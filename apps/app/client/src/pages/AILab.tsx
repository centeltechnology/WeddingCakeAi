import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, FileSignature, CheckCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

type AIResult = {
  items?: Array<{ name: string; qty: number; unit: string; price: number }>;
  summary?: string;
  clauses?: string[];
};

export default function AILab() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [resultType, setResultType] = useState<string | null>(null);
  const { toast } = useToast();

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
      });

      if (!response.ok) {
        throw new Error('AI endpoint failed');
      }

      const data = await response.json();
      if (data.ok) {
        setResult(data);
        setResultType(action);
        toast({
          title: "Success",
          description: "AI request completed successfully",
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
      <PageHeader title="AI Lab" subtitle="Test AI-powered features for quotes and contracts" />

      <div className="grid gap-6">
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
              disabled={loading === 'suggest-items'}
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
              disabled={loading === 'summarize-quote'}
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
              Create a contract draft based on approved quote details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleAIAction('generate-contract', '/api/ai/generate-contract')}
              disabled={loading === 'generate-contract'}
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
                AI Results
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
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2">{item.name}</td>
                            <td className="text-center py-2">{item.qty}</td>
                            <td className="text-center py-2">{item.unit}</td>
                            <td className="text-right py-2">${item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
