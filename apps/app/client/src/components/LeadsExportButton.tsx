import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Crown, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LeadsExportButtonProps {
  bakerId: string;
  userPlan?: string;
}

export default function LeadsExportButton({ bakerId, userPlan = "starter" }: LeadsExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const hasAccess = userPlan === "enterprise";

  const handleExport = async () => {
    if (!hasAccess) {
      setShowUpgradeDialog(true);
      return;
    }

    setIsExporting(true);
    try {
      const token = localStorage.getItem("baker_token");
      const response = await fetch(`/api/leads/export?bakerId=${bakerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export leads");
      }

      // Create a blob from the CSV data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Your leads have been exported to CSV.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "An error occurred while exporting leads.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={isExporting}
        data-testid="export-csv-button"
      >
        {isExporting ? (
          <>Exporting...</>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {hasAccess ? "Export to CSV" : (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Export to CSV
              </>
            )}
          </>
        )}
      </Button>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-orange-600" />
              Enterprise Feature
            </DialogTitle>
            <DialogDescription>
              CSV export is available on the Enterprise plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-semibold text-orange-900">
                  Enterprise Plan - $39/month
                </span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Export all your leads to CSV</li>
                <li>✓ Bulk email to leads</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority placement</li>
                <li>✓ API access</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Upgrade now to unlock powerful data export and marketing features.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              data-testid="button-cancel-upgrade"
            >
              Cancel
            </Button>
            <Button
              onClick={() => (window.location.href = "/billing")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              data-testid="button-upgrade-export"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Enterprise
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
