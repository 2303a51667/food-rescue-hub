import { Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  isVerified: boolean;
  organizationType?: string;
  className?: string;
  showText?: boolean;
}

const VerifiedBadge = ({ isVerified, organizationType, className = "", showText = false }: VerifiedBadgeProps) => {
  if (!isVerified) return null;

  const getOrgLabel = () => {
    switch (organizationType) {
      case "ngo":
        return "Verified NGO";
      case "community_partner":
        return "Verified Partner";
      case "restaurant":
        return "Verified Restaurant";
      case "grocery_store":
        return "Verified Store";
      default:
        return "Verified";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className={`bg-accent/10 text-accent border-accent ${className}`}>
            <Shield className="h-3 w-3 mr-1" />
            {showText && getOrgLabel()}
            {!showText && <CheckCircle className="h-3 w-3" />}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getOrgLabel()} - Trusted by community</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
