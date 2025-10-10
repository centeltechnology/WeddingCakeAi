import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  minutes: number;
  price: number;
}

interface BookingSettings {
  tenantId: string;
  timezone: string;
  slotMinutes: number;
  leadTimeDays: number;
  workdays: Record<string, number[]>;
  services: Service[];
}

export default function BookingSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<BookingSettings>({
    queryKey: ['/api/booking/settings'],
  });

  const [timezone, setTimezone] = useState('');
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [leadTimeDays, setLeadTimeDays] = useState(2);
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: '', minutes: 60, price: 0 });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<BookingSettings>) => {
      const res = await fetch('/api/booking/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/booking/settings'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      timezone: timezone || settings?.timezone,
      slotMinutes,
      leadTimeDays,
      workdays: settings?.workdays || {},
      services,
    });
  };

  const addService = () => {
    if (!newService.name) return;
    setServices([...services, { ...newService, id: crypto.randomUUID() }]);
    setNewService({ name: '', minutes: 60, price: 0 });
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (settings && timezone === '') {
    setTimezone(settings.timezone);
    setSlotMinutes(settings.slotMinutes);
    setLeadTimeDays(settings.leadTimeDays);
    setServices(settings.services || []);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Booking Settings"
        description="Configure your consultation booking system"
      />

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure timezone, slot duration, and lead time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/New_York"
              />
            </div>
            <div>
              <Label>Slot Duration (minutes)</Label>
              <Input
                type="number"
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Lead Time (days)</Label>
              <Input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Define consultation types you offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {service.minutes} min · ${service.price}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Service name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Minutes"
                className="w-24"
                value={newService.minutes}
                onChange={(e) =>
                  setNewService({ ...newService, minutes: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                className="w-24"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: Number(e.target.value) })
                }
              />
              <Button onClick={addService} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
