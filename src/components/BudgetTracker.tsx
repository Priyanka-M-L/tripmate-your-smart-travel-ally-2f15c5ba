import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetTrackerProps {
  budget: number;
  spent: number;
}

export const BudgetTracker = ({ budget, spent }: BudgetTrackerProps) => {
  const totalBudget = typeof budget === "number" && !Number.isNaN(budget) ? budget : 0;
  const totalSpent = typeof spent === "number" && !Number.isNaN(spent) ? spent : 0;
  const remaining = totalBudget - totalSpent;
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Budget Tracker</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Budget</span>
          <span className="font-semibold text-foreground">
            ${totalBudget.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Spent</span>
          <span className="font-semibold text-foreground">
            ${totalSpent.toFixed(2)}
          </span>
        </div>

        <Progress value={percentageSpent} className="h-2" />

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {isOverBudget ? (
              <TrendingDown className="w-4 h-4 text-destructive" />
            ) : (
              <TrendingUp className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium">Remaining</span>
          </div>
          <span
            className={`font-bold ${
              isOverBudget ? "text-destructive" : "text-primary"
            }`}
          >
            ${Math.abs(remaining).toFixed(2)}
          </span>
        </div>

        {isOverBudget && (
          <p className="text-xs text-destructive">
            You're over budget! Consider adjusting your expenses.
          </p>
        )}
      </div>
    </Card>
  );
};
