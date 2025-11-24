import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  Heart, 
  User, 
  LogOut, 
  Plane,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/wellness", icon: Heart, label: "Wellness" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 glass-effect shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                <Plane className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TripMate
              </span>
              <span className="text-xs text-muted-foreground -mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Travel Assistant
              </span>
            </div>
          </button>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  variant={active ? "default" : "ghost"}
                  className={`
                    gap-2 transition-all duration-300
                    ${active 
                      ? "bg-gradient-primary hover:opacity-90 shadow-soft text-white" 
                      : "hover:bg-accent/50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}

            <div className="w-px h-6 bg-border mx-2" />

            <ThemeToggle />

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
