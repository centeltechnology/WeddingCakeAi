import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

interface Targeting {
  geo?: {
    states?: string[];
    cities?: string[];
    zips?: string[];
  };
  dateWindow?: {
    from?: string;
    to?: string;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  interests?: string[];
}

export default function AdvertiserCampaigns() {
  const { toast } = useToast();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [preflightData, setPreflightData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    unitPriceCents: 25,
    maxSends: 1000,
    targeting: {
      geo: {
        states: [] as string[],
        cities: [] as string[],
        zips: [] as string[]
      },
      dateWindow: {
        from: "",
        to: ""
      },
      budget: {
        min: undefined as number | undefined,
        max: undefined as number | undefined
      },
      interests: [] as string[]
    }
  });

  const handleCreateCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/advertisers/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      setCampaignId(data.campaignId);
      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreflight = async () => {
    if (!campaignId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/advertisers/campaigns/${campaignId}/preflight`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to run preflight');
      }

      setPreflightData(data);
      toast({
        title: "Preflight Complete",
        description: `Found ${data.eligibleCount} eligible leads`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!campaignId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/advertisers/campaigns/${campaignId}/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit campaign');
      }

      toast({
        title: "Campaign Submitted",
        description: "Your campaign has been submitted for admin review"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout><div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Set up your campaign basics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Summer Wedding Special"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (cents)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={formData.unitPriceCents}
                      onChange={(e) => setFormData({ ...formData, unitPriceCents: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSends">Max Sends</Label>
                    <Input
                      id="maxSends"
                      type="number"
                      value={formData.maxSends}
                      onChange={(e) => setFormData({ ...formData, maxSends: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateCampaign} disabled={isLoading || !!campaignId}>
                  {campaignId ? "Campaign Created" : "Create Campaign"}
                </Button>
              </CardContent>
            </Card>

            {campaignId && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Targeting</CardTitle>
                    <CardDescription>Define your target audience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="states">States (comma-separated)</Label>
                      <Input
                        id="states"
                        placeholder="CA, NY, TX"
                        onChange={(e) => setFormData({
                          ...formData,
                          targeting: {
                            ...formData.targeting,
                            geo: {
                              ...formData.targeting.geo,
                              states: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cities">Cities (comma-separated)</Label>
                      <Input
                        id="cities"
                        placeholder="San Francisco, Los Angeles"
                        onChange={(e) => setFormData({
                          ...formData,
                          targeting: {
                            ...formData.targeting,
                            geo: {
                              ...formData.targeting.geo,
                              cities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          }
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateFrom">Event Date From</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          onChange={(e) => setFormData({
                            ...formData,
                            targeting: {
                              ...formData.targeting,
                              dateWindow: { ...formData.targeting.dateWindow, from: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateTo">Event Date To</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          onChange={(e) => setFormData({
                            ...formData,
                            targeting: {
                              ...formData.targeting,
                              dateWindow: { ...formData.targeting.dateWindow, to: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budgetMin">Budget Min ($)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          onChange={(e) => setFormData({
                            ...formData,
                            targeting: {
                              ...formData.targeting,
                              budget: { ...formData.targeting.budget, min: parseInt(e.target.value) || undefined }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="budgetMax">Budget Max ($)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          onChange={(e) => setFormData({
                            ...formData,
                            targeting: {
                              ...formData.targeting,
                              budget: { ...formData.targeting.budget, max: parseInt(e.target.value) || undefined }
                            }
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="interests">Interests (comma-separated)</Label>
                      <Input
                        id="interests"
                        placeholder="wedding, birthday, corporate"
                        onChange={(e) => setFormData({
                          ...formData,
                          targeting: {
                            ...formData.targeting,
                            interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          }
                        })}
                      />
                    </div>

                    <Button onClick={handlePreflight} disabled={isLoading}>
                      Run Preflight Check
                    </Button>
                  </CardContent>
                </Card>

                {preflightData && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Preflight Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg">
                          <strong>Eligible Leads:</strong> {preflightData.eligibleCount}
                        </p>
                        <p className="text-lg">
                          <strong>Estimated Cost:</strong> ${preflightData.estimatedCostDollars}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unit Price: ${(preflightData.unitPriceCents / 100).toFixed(2)} per send
                        </p>
                      </div>

                      <Button onClick={handleSubmit} disabled={isLoading} className="mt-4">
                        Submit for Review
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div></AppLayout>
  );
}
