import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Plus, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Place {
  id: string;
  name: string;
  allocatedBudget: number;
}

interface BudgetAllocatorProps {
  totalBudget: number;
  onBudgetChange?: (places: Place[], remaining: number) => void;
}

export const BudgetAllocator = ({ totalBudget, onBudgetChange }: BudgetAllocatorProps) => {
  const [places, setPlaces] = useState<Place[]>([
    { id: "1", name: "", allocatedBudget: 0 }
  ]);

  // Auto-allocate budget equally when places or total budget changes
  useEffect(() => {
    if (places.length > 0 && totalBudget > 0) {
      const equalShare = Math.floor(totalBudget / places.length);
      const updatedPlaces = places.map(place => ({
        ...place,
        allocatedBudget: equalShare
      }));
      setPlaces(updatedPlaces);
    }
  }, [totalBudget, places.length]);

  const addPlace = () => {
    const newPlace: Place = {
      id: Date.now().toString(),
      name: "",
      allocatedBudget: 0
    };
    setPlaces([...places, newPlace]);
  };

  const removePlace = (id: string) => {
    if (places.length > 1) {
      setPlaces(places.filter(p => p.id !== id));
    } else {
      toast.error("You must have at least one place");
    }
  };

  const updatePlaceName = (id: string, name: string) => {
    setPlaces(places.map(p => p.id === id ? { ...p, name } : p));
  };

  const updatePlaceBudget = (id: string, budget: number) => {
    setPlaces(places.map(p => p.id === id ? { ...p, allocatedBudget: budget } : p));
  };

  const totalAllocated = places.reduce((sum, place) => sum + place.allocatedBudget, 0);
  const remaining = totalBudget - totalAllocated;
  const percentageUsed = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;
  const isOverBudget = totalAllocated > totalBudget;

  useEffect(() => {
    if (onBudgetChange) {
      onBudgetChange(places, remaining);
    }
  }, [places, remaining]);

  return (
    <Card className="p-6 glass-card border-2 border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Smart Budget Allocation</h3>
          <p className="text-sm text-muted-foreground">Distribute your budget across destinations</p>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="mb-6 p-4 rounded-xl bg-accent/30 border border-accent">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold text-foreground">₹{totalBudget.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Allocated</p>
            <p className="text-xl font-semibold text-primary">₹{totalAllocated.toLocaleString()}</p>
          </div>
        </div>
        
        <Progress value={Math.min(percentageUsed, 100)} className="h-2 mb-2" />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Over budget by ₹{Math.abs(remaining).toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Remaining: ₹{remaining.toLocaleString()}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {percentageUsed.toFixed(1)}% used
          </span>
        </div>
      </div>

      {/* Places List */}
      <div className="space-y-3 mb-4">
        {places.map((place, index) => (
          <div
            key={place.id}
            className="p-4 rounded-xl bg-card border-2 border-border hover:border-primary/30 transition-all"
          >
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Place {index + 1}</Label>
                  <Input
                    placeholder="e.g., Paris, Eiffel Tower"
                    value={place.name}
                    onChange={(e) => updatePlaceName(place.id, e.target.value)}
                    className="border-border/50 focus:border-primary"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Budget (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={place.allocatedBudget || ""}
                    onChange={(e) => updatePlaceBudget(place.id, Number(e.target.value))}
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              {places.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlace(place.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={addPlace}
        variant="outline"
        className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Place
      </Button>
    </Card>
  );
};
