import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Trash2, Edit, Share, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProfileSchema } from "@shared/schema";
import { z } from "zod";
import type { Profile, Estimate } from "@shared/schema";

const profileFormSchema = insertProfileSchema.extend({
  restrictions: z.object({
    glutenFree: z.boolean().optional(),
    vegan: z.boolean().optional(),
    nutFree: z.boolean().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { toast } = useToast();
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      partnerName: "",
      weddingDate: "",
      venue: "",
      venueAddress: "",
      budget: "",
      restrictions: {
        glutenFree: false,
        vegan: false,
        nutFree: false,
      },
      notes: "",
    },
  });

  // Mock profile ID for demo - in real app this would come from auth
  const profileId = "demo-profile-id";

  const { data: estimates } = useQuery<Estimate[]>({
    queryKey: ['/api/profiles', profileId, 'estimates'],
    enabled: false, // Disabled for demo since we don't have actual profiles
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (profile: ProfileFormData) => {
      return await apiRequest('POST', '/api/profiles', profile);
    },
    onSuccess: () => {
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    }
  });

  const deleteEstimateMutation = useMutation({
    mutationFn: async (estimateId: string) => {
      return await apiRequest('DELETE', `/api/estimates/${estimateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Estimate deleted",
        description: "Your estimate has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', profileId, 'estimates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete estimate",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    saveProfileMutation.mutate(data);
  };

  const handleClearForm = () => {
    form.reset();
  };

  const handleShareToBaker = () => {
    if (!shareEmail) {
      toast({
        title: "Email required",
        description: "Please enter the baker's email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estimate shared",
      description: `Your estimate has been sent to ${shareEmail}`,
    });
    setShareEmail("");
    setShareMessage("");
  };

  const handleShareToPartner = () => {
    if (!partnerEmail) {
      toast({
        title: "Email required",
        description: "Please enter your partner's email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estimate shared",
      description: `Your estimate has been sent to ${partnerEmail}`,
    });
    setPartnerEmail("");
    setPartnerMessage("");
  };

  const handleEditEstimate = (estimateId: string) => {
    toast({
      title: "Edit estimate",
      description: "Redirecting to calculator with saved estimate...",
    });
  };

  const handleShareEstimate = (estimateId: string) => {
    toast({
      title: "Share estimate",
      description: "Estimate sharing options will be available soon.",
    });
  };

  const handleDeleteEstimate = (estimateId: string) => {
    deleteEstimateMutation.mutate(estimateId);
  };

  // Mock saved estimates for display
  const mockEstimates = [
    {
      id: "1",
      name: "2-Tier Chocolate Wedding Cake",
      details: "75 guests • Gold accents • Standard delivery",
      date: "March 15, 2024",
      total: "$580.48"
    },
    {
      id: "2",
      name: "3-Tier Vanilla with Fondant",
      details: "120 guests • Fresh flowers • White glove setup",
      date: "March 12, 2024",
      total: "$890.25"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Form */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-serif font-semibold mb-6 text-foreground">
            Customer Profile
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground mb-4">Personal Information</h3>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    {...form.register("name")}
                    data-testid="input-profile-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...form.register("email")}
                    data-testid="input-profile-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...form.register("phone")}
                    data-testid="input-profile-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    placeholder="Street address, city, state, ZIP"
                    {...form.register("address")}
                    data-testid="textarea-profile-address"
                  />
                </div>
              </div>

              {/* Event Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground mb-4">Event Details</h3>

                <div>
                  <Label htmlFor="partnerName">Partner's Name</Label>
                  <Input
                    id="partnerName"
                    placeholder="Partner's full name"
                    {...form.register("partnerName")}
                    data-testid="input-partner-name"
                  />
                </div>

                <div>
                  <Label htmlFor="weddingDate">Wedding Date</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    {...form.register("weddingDate")}
                    data-testid="input-wedding-date"
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue Name</Label>
                  <Input
                    id="venue"
                    placeholder="Wedding venue"
                    {...form.register("venue")}
                    data-testid="input-venue"
                  />
                </div>

                <div>
                  <Label htmlFor="venueAddress">Venue Address</Label>
                  <Textarea
                    id="venueAddress"
                    rows={3}
                    placeholder="Venue street address, city, state, ZIP"
                    {...form.register("venueAddress")}
                    data-testid="textarea-venue-address"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Preferences & Notes</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select onValueChange={(value) => form.setValue("budget", value)}>
                    <SelectTrigger data-testid="select-budget">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-300">Under $300</SelectItem>
                      <SelectItem value="300-500">$300 - $500</SelectItem>
                      <SelectItem value="500-800">$500 - $800</SelectItem>
                      <SelectItem value="800-1200">$800 - $1,200</SelectItem>
                      <SelectItem value="over-1200">Over $1,200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Dietary Restrictions
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="glutenFree"
                        onCheckedChange={(checked) => 
                          form.setValue("restrictions.glutenFree", checked as boolean)
                        }
                        data-testid="checkbox-gluten-free"
                      />
                      <Label htmlFor="glutenFree" className="text-sm">Gluten-Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegan"
                        onCheckedChange={(checked) => 
                          form.setValue("restrictions.vegan", checked as boolean)
                        }
                        data-testid="checkbox-vegan"
                      />
                      <Label htmlFor="vegan" className="text-sm">Vegan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nutFree"
                        onCheckedChange={(checked) => 
                          form.setValue("restrictions.nutFree", checked as boolean)
                        }
                        data-testid="checkbox-nut-free"
                      />
                      <Label htmlFor="nutFree" className="text-sm">Nut-Free</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Any additional preferences, style notes, or requirements for your wedding cake..."
                  {...form.register("notes")}
                  data-testid="textarea-profile-notes"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8">
              <Button
                type="submit"
                disabled={saveProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                data-testid="button-clear-form"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Saved Estimates */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-serif font-semibold mb-6 text-foreground">
            Saved Estimates
          </h2>

          <div className="space-y-4">
            {mockEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                data-testid={`estimate-item-${estimate.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground" data-testid={`estimate-name-${estimate.id}`}>
                    {estimate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`estimate-details-${estimate.id}`}>
                    {estimate.details}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`estimate-date-${estimate.id}`}>
                    Created on {estimate.date}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-primary" data-testid={`estimate-total-${estimate.id}`}>
                    {estimate.total}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditEstimate(estimate.id)}
                      data-testid={`button-edit-estimate-${estimate.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShareEstimate(estimate.id)}
                      data-testid={`button-share-estimate-${estimate.id}`}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEstimate(estimate.id)}
                      data-testid={`button-delete-estimate-${estimate.id}`}
                    >
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Estimates are automatically saved when you calculate pricing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-serif font-semibold mb-6 text-foreground">
            Share Estimates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Share with Bakers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send your estimate to bakers for quotes and consultations
              </p>

              <div className="space-y-3">
                <Input
                  placeholder="Baker's email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  data-testid="input-share-email"
                />
                <Textarea
                  rows={3}
                  placeholder="Message to baker..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  data-testid="textarea-share-message"
                />
                <Button
                  onClick={handleShareToBaker}
                  className="w-full"
                  data-testid="button-share-to-baker"
                >
                  Send to Baker
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Share with Partner</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Collaborate on cake decisions with your partner
              </p>

              <div className="space-y-3">
                <Input
                  placeholder="Partner's email address"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  data-testid="input-partner-email"
                />
                <Textarea
                  rows={3}
                  placeholder="Personal message..."
                  value={partnerMessage}
                  onChange={(e) => setPartnerMessage(e.target.value)}
                  data-testid="textarea-partner-message"
                />
                <Button
                  onClick={handleShareToPartner}
                  variant="secondary"
                  className="w-full"
                  data-testid="button-share-to-partner"
                >
                  Send to Partner
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
