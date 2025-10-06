import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Save,
  Eye,
  Settings,
  Tag,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Percent,
  Package
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  basePrice: string;
  pricePerServing: string;
  minimumOrder: string;
  pricingModel: string;
  seasonalPricing: any[];
  volumeDiscounts: any[];
  tiers: any[];
  addOns: any[];
  flavorOptions: any[];
  fillingOptions: any[];
  deliveryOptions: any[];
  leadTime: number;
  maxAdvanceBooking: number;
  cancellationPolicy: string;
  tags: string[];
  difficulty: string;
  estimatedHours: string;
  profitMargin: string;
  isActive: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  terms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface AdvancedQuoteTemplatesProps {
  bakerId: string;
}

export function AdvancedQuoteTemplates({ bakerId }: AdvancedQuoteTemplatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/quote-templates', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/quote-templates?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Create/Update template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<QuoteTemplate>) => {
      const url = templateData.id ? `/api/quote-templates/${templateData.id}` : '/api/quote-templates';
      const method = templateData.id ? 'PUT' : 'POST';
      return apiRequest(method, url, { ...templateData, bakerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      setIsCreating(false);
      setSelectedTemplate(null);
      setActiveTab('list'); // Navigate back to list after successful save
      toast({
        title: "Success",
        description: "Template saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return apiRequest('DELETE', `/api/quote-templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Filter templates
  const filteredTemplates = templates.filter((template: QuoteTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map((t: QuoteTemplate) => t.category))];

  const handleCreateNew = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      description: '',
      category: 'wedding',
      subcategory: '',
      basePrice: '0',
      pricePerServing: '0',
      minimumOrder: '0',
      pricingModel: 'fixed',
      seasonalPricing: [],
      volumeDiscounts: [],
      tiers: [
        {
          tierNumber: 1,
          name: '10" Base',
          diameter: 10,
          height: 4,
          servings: 25,
          basePrice: 150,
          priceMultiplier: 1.0,
          isOptional: false
        }
      ],
      addOns: [],
      flavorOptions: [
        { id: '1', name: 'Vanilla', description: 'Classic vanilla sponge', priceModifier: 0, isDefault: true, isAvailable: true },
        { id: '2', name: 'Chocolate', description: 'Rich chocolate cake', priceModifier: 20, isDefault: false, isAvailable: true },
        { id: '3', name: 'Red Velvet', description: 'Southern red velvet', priceModifier: 35, isDefault: false, isAvailable: true }
      ],
      fillingOptions: [
        { id: '1', name: 'Buttercream', description: 'Classic vanilla buttercream', priceModifier: 0, isDefault: true, isAvailable: true },
        { id: '2', name: 'Cream Cheese', description: 'Tangy cream cheese frosting', priceModifier: 25, isDefault: false, isAvailable: true }
      ],
      deliveryOptions: [
        { type: 'pickup', name: 'Pickup', description: 'Customer pickup from bakery', basePrice: 0, setupIncluded: false, leadTime: 0 },
        { type: 'standard_delivery', name: 'Standard Delivery', description: 'Delivery to venue', basePrice: 50, pricePerMile: 2, maxDistance: 25, setupIncluded: false, leadTime: 1 }
      ],
      leadTime: 168,
      maxAdvanceBooking: 8760,
      cancellationPolicy: '',
      tags: [],
      difficulty: 'medium',
      estimatedHours: '0',
      profitMargin: '30',
      isActive: true,
      isPublic: false,
      isFeatured: false,
      terms: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setActiveTab('editor');
    setIsCreating(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="list">Template Library</TabsTrigger>
            <TabsTrigger value="editor">Template Editor</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-templates"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48" data-testid="select-filter-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Templates Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: QuoteTemplate) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {template.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {!template.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span className="font-medium">${template.basePrice}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant={
                      template.difficulty === 'easy' ? 'default' :
                      template.difficulty === 'medium' ? 'secondary' :
                      template.difficulty === 'hard' ? 'destructive' : 'outline'
                    }>
                      {template.difficulty}
                    </Badge>
                  </div>

                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setActiveTab('editor');
                        setIsCreating(false);
                      }}
                      data-testid={`button-edit-${template.id}`}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const copy = { ...template, id: '', name: `${template.name} (Copy)` };
                        setSelectedTemplate(copy);
                        setActiveTab('editor');
                        setIsCreating(true);
                      }}
                      data-testid={`button-copy-${template.id}`}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteTemplateMutation.mutate(template.id);
                        }
                      }}
                      data-testid={`button-delete-${template.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Create your first quote template to get started"
                }
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor">
          {selectedTemplate ? (
            <TemplateEditor
              template={selectedTemplate}
              isCreating={isCreating}
              onSave={(data) => {
                // Keep editor open until save succeeds to allow retry on failure
                createTemplateMutation.mutate(data);
              }}
              onCancel={() => {
                setSelectedTemplate(null);
                setActiveTab('list');
                setIsCreating(false);
              }}
              isSaving={createTemplateMutation.isPending}
            />
          ) : (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No template selected</h3>
              <p className="text-muted-foreground mb-4">
                Select a template from the library or create a new one to start editing
              </p>
              <Button onClick={() => setActiveTab('list')}>
                Back to Library
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TemplateEditorProps {
  template: QuoteTemplate;
  isCreating: boolean;
  onSave: (data: QuoteTemplate) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function TemplateEditor({ template, isCreating, onSave, onCancel, isSaving }: TemplateEditorProps) {
  const [formData, setFormData] = useState<QuoteTemplate>(template);
  const [activeSection, setActiveSection] = useState('basic');

  const handleSave = () => {
    onSave(formData);
  };

  const updateFormData = (field: keyof QuoteTemplate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isCreating ? 'Create New Template' : 'Edit Template'}
          </h2>
          <p className="text-muted-foreground">
            Configure your quote template with advanced pricing and options
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-template">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="e.g., Classic Wedding Cake"
                    data-testid="input-template-name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger data-testid="select-template-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe what this template is for and what makes it special..."
                  rows={3}
                  data-testid="textarea-template-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => updateFormData('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => updateFormData('estimatedHours', e.target.value)}
                    placeholder="8.0"
                  />
                </div>
                <div>
                  <Label htmlFor="leadTime">Lead Time (hours)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={formData.leadTime}
                    onChange={(e) => updateFormData('leadTime', parseInt(e.target.value) || 168)}
                    placeholder="168"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateFormData('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active Template</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => updateFormData('isFeatured', checked)}
                  />
                  <Label htmlFor="isFeatured">Featured Template</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => updateFormData('isPublic', checked)}
                  />
                  <Label htmlFor="isPublic">Public Template</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricingModel">Pricing Model</Label>
                  <Select value={formData.pricingModel} onValueChange={(value) => updateFormData('pricingModel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per_serving">Per Serving</SelectItem>
                      <SelectItem value="tiered">Tiered Pricing</SelectItem>
                      <SelectItem value="custom">Custom Logic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => updateFormData('basePrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    value={formData.minimumOrder}
                    onChange={(e) => updateFormData('minimumOrder', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {formData.pricingModel === 'per_serving' && (
                <div>
                  <Label htmlFor="pricePerServing">Price Per Serving ($)</Label>
                  <Input
                    id="pricePerServing"
                    type="number"
                    step="0.01"
                    value={formData.pricePerServing}
                    onChange={(e) => updateFormData('pricePerServing', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="profitMargin">Target Profit Margin (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  step="0.1"
                  value={formData.profitMargin}
                  onChange={(e) => updateFormData('profitMargin', e.target.value)}
                  placeholder="30.0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would be implemented similarly */}
        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Cake Tiers Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure the available tiers for this template
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tier configuration UI would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>Flavors & Options</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure available flavors, fillings, and add-ons
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Options configuration UI would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Setup</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure delivery options and pricing
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Delivery configuration UI would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Terms, conditions, and business rules
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => updateFormData('terms', e.target.value)}
                  placeholder="Enter terms and conditions for this template..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Internal notes about this template..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={(e) => updateFormData('cancellationPolicy', e.target.value)}
                  placeholder="Describe the cancellation policy for orders using this template..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}