import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ShareButtonProps {
  listingId: string;
  title: string;
}

const ShareButton = ({ listingId, title }: ShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/listing/${listingId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Food Donation: ${title}`,
          text: `Check out this food donation: ${title}`,
          url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
          title: "Link Copied!",
          description: "Share this link with others",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" size="sm">
      {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
};

export default ShareButton;
