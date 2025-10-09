import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import ContractTimeline from '@/components/ContractTimeline';
import AppLayout from "@/components/AppLayout";

interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
}

export default function ContractEdit() {
  const [, params] = useRoute('/contracts/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const contractId = params?.id;
  const isNew = contractId === 'new';

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    quoteId: '',
    templateId: '',
    totalAmount: '',
    depositAmount: '',
    eventDate: '',
    deliveryDate: '',
    deliveryAddress: '',
    specialInstructions: '',
    variables: '{}'
  });

  useEffect(() => {
    fetchTemplates();
    if (!isNew && contractId) {
      fetchContract();
    }
  }, [contractId]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/contract-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/${contractId}`);
      if (!response.ok) throw new Error('Failed to fetch contract');
      const data = await response.json();
      setFormData({
        title: data.title || '',
        customerId: data.customerId || '',
        quoteId: data.quoteId || '',
        templateId: data.templateId || '',
        totalAmount: data.totalAmount || '',
        depositAmount: data.depositAmount || '',
        eventDate: data.eventDate || '',
        deliveryDate: data.deliveryDate || '',
        deliveryAddress: data.deliveryAddress || '',
        specialInstructions: data.specialInstructions || '',
        variables: '{}'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load contract'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const url = isNew ? '/api/contracts' : `/api/contracts/${contractId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save contract');

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Contract saved successfully'
      });

      if (isNew) {
        setLocation(`/contracts/${data.id}`);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save contract'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!contractId || isNew) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please save the contract first'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/contracts/${contractId}/send`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to send contract');

      toast({
        title: 'Success',
        description: 'Contract sent to customer for signature'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send contract'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNew) {
    return (
      <AppLayout><div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading contract...</div>
              </div></AppLayout>
    );
  }

  return (
    <AppLayout><div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/contracts">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{isNew ? 'New Contract' : 'Edit Contract'}</h1>
                <p className="text-muted-foreground">Configure contract details and send for signature</p>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Contract Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Wedding Cake Contract"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select
                        value={selectedTemplateId}
                        onValueChange={(value) => {
                          setSelectedTemplateId(value);
                          setFormData({ ...formData, templateId: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Deposit Amount</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.01"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Full delivery address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      placeholder="Any special instructions or notes"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variables">Template Variables (JSON)</Label>
                    <Textarea
                      id="variables"
                      value={formData.variables}
                      onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                      placeholder='{"customer_name": "John Doe", "event_type": "Wedding"}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {!isNew && contractId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContractTimeline contractId={contractId} />
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleSend} disabled={loading || isNew}>
                  <Send className="h-4 w-4 mr-2" />
                  Send for Signature
                </Button>
              </div>
            </div>
          </div></AppLayout>
  );
}
