import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, Trash2, Leaf, Bus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ItineraryItemCardProps {
  item: {
    id: string;
    title: string;
    type: string;
    time: string;
    location: string;
    description: string;
    cost: number;
    carbon_footprint?: number;
    transport_mode?: string;
    transport_distance?: number;
  };
  onDelete: (id: string) => void;
}

export const ItineraryItemCard = ({
  item,
  onDelete,
}: ItineraryItemCardProps) => {
  return (
    <div className="border-l-4 border-primary pl-4 py-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{item.time}</span>
            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
              {item.type}
            </span>
          </div>
          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
          {item.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              {item.location}
            </div>
          )}
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
          )}
          {item.cost > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <DollarSign className="w-4 h-4" />
              ${item.cost.toFixed(2)}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            {item.carbon_footprint !== undefined && item.carbon_footprint > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Leaf className="w-3 h-3 text-green-500" />
                {item.carbon_footprint.toFixed(2)} kg CO₂
              </div>
            )}
            {item.transport_mode && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bus className="w-3 h-3" />
                {item.transport_mode}
                {item.transport_distance ? ` (${item.transport_distance.toFixed(1)}km)` : ''}
              </div>
            )}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this itinerary item?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
