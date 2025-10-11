import { useState } from 'react';
import { useLocation } from 'wouter';
import { useRecentQuote, useAiFlags } from '@/hooks/useAiContext';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';

export default function AiQuickTiles() {
  const [, setLocation] = useLocation();
  const { data: recent } = useRecentQuote();
  const { aiOn } = useAiFlags();
  const { toast } = useToast();
  const [loading, setLoading] = useState<null | 'suggest' | 'summarize' | 'contract' | 'rescore' | 'sendtest'>(null);

  const disabled = !aiOn;

  async function run(path: string, body: any) {
    const r = await fetch(path, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || `Request failed: ${r.status}`);
    return j;
  }

  const qid = recent?.id;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {/* Price Suggestion */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Price Suggestion</div>
          <span className="text-xs rounded-full px-2 py-0.5 bg-black/5">
            {aiOn ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-sm mt-1 text-black/70">
          Get item suggestions and draft prices for a quote.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={disabled || !qid || loading === 'suggest'}
            loading={loading === 'suggest'}
            onClick={async () => {
              if (!qid) { 
                toast({ 
                  title: 'No Quote Selected', 
                  description: 'Pick a quote first',
                  variant: 'destructive'
                });
                setLocation('/ai-lab');
                return;
              }
              setLoading('suggest');
              try {
                const j = await run('/api/ai/suggest-items', { quoteId: qid });
                toast({
                  title: 'Items Suggested',
                  description: `Suggested ${j?.items?.length ?? 0} items`
                });
                setLocation(`/quotes/${qid}?tab=ai&suggested=1`);
              } catch (e: any) { 
                toast({
                  title: 'Suggestion Failed',
                  description: e.message,
                  variant: 'destructive'
                });
              } finally { 
                setLoading(null);
              }
            }}
          >
            Suggest for Last Quote
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/ai-lab')}>
            Open AI Lab
          </Button>
        </div>
        {!qid && (
          <div className="mt-2 text-xs text-black/50">
            No recent quote found — create or select one in Quotes.
          </div>
        )}
      </div>

      {/* Lead Scoring */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Lead Scoring</div>
          <span className="text-xs rounded-full px-2 py-0.5 bg-black/5">Active</span>
        </div>
        <p className="text-sm mt-1 text-black/70">
          Rank leads by likelihood to convert.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            variant="primary" 
            size="sm"
            disabled={loading === 'rescore'}
            loading={loading === 'rescore'}
            onClick={async () => {
              setLoading('rescore');
              try {
                await run('/api/leads/rescore', {});
                toast({
                  title: 'Leads Rescored',
                  description: 'All leads have been rescored successfully'
                });
              } catch {
                setLocation('/leads');
              } finally {
                setLoading(null);
              }
            }}
          >
            Rescore Now
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/leads?sort=score_desc')}>
            View Leads
          </Button>
        </div>
      </div>

      {/* Auto-Reply */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Auto-Reply</div>
          <span className="text-xs rounded-full px-2 py-0.5 bg-black/5">Configured?</span>
        </div>
        <p className="text-sm mt-1 text-black/70">
          Auto-respond to new leads with a friendly message.
        </p>
        <div className="mt-3 flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            disabled={loading === 'sendtest'}
            loading={loading === 'sendtest'}
            onClick={async () => {
              setLoading('sendtest');
              try {
                await run('/api/auto-reply/test', {});
                toast({
                  title: 'Test Sent',
                  description: 'Test reply sent (check logs)'
                });
              } catch (e: any) { 
                toast({
                  title: 'Test Failed',
                  description: e.message || 'Failed sending test',
                  variant: 'destructive'
                });
              } finally { 
                setLoading(null);
              }
            }}
          >
            Send Test
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation('/settings?tab=auto-reply')}>
            Configure
          </Button>
        </div>
      </div>
    </div>
  );
}
