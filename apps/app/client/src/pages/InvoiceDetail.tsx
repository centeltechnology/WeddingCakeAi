import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Download, DollarSign, Calendar, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  paidAmount?: string;
  status: string;
  dueDate?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{
    description: string;
    amount: string;
  }>;
  createdAt: string;
}

export default function InvoiceDetail() {
  const [, params] = useRoute('/invoices/:id');
  const { toast } = useToast();
  const invoiceId = params?.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId && invoiceId !== 'new') {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load invoice'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    toast({
      title: 'Payment',
      description: 'Stripe payment integration would open here'
    });
  };

  const handleDownload = () => {
    toast({
      title: 'Download',
      description: 'PDF generation would happen here'
    });
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading invoice...</div>
      </div>
    );
  }

  const outstandingAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount || '0');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">Invoice Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {outstandingAmount > 0 && (
            <Button onClick={handlePayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay by Card
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                  {invoice.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="space-y-3">
                {invoice.customerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{invoice.customerName}</span>
                  </div>
                )}
                {invoice.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{invoice.customerEmail}</span>
                  </div>
                )}
                {invoice.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{invoice.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <span>{item.description}</span>
                      <span className="font-medium">${parseFloat(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">${parseFloat(invoice.totalAmount).toFixed(2)}</span>
              </div>
              {invoice.paidAmount && parseFloat(invoice.paidAmount) > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Paid</span>
                  <span>-${parseFloat(invoice.paidAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Outstanding</span>
                <span>${outstandingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {outstandingAmount > 0 && (
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Pay by Card</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Secure payment powered by Stripe
                    </p>
                    <Button className="w-full" onClick={handlePayment}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${outstandingAmount.toFixed(2)}
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Manual Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact the business directly for alternative payment methods.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
