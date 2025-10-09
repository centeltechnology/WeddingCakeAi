import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, FileSignature } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

export default function AILab() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAIAction = async (action: string, endpoint: string) => {
    setLoading(action);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('AI endpoint missing.');
      }

      const data = await response.json();
      if (data.ok) {
        alert('AI request submitted (stubbed).');
      } else {
        alert('AI endpoint missing.');
      }
    } catch (error) {
      alert('AI endpoint missing.');
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
      </div>
    </AppLayout>
  );
}
