import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentLinksManager } from './PaymentLinksManager';
import { AvailabilitySettings } from './AvailabilitySettings';
import { 
  CreditCard, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  Receipt,
  Wallet,
  FileCheck
} from 'lucide-react';

interface PaymentManagerProps {
  bakerId: string;
}

interface Payment {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  contractId?: string;
  amount: string;
  paidAmount: string;
  remainingAmount: string;
  dueDate: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}

interface PaymentPlan {
  id: string;
  contractId: string;
  customerName: string;
  totalAmount: string;
  depositAmount: string;
  finalAmount: string;
  depositPaid: boolean;
  finalPaid: boolean;
  depositDueDate: string;
  finalDueDate: string;
}

export function PaymentManager({ bakerId }: PaymentManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('payment-info');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch transactions/payments from API
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<any[]>({
    queryKey: ['/api/bakers', bakerId, 'transactions'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  // Fetch quotes for payment integration
  const { data: quotes = [] } = useQuery({
    queryKey: ['/api/quotes', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/quotes?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      return response.json();
    }
  });

  // Fetch payment plans from API
  const { data: paymentPlans = [] } = useQuery<PaymentPlan[]>({
    queryKey: ['/api/bakers', bakerId, 'payment-plans'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/payment-plans`);
      if (!response.ok) throw new Error('Failed to fetch payment plans');
      return response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const handleSendInvoice = (payment: Payment) => {
    toast({
      title: "Invoice Sent",
      description: `Invoice ${payment.invoiceNumber} sent to ${payment.customerName}.`,
    });
  };

  const handleProcessPayment = (payment: Payment) => {
    toast({
      title: "Payment Link Sent",
      description: `Secure payment link sent to ${payment.customerName}.`,
    });
  };

  const paymentStats = {
    totalRevenue: payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0),
    pendingAmount: payments
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0),
    overdueCount: payments.filter((p: any) => p.status === 'failed').length,
    thisMonth: payments
      .filter((p: any) => {
        const paymentDate = new Date(p.createdAt);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear() &&
               p.status === 'completed';
      })
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Payment Management</h2>
          <p className="text-muted-foreground">Track payments, deposits, and invoicing</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-invoice">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate an invoice for payment collection.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Invoice Builder</h3>
              <p className="text-muted-foreground mb-4">
                Advanced invoicing with automated payment processing.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Updated for Manual Payment System */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Links</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Ready</div>
            <p className="text-xs text-muted-foreground">Manual payment system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Set</div>
            <p className="text-xs text-muted-foreground">Schedule configured</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Pay</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">You handle payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment-info" data-testid="tab-payment-info">
            <Wallet className="h-4 w-4 mr-2" />
            Payment Info
          </TabsTrigger>
          <TabsTrigger value="availability" data-testid="tab-availability">
            <Calendar className="h-4 w-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="bookings" data-testid="tab-bookings">
            <Clock className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-payment-analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-info" className="space-y-4">
          <PaymentLinksManager bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <AvailabilitySettings bakerId={bakerId} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Customer Bookings
              </CardTitle>
              <CardDescription>
                Manage consultation appointments and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Booking Calendar</h3>
                <p className="text-muted-foreground mb-4">
                  Customer booking calendar with your availability settings.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Manual Payment Tracking
              </CardTitle>
              <CardDescription>
                Track payments received through your payment links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Manual Payment Records</h3>
                <p className="text-muted-foreground mb-4">
                  Since you handle payments directly, you can manually track them here for your records.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {paymentPlans.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-xl">
              <CardContent className="text-center py-16">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-xl opacity-30"></div>
                  <Calendar className="h-20 w-20 text-blue-400 mx-auto mb-4 relative" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No payment plans yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Payment plans help you manage installments and track deposits. They'll appear here automatically when you create contracts with payment schedules.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '#contracts'}
                  data-testid="button-create-contract-for-payment"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Create a Contract
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentPlans.map((plan) => {
            const depositProgress = plan.depositPaid ? 100 : 0;
            const finalProgress = plan.finalPaid ? 100 : 0;
            const overallProgress = (depositProgress + finalProgress) / 2;
            
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.customerName}</CardTitle>
                      <CardDescription>Payment Plan • Total: ${plan.totalAmount}</CardDescription>
                    </div>
                    <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                      {overallProgress === 100 ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium">Overall Progress</Label>
                      <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {paymentPlans.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-xl">
              <CardContent className="text-center py-16">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-xl opacity-30"></div>
                  <Calendar className="h-20 w-20 text-blue-400 mx-auto mb-4 relative" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No payment plans yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Payment plans help you manage installments and track deposits. They'll appear here automatically when you create contracts with payment schedules.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '#contracts'}
                  data-testid="button-create-contract-for-payment"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Create a Contract
                </Button>
              </CardContent>
            </Card>
          ) : (
            paymentPlans.map((plan) => {
            const depositProgress = plan.depositPaid ? 100 : 0;
            const finalProgress = plan.finalPaid ? 100 : 0;
            const overallProgress = (depositProgress + finalProgress) / 2;
            
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.customerName}</CardTitle>
                      <CardDescription>Payment Plan • Total: ${plan.totalAmount}</CardDescription>
                    </div>
                    <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                      {overallProgress === 100 ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium">Overall Progress</Label>
                      <span className="text-sm text-muted-foreground">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Deposit</CardTitle>
                          {plan.depositPaid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">${plan.depositAmount}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(plan.depositDueDate).toLocaleDateString()}
                        </p>
                        <Badge className={plan.depositPaid ? 'bg-green-100 text-green-800 mt-2' : 'bg-yellow-100 text-yellow-800 mt-2'}>
                          {plan.depositPaid ? 'Paid' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Final Payment</CardTitle>
                          {plan.finalPaid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">${plan.finalAmount}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(plan.finalDueDate).toLocaleDateString()}
                        </p>
                        <Badge className={plan.finalPaid ? 'bg-green-100 text-green-800 mt-2' : 'bg-yellow-100 text-yellow-800 mt-2'}>
                          {plan.finalPaid ? 'Paid' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Payment Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Detailed revenue reporting and payment trends.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}