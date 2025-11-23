# Offline Mode Setup Guide

## Overview
Trip Mate now supports full offline functionality with PWA (Progressive Web App) capabilities. This means users can:
- View cached trips and itineraries offline
- See previously loaded maps (Google Maps)
- Access cached weather data
- Get wellness AI suggestions (rule-based offline mode)
- Make changes that automatically sync when back online

## What's Been Added

### 1. Service Worker (`public/service-worker.js`)
- Caches all app assets (JS, CSS, images)
- Implements network-first strategy with cache fallback
- Stores API responses for offline access
- Automatically updates cache when online

### 2. PWA Manifest (`public/manifest.json`)
- Enables "Add to Home Screen" on mobile devices
- Provides app-like experience
- Custom app icons and theme colors

### 3. Offline Storage Extensions (`src/utils/offlineStorage.ts`)
- Caches weather data by location
- Stores map tiles and markers
- Maintains itinerary items in IndexedDB
- Tracks pending changes for sync

### 4. Sync Manager (`src/utils/syncManager.ts`)
- Queues offline changes
- Automatically syncs when connection restored
- Handles conflict resolution
- Provides sync status updates

### 5. Enhanced Offline Indicator (`src/components/OfflineIndicator.tsx`)
- Shows clear "Offline Mode" banner
- Displays sync status
- Manual retry button
- Toast notifications for connectivity changes

## Setup Instructions

### Google Maps API Configuration

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable these APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (optional, for nearby places)
   - Create credentials → API Key
   - **Important:** Enable billing (required for Google Maps Platform)

2. **Add API Key to Environment:**
   Create a `.env` file in project root:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Security Best Practices:**
   - Restrict API key to your domain in Google Cloud Console
   - Set API restrictions to only enabled APIs
   - Monitor usage to avoid unexpected charges

### Google Maps Pricing
- Google Maps offers $200 free monthly credit
- After free tier: ~$7 per 1,000 map loads
- Geocoding: ~$5 per 1,000 requests
- Monitor usage at: https://console.cloud.google.com/billing

### Alternative: Continue Using Free APIs
If you prefer to avoid Google Maps costs, the project also includes:
- **Leaflet + OpenStreetMap** (free, open-source)
- **Open-Meteo API** (free weather and geocoding)

To use free APIs instead:
1. In `src/pages/TripDetail.tsx`, change import:
   ```tsx
   import { InteractiveMapEngine } from "@/components/InteractiveMapEngine";
   ```
2. Update component usage:
   ```tsx
   <InteractiveMapEngine items={itineraryItems} destination={trip.destination} />
   ```

## How Offline Mode Works

### When Online:
1. App fetches fresh data from APIs
2. Caches responses in IndexedDB
3. Service worker stores assets
4. All features work normally

### When Offline:
1. App detects offline state
2. Shows "Offline Mode" banner
3. Loads data from cache (IndexedDB)
4. Maps show last cached tiles
5. Weather shows last fetched data with timestamp
6. Wellness AI uses rule-based logic (no API calls)
7. User changes are queued for sync

### When Back Online:
1. App detects connection
2. Shows "Back online - syncing..." toast
3. Automatically syncs queued changes
4. Updates all cached data
5. Removes offline banner

## Testing Offline Mode

### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Reload page and test functionality

### Real Device Testing:
1. Enable airplane mode
2. Open the app
3. Verify cached data displays
4. Make changes (they'll queue)
5. Disable airplane mode
6. Watch automatic sync

## Features Supported Offline

✅ **Fully Supported:**
- View trips and itineraries
- See cached weather data
- View map (last loaded tiles)
- Wellness AI (rule-based suggestions)
- Browse dashboard
- View profile

⚠️ **Limited Offline:**
- Creating new trips (queued for sync)
- Editing itinerary items (queued for sync)
- Weather refresh (shows cached data)
- Map search (uses cached locations)

❌ **Requires Connection:**
- AI-powered features (Lovable AI)
- Real-time weather updates
- Fresh geocoding lookups
- User authentication

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (or localhost)
- Clear browser cache and reload

### Maps Not Loading Offline
- Verify map was loaded at least once online
- Check IndexedDB has cached tiles
- Ensure GOOGLE_MAPS_API_KEY is set

### Sync Not Working
- Check browser console for errors
- Verify internet connection restored
- Try manual sync button in offline banner

### Cache Too Large
- Service worker limits cache size
- Older cached data auto-expires
- Clear cache: DevTools → Application → Storage → Clear

## Performance Tips

1. **First Load:** Must be online to cache assets
2. **Cache Refresh:** App updates cache every 30 minutes when online
3. **Storage Limits:** IndexedDB typically allows 50MB-100MB per domain
4. **Battery Impact:** Service worker has minimal battery impact

## Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (iOS 11.3+)
- ⚠️ Safari (desktop) - limited service worker support
- ❌ IE11 (not supported)

## Next Steps

Consider adding:
- Background sync for better reliability
- Push notifications for trip reminders
- Offline-first conflict resolution UI
- Cache size management settings
