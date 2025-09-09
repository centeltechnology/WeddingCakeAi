import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Zap,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Copy,
  Code,
  Settings,
  Layout,
  Type,
  Image,
  MousePointer,
  Zap,
  Download,
  Share,
  RotateCcw,
  Save,
  ExternalLink,
  Layers,
  Grid,
  ChevronDown,
  Plus,
  Trash2,
  Move,
  Square
} from 'lucide-react';

interface WidgetConfig {
  id: string;
  name: string;
  type: 'quote-form' | 'gallery' | 'contact' | 'testimonials' | 'pricing' | 'booking';
  dimensions: {
    width: number;
    height: number;
    responsive: boolean;
  };
  styling: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    borderWidth: number;
    padding: number;
    fontFamily: string;
    fontSize: number;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    buttonStyle: 'rounded' | 'square' | 'pill';
    shadowIntensity: number;
  };
  content: {
    title: string;
    subtitle: string;
    fields: Array<{
      id: string;
      type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date';
      label: string;
      placeholder: string;
      required: boolean;
      options?: string[];
    }>;
    submitText: string;
    successMessage: string;
  };
  behavior: {
    autoHeight: boolean;
    smoothScroll: boolean;
    loadingAnimation: boolean;
    validationStyle: 'inline' | 'tooltip' | 'summary';
    submitAction: 'redirect' | 'modal' | 'inline';
    redirectUrl?: string;
  };
  integrations: {
    googleAnalytics: boolean;
    facebookPixel: boolean;
    customCss: string;
    customJs: string;
    webhookUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdvancedWidgetBuilderProps {
  bakerId: string;
}

const widgetTypes = [
  { id: 'quote-form', name: 'Quote Request Form', icon: Zap, description: 'Let customers request custom quotes' },
  { id: 'gallery', name: 'Photo Gallery', icon: Image, description: 'Showcase your work beautifully' },
  { id: 'contact', name: 'Contact Form', icon: MousePointer, description: 'Simple contact and inquiry form' },
  { id: 'testimonials', name: 'Testimonials Slider', icon: Zap, description: 'Display customer reviews' },
  { id: 'pricing', name: 'Pricing Display', icon: Square, description: 'Show your pricing tiers' },
  { id: 'booking', name: 'Booking Calendar', icon: Layout, description: 'Allow appointment scheduling' }
];

const previewDevices = [
  { id: 'desktop', name: 'Desktop', icon: Monitor, width: 1200, height: 800 },
  { id: 'tablet', name: 'Tablet', icon: Tablet, width: 768, height: 1024 },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, width: 375, height: 667 }
];

const buttonStyles = [
  { id: 'rounded', name: 'Rounded', class: 'rounded-md' },
  { id: 'square', name: 'Square', class: 'rounded-none' },
  { id: 'pill', name: 'Pill', class: 'rounded-full' }
];

