import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Trash2 } from "lucide-react";
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

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
  };
  onDelete: (id: string) => void;
}

export const TripCard = ({ trip, onDelete }: TripCardProps) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="glass-card hover-lift group cursor-pointer transition-all duration-300 overflow-hidden border-2 border-border/50">
      <div onClick={() => navigate(`/trip/${trip.id}`)} className="relative">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
        
        <div className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform pr-4">
              {trip.title}
            </h3>
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {Math.ceil(
                (new Date(trip.end_date).getTime() -
                  new Date(trip.start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              )} days
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{trip.destination}</span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-info" />
              </div>
              <span className="text-sm">
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm font-semibold">₹{trip.budget?.toLocaleString() || "0"}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 pt-4 border-t border-border/50 bg-muted/20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Trip
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-2 border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Trip</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete "{trip.title}"? This action cannot be
                undone and will remove all itinerary items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover-lift">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(trip.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
