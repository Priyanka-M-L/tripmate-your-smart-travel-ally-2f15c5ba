import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import Profile from "./pages/Profile";
import Itinerary from "./pages/Itinerary";
import Wellness from "./pages/Wellness";
import WellnessChat from "./pages/WellnessChat";
import NotFound from "./pages/NotFound";
import { initOfflineDB, getPendingChanges, clearPendingChanges, isOnline } from "@/utils/offlineStorage";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize offline database
    initOfflineDB();

    // Sync pending changes when coming online
    const handleOnline = async () => {
      if (isOnline()) {
        const pending = await getPendingChanges();
        if (pending.length > 0) {
          console.log('Syncing pending changes...', pending);
          // Process pending changes
          for (const change of pending) {
            try {
              if (change.type === 'delete') {
                await supabase.from(change.table as any).delete().eq('id', change.data.id);
              } else if (change.type === 'insert') {
                await supabase.from(change.table as any).insert(change.data);
              } else if (change.type === 'update') {
                await supabase.from(change.table as any).update(change.data).eq('id', change.data.id);
              }
            } catch (error) {
              console.error('Sync error:', error);
            }
          }
          await clearPendingChanges();
        }
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trip/:id" element={<TripDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/wellness" element={<Wellness />} />
              <Route path="/wellness-chat" element={<WellnessChat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
