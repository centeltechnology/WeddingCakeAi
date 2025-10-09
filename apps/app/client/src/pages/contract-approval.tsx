import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Loader2, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  html: string;
  summary: {
    contractNumber: string;
    title: string;
    totalAmount: string;
    depositAmount?: string;
    eventDate?: string;
    status: string;
  };
}

export default function ContractApprovalPage() {
  const [, params] = useRoute('/contract-approval/:token');
  const token = params?.token;
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (token) {
      fetchContract();
    }
  }, [token]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/public/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load contract');
        return;
      }
      
      const data = await response.json();
      setContract(data);
    } catch (err) {
      setError('Failed to load contract. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signerName || !signerEmail) {
      toast({
        variant: 'destructive',
        title: 'Required Fields',
        description: 'Please enter your name and email to sign the contract'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/contracts/public/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          signerEmail,
          signerType: 'customer'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign contract');
      }

      setSigned(true);
      toast({
        title: 'Contract Signed!',
        description: 'You will receive a confirmation email shortly.'
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to sign contract'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading contract...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contract Not Found</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Contract Signed Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for signing the contract. You will receive a confirmation email at{' '}
                <span className="font-medium">{signerEmail}</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                You can close this page now.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{contract?.summary.title}</CardTitle>
                <p className="text-muted-foreground">Contract #{contract?.summary.contractNumber}</p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {contract?.summary.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {contract?.summary.totalAmount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">${parseFloat(contract.summary.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              )}
              {contract?.summary.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(contract.summary.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contract?.html || '' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Full Name</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerEmail">Email Address</Label>
              <Input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="text-muted-foreground">
                By signing this contract, you agree to the terms and conditions outlined above. 
                You will receive a confirmation email with a copy of the signed contract.
              </p>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleSign} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sign Contract
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
