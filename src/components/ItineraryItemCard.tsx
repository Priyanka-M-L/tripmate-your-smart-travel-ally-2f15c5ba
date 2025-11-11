import { Button } from "@/components/ui/button";
import { Clock, MapPin, DollarSign, Trash2 } from "lucide-react";
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
