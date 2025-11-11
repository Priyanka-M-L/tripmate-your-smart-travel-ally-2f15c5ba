import { Card } from "@/components/ui/card";

interface DestinationCardProps {
  title: string;
  image: string;
  description: string;
}

export const DestinationCard = ({ title, image, description }: DestinationCardProps) => {
  return (
    <Card className="overflow-hidden group cursor-pointer border-border shadow-card hover:shadow-hover transition-all">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};
