import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, User, Phone, DollarSign, Calendar, MessageSquare, StickyNote, Send, TrendingUp, FileText, Cake, Layers, Palette, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

type Message = {
  id: string;
  direction: 'in' | 'out';
  channel: string;
  subject: string | null;
  body: string;
  createdAt: string;
};

type Note = {
  id: string;
  body: string;
  authorId: string | null;
  createdAt: string;
};

type TierConfig = {
  size: string;
  shape: string;
  flavor: string;
  servings: number;
};

type CalculatorPayload = {
  tiers?: TierConfig[];
  decorations?: string[];
  eventDate?: string;
  eventType?: string;
  guestCount?: number;
  venue?: string;
  pricing?: {
    total: number;
    basePrice?: number;
    decorationsTotal?: number;
    perServing?: number;
  };
};

type Lead = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  budget: string | null;
  weddingDate: string | null;
  status: string;
  source: string;
  message: string | null;
  createdAt: string;
  calculatorPayload?: CalculatorPayload | null;
  notes?: string | null;
};

type ThreadData = {
  messages: Message[];
  notes: Note[];
};

export default function LeadInbox() {
  const [, params] = useRoute('/leads/:id');
  const [, navigate] = useLocation();
  const leadId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'note'>('email');
  const [creatingQuote, setCreatingQuote] = useState(false);

  // Fetch lead details
  const { data: lead, isLoading: leadLoading, isError: leadError, refetch: refetchLead } = useQuery<Lead>({
    queryKey: [`/api/leads/${leadId}`],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch lead');
      const data = await res.json();
      console.log('[DEBUG] Lead data received:', JSON.stringify(data, null, 2));
      console.log('[DEBUG] calculatorPayload:', data.calculatorPayload);
      console.log('[DEBUG] calculator_payload:', data.calculator_payload);
      return data;
    },
    enabled: !!leadId,
    retry: 2,
  });

  // Fetch thread (messages + notes)
  const { data: thread, isLoading: threadLoading, isError: threadError, refetch: refetchThread } = useQuery<ThreadData>({
    queryKey: [`/api/leads/${leadId}/thread`],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/thread`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch thread');
      return res.json();
    },
    enabled: !!leadId,
    retry: 2,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/thread`] });
      setEmailSubject('');
      setEmailBody('');
      toast({
        title: 'Message Sent',
        description: 'Your message has been logged (stub mode).',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: noteBody }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadId}/thread`] });
      setNoteBody('');
      toast({
        title: 'Note Added',
        description: 'Internal note has been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add note.',
        variant: 'destructive',
      });
    },
  });

  const handleSendMessage = () => {
    if (!emailBody.trim()) {
      toast({
        title: 'Error',
        description: 'Message body is required.',
        variant: 'destructive',
      });
      return;
    }
    sendMessageMutation.mutate();
  };

  const handleAddNote = () => {
    if (!noteBody.trim()) {
      toast({
        title: 'Error',
        description: 'Note body is required.',
        variant: 'destructive',
      });
      return;
    }
    addNoteMutation.mutate();
  };

  if (leadLoading || threadLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (leadError) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Failed to load lead details. This could be due to network issues or insufficient permissions.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => refetchLead()}>
                  Try Again
                </Button>
                <Link href="/leads">
                  <Button variant="outline">
                    Back to Leads
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lead not found</p>
          <Link href="/leads">
            <Button variant="outline" className="mt-4">
              Back to Leads
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Combine and sort messages + notes by timestamp (only if thread loaded successfully)
  const timeline = thread && !threadError ? [
    ...(thread.messages || []).map(m => ({ ...m, type: 'message' as const })),
    ...(thread.notes || []).map(n => ({ ...n, type: 'note' as const })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  return (
    <AppLayout>
      <div className="mb-4">
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Thread Panel (Left - 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation Thread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {threadError ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-destructive">Failed to load conversation thread</p>
                    <Button variant="outline" size="sm" onClick={() => refetchThread()}>
                      Try Again
                    </Button>
                  </div>
                ) : timeline.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No messages or notes yet</p>
                ) : (
                  timeline.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${
                      item.type === 'message' 
                        ? (item as any).direction === 'in' 
                          ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500'
                          : 'bg-green-50 dark:bg-green-950 border-l-4 border-green-500'
                        : 'bg-orange-50 dark:bg-orange-950 border-l-4 border-orange-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'message' ? (
                          <>
                            <Mail className="h-4 w-4" />
                            <span className="font-semibold text-sm">
                              {(item as any).direction === 'in' ? 'Incoming' : 'Outgoing'} Email
                            </span>
                            {(item as any).subject && (
                              <span className="text-sm text-muted-foreground">
                                - {(item as any).subject}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <StickyNote className="h-4 w-4" />
                            <span className="font-semibold text-sm">Internal Note</span>
                          </>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{(item as any).body}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Forms */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant={activeTab === 'note' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('note')}
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Email (Stub)'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Note: This is a stub - no actual email will be sent. The message will be logged to the thread.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="note">Internal Note</Label>
                    <Textarea
                      id="note"
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Add an internal note about this lead..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleAddNote}
                    disabled={addNoteMutation.isPending}
                    className="w-full"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Panel (Right - 1 column) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{lead.customerName}</span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.customerEmail}</span>
                </div>
              </div>

              {lead.customerPhone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.customerPhone}</span>
                  </div>
                </div>
              )}

              {lead.budget && (
                <div>
                  <Label className="text-muted-foreground">Budget</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.budget}</span>
                  </div>
                </div>
              )}

              {lead.weddingDate && (
                <div>
                  <Label className="text-muted-foreground">Event Date</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(lead.weddingDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge>{lead.status}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Source</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">{lead.source}</Badge>
                </div>
              </div>

              {lead.message && (
                <div>
                  <Label className="text-muted-foreground">Initial Message</Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{lead.message}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={async () => {
                    setCreatingQuote(true);
                    try {
                      const response = await fetch('/api/ai/suggest-items', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ leadId }),
                      });
                      if (!response.ok) throw new Error('Failed to create quote');
                      const data = await response.json();
                      if (data.quoteId) {
                        toast({
                          title: "Success! Quote Created",
                          description: `Created draft quote for ${lead.customerName}. Opening quote editor...`,
                        });
                        // Small delay so user sees the success message before navigation
                        setTimeout(() => navigate(`/quotes/${data.quoteId}`), 800);
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : 'Failed to create quote',
                        variant: "destructive",
                      });
                    } finally {
                      setCreatingQuote(false);
                    }
                  }}
                  disabled={creatingQuote}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {creatingQuote ? 'Creating...' : 'Create Quote from Lead'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cake Configuration Details (from Calculator) */}
          {lead.calculatorPayload && (
            <Card data-testid="calculator-details-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cake className="h-5 w-5" />
                  Cake Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Info */}
                {(lead.calculatorPayload.eventType || lead.calculatorPayload.eventDate || lead.calculatorPayload.guestCount) && (
                  <div className="space-y-2">
                    {lead.calculatorPayload.eventType && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{lead.calculatorPayload.eventType}</span>
                      </div>
                    )}
                    {lead.calculatorPayload.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(lead.calculatorPayload.eventDate), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    {lead.calculatorPayload.guestCount && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.calculatorPayload.guestCount} guests</span>
                      </div>
                    )}
                    {lead.calculatorPayload.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lead.calculatorPayload.venue}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cake Tiers */}
                {lead.calculatorPayload.tiers && lead.calculatorPayload.tiers.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4" />
                      Cake Tiers ({lead.calculatorPayload.tiers.length})
                    </Label>
                    <div className="space-y-2">
                      {lead.calculatorPayload.tiers.map((tier, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          <div className="font-medium">Tier {index + 1}</div>
                          <div className="grid grid-cols-2 gap-1 text-muted-foreground mt-1">
                            <span>Size: {tier.size}"</span>
                            <span>Shape: {tier.shape}</span>
                            <span>Flavor: {tier.flavor}</span>
                            <span>Servings: {tier.servings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decorations */}
                {lead.calculatorPayload.decorations && lead.calculatorPayload.decorations.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4" />
                      Decorations
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {lead.calculatorPayload.decorations.map((decoration, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {decoration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {lead.calculatorPayload.pricing && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4" />
                      Estimated Pricing
                    </Label>
                    <div className="p-3 bg-primary/10 rounded">
                      <div className="text-2xl font-bold text-primary">
                        ${lead.calculatorPayload.pricing.total?.toFixed(2) || '0.00'}
                      </div>
                      {lead.calculatorPayload.pricing.perServing && (
                        <div className="text-sm text-muted-foreground">
                          ${lead.calculatorPayload.pricing.perServing.toFixed(2)} per serving
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Notes from calculator */}
                {lead.notes && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">Special Requests</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{lead.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
