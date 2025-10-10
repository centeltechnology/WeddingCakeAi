import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import { SettingsTabs } from '@/components/SettingsTabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Template {
  id: string;
  tenantId: string;
  type: 'quote' | 'contract' | 'email';
  name: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

const EXAMPLE_QUOTE_TEMPLATE = [
  '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">',
  '  <h1>Quote #' + '{{quote.number}}</h1>',
  '  <h2>' + '{{quote.title}}</h2>',
  '  <div style="margin: 20px 0;">',
  '    <h3>Customer Information</h3>',
  '    <p><strong>Name:</strong> ' + '{{customer.name}}</p>',
  '    <p><strong>Email:</strong> ' + '{{customer.email}}</p>',
  '  </div>',
  '  <div style="margin: 20px 0;">',
  '    <h3>Event Details</h3>',
  '    <p><strong>Event Date:</strong> ' + '{{quote.eventDate}}</p>',
  '    <p><strong>Guest Count:</strong> ' + '{{quote.guestCount}}</p>',
  '  </div>',
  '  <div style="margin: 20px 0;">',
  '    <h3>Items</h3>',
  '    <table style="width: 100%; border-collapse: collapse;">',
  '      <tbody>',
  '        ' + '{{#each items}}',
  '        <tr><td>' + '{{name}}</td><td>${{totalPrice}}</td></tr>',
  '        ' + '{{/each}}',
  '      </tbody>',
  '    </table>',
  '  </div>',
  '  <div style="margin: 20px 0; text-align: right;">',
  '    <p><strong>Total:</strong> $' + '{{totals.total}}</p>',
  '  </div>',
  '</div>'
].join('\n');

const EXAMPLE_CONTRACT_TEMPLATE = [
  '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">',
  '  <h1>Contract #' + '{{contract.number}}</h1>',
  '  <h2>' + '{{contract.title}}</h2>',
  '  <div style="margin: 20px 0;">',
  '    <h3>Contract Terms</h3>',
  '    <p><strong>Total Amount:</strong> $' + '{{contract.totalAmount}}</p>',
  '    <p><strong>Deposit:</strong> $' + '{{contract.depositAmount}}</p>',
  '    <p><strong>Balance:</strong> $' + '{{contract.remainingBalance}}</p>',
  '  </div>',
  '  <div style="margin: 20px 0;">',
  '    <h3>Customer Information</h3>',
  '    <p><strong>Name:</strong> ' + '{{customer.name}}</p>',
  '    <p><strong>Email:</strong> ' + '{{customer.email}}</p>',
  '  </div>',
  '  <div style="margin: 20px 0;">',
  '    <p>By signing this contract, you agree to the terms and conditions outlined above.</p>',
  '  </div>',
  '</div>'
].join('\n');

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    type: 'quote' as 'quote' | 'contract' | 'email',
    name: '',
    content: '',
  });

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    queryFn: async () => apiRequest('GET', '/api/templates', undefined) as Promise<Template[]>,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('POST', '/api/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Saved',
        description: 'Your template has been saved successfully.',
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save template',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest('DELETE', `/api/templates/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Deleted',
        description: 'The template has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Unable to delete template',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      type: 'quote',
      name: '',
      content: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      id: template.id,
      type: template.type,
      name: template.name,
      content: template.content,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = async (template: Template) => {
    setSelectedTemplate(template);
    
    // Create example data for preview
    const exampleData = {
      type: template.type,
      templateId: template.id,
      data: template.type === 'quote' ? {
        quote: {
          number: 'Q-2024-001',
          title: 'Wedding Cake Quote',
          eventDate: '2024-06-15',
          guestCount: 150,
        },
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-1234',
        },
        items: [
          { name: 'Tiered Wedding Cake', quantity: 1, unitPrice: 500, totalPrice: 500 },
          { name: 'Cupcakes', quantity: 50, unitPrice: 3, totalPrice: 150 },
        ],
        totals: {
          subtotal: 650,
          taxRate: 8.75,
          taxAmount: 56.88,
          total: 706.88,
        },
      } : {
        contract: {
          number: 'C-2024-001',
          title: 'Wedding Cake Contract',
          totalAmount: 706.88,
          depositAmount: 353.44,
          remainingBalance: 353.44,
        },
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
    };

    try {
      const result = await apiRequest('POST', '/api/templates/render', exampleData);
      setPreviewHtml(result.html);
      setPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: 'Preview Failed',
        description: error.message || 'Unable to preview template',
        variant: 'destructive',
      });
    }
  };

  const loadExample = () => {
    setFormData({
      ...formData,
      content: formData.type === 'quote' ? EXAMPLE_QUOTE_TEMPLATE : EXAMPLE_CONTRACT_TEMPLATE,
    });
  };

  const quoteTemplates = templates?.filter(t => t.type === 'quote') || [];
  const contractTemplates = templates?.filter(t => t.type === 'contract') || [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Manage your templates for quotes and contracts"
        />

        <SettingsTabs />

        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Templates</h2>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Loading templates...
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Quote Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  {quoteTemplates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No quote templates yet</p>
                  ) : (
                    <div className="space-y-2">
                      {quoteTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-gray-500">
                                {template.variables.length} variables
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contract Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  {contractTemplates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No contract templates yet</p>
                  ) : (
                    <div className="space-y-2">
                      {contractTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-gray-500">
                                {template.variables.length} variables
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit' : 'Create'} Template</DialogTitle>
            <DialogDescription>
              Use {'{{variable}}'} for values, {'{{#if}}'} for conditions, {'{{#each}}'} for loops
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Quote Template"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Template Content</Label>
                <Button variant="outline" size="sm" onClick={loadExample}>
                  Load Example
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your template HTML with {{variables}}"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              This preview uses example data
            </DialogDescription>
          </DialogHeader>
          <div
            className="border rounded-lg p-4 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
