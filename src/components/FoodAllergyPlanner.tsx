import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Plus, X, AlertCircle } from "lucide-react";

interface FoodAllergyPlannerProps {
  destination: string;
}

export const FoodAllergyPlanner = ({ destination }: FoodAllergyPlannerProps) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const localCuisineInfo = {
    common: "Research local dishes before ordering",
    phrases: "Learn allergy phrases in local language",
    restaurants: "Look for allergy-friendly restaurants",
  };

  return (
    <Card className="glass-card p-6 hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <Utensils className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Food & Allergy Planner</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Add Food Allergies / Dietary Restrictions
          </label>
          <div className="flex gap-2">
            <Input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              placeholder="e.g., Peanuts, Gluten, Dairy"
              className="flex-1"
            />
            <Button onClick={addAllergy} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <Badge key={allergy} variant="secondary" className="gap-1">
                {allergy}
                <button onClick={() => removeAllergy(allergy)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground">Tips for {destination}</h4>
          
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{localCuisineInfo.common}</p>
                <p className="text-xs text-muted-foreground">
                  Check ingredient lists and ask restaurant staff
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{localCuisineInfo.phrases}</p>
                <p className="text-xs text-muted-foreground">
                  "I am allergic to..." in local language
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{localCuisineInfo.restaurants}</p>
                <p className="text-xs text-muted-foreground">
                  Use apps like HappyCow or Find Me Gluten Free
                </p>
              </div>
            </div>
          </div>
        </div>

        {allergies.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 mt-4">
            <p className="text-xs font-medium text-foreground mb-1">⚠️ Important Reminder</p>
            <p className="text-xs text-muted-foreground">
              Always carry an allergy card and emergency medication. 
              Inform hotel staff and tour guides about your allergies.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
