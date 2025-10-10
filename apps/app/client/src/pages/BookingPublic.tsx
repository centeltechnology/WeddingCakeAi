import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2, CheckCircle } from 'lucide-react';

export default function BookingPublic() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceId: 'consultation',
    serviceName: 'Consultation',
    startISO: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // tenantId is now derived server-side from subdomain/session
    createMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Received!</h2>
            <p className="text-muted-foreground">
              We've received your booking request and will confirm shortly via email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Book a Consultation
          </CardTitle>
          <CardDescription>
            Schedule a time to discuss your cake vision with our expert bakers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <Label>Preferred Date & Time</Label>
              <Input
                type="datetime-local"
                required
                value={formData.startISO}
                onChange={(e) =>
                  setFormData({ ...formData, startISO: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Tell us about your event, cake preferences, or any questions..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Request Booking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
