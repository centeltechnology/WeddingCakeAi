import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Phone, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Baker } from "@shared/schema";

interface ContactBakerModalProps {
  baker: Baker;
  onClose: () => void;
}

interface ContactFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  weddingDate: string;
  guestCount: string;
  budget: string;
  message: string;
}

export default function ContactBakerModal({ baker, onClose }: ContactBakerModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    weddingDate: '',
    guestCount: '',
    budget: '',
    message: ''
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bakerId: baker.id,
          ...data,
          guestCount: data.guestCount ? parseInt(data.guestCount) : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to send inquiry');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: `Your message has been sent to ${baker.name}. They'll contact you soon!`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "There was an error sending your inquiry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDirectContact = (method: 'phone' | 'email') => {
    if (method === 'phone' && baker.phone) {
      window.location.href = `tel:${baker.phone}`;
    } else if (method === 'email') {
      window.location.href = `mailto:${baker.email}`;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-white to-white/95">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎂</span>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Contact {baker.name}</h2>
                <p className="text-muted-foreground">Send an inquiry about your wedding cake</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-10 h-10"
              data-testid="button-close-contact-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Direct Contact Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => handleDirectContact('phone')}
              className="h-14 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              disabled={!baker.phone}
              data-testid="button-call-direct"
            >
              <Phone className="w-5 h-5 mr-2 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">Call Direct</div>
                <div className="text-xs text-muted-foreground">
                  {baker.phone || 'No phone available'}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDirectContact('email')}
              className="h-14 border-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              data-testid="button-email-direct"
            >
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">Email Direct</div>
                <div className="text-xs text-muted-foreground">
                  {baker.email}
                </div>
              </div>
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or send a detailed inquiry</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Your Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  data-testid="input-customer-name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  data-testid="input-customer-email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </div>
              <div>
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  data-testid="input-wedding-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestCount">Expected Guests</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => handleInputChange('guestCount', e.target.value)}
                  placeholder="e.g., 100"
                  min="1"
                  data-testid="input-guest-count"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger data-testid="select-budget">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                    <SelectItem value="3000-plus">$3,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell the baker about your dream wedding cake..."
                rows={4}
                data-testid="textarea-message"
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-contact"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-send-inquiry"
              >
                {contactMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}