export function AdvancedWidgetBuilder({ bakerId }: AdvancedWidgetBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('design');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Fetch widgets
  const { data: widgets = [], isLoading } = useQuery<WidgetConfig[]>({
    queryKey: [`/api/widgets/${bakerId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/widgets/${bakerId}`);
      return response.json();
    },
  });

  // Create widget mutation
  const createWidgetMutation = useMutation({
    mutationFn: async (widgetData: Partial<WidgetConfig>) => {
      const response = await apiRequest('POST', `/api/widgets/${bakerId}`, widgetData);
      return response.json();
    },
    onSuccess: (newWidget) => {
      toast({
        title: "Widget created!",
        description: "Your new widget is ready for customization.",
      });
      setSelectedWidget(newWidget);
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: [`/api/widgets/${bakerId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update widget mutation
  const updateWidgetMutation = useMutation({
    mutationFn: async (widgetData: WidgetConfig) => {
      const response = await apiRequest('PUT', `/api/widgets/${bakerId}/${widgetData.id}`, widgetData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Widget saved!",
        description: "Your changes have been saved successfully.",
      });
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: [`/api/widgets/${bakerId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete widget mutation
  const deleteWidgetMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      await apiRequest('DELETE', `/api/widgets/${bakerId}/${widgetId}`);
    },
    onSuccess: () => {
      toast({
        title: "Widget deleted",
        description: "The widget has been deleted successfully.",
      });
      setSelectedWidget(null);
      queryClient.invalidateQueries({ queryKey: [`/api/widgets/${bakerId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete widget",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateWidget = (type: string) => {
    const newWidget = {
      name: `New ${widgetTypes.find(t => t.id === type)?.name || 'Widget'}`,
      type: type as WidgetConfig['type'],
      dimensions: { width: 400, height: 600, responsive: true },
      styling: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderRadius: 8,
        borderWidth: 1,
        padding: 24,
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        primaryColor: '#f43f5e',
        secondaryColor: '#fda4af',
        textColor: '#1f2937',
        buttonStyle: 'rounded' as const,
        shadowIntensity: 2
      },
      content: {
        title: 'Get Your Custom Quote',
        subtitle: 'Tell us about your dream cake and we\'ll create a personalized quote for you.',
        fields: [
          { id: 'name', type: 'text' as const, label: 'Full Name', placeholder: 'Enter your name', required: true },
          { id: 'email', type: 'email' as const, label: 'Email Address', placeholder: 'your@email.com', required: true },
          { id: 'event-date', type: 'date' as const, label: 'Event Date', placeholder: 'Select date', required: true },
          { id: 'details', type: 'textarea' as const, label: 'Cake Details', placeholder: 'Tell us about your cake...', required: true }
        ],
        submitText: 'Get My Quote',
        successMessage: 'Thank you! We\'ll get back to you within 24 hours.'
      },
      behavior: {
        autoHeight: true,
        smoothScroll: true,
        loadingAnimation: true,
        validationStyle: 'inline' as const,
        submitAction: 'modal' as const
      },
      integrations: {
        googleAnalytics: false,
        facebookPixel: false,
        customCss: '',
        customJs: ''
      }
    };

    createWidgetMutation.mutate(newWidget);
  };

  const handleUpdateWidget = (updates: Partial<WidgetConfig>) => {
    if (!selectedWidget) return;
    
    const updatedWidget = { ...selectedWidget, ...updates };
    setSelectedWidget(updatedWidget);
    setUnsavedChanges(true);
  };

  const handleSaveWidget = () => {
    if (!selectedWidget) return;
    updateWidgetMutation.mutate(selectedWidget);
  };

  const addFormField = () => {
    if (!selectedWidget) return;
    
    const newField = {
      id: `field-${Date.now()}`,
      type: 'text' as const,
      label: 'New Field',
      placeholder: 'Enter value',
      required: false
    };
    
    handleUpdateWidget({
      content: {
        ...selectedWidget.content,
        fields: [...selectedWidget.content.fields, newField]
      }
    });
  };

  const removeFormField = (fieldId: string) => {
    if (!selectedWidget) return;
    
    handleUpdateWidget({
      content: {
        ...selectedWidget.content,
        fields: selectedWidget.content.fields.filter(field => field.id !== fieldId)
      }
    });
  };

  const updateFormField = (fieldId: string, updates: Partial<WidgetConfig['content']['fields'][0]>) => {
    if (!selectedWidget) return;
    
    handleUpdateWidget({
      content: {
        ...selectedWidget.content,
        fields: selectedWidget.content.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      }
    });
  };

  const generateEmbedCode = () => {
    if (!selectedWidget) return '';
    
    return `<iframe 
  src="https://${bakerId}.bakewiseapp.com/widget/${selectedWidget.id}" 
  width="${selectedWidget.dimensions.responsive ? '100%' : selectedWidget.dimensions.width}" 
  height="${selectedWidget.dimensions.height}" 
  frameborder="0"
  style="border: none; ${selectedWidget.dimensions.responsive ? 'max-width: 100%;' : ''}"
></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast({
      title: "Embed code copied!",
      description: "The widget embed code has been copied to your clipboard.",
    });
  };

  const currentPreviewDevice = previewDevices.find(d => d.id === previewDevice) || previewDevices[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Widget Builder</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Advanced Widget Builder</h1>
          <p className="text-muted-foreground">Create and customize embeddable widgets for your website</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedWidget && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                data-testid="button-toggle-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={handleSaveWidget}
                disabled={!unsavedChanges || updateWidgetMutation.isPending}
                data-testid="button-save-widget"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateWidgetMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {!selectedWidget ? (
        /* Widget Selection */
        <div className="space-y-6">
          {widgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Widgets</CardTitle>
                <CardDescription>Manage and edit your existing widgets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                      onClick={() => setSelectedWidget(widget)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{widget.type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWidgetMutation.mutate(widget.id);
                          }}
                          data-testid={`button-delete-widget-${widget.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-medium">{widget.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {widget.dimensions.width}x{widget.dimensions.height}px
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Create New Widget</CardTitle>
              <CardDescription>Choose a widget type to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {widgetTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleCreateWidget(type.id)}
                    className="p-6 border-2 border-dashed border-muted rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    data-testid={`button-create-${type.id}`}
                  >
                    <type.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-medium mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Widget Editor */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Editor Panel */}
          <div className={`space-y-6 ${isPreviewMode ? 'hidden lg:block lg:col-span-1' : 'lg:col-span-2'}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedWidget(null)}
                        data-testid="button-back-to-widgets"
                      >
                        ←
                      </Button>
                      <span>Edit Widget</span>
                    </CardTitle>
                    <CardDescription>{selectedWidget.name}</CardDescription>
                  </div>
                  {unsavedChanges && (
                    <Badge variant="secondary">Unsaved Changes</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Widget Name</Label>
                    <Input
                      value={selectedWidget.name}
                      onChange={(e) => handleUpdateWidget({ name: e.target.value })}
                      data-testid="input-widget-name"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={selectedWidget.dimensions.width}
                        onChange={(e) => handleUpdateWidget({
                          dimensions: { ...selectedWidget.dimensions, width: parseInt(e.target.value) || 400 }
                        })}
                        data-testid="input-widget-width"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={selectedWidget.dimensions.height}
                        onChange={(e) => handleUpdateWidget({
                          dimensions: { ...selectedWidget.dimensions, height: parseInt(e.target.value) || 600 }
                        })}
                        data-testid="input-widget-height"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Responsive</Label>
                    <Switch
                      checked={selectedWidget.dimensions.responsive}
                      onCheckedChange={(checked) => handleUpdateWidget({
                        dimensions: { ...selectedWidget.dimensions, responsive: checked }
                      })}
                      data-testid="switch-responsive"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="design" data-testid="tab-design">Design</TabsTrigger>
                <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                <TabsTrigger value="behavior" data-testid="tab-behavior">Behavior</TabsTrigger>
                <TabsTrigger value="code" data-testid="tab-code">Code</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Styling</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedWidget.styling.primaryColor}
                            onChange={(e) => handleUpdateWidget({
                              styling: { ...selectedWidget.styling, primaryColor: e.target.value }
                            })}
                            className="w-12 h-10 rounded border cursor-pointer"
                            data-testid="color-primary"
                          />
                          <Input
                            value={selectedWidget.styling.primaryColor}
                            onChange={(e) => handleUpdateWidget({
                              styling: { ...selectedWidget.styling, primaryColor: e.target.value }
                            })}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedWidget.styling.backgroundColor}
                            onChange={(e) => handleUpdateWidget({
                              styling: { ...selectedWidget.styling, backgroundColor: e.target.value }
                            })}
                            className="w-12 h-10 rounded border cursor-pointer"
                            data-testid="color-background"
                          />
                          <Input
                            value={selectedWidget.styling.backgroundColor}
                            onChange={(e) => handleUpdateWidget({
                              styling: { ...selectedWidget.styling, backgroundColor: e.target.value }
                            })}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius: {selectedWidget.styling.borderRadius}px</Label>
                      <Slider
                        value={[selectedWidget.styling.borderRadius]}
                        onValueChange={(value) => handleUpdateWidget({
                          styling: { ...selectedWidget.styling, borderRadius: value[0] }
                        })}
                        min={0}
                        max={24}
                        step={1}
                        className="w-full"
                        data-testid="slider-border-radius"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Padding: {selectedWidget.styling.padding}px</Label>
                      <Slider
                        value={[selectedWidget.styling.padding]}
                        onValueChange={(value) => handleUpdateWidget({
                          styling: { ...selectedWidget.styling, padding: value[0] }
                        })}
                        min={8}
                        max={48}
                        step={4}
                        className="w-full"
                        data-testid="slider-padding"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Button Style</Label>
                      <Select
                        value={selectedWidget.styling.buttonStyle}
                        onValueChange={(value: 'rounded' | 'square' | 'pill') => handleUpdateWidget({
                          styling: { ...selectedWidget.styling, buttonStyle: value }
                        })}
                      >
                        <SelectTrigger data-testid="select-button-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {buttonStyles.map(style => (
                            <SelectItem key={style.id} value={style.id}>
                              {style.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Type className="h-5 w-5" />
                      <span>Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={selectedWidget.content.title}
                        onChange={(e) => handleUpdateWidget({
                          content: { ...selectedWidget.content, title: e.target.value }
                        })}
                        data-testid="input-widget-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Textarea
                        value={selectedWidget.content.subtitle}
                        onChange={(e) => handleUpdateWidget({
                          content: { ...selectedWidget.content, subtitle: e.target.value }
                        })}
                        data-testid="textarea-widget-subtitle"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Form Fields</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addFormField}
                          data-testid="button-add-field"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Field
                        </Button>
                      </div>

                      {selectedWidget.content.fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">Field {index + 1}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFormField(field.id)}
                                data-testid={`button-remove-field-${field.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Field Type</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value: any) => updateFormField(field.id, { type: value })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Required</Label>
                                <Switch
                                  checked={field.required}
                                  onCheckedChange={(checked) => updateFormField(field.id, { required: checked })}
                                  className="h-6 w-10"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                  className="h-8"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Placeholder</Label>
                                <Input
                                  value={field.placeholder}
                                  onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Submit Button Text</Label>
                      <Input
                        value={selectedWidget.content.submitText}
                        onChange={(e) => handleUpdateWidget({
                          content: { ...selectedWidget.content, submitText: e.target.value }
                        })}
                        data-testid="input-submit-text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Success Message</Label>
                      <Textarea
                        value={selectedWidget.content.successMessage}
                        onChange={(e) => handleUpdateWidget({
                          content: { ...selectedWidget.content, successMessage: e.target.value }
                        })}
                        data-testid="textarea-success-message"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Behavior Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Height</Label>
                        <p className="text-sm text-muted-foreground">Automatically adjust height to content</p>
                      </div>
                      <Switch
                        checked={selectedWidget.behavior.autoHeight}
                        onCheckedChange={(checked) => handleUpdateWidget({
                          behavior: { ...selectedWidget.behavior, autoHeight: checked }
                        })}
                        data-testid="switch-auto-height"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Loading Animation</Label>
                        <p className="text-sm text-muted-foreground">Show loading spinner on submit</p>
                      </div>
                      <Switch
                        checked={selectedWidget.behavior.loadingAnimation}
                        onCheckedChange={(checked) => handleUpdateWidget({
                          behavior: { ...selectedWidget.behavior, loadingAnimation: checked }
                        })}
                        data-testid="switch-loading-animation"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Submit Action</Label>
                      <Select
                        value={selectedWidget.behavior.submitAction}
                        onValueChange={(value: 'redirect' | 'modal' | 'inline') => handleUpdateWidget({
                          behavior: { ...selectedWidget.behavior, submitAction: value }
                        })}
                      >
                        <SelectTrigger data-testid="select-submit-action">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modal">Show Modal</SelectItem>
                          <SelectItem value="inline">Inline Message</SelectItem>
                          <SelectItem value="redirect">Redirect to URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedWidget.behavior.submitAction === 'redirect' && (
                      <div className="space-y-2">
                        <Label>Redirect URL</Label>
                        <Input
                          placeholder="https://yourbakery.com/thank-you"
                          value={selectedWidget.behavior.redirectUrl || ''}
                          onChange={(e) => handleUpdateWidget({
                            behavior: { ...selectedWidget.behavior, redirectUrl: e.target.value }
                          })}
                          data-testid="input-redirect-url"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5" />
                      <span>Embed & Integration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Embed Code</Label>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode()}
                          readOnly
                          className="font-mono text-sm resize-none"
                          rows={6}
                          data-testid="textarea-embed-code"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={copyEmbedCode}
                          data-testid="button-copy-embed"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Widget URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={`https://${bakerId}.bakewiseapp.com/widget/${selectedWidget.id}`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://${bakerId}.bakewiseapp.com/widget/${selectedWidget.id}`, '_blank')}
                          data-testid="button-open-widget-url"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom CSS</Label>
                      <Textarea
                        placeholder="/* Add custom CSS here */"
                        value={selectedWidget.integrations.customCss}
                        onChange={(e) => handleUpdateWidget({
                          integrations: { ...selectedWidget.integrations, customCss: e.target.value }
                        })}
                        className="font-mono text-sm"
                        rows={4}
                        data-testid="textarea-custom-css"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className={`space-y-4 ${isPreviewMode ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Live Preview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    {previewDevices.map(device => (
                      <Button
                        key={device.id}
                        variant={previewDevice === device.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewDevice(device.id)}
                        data-testid={`button-preview-${device.id}`}
                      >
                        <device.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full">
                <div className="flex items-center justify-center h-full min-h-96">
                  <div
                    className="border rounded-lg overflow-hidden bg-white shadow-lg"
                    style={{
                      width: selectedWidget.dimensions.responsive ? '100%' : selectedWidget.dimensions.width,
                      maxWidth: currentPreviewDevice.width,
                      height: selectedWidget.dimensions.height,
                      backgroundColor: selectedWidget.styling.backgroundColor,
                      borderRadius: selectedWidget.styling.borderRadius,
                      padding: selectedWidget.styling.padding,
                      fontFamily: selectedWidget.styling.fontFamily,
                      fontSize: selectedWidget.styling.fontSize,
                      color: selectedWidget.styling.textColor
                    }}
                  >
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2
                          className="text-2xl font-bold mb-2"
                          style={{ color: selectedWidget.styling.primaryColor }}
                        >
                          {selectedWidget.content.title}
                        </h2>
                        <p className="text-muted-foreground">{selectedWidget.content.subtitle}</p>
                      </div>

                      <div className="space-y-3">
                        {selectedWidget.content.fields.map(field => (
                          <div key={field.id} className="space-y-1">
                            <label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                placeholder={field.placeholder}
                                className="w-full p-2 border rounded resize-none"
                                rows={3}
                                disabled
                              />
                            ) : field.type === 'select' ? (
                              <select className="w-full p-2 border rounded" disabled>
                                <option>{field.placeholder}</option>
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="w-full p-2 border rounded"
                                disabled
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        className={`w-full p-3 text-white font-medium transition-colors ${selectedWidget.styling.buttonStyle === 'pill' ? 'rounded-full' : selectedWidget.styling.buttonStyle === 'square' ? 'rounded-none' : 'rounded-md'}`}
                        style={{ backgroundColor: selectedWidget.styling.primaryColor }}
                        disabled
                      >
                        {selectedWidget.content.submitText}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}