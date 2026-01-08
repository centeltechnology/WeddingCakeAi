import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Users, FileText, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import type { Consultation, Contract, Booking } from "@shared/schema";

interface MonthlyCommitmentsCalendarProps {
  bakerId: string;
}

interface DayCommitment {
  consultations: Consultation[];
  contracts: Contract[];
  bookings: Booking[];
  revenue: number;
}

export function MonthlyCommitmentsCalendar({ bakerId }: MonthlyCommitmentsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: [`/api/bakers/${bakerId}/consultations`],
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: [`/api/contracts?bakerId=${bakerId}`],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/booking/list'],
  });

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

  const getCommitmentsForDate = (date: Date): DayCommitment => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayConsultations = consultations.filter(c => 
      format(new Date(c.date), 'yyyy-MM-dd') === dateStr
    );
    
    const dayContracts = contracts.filter(c => 
      c.eventDate && format(new Date(c.eventDate), 'yyyy-MM-dd') === dateStr
    );

    const dayBookings = confirmedBookings.filter(b => 
      b.startISO && format(new Date(b.startISO), 'yyyy-MM-dd') === dateStr
    );
    
    const revenue = dayContracts.reduce((sum, contract) => {
      return sum + (parseFloat(contract.totalAmount as any) || 0);
    }, 0);
    
    return {
      consultations: dayConsultations,
      contracts: dayContracts,
      bookings: dayBookings,
      revenue
    };
  };

  const getTotalMonthlyRevenue = () => {
    return contracts
      .filter(c => {
        if (!c.eventDate) return false;
        const contractDate = new Date(c.eventDate);
        return isSameMonth(contractDate, currentDate);
      })
      .reduce((sum, contract) => sum + (parseFloat(contract.totalAmount as any) || 0), 0);
  };

  const getTotalMonthlyConsultations = () => {
    return consultations.filter(c => {
      const consultationDate = new Date(c.date);
      return isSameMonth(consultationDate, currentDate);
    }).length;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isLoading = consultationsLoading || contractsLoading || bookingsLoading;

  const getTotalMonthlyBookings = () => {
    return confirmedBookings.filter(b => {
      if (!b.startISO) return false;
      const bookingDate = new Date(b.startISO);
      return isSameMonth(bookingDate, currentDate);
    }).length;
  };

  return (
    <Card data-testid="monthly-commitments-calendar">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Commitments Calendar
            </CardTitle>
            <CardDescription>View all bookings, contracts, and revenue commitments</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[150px] text-center" data-testid="current-month">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                  <p className="text-2xl font-bold" data-testid="total-bookings">
                    {getTotalMonthlyBookings()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consultations</p>
                  <p className="text-2xl font-bold" data-testid="total-consultations">
                    {getTotalMonthlyConsultations()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contracts</p>
                  <p className="text-2xl font-bold" data-testid="total-contracts">
                    {contracts.filter(c => c.eventDate && isSameMonth(new Date(c.eventDate), currentDate)).length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold" data-testid="total-revenue">
                    ${getTotalMonthlyRevenue().toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-muted">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const commitments = getCommitmentsForDate(day);
                const hasCommitments = commitments.consultations.length > 0 || commitments.contracts.length > 0 || commitments.bookings.length > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border-r border-b last:border-r-0 ${
                      !isCurrentMonth ? 'bg-muted/30' : ''
                    } ${isTodayDate ? 'bg-primary/5 border-primary' : ''}`}
                    data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isTodayDate ? 'text-primary font-bold' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    
                    {isCurrentMonth && hasCommitments && (
                      <div className="space-y-1">
                        {commitments.bookings.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs w-full justify-center py-0.5 bg-purple-100 text-purple-800 hover:bg-purple-200"
                            data-testid={`booking-badge-${format(day, 'yyyy-MM-dd')}`}
                          >
                            {commitments.bookings.length} booking{commitments.bookings.length !== 1 ? 's' : ''}
                          </Badge>
                        )}

                        {commitments.consultations.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs w-full justify-center py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-200"
                            data-testid={`consultation-badge-${format(day, 'yyyy-MM-dd')}`}
                          >
                            {commitments.consultations.length} consult{commitments.consultations.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        {commitments.contracts.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs w-full justify-center py-0.5 bg-green-100 text-green-800 hover:bg-green-200"
                            data-testid={`contract-badge-${format(day, 'yyyy-MM-dd')}`}
                          >
                            {commitments.contracts.length} contract{commitments.contracts.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        {commitments.revenue > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs w-full justify-center py-0.5 bg-orange-100 text-orange-800 hover:bg-orange-200"
                            data-testid={`revenue-badge-${format(day, 'yyyy-MM-dd')}`}
                          >
                            ${commitments.revenue.toFixed(0)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
