import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Send,
  Users,
  Filter,
  X,
  CheckSquare,
  Square,
  Lock,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Lead {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  weddingDate?: string;
  status: string;
  message?: string;
  createdAt: string;
}

interface BulkEmailLeadsProps {
  bakerId: string;
  userPlan?: string;
}

export default function BulkEmailLeads({
  bakerId,
  userPlan = "starter",
}: BulkEmailLeadsProps) {
  const { toast } = useToast();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Email composition state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Check if user has enterprise plan
  const hasAccess = userPlan === "enterprise";

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", bakerId],
    enabled: hasAccess, // Only fetch if has access
  });

  // Send bulk email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (data: {
      leadIds: string[];
      subject: string;
      body: string;
    }) => {
      return await apiRequest("POST", "/api/leads/bulk-email", data);
    },
    onSuccess: () => {
      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${selectedLeads.size} lead(s).`,
      });
      setEmailDialogOpen(false);
      setSelectedLeads(new Set());
      setEmailSubject("");
      setEmailBody("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Emails",
        description: error.message || "An error occurred while sending emails.",
        variant: "destructive",
      });
    },
  });

  // Filter leads based on status and search
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Toggle lead selection
  const toggleLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  // Select all filtered leads
  const selectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  // Handle send emails
  const handleSendEmails = () => {
    if (selectedLeads.size === 0) {
      toast({
        title: "No Leads Selected",
        description: "Please select at least one lead to send emails to.",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and message.",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      leadIds: Array.from(selectedLeads),
      subject: emailSubject,
      body: emailBody,
    });
  };

  // Upgrade prompt for non-enterprise users
  if (!hasAccess) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
        <CardContent className="p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Enterprise Feature
            </h3>
            <p className="text-gray-600 mb-6">
              Bulk email to leads is available on the{" "}
              <strong>Enterprise plan</strong>. Upgrade to unlock this powerful
              marketing tool and reach all your leads at once.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-semibold text-orange-900">
                  Enterprise Plan - $39/month
                </span>
              </div>
              <ul className="text-sm text-gray-700 text-left space-y-1">
                <li>✓ Bulk email to leads</li>
                <li>✓ CSV data export</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority placement</li>
                <li>✓ API access</li>
              </ul>
            </div>
            <Button
              onClick={() => (window.location.href = "/billing")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              data-testid="button-upgrade-bulk-email"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Enterprise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main bulk email interface
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <Mail className="w-6 h-6 mr-2 text-orange-600" />
                Bulk Email Leads
              </CardTitle>
              <CardDescription className="mt-1">
                Send targeted emails to multiple leads at once
              </CardDescription>
            </div>
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search-leads">Search Leads</Label>
              <Input
                id="search-leads"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-leads"
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  id="filter-status"
                  data-testid="select-status-filter"
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selection Actions */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                data-testid="button-select-all"
              >
                {selectedLeads.size === filteredLeads.length &&
                filteredLeads.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <div className="text-sm text-gray-600">
                <Users className="w-4 h-4 inline mr-1" />
                {selectedLeads.size} of {filteredLeads.length} lead(s) selected
              </div>
            </div>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={selectedLeads.size === 0}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  data-testid="button-compose-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Compose Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Compose Bulk Email</DialogTitle>
                  <DialogDescription>
                    Sending to {selectedLeads.size} lead(s)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Enter email subject..."
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      data-testid="input-email-subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-body">Message</Label>
                    <Textarea
                      id="email-body"
                      placeholder="Enter your message... 

You can use these merge fields:
{{customerName}} - Customer's name
{{weddingDate}} - Wedding date"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={12}
                      data-testid="textarea-email-body"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use merge fields like {'{{customerName}}'} and {'{{weddingDate}}'} for
                      personalization
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEmailDialogOpen(false)}
                    data-testid="button-cancel-email"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmails}
                    disabled={sendEmailMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    data-testid="button-send-email"
                  >
                    {sendEmailMutation.isPending ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Emails
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Leads List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="ml-3 text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedLeads.has(lead.id) ? "bg-orange-50 border-orange-200" : ""
                  }`}
                  data-testid={`lead-row-${lead.id}`}
                >
                  <Checkbox
                    checked={selectedLeads.has(lead.id)}
                    onCheckedChange={() => toggleLead(lead.id)}
                    data-testid={`checkbox-lead-${lead.id}`}
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.customerName}</p>
                        <p className="text-sm text-gray-600">{lead.customerEmail}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="capitalize">
                          {lead.status}
                        </Badge>
                        {lead.weddingDate && (
                          <span className="text-sm text-gray-500">
                            {new Date(lead.weddingDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
