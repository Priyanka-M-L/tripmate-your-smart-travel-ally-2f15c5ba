import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { syncManager } from "@/utils/syncManager";
import { toast } from "sonner";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online - syncing data...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Offline mode - changes will sync when reconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncManager.forceSyn();
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline) return null;

  return (
    <Alert className="fixed top-20 left-1/2 -translate-x-1/2 w-auto max-w-md z-50 bg-warning/95 backdrop-blur-sm border-warning shadow-lg">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-3">
        <span className="text-warning-foreground font-medium">
          Offline Mode Enabled - Using cached data
        </span>
        <Button
          onClick={handleSync}
          disabled={syncing || !isOnline}
          size="sm"
          variant="outline"
          className="h-7 text-xs"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Sync
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
