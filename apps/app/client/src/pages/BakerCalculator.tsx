import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Calculator, Plus, Trash2, DollarSign } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface CustomLineItem {
  id: string;
  description: string;
  total: number;
}

interface CalculatorEstimate {
  subtotal: number;
  rushFee: number;
  deliveryFee: number;
  suggested: number;
  margin: number;
  inputs: {
    servings: number;
    complexity: string;
    rush: boolean;
    deliveryMiles: number;
    items: CustomLineItem[];
  };
}

export default function BakerCalculator() {
  const { toast } = useToast();
  const [servings, setServings] = useState(12);
  const [complexity, setComplexity] = useState('standard');
  const [rush, setRush] = useState(false);
  const [deliveryMiles, setDeliveryMiles] = useState(0);
  const [customItems, setCustomItems] = useState<CustomLineItem[]>([]);
  const [estimate, setEstimate] = useState<CalculatorEstimate | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/calculator/estimate', data);
      return response as CalculatorEstimate;
    },
    onSuccess: (data) => {
      setEstimate(data);
      toast({
        title: 'Estimate Calculated',
        description: `Suggested price: $${data.suggested.toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Calculation Failed',
        description: error.message || 'Unable to calculate estimate',
        variant: 'destructive',
      });
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      servings,
      complexity,
      rush,
      deliveryMiles,
      items: customItems,
    });
  };

  const handleSaveAsQuote = () => {
    toast({
      title: 'Quote Saved',
      description: 'This feature will be connected to Quotes API soon.',
    });
  };

  const addCustomItem = () => {
    setCustomItems([
      ...customItems,
      { id: crypto.randomUUID(), description: '', total: 0 },
    ]);
  };

  const updateCustomItem = (id: string, field: 'description' | 'total', value: string | number) => {
    setCustomItems(
      customItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter((item) => item.id !== id));
  };

  return (
    <AppLayout>
      <PageHeader title="Baker Calculator" icon={Calculator} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cake Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="complexity">Complexity</Label>
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger id="complexity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple ($3.50/serving)</SelectItem>
                  <SelectItem value="standard">Standard ($5.00/serving)</SelectItem>
                  <SelectItem value="premium">Premium ($7.50/serving)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="rush">Rush Order (25% fee)</Label>
              <Switch
                id="rush"
                checked={rush}
                onCheckedChange={setRush}
              />
            </div>

            <div>
              <Label htmlFor="delivery">Delivery Distance (miles)</Label>
              <Input
                id="delivery"
                type="number"
                min="0"
                value={deliveryMiles}
                onChange={(e) => setDeliveryMiles(parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                $2 per mile delivery fee
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Custom Line Items
              <Button
                size="sm"
                variant="outline"
                onClick={addCustomItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom items</p>
            ) : (
              customItems.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateCustomItem(item.id, 'description', e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="w-28"
                    value={item.total || ''}
                    onChange={(e) =>
                      updateCustomItem(item.id, 'total', parseFloat(e.target.value) || 0)
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeCustomItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pricing Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            {estimate ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-2xl font-semibold">${estimate.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rush Fee</p>
                    <p className="text-2xl font-semibold">${estimate.rushFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Fee</p>
                    <p className="text-2xl font-semibold">${estimate.deliveryFee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-semibold">{estimate.margin}%</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Suggested Price</p>
                    <p className="text-3xl font-bold text-primary">
                      ${estimate.suggested.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCalculate} variant="outline" className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Recalculate
                  </Button>
                  <Button onClick={handleSaveAsQuote} className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Save as Quote
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Click Calculate to see your pricing estimate
                </p>
                <Button
                  onClick={handleCalculate}
                  disabled={calculateMutation.isPending}
                >
                  {calculateMutation.isPending ? 'Calculating...' : 'Calculate Estimate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
