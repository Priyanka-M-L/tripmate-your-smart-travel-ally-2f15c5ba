import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { WifiOff, Wifi, CloudUpload } from "lucide-react";
import { getPendingChanges } from "@/utils/offlineStorage";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkPending = async () => {
      const pending = await getPendingChanges();
      setPendingCount(pending.length);
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <Card className={`fixed bottom-4 right-4 p-3 flex items-center gap-2 glass-card z-50 ${
      isOnline ? 'bg-primary/10' : 'bg-yellow-500/10'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 text-primary" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">Online</span>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CloudUpload className="w-3 h-3" />
                Syncing {pendingCount} change{pendingCount > 1 ? 's' : ''}...
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-yellow-500" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">Offline Mode</span>
            <p className="text-xs text-muted-foreground">
              Changes will sync when online
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
