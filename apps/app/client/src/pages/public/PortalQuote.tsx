import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface QuoteData {
  quote: {
    id: string;
    quoteNumber: string;
    title: string;
    description?: string;
    eventDate?: string;
    subtotal?: string;
    taxAmount?: string;
    total?: string;
    status?: string;
    items?: Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: string;
      total: string;
    }>;
  };
  customer?: {
    name: string;
    email: string;
  };
  template?: {
    snapshot?: string;
  };
}

export default function PortalQuote() {
  const [, params] = useRoute("/portal/q/:token");
  const token = params?.token;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuoteData | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/portal/q/${token}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load quote');
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setApproved(data.quote.status === 'approved');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleApprove = async () => {
    if (!token) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/portal/q/${token}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to approve quote');
      }

      setApproved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve quote');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-2 text-slate-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card title="Error" className="max-w-md">
          <p className="text-red-600">{error || 'Quote not found'}</p>
        </Card>
      </div>
    );
  }

  const { quote, customer, template } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Quote</h1>
          <p className="text-slate-600 mt-2">{quote.quoteNumber}</p>
        </div>

        {/* Success Banner */}
        {approved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Quote approved successfully!</p>
          </div>
        )}

        {/* Quote Details */}
        <Card title={quote.title} subtitle={customer?.name}>
          {template?.snapshot ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: template.snapshot }}
            />
          ) : (
            <div className="space-y-4">
              {quote.description && (
                <p className="text-slate-600">{quote.description}</p>
              )}
              
              {quote.eventDate && (
                <div>
                  <span className="font-medium">Event Date:</span>{' '}
                  <span className="text-slate-600">
                    {new Date(quote.eventDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {quote.items && quote.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Items</h3>
                  <div className="space-y-3">
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b pb-2">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-slate-500">{item.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.total}</div>
                          <div className="text-sm text-slate-500">
                            {item.quantity} × ${item.unitPrice}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${quote.total}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        {!approved && (
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={approving}
              className="min-w-[200px]"
            >
              {approving ? 'Approving...' : 'Approve Quote'}
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
