import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import type { Availability, Baker } from "@shared/schema";

interface BookingCalendarProps {
  baker: Baker;
  onBookingComplete?: (consultationId: string) => void;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export function BookingCalendar({ baker, onBookingComplete }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventType: "wedding",
    eventDate: "",
    guestCount: "",
    budget: "",
    dietaryRestrictions: "",
    notes: ""
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: Date/Time, 2: Info, 3: Confirmation
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: [`/api/bakers/${baker.id}/availability`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${baker.id}/availability`);
      return response as Availability[];
    },
  });

  const bookConsultationMutation = useMutation({
    mutationFn: (consultationData: any) => 
      apiRequest('POST', '/api/consultations', consultationData),
    onSuccess: (consultation) => {
      toast({
        title: "Consultation Booked!",
        description: `Your consultation with ${baker.businessName || baker.name} has been successfully booked for ${format(selectedDate!, 'MMMM d, yyyy')} at ${selectedTimeSlot}.`,
      });
      
      if (onBookingComplete) {
        onBookingComplete(consultation.id);
      }
      
      // Reset form
      setSelectedDate(null);
      setSelectedTimeSlot("");
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        eventType: "wedding",
        eventDate: "",
        guestCount: "",
        budget: "",
        dietaryRestrictions: "",
        notes: ""
      });
      setCurrentStep(1);
      
      queryClient.invalidateQueries({ queryKey: [`/api/bakers/${baker.id}/availability`] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book consultation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Process availability data to get available dates
  useEffect(() => {
    if (availability.length > 0) {
      const today = startOfDay(new Date());
      const dates = availability
        .filter(avail => {
          const availDate = new Date(avail.date);
          return isAfter(availDate, today) || availDate.getTime() === today.getTime();
        })
        .filter(avail => !avail.isBlocked && avail.timeSlots)
        .filter(avail => {
          try {
            const timeSlots = typeof avail.timeSlots === 'string' 
              ? JSON.parse(avail.timeSlots) 
              : avail.timeSlots;
            return Array.isArray(timeSlots) && timeSlots.some((slot: TimeSlot) => slot.available);
          } catch {
            return false;
          }
        })
        .map(avail => avail.date)
        .sort();
      
      setAvailableDates(dates);
    }
  }, [availability]);

  // Process time slots for selected date
  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayAvailability = availability.find(avail => avail.date === dateStr);
      
      if (dayAvailability && dayAvailability.timeSlots) {
        try {
          const timeSlots = typeof dayAvailability.timeSlots === 'string' 
            ? JSON.parse(dayAvailability.timeSlots) 
            : dayAvailability.timeSlots;
          
          if (Array.isArray(timeSlots)) {
            setAvailableTimeSlots(timeSlots.filter((slot: TimeSlot) => slot.available));
          }
        } catch {
          setAvailableTimeSlots([]);
        }
      } else {
        setAvailableTimeSlots([]);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availability]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedDate && selectedTimeSlot) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.customerName && formData.customerEmail) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTimeSlot) return;

    const consultationData = {
      bakerId: baker.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || null,
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeSlot: selectedTimeSlot,
      duration: 60,
      type: "consultation",
      status: "pending",
      notes: formData.notes || null,
      eventType: formData.eventType || null,
      eventDate: formData.eventDate || null,
      guestCount: formData.guestCount ? parseInt(formData.guestCount) : null,
      budget: formData.budget || null,
      dietaryRestrictions: formData.dietaryRestrictions || null,
      consultationFee: null,
      depositAmount: null,
      paymentStatus: "pending"
    };

    bookConsultationMutation.mutate(consultationData);
  };

  const renderCalendarDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
      
      dates.push(
        <button
          key={dateStr}
          onClick={() => isAvailable ? handleDateSelect(date) : null}
          disabled={!isAvailable}
          className={`
            p-3 rounded-lg border text-sm font-medium transition-colors
            ${isSelected 
              ? 'bg-pink-500 text-white border-pink-500' 
              : isAvailable 
                ? 'bg-white hover:bg-pink-50 border-gray-200 text-gray-900 hover:border-pink-300'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            }
          `}
          data-testid={`date-${dateStr}`}
        >
          <div className="font-bold">{format(date, 'd')}</div>
          <div className="text-xs">{format(date, 'EEE')}</div>
        </button>
      );
    }
    
    return dates;
  };

  if (isLoadingAvailability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Book Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Book Consultation
        </CardTitle>
        <CardDescription>
          Schedule a consultation with {baker.businessName || baker.name}
        </CardDescription>
        
        {/* Progress indicators */}
        <div className="flex items-center space-x-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {currentStep > step ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`
                  w-12 h-1 mx-2
                  ${currentStep > step ? 'bg-pink-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Date and Time Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Select Date</Label>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDates()}
              </div>
            </div>
            
            {selectedDate && (
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Available Times on {format(selectedDate, 'MMMM d, yyyy')}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const timeSlotStr = `${slot.start}-${slot.end}`;
                    const isSelected = selectedTimeSlot === timeSlotStr;
                    
                    return (
                      <button
                        key={timeSlotStr}
                        onClick={() => handleTimeSlotSelect(timeSlotStr)}
                        className={`
                          p-3 rounded-lg border text-sm font-medium transition-colors
                          ${isSelected 
                            ? 'bg-pink-500 text-white border-pink-500' 
                            : 'bg-white hover:bg-pink-50 border-gray-200 text-gray-900 hover:border-pink-300'
                          }
                        `}
                        data-testid={`time-slot-${timeSlotStr}`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        {slot.start} - {slot.end}
                      </button>
                    );
                  })}
                </div>
                
                {availableTimeSlots.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No available time slots for this date
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={handleNextStep}
                disabled={!selectedDate || !selectedTimeSlot}
                data-testid="button-next-step-1"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-pink-50 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                <span className="font-medium text-pink-800">
                  {format(selectedDate!, 'MMMM d, yyyy')} at {selectedTimeSlot}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter your full name"
                  data-testid="input-customer-name"
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="your@email.com"
                  data-testid="input-customer-email"
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger data-testid="select-event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  data-testid="input-event-date"
                />
              </div>
              
              <div>
                <Label htmlFor="guestCount">Guest Count</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                  placeholder="100"
                  data-testid="input-guest-count"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger data-testid="select-budget">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                  <SelectItem value="2000-5000">$2,000 - $5,000</SelectItem>
                  <SelectItem value="5000-plus">$5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                placeholder="e.g., gluten-free, vegan, nut allergies"
                data-testid="input-dietary-restrictions"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Tell us about your vision, any special requests, or questions you have..."
                rows={4}
                data-testid="textarea-notes"
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step-2">
                Previous
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!formData.customerName || !formData.customerEmail}
                data-testid="button-next-step-2"
              >
                Review Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Baker:</span>
                  <span className="font-medium">{baker.businessName || baker.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {format(selectedDate!, 'MMMM d, yyyy')} at {selectedTimeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.customerEmail}</span>
                </div>
                {formData.eventType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Type:</span>
                    <span className="font-medium capitalize">{formData.eventType}</span>
                  </div>
                )}
                {formData.eventDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Date:</span>
                    <span className="font-medium">{format(new Date(formData.eventDate), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                {formData.guestCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest Count:</span>
                    <span className="font-medium">{formData.guestCount}</span>
                  </div>
                )}
                {formData.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget Range:</span>
                    <span className="font-medium">{formData.budget}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What to Expect</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• The baker will contact you to confirm details</li>
                <li>• Come prepared with your vision and any inspiration photos</li>
                <li>• Duration: approximately 60 minutes</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step-3">
                Previous
              </Button>
              <Button 
                onClick={handleConfirmBooking}
                disabled={bookConsultationMutation.isPending}
                data-testid="button-confirm-booking"
              >
                {bookConsultationMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}