import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  category?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  eventDate?: string;
  eventType?: string;
  guestCount?: number;
  deliveryAddress?: string;
  setupTime?: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  depositAmount?: string;
  status: string;
  validUntil?: string;
  terms?: string;
  items: QuoteItem[];
  approvedAt?: string;
  declinedAt?: string;
  declineReason?: string;
}

interface Baker {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
}

export default function QuoteApprovalPage() {
  const [, params] = useRoute('/quote-approval/:token');
  const token = params?.token;
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [baker, setBaker] = useState<Baker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  useEffect(() => {
    if (token) {
      fetchQuote();
    }
  }, [token]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/approve/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load quote');
        return;
      }
      
      const data = await response.json();
      setQuote(data.quote);
      setBaker(data.baker);
    } catch (err) {
      setError('Failed to load quote. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/quotes/approve/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve quote');
      }
      
      setActionCompleted(true);
      toast({
        title: 'Quote Approved!',
        description: 'The baker has been notified of your approval.',
      });
      
      // Refresh quote to show updated status
      fetchQuote();
    } catch (err: any) {
      toast({
        title: 'Approval Failed',
        description: err.message || 'An error occurred while approving the quote.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/quotes/decline/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline quote');
      }
      
      setActionCompleted(true);
      setShowDeclineDialog(false);
      toast({
        title: 'Quote Declined',
        description: 'The baker has been notified.',
      });
      
      // Refresh quote to show updated status
      fetchQuote();
    } catch (err: any) {
      toast({
        title: 'Decline Failed',
        description: err.message || 'An error occurred while declining the quote.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
              <p className="text-gray-600">{error || 'This quote link may be invalid or expired.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = quote.validUntil && new Date() > new Date(quote.validUntil);
  const canTakeAction = !quote.approvedAt && !quote.declinedAt && !isExpired && !actionCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quote Review</h1>
          <p className="text-gray-600">Please review the details below and approve or decline</p>
        </div>

        {/* Status Banner */}
        {quote.approvedAt && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="flex items-center justify-center py-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-green-800 font-semibold">
                This quote has been approved
              </span>
            </CardContent>
          </Card>
        )}

        {quote.declinedAt && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="flex items-center justify-center py-4">
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-red-800 font-semibold">
                This quote has been declined
              </span>
            </CardContent>
          </Card>
        )}

        {isExpired && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="flex items-center justify-center py-4">
              <Clock className="w-6 h-6 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-semibold">
                This quote has expired
              </span>
            </CardContent>
          </Card>
        )}

        {/* Quote Details */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{quote.title}</h2>
                <p className="text-orange-100">Quote #{quote.quoteNumber}</p>
              </div>
              <Badge className="bg-white text-orange-600 px-4 py-2 text-lg">
                ${parseFloat(quote.total).toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {quote.description && (
              <p className="text-gray-700 mb-6">{quote.description}</p>
            )}

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {quote.eventDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-semibold">{new Date(quote.eventDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {quote.eventType && (
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {quote.eventType === 'wedding' ? '💒' : quote.eventType === 'birthday' ? '🎂' : '🎉'}
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-semibold capitalize">{quote.eventType}</p>
                  </div>
                </div>
              )}
              {quote.guestCount && (
                <div className="flex items-center">
                  <User className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Guest Count</p>
                    <p className="font-semibold">{quote.guestCount} guests</p>
                  </div>
                </div>
              )}
              {quote.deliveryAddress && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-semibold">{quote.deliveryAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items */}
            {quote.items && quote.items.length > 0 && (
              <div className="border-t border-b py-4 mb-4">
                <h3 className="font-semibold text-lg mb-4">Items</h3>
                <div className="space-y-3">
                  {quote.items.map((item) => (
                    <div key={item.id} className="flex justify-between" data-testid={`quote-item-${item.id}`}>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${parseFloat(item.totalPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${parseFloat(quote.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax ({(parseFloat(quote.taxRate) * 100).toFixed(2)}%)</span>
                <span>${parseFloat(quote.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-orange-600">${parseFloat(quote.total).toFixed(2)}</span>
              </div>
              {quote.depositAmount && (
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Deposit Required</span>
                  <span className="font-semibold">${parseFloat(quote.depositAmount).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Terms */}
            {quote.terms && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Baker Info */}
        {baker && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-xl font-semibold">Baker Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="font-semibold">{baker.businessName || baker.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-orange-600 mr-2" />
                  <a href={`mailto:${baker.email}`} className="text-orange-600 hover:underline">
                    {baker.email}
                  </a>
                </div>
                {baker.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-orange-600 mr-2" />
                    <a href={`tel:${baker.phone}`} className="text-orange-600 hover:underline">
                      {baker.phone}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {canTakeAction && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg"
                  data-testid="button-approve-quote"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Quote
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowDeclineDialog(true)}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 py-6 text-lg"
                  data-testid="button-decline-quote"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Decline Dialog */}
        <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Quote</DialogTitle>
              <DialogDescription>
                Please let the baker know why you're declining this quote (optional).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Reason for declining (optional)..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                data-testid="textarea-decline-reason"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeclineDialog(false)}
                disabled={submitting}
                data-testid="button-cancel-decline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-confirm-decline"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Decline Quote'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
