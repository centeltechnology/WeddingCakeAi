import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

type AutoReplyRule = {
  id: string;
  tenantId: string;
  name: string;
  trigger: 'new_lead' | 'after_hours' | 'no_response';
  templateId: string | null;
  conditions: {
    minBudget?: number;
    sources?: string[];
    hoursSinceLastMsg?: number;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type AutoReplyTemplate = {
  id: string;
  name: string;
};

type AutoReplyRulesProps = {
  embedded?: boolean;
};

export default function AutoReplyRules({ embedded = false }: AutoReplyRulesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    trigger: 'new_lead' as 'new_lead' | 'after_hours' | 'no_response',
    templateId: '',
    conditions: {
      minBudget: undefined as number | undefined,
      sources: [] as string[],
      hoursSinceLastMsg: undefined as number | undefined,
    },
    active: true,
  });

  const { data: rules = [], isLoading } = useQuery<AutoReplyRule[]>({
    queryKey: ['/api/auto-reply/rules'],
    queryFn: async () => {
      const res = await fetch('/api/auto-reply/rules', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch rules');
      return res.json();
    },
  });

  const { data: templates = [] } = useQuery<AutoReplyTemplate[]>({
    queryKey: ['/api/auto-reply/templates'],
    queryFn: async () => {
      const res = await fetch('/api/auto-reply/templates', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/auto-reply/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reply/rules'] });
      toast({
        title: 'Success',
        description: 'Rule saved successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/auto-reply/rules/${id}/toggle`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to toggle rule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reply/rules'] });
      toast({
        title: 'Success',
        description: 'Rule toggled successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to toggle rule',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      trigger: 'new_lead',
      templateId: '',
      conditions: {
        minBudget: undefined,
        sources: [],
        hoursSinceLastMsg: undefined,
      },
      active: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: AutoReplyRule) => {
    setFormData({
      id: rule.id,
      name: rule.name,
      trigger: rule.trigger,
      templateId: rule.templateId || '',
      conditions: {
        minBudget: rule.conditions?.minBudget,
        sources: rule.conditions?.sources || [],
        hoursSinceLastMsg: rule.conditions?.hoursSinceLastMsg,
      },
      active: rule.active,
    });
    setIsDialogOpen(true);
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.name || !formData.templateId) {
      toast({
        title: 'Validation Error',
        description: 'Name and template are required',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      new_lead: 'New Lead',
      after_hours: 'After Hours',
      no_response: 'No Response',
    };
    return labels[trigger] || trigger;
  };

  const getTriggerColor = (trigger: string) => {
    const colors: Record<string, string> = {
      new_lead: 'bg-blue-100 text-blue-700',
      after_hours: 'bg-purple-100 text-purple-700',
      no_response: 'bg-orange-100 text-orange-700',
    };
    return colors[trigger] || 'bg-gray-100 text-gray-700';
  };

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Auto-Reply Rules</CardTitle>
              <CardDescription>
                Define when and how to send automatic responses
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No rules yet. Create your first rule to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge className={getTriggerColor(rule.trigger)}>
                        {getTriggerLabel(rule.trigger)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {templates.find((t) => t.id === rule.templateId)?.name || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rule.conditions?.minBudget && (
                        <div>Min: ${rule.conditions.minBudget}</div>
                      )}
                      {rule.conditions?.sources && rule.conditions.sources.length > 0 && (
                        <div>Sources: {rule.conditions.sources.join(', ')}</div>
                      )}
                      {rule.conditions?.hoursSinceLastMsg && (
                        <div>{rule.conditions.hoursSinceLastMsg}h since msg</div>
                      )}
                      {!rule.conditions?.minBudget &&
                        !rule.conditions?.sources?.length &&
                        !rule.conditions?.hoursSinceLastMsg &&
                        '—'}
                    </TableCell>
                    <TableCell>
                      {rule.active ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(rule.id)}
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                        >
                          <Pencil className="h-4 w-4" />
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
              {formData.id ? 'Edit Rule' : 'Create Rule'}
            </DialogTitle>
            <DialogDescription>
              Define when this auto-reply should be triggered
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome new website leads"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger</Label>
              <Select
                value={formData.trigger}
                onValueChange={(value: any) => setFormData({ ...formData, trigger: value })}
              >
                <SelectTrigger id="trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New Lead</SelectItem>
                  <SelectItem value="after_hours">After Hours</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateId">Template</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger id="templateId">
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
            <div className="space-y-4 pt-4 border-t">
              <Label>Conditions (Optional)</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="minBudget" className="text-sm">
                    Minimum Budget ($)
                  </Label>
                  <Input
                    id="minBudget"
                    type="number"
                    value={formData.conditions.minBudget || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conditions: {
                          ...formData.conditions,
                          minBudget: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="e.g., 200"
                  />
                </div>
                {formData.trigger === 'no_response' && (
                  <div className="space-y-2">
                    <Label htmlFor="hoursSince" className="text-sm">
                      Hours Since Last Message
                    </Label>
                    <Input
                      id="hoursSince"
                      type="number"
                      value={formData.conditions.hoursSinceLastMsg || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            hoursSinceLastMsg: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      placeholder="e.g., 12"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this rule to start sending auto-replies
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
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
              Save Rule
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
        title="Auto-Reply Rules"
        subtitle="Define when and how to send automatic responses"
      />
      {content}
    </AppLayout>
  );
}
