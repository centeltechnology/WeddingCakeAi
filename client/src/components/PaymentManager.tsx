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
  Wallet
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
  const [activeTab, setActiveTab] = useState('payments');
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

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'plan-1',
      contractId: 'contract-1',
      customerName: 'Emily Thompson',
      totalAmount: '1386.56',
      depositAmount: '693.28',
      finalAmount: '693.28',
      depositPaid: true,
      finalPaid: false,
      depositDueDate: '2024-08-01',
      finalDueDate: '2024-09-08'
    },
    {
      id: 'plan-2',
      contractId: 'contract-2',
      customerName: 'Jessica Martinez',
      totalAmount: '1250.00',
      depositAmount: '625.00',
      finalAmount: '625.00',
      depositPaid: false,
      finalPaid: false,
      depositDueDate: '2024-12-01',
      finalDueDate: '2024-11-23'
    }
  ];

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paymentStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${paymentStats.thisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${paymentStats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{paymentStats.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Overdue payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" data-testid="tab-payments">
            <Receipt className="h-4 w-4 mr-2" />
            Invoices ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-payment-plans">
            <Calendar className="h-4 w-4 mr-2" />
            Payment Plans ({paymentPlans.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-payment-analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first invoice to start getting paid.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2">{payment.invoiceNumber}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {payment.customerName} • Due {new Date(payment.dueDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <p className="font-medium text-lg">${payment.amount}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Paid</Label>
                        <p className="font-medium text-green-600">${payment.paidAmount}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Remaining</Label>
                        <p className="font-medium text-red-600">${payment.remainingAmount}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Method</Label>
                        <p className="font-medium">{payment.paymentMethod || 'Not paid'}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleSendInvoice(payment)}>
                            <Send className="h-3 w-3 mr-1" />
                            Send Reminder
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleProcessPayment(payment)}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            Payment Link
                          </Button>
                        </>
                      )}
                      {payment.status === 'sent' && (
                        <Button variant="outline" size="sm" onClick={() => handleProcessPayment(payment)}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          Process Payment
                        </Button>
                      )}
                      {payment.status === 'overdue' && (
                        <Button variant="destructive" size="sm" onClick={() => handleSendInvoice(payment)}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Send Overdue Notice
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {paymentPlans.map((plan) => {
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
          })}
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