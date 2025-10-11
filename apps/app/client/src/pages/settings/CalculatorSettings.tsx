import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CalculatorDefaults {
  servings?: number;
  cakeSizeInches?: number;
  frosting?: string;
  filling?: string;
  flavor?: string;
  delivery?: { miles?: number };
  modifiers?: { rush?: boolean; dietary?: string[] };
  pricing?: { matrix?: any };
  tax?: { rate?: number };
  payment?: { depositPct?: number };
}

interface CalculatorTheme {
  primary?: string;
  secondary?: string;
  bg?: string;
  text?: string;
  radius?: string;
  font?: string;
}

interface CalculatorSettings {
  defaults: CalculatorDefaults;
  theme: CalculatorTheme;
}

export default function CalculatorSettings({ embedded = false }: { embedded?: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<CalculatorSettings>({
    queryKey: ['/api/calculator/settings'],
  });

  const [defaults, setDefaults] = useState<CalculatorDefaults>({
    servings: 12,
    cakeSizeInches: 8,
    frosting: 'buttercream',
    filling: 'vanilla',
    flavor: 'vanilla',
    delivery: { miles: 0 },
    modifiers: { rush: false, dietary: [] },
    tax: { rate: 0.0825 },
    payment: { depositPct: 0.5 },
  });

  const [theme, setTheme] = useState<CalculatorTheme>({
    primary: '#0F172A',
    secondary: '#475569',
    bg: '#F8FAFC',
    text: '#0B1221',
    radius: 'md',
    font: 'system',
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setDefaults(settings.defaults);
      setTheme(settings.theme);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<CalculatorSettings>) => {
      const res = await fetch('/api/calculator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calculator/settings'] });
      setIsDirty(false);
      toast({
        title: 'Settings saved',
        description: 'Calculator settings updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ defaults, theme });
  };

  const updateDefaults = (key: string, value: any) => {
    setDefaults((prev) => {
      const keys = key.split('.');
      if (keys.length === 1) {
        return { ...prev, [key]: value };
      } else if (keys.length === 2) {
        return { ...prev, [keys[0]]: { ...prev[keys[0] as keyof CalculatorDefaults], [keys[1]]: value } };
      }
      return prev;
    });
    setIsDirty(true);
  };

  const updateTheme = (key: keyof CalculatorTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {!embedded && (
        <PageHeader
          title="Calculator Settings"
          subtitle="Configure default values and theme for your pricing calculator"
        />
      )}

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        {/* Defaults Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Values</CardTitle>
              <CardDescription>Set default calculator parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={defaults.servings || 0}
                  onChange={(e) => updateDefaults('servings', Number(e.target.value))}
                  min="0"
                  max="1000"
                />
              </div>

              <div>
                <Label htmlFor="cakeSize">Cake Size (inches)</Label>
                <Select
                  value={String(defaults.cakeSizeInches || 8)}
                  onValueChange={(value) => updateDefaults('cakeSizeInches', Number(value))}
                >
                  <SelectTrigger id="cakeSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 inch</SelectItem>
                    <SelectItem value="8">8 inch</SelectItem>
                    <SelectItem value="10">10 inch</SelectItem>
                    <SelectItem value="12">12 inch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frosting">Frosting</Label>
                <Input
                  id="frosting"
                  value={defaults.frosting || ''}
                  onChange={(e) => updateDefaults('frosting', e.target.value)}
                  placeholder="e.g., buttercream"
                />
              </div>

              <div>
                <Label htmlFor="filling">Filling</Label>
                <Input
                  id="filling"
                  value={defaults.filling || ''}
                  onChange={(e) => updateDefaults('filling', e.target.value)}
                  placeholder="e.g., vanilla"
                />
              </div>

              <div>
                <Label htmlFor="flavor">Flavor</Label>
                <Input
                  id="flavor"
                  value={defaults.flavor || ''}
                  onChange={(e) => updateDefaults('flavor', e.target.value)}
                  placeholder="e.g., chocolate"
                />
              </div>

              <div>
                <Label htmlFor="deliveryMiles">Delivery Miles</Label>
                <Input
                  id="deliveryMiles"
                  type="number"
                  value={defaults.delivery?.miles || 0}
                  onChange={(e) => updateDefaults('delivery.miles', Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rush"
                  checked={defaults.modifiers?.rush || false}
                  onCheckedChange={(checked) => updateDefaults('modifiers.rush', checked)}
                />
                <Label htmlFor="rush" className="font-normal">Rush order by default</Label>
              </div>

              <div>
                <Label htmlFor="taxRate">Tax Rate (0-1)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.0001"
                  value={defaults.tax?.rate || 0}
                  onChange={(e) => updateDefaults('tax.rate', Number(e.target.value))}
                  min="0"
                  max="1"
                />
              </div>

              <div>
                <Label htmlFor="depositPct">Deposit Percentage (0-1)</Label>
                <Input
                  id="depositPct"
                  type="number"
                  step="0.01"
                  value={defaults.payment?.depositPct || 0}
                  onChange={(e) => updateDefaults('payment.depositPct', Number(e.target.value))}
                  min="0"
                  max="1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>Customize calculator appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary"
                    type="color"
                    value={theme.primary || '#0F172A'}
                    onChange={(e) => updateTheme('primary', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.primary || '#0F172A'}
                    onChange={(e) => updateTheme('primary', e.target.value)}
                    placeholder="#0F172A"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={theme.secondary || '#475569'}
                    onChange={(e) => updateTheme('secondary', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.secondary || '#475569'}
                    onChange={(e) => updateTheme('secondary', e.target.value)}
                    placeholder="#475569"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bg">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg"
                    type="color"
                    value={theme.bg || '#F8FAFC'}
                    onChange={(e) => updateTheme('bg', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.bg || '#F8FAFC'}
                    onChange={(e) => updateTheme('bg', e.target.value)}
                    placeholder="#F8FAFC"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text"
                    type="color"
                    value={theme.text || '#0B1221'}
                    onChange={(e) => updateTheme('text', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.text || '#0B1221'}
                    onChange={(e) => updateTheme('text', e.target.value)}
                    placeholder="#0B1221"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="radius">Border Radius</Label>
                <Select
                  value={theme.radius || 'md'}
                  onValueChange={(value) => updateTheme('radius', value)}
                >
                  <SelectTrigger id="radius">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font">Font Style</Label>
                <Select
                  value={theme.font || 'system'}
                  onValueChange={(value) => updateTheme('font', value)}
                >
                  <SelectTrigger id="font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your calculator will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  padding: '1rem',
                  borderRadius: theme.radius === 'sm' ? '0.25rem' : theme.radius === 'lg' ? '0.75rem' : '0.5rem',
                  fontFamily: theme.font === 'serif' ? 'Georgia, serif' : theme.font === 'mono' ? 'monospace' : 'system-ui',
                }}
              >
                <div className="space-y-3">
                  <h3 style={{ color: theme.primary, fontWeight: 'bold' }}>
                    Cake Price Calculator
                  </h3>
                  <div
                    style={{
                      backgroundColor: theme.primary,
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: theme.radius === 'sm' ? '0.25rem' : theme.radius === 'lg' ? '0.75rem' : '0.5rem',
                    }}
                  >
                    Primary Button
                  </div>
                  <div
                    style={{
                      backgroundColor: theme.secondary,
                      color: '#fff',
                      padding: '0.5rem 1rem',
                      borderRadius: theme.radius === 'sm' ? '0.25rem' : theme.radius === 'lg' ? '0.75rem' : '0.5rem',
                    }}
                  >
                    Secondary Button
                  </div>
                  <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Preview text in {defaults.flavor || 'vanilla'} flavor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span>You have unsaved changes</span>
            <div className="flex gap-2">
              <Button
                variant="outline-light"
                onClick={() => {
                  if (settings) {
                    setDefaults(settings.defaults);
                    setTheme(settings.theme);
                    setIsDirty(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
