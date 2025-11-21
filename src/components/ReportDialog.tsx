import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportDialogProps {
  listingId: string;
  userId: string;
}

const ReportDialog = ({ listingId, userId }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: userId,
        reported_listing_id: listingId,
        report_type: reportType,
        description,
      });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });

      setOpen(false);
      setReportType("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Listing</DialogTitle>
          <DialogDescription>
            Help us maintain a safe and trustworthy community. Your report will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fake_listing">Fake Listing</SelectItem>
                <SelectItem value="poor_quality">Poor Food Quality</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="safety_concern">Safety Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more information about the issue..."
              rows={4}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
