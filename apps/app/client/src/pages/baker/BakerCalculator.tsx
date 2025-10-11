import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LineItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function BakerCalculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('Estimate');
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), name: '', qty: 1, unit: 'ea', price: 0, notes: '' }
  ]);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  
  const [taxRate, setTaxRate] = useState(0.0875);
  const [discount, setDiscount] = useState(0);
  const [depositPct, setDepositPct] = useState(0.5);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: '', qty: 1, unit: 'ea', price: 0, notes: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const discountAmount = Math.max(0, discount);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const total = subtotal - discountAmount + taxAmount;
  const depositDue = total * depositPct;

  const handleSaveAsQuote = async () => {
    if (items.filter(i => i.name.trim()).length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one item',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedCustomer && !newCustomerName && !newCustomerEmail) {
      toast({
        title: 'Customer Required',
        description: 'Please select or add a customer',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      const customer = selectedCustomer || {
        name: newCustomerName,
        email: newCustomerEmail,
        phone: newCustomerPhone
      };

      const payload = {
        customer,
        title,
        items: items.filter(i => i.name.trim()).map(i => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          price: i.price,
          notes: i.notes
        })),
        taxRate,
        discount: discountAmount,
        depositPct,
        notes: ''
      };

      const res = await fetch('/api/estimates/save-as-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Save Failed',
          description: data?.error || 'Failed to save quote',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Quote Saved',
        description: 'Estimate saved as quote successfully'
      });

      setLocation(`/quotes/${data.quoteId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setItems([{ id: crypto.randomUUID(), name: '', qty: 1, unit: 'ea', price: 0, notes: '' }]);
    setTitle('Estimate');
    setSelectedCustomer(null);
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerPhone('');
    setDiscount(0);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Baker Calculator
        </h1>
        <p className="text-muted-foreground mt-1">
          Create detailed estimates and save them as quotes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items - Left Panel (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                  <div className="col-span-3">Item</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-2">Notes</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder="Item name"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="col-span-1">
                      <Select value={item.unit} onValueChange={(v) => updateItem(item.id, 'unit', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ea">ea</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="doz">doz</SelectItem>
                          <SelectItem value="hr">hr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={`$${(item.qty * item.price).toFixed(2)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        placeholder="Notes"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary - Right Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Estimate title"
                />
              </div>

              <div>
                <Label>Customer</Label>
                {!showNewCustomer ? (
                  <div className="space-y-2">
                    <Select 
                      value={selectedCustomer?.id || ''} 
                      onValueChange={(id) => setSelectedCustomer(customers.find(c => c.id === id) || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCustomer(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Customer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Name"
                    />
                    <Input
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                    />
                    <Input
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="Phone (optional)"
                      type="tel"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCustomer(false);
                        setNewCustomerName('');
                        setNewCustomerEmail('');
                        setNewCustomerPhone('');
                      }}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={(taxRate * 100).toFixed(2)}
                    onChange={(e) => setTaxRate((parseFloat(e.target.value) || 0) / 100)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="depositPct">Deposit (%)</Label>
                  <Input
                    id="depositPct"
                    type="number"
                    value={(depositPct * 100).toFixed(0)}
                    onChange={(e) => setDepositPct((parseFloat(e.target.value) || 0) / 100)}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Deposit Due ({(depositPct * 100).toFixed(0)}%)</span>
                  <span>${depositDue.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  onClick={handleSaveAsQuote}
                  disabled={saving}
                  loading={saving}
                >
                  Save as Quote
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClear}
                  disabled={saving}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
