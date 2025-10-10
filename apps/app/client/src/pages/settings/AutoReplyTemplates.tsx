import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Plus, Pencil, Trash2, Send } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

type AutoReplyTemplate = {
  id: string;
  tenantId: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
};

type AutoReplyTemplatesProps = {
  embedded?: boolean;
};

export default function AutoReplyTemplates({ embedded = false }: AutoReplyTemplatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AutoReplyTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    channel: 'email',
    subject: '',
    body: '',
    variables: [] as string[],
  });

  const { data: templates = [], isLoading } = useQuery<AutoReplyTemplate[]>({
    queryKey: ['/api/auto-reply/templates'],
    queryFn: async () => {
      const res = await fetch('/api/auto-reply/templates', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/auto-reply/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reply/templates'] });
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auto-reply/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reply/templates'] });
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    },
  });

  const testSendMutation = useMutation({
    mutationFn: async ({ to, templateId }: { to: string; templateId: string }) => {
      const res = await fetch('/api/auto-reply/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to,
          templateId,
          variables: {
            customer_name: 'Test Customer',
            event_date: '2025-06-15',
            budget: '$500',
            lead_source: 'website',
            quote_link: 'https://example.com/q/test',
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to send test email');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Test email sent successfully (check server logs)',
      });
      setIsTestDialogOpen(false);
      setTestEmail('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      channel: 'email',
      subject: '',
      body: '',
      variables: [],
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (template: AutoReplyTemplate) => {
    setFormData({
      id: template.id,
      name: template.name,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      variables: template.variables || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTestSend = (template: AutoReplyTemplate) => {
    setSelectedTemplate(template);
    setIsTestDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.body) {
      toast({
        title: 'Validation Error',
        description: 'Name and body are required',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Create and manage auto-reply email templates
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No templates yet. Create your first template to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <Mail className="h-3 w-3 mr-1" />
                        {template.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {template.subject || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestSend(template)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formData.id ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Available variables: {'{{customer_name}}, {{event_date}}, {{budget}}, {{lead_source}}, {{quote_link}}'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., New Lead Welcome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value })}
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms" disabled>
                    SMS (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Thanks for contacting {{customer_name}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Hi {{customer_name}},&#10;&#10;Thank you for your inquiry! We'll get back to you soon.&#10;&#10;Best regards"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Send</DialogTitle>
            <DialogDescription>
              Send a test email to verify your template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  testSendMutation.mutate({
                    to: testEmail,
                    templateId: selectedTemplate.id,
                  });
                }
              }}
              disabled={!testEmail || testSendMutation.isPending}
            >
              {testSendMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppLayout>
      <PageHeader
        title="Auto-Reply Templates"
        subtitle="Create and manage email templates for automatic responses"
      />
      {content}
    </AppLayout>
  );
}
