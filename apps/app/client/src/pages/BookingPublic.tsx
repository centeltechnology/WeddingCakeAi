import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRoute } from 'wouter';

type BookingSettings = {
  timezone: string;
  slotMinutes: number;
  leadTimeDays: number;
  workdays: Record<string, [number, number]>;
  services: Array<{ id: string; name: string; minutes: number; price: number }>;
};

export default function BookingPublic() {
  const [, params] = useRoute('/b/:slug/book');
  const tenantSlug = params?.slug || null;
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceId: '',
    serviceName: '',
    startISO: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, error } = useQuery<BookingSettings>({
    queryKey: ['booking-public-settings', tenantSlug],
    queryFn: async () => {
      const url = `/api/booking/public-settings${tenantSlug ? `?tenant=${tenantSlug}` : ''}`;
      const r = await fetch(url);
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        throw new Error(errorData.error || `${r.status}`);
      }
      return r.json();
    },
  });

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
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message.includes('disabled') 
      ? 'Booking is currently disabled' 
      : error.message.includes('tenant_not_found')
      ? 'Business not found'
      : 'Booking is unavailable right now';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unavailable</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            {isDemoMode && (
              <p className="text-xs text-gray-500 mt-4">
                Diagnostic: {error.message} (Status: {error.message})
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.services?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              No services are configured yet. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label>Service</Label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.serviceId}
                onChange={(e) => {
                  const service = data.services.find(s => s.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    serviceId: e.target.value,
                    serviceName: service?.name || ''
                  });
                }}
              >
                <option value="">Select a service</option>
                {data.services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.minutes} min)
                  </option>
                ))}
              </select>
            </div>

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

          {isDemoMode && data && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              Diagnostic: /api/booking/public-settings (200 OK) - {data.services.length} services loaded
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
