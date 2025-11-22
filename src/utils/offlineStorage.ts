import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TripDB extends DBSchema {
  trips: {
    key: string;
    value: {
      id: string;
      data: any;
      lastSync: number;
    };
  };
  itineraryItems: {
    key: string;
    value: {
      id: string;
      tripId: string;
      data: any;
      lastSync: number;
    };
    indexes: { 'by-trip': string };
  };
  pendingChanges: {
    key: number;
    value: {
      type: 'insert' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

let db: IDBPDatabase<TripDB> | null = null;

export const initOfflineDB = async () => {
  if (db) return db;
  
  db = await openDB<TripDB>('TravelPlannerDB', 1, {
    upgrade(db) {
      // Store trips
      if (!db.objectStoreNames.contains('trips')) {
        db.createObjectStore('trips', { keyPath: 'id' });
      }
      
      // Store itinerary items
      if (!db.objectStoreNames.contains('itineraryItems')) {
        const itemStore = db.createObjectStore('itineraryItems', { keyPath: 'id' });
        itemStore.createIndex('by-trip', 'tripId');
      }
      
      // Store pending changes for sync
      if (!db.objectStoreNames.contains('pendingChanges')) {
        const changeStore = db.createObjectStore('pendingChanges', { 
          keyPath: 'timestamp',
          autoIncrement: true 
        });
        changeStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
  
  return db;
};

export const cacheTrip = async (trip: any) => {
  const database = await initOfflineDB();
  await database.put('trips', {
    id: trip.id,
    data: trip,
    lastSync: Date.now(),
  });
};

export const getCachedTrip = async (tripId: string) => {
  const database = await initOfflineDB();
  const cached = await database.get('trips', tripId);
  return cached?.data;
};

export const cacheItineraryItems = async (items: any[], tripId: string) => {
  const database = await initOfflineDB();
  const tx = database.transaction('itineraryItems', 'readwrite');
  
  await Promise.all(
    items.map(item => 
      tx.store.put({
        id: item.id,
        tripId,
        data: item,
        lastSync: Date.now(),
      })
    )
  );
  
  await tx.done;
};

export const getCachedItineraryItems = async (tripId: string) => {
  const database = await initOfflineDB();
  const tx = database.transaction('itineraryItems', 'readonly');
  const index = tx.store.index('by-trip');
  const items = await index.getAll(IDBKeyRange.only(tripId));
  return items.map(item => item.data);
};

export const addPendingChange = async (
  type: 'insert' | 'update' | 'delete',
  table: string,
  data: any
) => {
  const database = await initOfflineDB();
  await database.add('pendingChanges', {
    type,
    table,
    data,
    timestamp: Date.now(),
  });
};

export const getPendingChanges = async () => {
  const database = await initOfflineDB();
  return database.getAll('pendingChanges');
};

export const clearPendingChanges = async () => {
  const database = await initOfflineDB();
  await database.clear('pendingChanges');
};

export const isOnline = () => {
  return navigator.onLine;
};
