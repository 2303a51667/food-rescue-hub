import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, AlertCircle } from "lucide-react";

interface ShelfLifeIndicatorProps {
  status: string;
  availableUntil: string;
  className?: string;
}

const ShelfLifeIndicator = ({ status, availableUntil, className = "" }: ShelfLifeIndicatorProps) => {
  const getIndicatorConfig = () => {
    switch (status) {
      case "fresh":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: "Fresh",
          className: "bg-success/10 text-success border-success",
        };
      case "expiring_soon":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: "Expiring Soon",
          className: "bg-warning/10 text-warning border-warning",
        };
      case "expiring_today":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: "Expiring Today",
          className: "bg-destructive/10 text-destructive border-destructive",
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          label: "Fresh",
          className: "bg-success/10 text-success border-success",
        };
    }
  };

  const config = getIndicatorConfig();

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
};

export default ShelfLifeIndicator;
