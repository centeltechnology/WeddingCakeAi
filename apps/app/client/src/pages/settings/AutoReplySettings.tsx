import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

type AutoReplySettings = {
  tenantId: string;
  enabled: boolean;
  timezone: string;
  quietHours?: {
    from: string;
    to: string;
  };
  channels: {
    email: boolean;
    sms: boolean;
  };
};

type AutoReplySettingsProps = {
  embedded?: boolean;
};

export default function AutoReplySettings({ embedded = false }: AutoReplySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Partial<AutoReplySettings>>({
    enabled: true,
    timezone: 'America/Chicago',
    channels: { email: true, sms: false },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['/api/auto-reply/settings'],
    queryFn: async () => {
      const res = await fetch('/api/auto-reply/settings', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json() as Promise<AutoReplySettings>;
    },
  });

  // Update settings when data is loaded - using useEffect to avoid render-time mutation
  useEffect(() => {
    if (data && !isLoading) {
      setSettings(data);
    }
  }, [data, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<AutoReplySettings>) => {
      const res = await fetch('/api/auto-reply/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-reply/settings'] });
      toast({
        title: 'Success',
        description: 'Auto-reply settings saved successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Auto-Reply Settings
          </CardTitle>
          <CardDescription>
            Configure automatic responses for leads based on templates and rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Auto-Reply</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to leads based on your rules
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (EST/EDT)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CST/CDT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MST/MDT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PST/PDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Don't send auto-replies during these hours
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quietFrom" className="text-xs">
                      From
                    </Label>
                    <Input
                      id="quietFrom"
                      type="time"
                      value={settings.quietHours?.from || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          quietHours: {
                            ...settings.quietHours,
                            from: e.target.value,
                            to: settings.quietHours?.to || '',
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietTo" className="text-xs">
                      To
                    </Label>
                    <Input
                      id="quietTo"
                      type="time"
                      value={settings.quietHours?.to || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          quietHours: {
                            ...settings.quietHours,
                            from: settings.quietHours?.from || '',
                            to: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Channels</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="channelEmail">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send auto-replies via email
                      </p>
                    </div>
                    <Switch
                      id="channelEmail"
                      checked={settings.channels?.email || false}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          channels: { ...settings.channels, email: checked, sms: settings.channels?.sms || false },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label htmlFor="channelSms">SMS (Coming Soon)</Label>
                      <p className="text-sm text-muted-foreground">
                        Send auto-replies via SMS
                      </p>
                    </div>
                    <Switch id="channelSms" disabled checked={false} />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {saveMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppLayout>
      <PageHeader
        title="Auto-Reply Settings"
        subtitle="Configure automatic responses for leads"
      />
      {content}
    </AppLayout>
  );
}
