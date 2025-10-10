import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, CreditCard, FileText } from "lucide-react";

interface InvoiceData {
  invoice: {
    id: string;
    invoiceNumber: string;
    description?: string;
    subtotal?: string;
    taxAmount?: string;
    total?: string;
    status?: string;
    dueDate?: string;
    paidAt?: string;
  };
  customer?: {
    name: string;
    email: string;
  };
  contract?: {
    id: string;
    title: string;
    contractNumber: string;
  };
}

export default function PortalInvoice() {
  const [, params] = useRoute("/portal/i/:token");
  const token = params?.token;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/portal/i/${token}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load invoice');
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handlePayment = async () => {
    if (!data || !token) return;

    setProcessingPayment(true);
    try {
      const response = await fetch(`/api/invoices/${data.invoice.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isPortal: true,
          returnUrl: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      
      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-2 text-slate-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card title="Error" className="max-w-md">
          <p className="text-red-600">{error || 'Invoice not found'}</p>
        </Card>
      </div>
    );
  }

  const { invoice, customer, contract } = data;
  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Invoice</h1>
          <p className="text-slate-600 mt-2">{invoice.invoiceNumber}</p>
        </div>

        {/* Status Banner */}
        {isPaid ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Paid</p>
              {invoice.paidAt && (
                <p className="text-green-700 text-sm">
                  Payment received on {new Date(invoice.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-orange-800 font-medium">Payment Pending</p>
              {invoice.dueDate && (
                <p className="text-orange-700 text-sm">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Invoice Details */}
        <Card title="Invoice Details" subtitle={customer?.name}>
          <div className="space-y-4">
            {invoice.description && (
              <p className="text-slate-600">{invoice.description}</p>
            )}

            {contract && (
              <div className="border-t pt-4">
                <p className="text-sm text-slate-500">Related Contract</p>
                <p className="font-medium">{contract.title}</p>
                <p className="text-sm text-slate-500">{contract.contractNumber}</p>
              </div>
            )}

            <div className="border-t pt-4 mt-4 space-y-2">
              {invoice.subtotal && (
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${invoice.subtotal}</span>
                </div>
              )}
              
              {invoice.taxAmount && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>${invoice.taxAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-semibold pt-2 border-t">
                <span>Total</span>
                <span>${invoice.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Actions */}
        {!isPaid && (
          <Card>
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Ready to pay your invoice?
              </p>
              <Button 
                variant="primary" 
                className="w-full sm:w-auto"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {processingPayment ? 'Processing...' : `Pay $${invoice.total}`}
              </Button>
              <p className="text-xs text-slate-500">
                Secure payment powered by Stripe
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
