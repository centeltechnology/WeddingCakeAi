import { useState } from "react";
import { Calendar, Clock, Plus, X, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Availability, InsertAvailability } from "@shared/schema";

interface CalendarSystemProps {
  bakerId: string;
  isOwner?: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export function CalendarSystem({ bakerId, isOwner = false }: CalendarSystemProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'availability'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/availability`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return await response.json();
    },
  });

  const addAvailabilityMutation = useMutation({
    mutationFn: (data: InsertAvailability) => 
      apiRequest('POST', '/api/availability', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'availability'] });
      setIsAddingSlot(false);
      setSelectedDate("");
      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertAvailability> }) => 
      apiRequest('PUT', `/api/availability/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'availability'] });
      toast({
        title: "Availability Updated",
        description: "Your availability has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddTimeSlot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const timeSlots: TimeSlot[] = [
      {
        start: formData.get('startTime') as string,
        end: formData.get('endTime') as string,
        available: true
      }
    ];

    addAvailabilityMutation.mutate({
      bakerId,
      date: selectedDate,
      timeSlots: JSON.stringify(timeSlots),
      isBlocked: false
    });
  };

  const handleBlockDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addAvailabilityMutation.mutate({
      bakerId,
      date: selectedDate,
      timeSlots: JSON.stringify([]),
      isBlocked: true,
      blockReason: formData.get('blockReason') as string
    });
  };

  const toggleTimeSlotAvailability = (availabilityId: string, slotIndex: number, currentSlots: TimeSlot[]) => {
    const updatedSlots = [...currentSlots];
    updatedSlots[slotIndex].available = !updatedSlots[slotIndex].available;
    
    updateAvailabilityMutation.mutate({
      id: availabilityId,
      updates: { timeSlots: JSON.stringify(updatedSlots) }
    });
  };

  const toggleBlockDate = (availabilityId: string, isCurrentlyBlocked: boolean) => {
    updateAvailabilityMutation.mutate({
      id: availabilityId,
      updates: { 
        isBlocked: !isCurrentlyBlocked,
        blockReason: isCurrentlyBlocked ? null : "Unavailable"
      }
    });
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const getAvailabilityForDate = (date: string) => {
    // Handle different availability data formats
    if (Array.isArray(availability)) {
      return availability.find(a => a.date === date);
    }
    // For template-based availability, return null as it's handled differently
    return null;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card data-testid="calendar-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 21 }, (_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      <Card data-testid="calendar-system">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Calendar
            {isOwner && (
              <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-availability">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Availability
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-add-availability">
                  <DialogHeader>
                    <DialogTitle>Add Availability</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={formatDate(new Date())}
                        required
                        data-testid="input-date"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Add Time Slot</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddTimeSlot} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label htmlFor="startTime" className="text-xs">Start</Label>
                                <Input
                                  id="startTime"
                                  name="startTime"
                                  type="time"
                                  required
                                  data-testid="input-start-time"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="endTime" className="text-xs">End</Label>
                                <Input
                                  id="endTime"
                                  name="endTime"
                                  type="time"
                                  required
                                  data-testid="input-end-time"
                                />
                              </div>
                            </div>
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="w-full"
                              disabled={!selectedDate || addAvailabilityMutation.isPending}
                              data-testid="button-add-time-slot"
                            >
                              Add Time Slot
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Block Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleBlockDate} className="space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor="blockReason" className="text-xs">Reason</Label>
                              <Textarea
                                id="blockReason"
                                name="blockReason"
                                placeholder="e.g., Already booked, Personal day"
                                rows={2}
                                className="text-sm"
                                data-testid="textarea-block-reason"
                              />
                            </div>
                            <Button 
                              type="submit" 
                              size="sm" 
                              variant="destructive" 
                              className="w-full"
                              disabled={!selectedDate || addAvailabilityMutation.isPending}
                              data-testid="button-block-date"
                            >
                              Block Date
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 p-1 md:p-2">
                {day}
              </div>
            ))}
            
            {calendarDays.slice(0, 21).map(date => {
              const dateStr = formatDate(date);
              const dayAvailability = getAvailabilityForDate(dateStr);
              const isToday = formatDate(new Date()) === dateStr;
              
              return (
                <div 
                  key={dateStr}
                  className={`relative p-1 md:p-2 min-h-[40px] md:min-h-[48px] border rounded cursor-pointer transition-colors ${
                    isToday ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'
                  } ${
                    dayAvailability?.isBlocked 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : dayAvailability 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  data-testid={`calendar-day-${dateStr}`}
                >
                  <div className="text-xs md:text-sm font-medium">{date.getDate()}</div>
                  
                  {dayAvailability && (
                    <div className="absolute bottom-1 right-1">
                      {dayAvailability.isBlocked ? (
                        <X className="w-3 h-3 text-red-500" />
                      ) : (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Availability Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded" />
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Availability List */}
      <Card data-testid="availability-details">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Detailed Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(availability) || availability.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>
                {!Array.isArray(availability) 
                  ? 'Using template-based availability. Individual slots not shown here.'
                  : `No availability set. ${isOwner ? 'Add your first availability above.' : 'Check back later for updates.'}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(availability as any[])
                .sort((a: any, b: any) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
                .map((avail: any) => {
                  const timeSlots: TimeSlot[] = JSON.parse(avail.timeSlots as string);
                  
                  return (
                    <div key={avail.id} className="border rounded-lg p-4 dark:border-gray-700" data-testid={`availability-${avail.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">
                            {formatDisplayDate(avail.date!)}
                          </h4>
                          {avail.isBlocked && avail.blockReason && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {avail.blockReason}
                            </p>
                          )}
                        </div>
                        
                        {isOwner && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={avail.isBlocked ? "default" : "destructive"}
                              onClick={() => toggleBlockDate(avail.id, avail.isBlocked || false)}
                              data-testid={`button-toggle-block-${avail.id}`}
                            >
                              {avail.isBlocked ? "Unblock" : "Block"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {!avail.isBlocked && timeSlots.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {timeSlots.map((slot, index) => (
                            <div 
                              key={index}
                              className={`p-2 md:p-3 rounded border text-xs md:text-sm ${
                                slot.available 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                              }`}
                              data-testid={`time-slot-${avail.id}-${index}`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{slot.start} - {slot.end}</span>
                                {isOwner && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2"
                                    onClick={() => toggleTimeSlotAvailability(avail.id, index, timeSlots)}
                                    data-testid={`button-toggle-slot-${avail.id}-${index}`}
                                  >
                                    {slot.available ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                  </Button>
                                )}
                              </div>
                              <Badge 
                                variant={slot.available ? "default" : "secondary"} 
                                className="text-xs mt-1"
                              >
                                {slot.available ? "Available" : "Booked"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}