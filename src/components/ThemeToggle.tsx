import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className="glass-card hover-lift"
      >
        <Sun className="h-5 w-5 text-primary opacity-50 transition-transform" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return <ThemeToggleButton />;
};

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass-card hover-lift overflow-hidden relative"
    >
      <div className="relative">
        <Sun 
          className={`h-5 w-5 text-primary absolute transition-all duration-500 ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-90 scale-0 opacity-0"
          }`} 
        />
        <Moon 
          className={`h-5 w-5 text-primary transition-all duration-500 ${
            theme === "light" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
