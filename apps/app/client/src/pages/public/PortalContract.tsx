import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, FileText } from "lucide-react";

interface ContractData {
  contract: {
    id: string;
    contractNumber: string;
    title: string;
    content?: string;
    total?: string;
    depositAmount?: string;
    status?: string;
    signedAt?: string;
  };
  customer?: {
    name: string;
    email: string;
  };
  template?: {
    snapshot?: string;
  };
}

export default function PortalContract() {
  const [, params] = useRoute("/portal/c/:token");
  const token = params?.token;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ContractData | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/portal/c/${token}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load contract');
        }
        return res.json();
      })
      .then(data => {
        setData(data);
        setSigned(data.contract.status === 'signed');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleSign = async () => {
    if (!token) return;
    
    setSigning(true);
    try {
      const res = await fetch(`/api/portal/c/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: data?.customer?.name })
      });

      if (!res.ok) {
        throw new Error('Failed to sign contract');
      }

      const result = await res.json();
      setSigned(true);
      
      if (result.invoiceId) {
        // Could redirect to invoice or show success message with invoice info
        console.log('Deposit invoice created:', result.invoiceId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="mt-2 text-slate-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card title="Error" className="max-w-md">
          <p className="text-red-600">{error || 'Contract not found'}</p>
        </Card>
      </div>
    );
  }

  const { contract, customer, template } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contract</h1>
          <p className="text-slate-600 mt-2">{contract.contractNumber}</p>
        </div>

        {/* Success Banner */}
        {signed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Contract signed successfully!</p>
              {contract.depositAmount && (
                <p className="text-green-700 text-sm mt-1">
                  A deposit invoice for ${contract.depositAmount} has been created.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contract Details */}
        <Card title={contract.title} subtitle={customer?.name}>
          {template?.snapshot ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: template.snapshot }}
            />
          ) : (
            <div className="space-y-4">
              {contract.content && (
                <div className="whitespace-pre-wrap text-slate-700">
                  {contract.content}
                </div>
              )}

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Contract Total</span>
                  <span>${contract.total}</span>
                </div>
                {contract.depositAmount && (
                  <div className="flex justify-between text-slate-600 mt-2">
                    <span>Deposit Required</span>
                    <span>${contract.depositAmount}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Agreement */}
        {!signed && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-slate-700">
                    By signing this contract, you agree to the terms and conditions outlined above.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Your signature: <span className="font-medium">{customer?.name}</span>
                  </p>
                </div>
              </div>
              
              <Button
                variant="primary"
                onClick={handleSign}
                disabled={signing}
                className="w-full"
              >
                {signing ? 'Signing...' : 'Sign Contract'}
              </Button>
            </div>
          </Card>
        )}

        {/* Signed Info */}
        {signed && contract.signedAt && (
          <div className="text-center text-sm text-slate-500">
            Signed on {new Date(contract.signedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
