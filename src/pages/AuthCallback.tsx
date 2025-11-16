import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for OAuth completion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });

    // Also check existing session in case we're landing directly from provider
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
      else navigate("/auth", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner message="Completing sign-in..." />
    </div>
  );
};

export default AuthCallback;
