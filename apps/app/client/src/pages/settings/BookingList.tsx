import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startISO: string;
  endISO: string;
  status: string;
  notes?: string;
  eventType?: string;
}

export default function BookingList() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/booking/list'],
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/booking/confirm/${id}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to confirm');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/booking/list'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/booking/cancel/${id}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to cancel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/booking/list'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Bookings"
        subtitle="Manage your consultation bookings"
      />

      <div className="grid gap-4 mt-6">
        {bookings?.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No bookings yet
          </div>
        )}

        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(booking.startISO), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(new Date(booking.startISO), 'p')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {booking.customerEmail}
                    </div>
                    {booking.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {booking.customerPhone}
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => confirmMutation.mutate(booking.id)}
                      disabled={confirmMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
