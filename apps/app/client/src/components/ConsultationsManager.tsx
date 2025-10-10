import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, Mail, MapPin, Users, DollarSign, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Consultation } from "@shared/schema";

interface ConsultationsManagerProps {
  bakerId: string;
}

export function ConsultationsManager({ bakerId }: ConsultationsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allConsultations = [], isLoading } = useQuery<Consultation[]>({
    queryKey: [`/api/bakers/${bakerId}/consultations`],
  });

  const { data: upcomingConsultations = [], isLoading: isLoadingUpcoming } = useQuery<Consultation[]>({
    queryKey: [`/api/bakers/${bakerId}/consultations/upcoming`],
  });

  const updateConsultationMutation = useMutation({
    mutationFn: (data: { id: string; status: string; reason?: string }) =>
      apiRequest('PUT', `/api/consultations/${data.id}`, { status: data.status, cancelReason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/consultations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/consultations/upcoming`] });
      toast({
        title: "Consultation Updated",
        description: "The consultation status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update consultation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const editConsultationMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Consultation> }) =>
      apiRequest('PUT', `/api/consultations/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/consultations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${bakerId}/consultations/upcoming`] });
      toast({
        title: "Consultation Updated",
        description: "Consultation details have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update consultation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const [open, setOpen] = useState(false);
    
    const formatDateForInput = (date: string) => {
      try {
        const d = new Date(date);
        return format(d, 'yyyy-MM-dd');
      } catch {
        return date;
      }
    };

    const formatTimeForInput = (time: string) => {
      if (!time) return '09:00';
      
      if (time.match(/^\d{2}:\d{2}$/)) {
        return time;
      }
      
      try {
        const timeParts = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = timeParts[2];
          const meridiem = timeParts[3].toUpperCase();
          
          if (meridiem === 'PM' && hours !== 12) {
            hours += 12;
          } else if (meridiem === 'AM' && hours === 12) {
            hours = 0;
          }
          
          return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        
        return time;
      } catch {
        return time;
      }
    };

    const [editData, setEditData] = useState({
      date: formatDateForInput(consultation.date),
      timeSlot: formatTimeForInput(consultation.timeSlot),
      duration: consultation.duration,
      notes: consultation.notes || ''
    });

    const handleSaveEdit = () => {
      if (!editData.duration || editData.duration < 1) {
        toast({
          title: "Invalid Duration",
          description: "Duration must be at least 1 minute.",
          variant: "destructive",
        });
        return;
      }

      editConsultationMutation.mutate({
        id: consultation.id,
        updates: editData
      }, {
        onSuccess: () => setOpen(false)
      });
    };

    return (
      <Card key={consultation.id} data-testid={`consultation-${consultation.id}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{consultation.customerName}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(consultation.date), 'MMMM d, yyyy')} at {consultation.timeSlot}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(consultation.status)}>
                {consultation.status ? consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1) : 'Unknown'}
              </Badge>
              {consultation.status !== 'cancelled' && consultation.status !== 'completed' && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" data-testid={`button-edit-${consultation.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-edit-consultation">
                    <DialogHeader>
                      <DialogTitle>Edit Consultation</DialogTitle>
                      <DialogDescription>
                        Update the booking details for {consultation.customerName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData({...editData, date: e.target.value})}
                          data-testid="input-edit-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-time">Time</Label>
                        <Input
                          id="edit-time"
                          type="time"
                          value={editData.timeSlot}
                          onChange={(e) => setEditData({...editData, timeSlot: e.target.value})}
                          data-testid="input-edit-time"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration">Duration (minutes)</Label>
                        <Input
                          id="edit-duration"
                          type="number"
                          min="1"
                          value={editData.duration}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setEditData({...editData, duration: val});
                            }
                          }}
                          data-testid="input-edit-duration"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-notes">Notes</Label>
                        <Textarea
                          id="edit-notes"
                          value={editData.notes}
                          onChange={(e) => setEditData({...editData, notes: e.target.value})}
                          placeholder="Add notes about the consultation..."
                          data-testid="input-edit-notes"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-edit">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveEdit} 
                        disabled={editConsultationMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600"
                        data-testid="button-save-edit"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{consultation.customerEmail}</span>
            </div>
            {consultation.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{consultation.customerPhone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{consultation.duration} minutes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {consultation.eventType && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{consultation.eventType.charAt(0).toUpperCase() + consultation.eventType.slice(1)}</span>
              </div>
            )}
            {consultation.guestCount && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{consultation.guestCount} guests</span>
              </div>
            )}
            {consultation.budget && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{consultation.budget}</span>
              </div>
            )}
          </div>
        </div>

        {consultation.notes && (
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {consultation.notes}
            </p>
          </div>
        )}

        {consultation.eventDate && (
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600">
              <strong>Event Date:</strong> {format(new Date(consultation.eventDate), 'MMMM d, yyyy')}
            </p>
          </div>
        )}

        {consultation.status === 'pending' && (
          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600"
              onClick={() => updateConsultationMutation.mutate({ 
                id: consultation.id, 
                status: 'confirmed' 
              })}
              disabled={updateConsultationMutation.isPending}
              data-testid={`button-confirm-${consultation.id}`}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateConsultationMutation.mutate({ 
                id: consultation.id, 
                status: 'cancelled',
                reason: 'Cancelled by baker'
              })}
              disabled={updateConsultationMutation.isPending}
              data-testid={`button-cancel-${consultation.id}`}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  if (isLoading || isLoadingUpcoming) {
    return (
      <Card data-testid="consultations-loading">
        <CardHeader>
          <CardTitle>Loading Consultations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="consultations-manager">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming-consultations">
            Upcoming ({upcomingConsultations.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all-consultations">
            All Consultations ({allConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingConsultations.length > 0 ? (
            upcomingConsultations.map(consultation => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No upcoming consultations</p>
                <p className="text-sm text-gray-400 mt-2">
                  New consultation bookings will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allConsultations.length > 0 ? (
            allConsultations.map(consultation => (
              <ConsultationCard key={consultation.id} consultation={consultation} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No consultations yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Customer bookings will appear here once they start booking consultations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}