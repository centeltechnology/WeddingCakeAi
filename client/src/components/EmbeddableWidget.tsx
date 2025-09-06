import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Eye, 
  Copy, 
  Globe, 
  Palette, 
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle
} from 'lucide-react';

interface EmbeddableWidgetProps {
  bakerId: string;
}

export function EmbeddableWidget({ bakerId }: EmbeddableWidgetProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('widgets');
  const [selectedWidget, setSelectedWidget] = useState('quote-calculator');
  const [widgetConfig, setWidgetConfig] = useState({
    primaryColor: '#ec4899',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '8',
    showLogo: true,
    companyName: 'Sweet Dreams Bakery'
  });

  const widgets = [
    {
      id: 'quote-calculator',
      name: 'Quote Calculator',
      description: 'Interactive cake pricing calculator for your website',
      category: 'Lead Generation',
      preview: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Quote+Calculator',
      embedCode: `<iframe src="https://bakewise.com/widgets/quote-calculator/${bakerId}" width="100%" height="600" frameborder="0"></iframe>`
    },
    {
      id: 'booking-form',
      name: 'Booking Form',
      description: 'Simple booking form to capture customer inquiries',
      category: 'Lead Generation',
      preview: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Booking+Form',
      embedCode: `<iframe src="https://bakewise.com/widgets/booking-form/${bakerId}" width="100%" height="500" frameborder="0"></iframe>`
    },
    {
      id: 'portfolio-gallery',
      name: 'Portfolio Gallery',
      description: 'Showcase your best work with an interactive gallery',
      category: 'Showcase',
      preview: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Portfolio+Gallery',
      embedCode: `<iframe src="https://bakewise.com/widgets/portfolio/${bakerId}" width="100%" height="400" frameborder="0"></iframe>`
    },
    {
      id: 'testimonials',
      name: 'Customer Reviews',
      description: 'Display customer testimonials and ratings',
      category: 'Social Proof',
      preview: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Customer+Reviews',
      embedCode: `<iframe src="https://bakewise.com/widgets/testimonials/${bakerId}" width="100%" height="350" frameborder="0"></iframe>`
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  const generateCustomCode = () => {
    const widget = widgets.find(w => w.id === selectedWidget);
    if (!widget) return '';

    const config = btoa(JSON.stringify(widgetConfig));
    return widget.embedCode.replace('frameborder="0"', `frameborder="0" data-config="${config}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Embeddable Widgets</h2>
          <p className="text-muted-foreground">Add powerful widgets to your website to capture more leads</p>
        </div>
        <Button variant="outline">
          <Globe className="h-4 w-4 mr-2" />
          Widget Documentation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="widgets" data-testid="tab-widgets">
            <Code className="h-4 w-4 mr-2" />
            Available Widgets
          </TabsTrigger>
          <TabsTrigger value="customize" data-testid="tab-customize">
            <Palette className="h-4 w-4 mr-2" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-widget-analytics">
            <Monitor className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{widget.name}</CardTitle>
                      <CardDescription className="mt-1">{widget.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{widget.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Widget Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img 
                      src={widget.preview} 
                      alt={`${widget.name} preview`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-sm text-muted-foreground mt-2">Widget Preview</p>
                  </div>
                  
                  {/* Embed Code */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Embed Code</Label>
                    <div className="bg-muted p-3 rounded-md">
                      <code className="text-sm break-all">{widget.embedCode}</code>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(widget.embedCode)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Code
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedWidget(widget.id);
                        setActiveTab('customize');
                      }}
                      className="flex-1"
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                How to Add Widgets to Your Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-medium mb-1">Choose Widget</h4>
                  <p className="text-sm text-muted-foreground">Select the widget that fits your needs</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-medium mb-1">Copy Code</h4>
                  <p className="text-sm text-muted-foreground">Copy the embed code to your clipboard</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-medium mb-1">Paste & Publish</h4>
                  <p className="text-sm text-muted-foreground">Paste the code into your website HTML</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Place the quote calculator on your services or pricing page</li>
                  <li>• Add the booking form to your contact page for maximum visibility</li>
                  <li>• Portfolio galleries work great on your home page or portfolio section</li>
                  <li>• Customer reviews build trust - add them near your call-to-action buttons</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customization Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Widget Customization</CardTitle>
                <CardDescription>
                  Customize the appearance to match your brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#ec4899"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={widgetConfig.backgroundColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={widgetConfig.backgroundColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={widgetConfig.textColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={widgetConfig.textColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      placeholder="#1f2937"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="borderRadius">Border Radius (px)</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={widgetConfig.borderRadius}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                    placeholder="8"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={widgetConfig.companyName}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your Bakery Name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Live Preview
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Monitor className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Tablet className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Smartphone className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-6 min-h-64"
                  style={{
                    backgroundColor: widgetConfig.backgroundColor,
                    color: widgetConfig.textColor,
                    borderRadius: `${widgetConfig.borderRadius}px`
                  }}
                >
                  <div className="text-center">
                    <h3 
                      className="text-xl font-bold mb-4"
                      style={{ color: widgetConfig.primaryColor }}
                    >
                      {widgetConfig.companyName}
                    </h3>
                    <div 
                      className="p-4 rounded-lg mb-4"
                      style={{ 
                        backgroundColor: widgetConfig.primaryColor + '20',
                        borderRadius: `${widgetConfig.borderRadius}px`
                      }}
                    >
                      <h4 className="font-medium mb-2">Get Your Custom Quote</h4>
                      <p className="text-sm opacity-80">
                        Fill out our quick form to receive a personalized quote for your special event.
                      </p>
                    </div>
                    <Button 
                      style={{ 
                        backgroundColor: widgetConfig.primaryColor,
                        borderRadius: `${widgetConfig.borderRadius}px`
                      }}
                      className="text-white"
                    >
                      Start Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Embed Code</CardTitle>
              <CardDescription>
                Copy this customized embed code for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm break-all">{generateCustomCode()}</code>
              </div>
              <Button 
                className="mt-4 w-full" 
                onClick={() => copyToClipboard(generateCustomCode())}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Customized Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Widget Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Track widget performance, conversions, and user interactions.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}