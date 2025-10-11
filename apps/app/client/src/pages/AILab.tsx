import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, FileText, FileSignature, CheckCircle, AlertCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AIResult = {
  quoteId?: string;
  items?: Array<{ name: string; qty: number; unit: string; price: number; rationale?: string }>;
  summary?: string;
  clauses?: string[];
  brief?: string | null;
};

type Quote = {
  id: string;
  quoteNumber: string;
  title: string;
  customerName?: string;
  status: string;
};

type Lead = {
  id: string;
  customerName: string;
  customerEmail: string;
  source?: string;
};

export default function AILab() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [resultType, setResultType] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | undefined>();
  const [leadId, setLeadId] = useState<string | undefined>();
  const [brief, setBrief] = useState('');
  const { toast } = useToast();

  // Fetch quotes for dropdown
  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    queryFn: async () => {
      const res = await fetch('/api/quotes?limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    },
  });

  // Fetch leads for dropdown
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads?limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
  });

  const canRun = Boolean(quoteId || leadId);

  const handleAIAction = async (action: string, endpoint: string) => {
    setLoading(action);
    setResult(null);
    setResultType(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quoteId, leadId, brief: brief || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI endpoint failed');
      }

      const data = await response.json();
      if (data.ok) {
        setResult(data);
        setResultType(action);
        
        // Update quoteId if it was created from a lead
        if (data.quoteId && !quoteId) {
          setQuoteId(data.quoteId);
        }
        
        toast({
          title: "Success",
          description: data.quoteId && !quoteId 
            ? `Created draft quote and completed AI request`
            : "AI request completed successfully",
        });
      } else {
        throw new Error('AI request failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'AI endpoint failed',
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="AI Lab" subtitle="Test AI-powered features with explicit quote or lead context" />

      <div className="grid gap-6">
        {/* Context Panel */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Context Selection (Required)</CardTitle>
            <CardDescription className="text-blue-700">
              Select a quote or lead to provide context for AI actions. All AI features require explicit context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quote-select" className="text-blue-900">Select Quote</Label>
                <Select value={quoteId} onValueChange={setQuoteId}>
                  <SelectTrigger id="quote-select">
                    <SelectValue placeholder="Choose a quote..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.quoteNumber} - {quote.title} ({quote.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-select" className="text-blue-900">Select Lead (Optional)</Label>
                <Select value={leadId} onValueChange={setLeadId}>
                  <SelectTrigger id="lead-select">
                    <SelectValue placeholder="Choose a lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.customerName} ({lead.customerEmail})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brief" className="text-blue-900">Brief (Optional)</Label>
              <Textarea
                id="brief"
                placeholder="Add context like party size, flavors, theme, special requirements..."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {!canRun && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Pick a quote or select a lead to continue</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggest Items Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggest Items for Quote
            </CardTitle>
            <CardDescription>
              AI analyzes quote context and suggests relevant items to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleAIAction('suggest-items', '/api/ai/suggest-items')}
              disabled={loading === 'suggest-items' || !canRun}
              className="w-full sm:w-auto"
            >
              {loading === 'suggest-items' ? 'Processing...' : 'Suggest Items'}
            </Button>
          </CardContent>
        </Card>

        {/* Summarize Quote Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Summarize Quote
            </CardTitle>
            <CardDescription>
              Generate a concise summary of quote details for quick review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleAIAction('summarize-quote', '/api/ai/summarize-quote')}
              disabled={loading === 'summarize-quote' || !canRun}
              className="w-full sm:w-auto"
            >
              {loading === 'summarize-quote' ? 'Processing...' : 'Summarize Quote'}
            </Button>
          </CardContent>
        </Card>

        {/* Generate Contract Draft Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Generate Contract Draft
            </CardTitle>
            <CardDescription>
              Create a contract draft based on quote details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleAIAction('generate-contract', '/api/ai/generate-contract')}
              disabled={loading === 'generate-contract' || !canRun}
              className="w-full sm:w-auto"
            >
              {loading === 'generate-contract' ? 'Processing...' : 'Generate Contract'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Display */}
        {result && resultType && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                AI Results {result.quoteId && <span className="text-sm font-normal">(Quote: {result.quoteId.substring(0, 8)}...)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resultType === 'suggest-items' && result.items && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-green-900">Suggested Items:</h3>
                  <div className="bg-white rounded-md p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Item</th>
                          <th className="text-center pb-2">Qty</th>
                          <th className="text-center pb-2">Unit</th>
                          <th className="text-right pb-2">Price</th>
                          {result.items.some(i => i.rationale) && (
                            <th className="text-left pb-2 pl-4">Rationale</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2">{item.name}</td>
                            <td className="text-center py-2">{item.qty}</td>
                            <td className="text-center py-2">{item.unit}</td>
                            <td className="text-right py-2">${item.price}</td>
                            {item.rationale && (
                              <td className="py-2 pl-4 text-xs text-gray-600">{item.rationale}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.brief && (
                    <p className="text-xs text-gray-600 mt-2">Brief: {result.brief}</p>
                  )}
                </div>
              )}

              {resultType === 'summarize-quote' && result.summary && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-green-900">Quote Summary:</h3>
                  <div className="bg-white rounded-md p-4">
                    <p className="text-gray-700">{result.summary}</p>
                  </div>
                </div>
              )}

              {resultType === 'generate-contract' && result.clauses && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-green-900">Contract Clauses:</h3>
                  <div className="bg-white rounded-md p-4">
                    <ul className="space-y-2">
                      {result.clauses.map((clause, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-green-600 font-bold">{idx + 1}.</span>
                          <span className="text-gray-700">{clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
