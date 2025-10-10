import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Palette,
  Image,
  Globe,
  Mail,
  Upload,
  Eye,
  Check,
  Copy,
  Settings,
  Brush,
  Monitor,
  Smartphone,
  Camera,
  Download,
  ExternalLink,
  RefreshCw,
  FileImage,
  Link,
  Crown
} from 'lucide-react';

interface BrandingConfig {
  id: string;
  tenantId: string;
  logo?: string;
  logoUrl?: string;
  businessName?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  emailBranding: {
    enabled: boolean;
    headerLogo: boolean;
    footerBranding: boolean;
    customSignature?: string;
    socialLinks: {
      website?: string;
      instagram?: string;
      facebook?: string;
      twitter?: string;
    };
  };
  whiteLabel: {
    enabled: boolean;
    hidePoweredBy: boolean;
    customFavicon?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BrandingSystemProps {
  tenantId: string;
}

const colorPresets = [
  { name: 'Rose Gold', colors: { primary: '#f43f5e', secondary: '#fda4af', accent: '#fb7185', background: '#fef2f2', text: '#881337' } },
  { name: 'Lavender', colors: { primary: '#8b5cf6', secondary: '#c4b5fd', accent: '#a78bfa', background: '#f5f3ff', text: '#581c87' } },
  { name: 'Mint', colors: { primary: '#10b981', secondary: '#6ee7b7', accent: '#34d399', background: '#ecfdf5', text: '#064e3b' } },
  { name: 'Peach', colors: { primary: '#f97316', secondary: '#fdba74', accent: '#fb923c', background: '#fff7ed', text: '#9a3412' } },
  { name: 'Ocean', colors: { primary: '#0ea5e9', secondary: '#7dd3fc', accent: '#38bdf8', background: '#f0f9ff', text: '#0c4a6e' } },
  { name: 'Sunset', colors: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#d97706', background: '#fffbeb', text: '#92400e' } },
];

const fontOptions = [
  { label: 'Inter (Modern)', value: 'Inter, sans-serif' },
  { label: 'Poppins (Friendly)', value: 'Poppins, sans-serif' },
  { label: 'Playfair Display (Elegant)', value: 'Playfair Display, serif' },
  { label: 'Dancing Script (Script)', value: 'Dancing Script, cursive' },
  { label: 'Montserrat (Clean)', value: 'Montserrat, sans-serif' },
  { label: 'Lora (Readable)', value: 'Lora, serif' },
];

export function BrandingSystem({ tenantId }: BrandingSystemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState('appearance');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Fetch branding configuration
  const { data: brandingConfig, isLoading } = useQuery<BrandingConfig>({
    queryKey: [`/api/branding/${tenantId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/branding/${tenantId}`);
      return response.json();
    },
  });

  // Update branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (updates: Partial<BrandingConfig>) => {
      const response = await apiRequest('PUT', `/api/branding/${tenantId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Branding updated!",
        description: "Your brand settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/branding/${tenantId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update branding",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await apiRequest('POST', `/api/branding/${tenantId}/logo`, formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Logo uploaded!",
        description: "Your logo has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/branding/${tenantId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to upload logo",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const handleColorChange = (colorType: keyof BrandingConfig['brandColors'], value: string) => {
    if (!brandingConfig) return;
    
    const updatedConfig = {
      ...brandingConfig,
      brandColors: {
        ...brandingConfig.brandColors,
        [colorType]: value
      }
    };
    updateBrandingMutation.mutate(updatedConfig);
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    if (!brandingConfig) return;
    
    const updatedConfig = {
      ...brandingConfig,
      brandColors: preset.colors
    };
    updateBrandingMutation.mutate(updatedConfig);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      uploadLogoMutation.mutate(file);
    }
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="https://${tenantId}.bakeriq.app/widget" width="400" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "The widget embed code has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Brand Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!brandingConfig) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Brand Settings</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Brush className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No branding configuration found</h3>
            <p className="text-muted-foreground">Create your brand settings to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Brand Settings</h1>
          <p className="text-muted-foreground">Customize your brand appearance and white-label settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
            data-testid="button-toggle-preview"
          >
            {previewMode === 'desktop' ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            {previewMode === 'desktop' ? 'Desktop' : 'Mobile'} Preview
          </Button>
        </div>
      </div>

      {/* Brand Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Live Preview</span>
          </CardTitle>
          <CardDescription>See how your branding looks in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed border-muted rounded-lg p-6 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}
            style={{
              backgroundColor: brandingConfig.brandColors.background,
              color: brandingConfig.brandColors.text,
              fontFamily: brandingConfig.typography.fontFamily
            }}
          >
            <div className="text-center space-y-4">
              {brandingConfig.logoUrl && (
                <img
                  src={brandingConfig.logoUrl}
                  alt="Brand Logo"
                  className="h-12 mx-auto object-contain"
                  data-testid="preview-brand-logo"
                />
              )}
              <h2
                className="text-2xl font-bold"
                style={{
                  color: brandingConfig.brandColors.primary,
                  fontFamily: brandingConfig.typography.headingFont
                }}
              >
                {brandingConfig.businessName || 'Your Bakery Name'}
              </h2>
              <p className="text-muted-foreground">
                Experience our delicious custom cakes and desserts
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  style={{
                    backgroundColor: brandingConfig.brandColors.primary,
                    color: '#ffffff'
                  }}
                  data-testid="preview-primary-button"
                >
                  Get Quote
                </Button>
                <Button
                  variant="outline"
                  style={{
                    borderColor: brandingConfig.brandColors.secondary,
                    color: brandingConfig.brandColors.secondary
                  }}
                >
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appearance" data-testid="tab-appearance">Appearance</TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5" />
                  <span>Brand Logo</span>
                </CardTitle>
                <CardDescription>Upload your brand logo (PNG, JPG, SVG up to 5MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {brandingConfig.logoUrl ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg" data-testid="logo-display-container">
                    <div className="flex items-center space-x-3">
                      <img
                        src={brandingConfig.logoUrl}
                        alt="Current Logo"
                        className="h-12 w-12 object-contain border rounded"
                        data-testid="current-brand-logo"
                      />
                      <div>
                        <p className="font-medium">Current Logo</p>
                        <p className="text-sm text-muted-foreground">Uploaded logo</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-change-logo"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium">Upload your logo</p>
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG or SVG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Color Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Color Presets</span>
                </CardTitle>
                <CardDescription>Choose from pre-designed color schemes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="p-3 border rounded-lg hover:border-primary transition-colors group"
                      data-testid={`preset-${preset.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="flex space-x-1 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.colors.primary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.colors.secondary }}
                        ></div>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.colors.accent }}
                        ></div>
                      </div>
                      <p className="text-sm font-medium group-hover:text-primary">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Brand Colors</CardTitle>
              <CardDescription>Fine-tune your brand colors to match your style</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {Object.entries(brandingConfig.brandColors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-medium capitalize">{key}</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof BrandingConfig['brandColors'], e.target.value)}
                        className="w-12 h-10 rounded border cursor-pointer"
                        data-testid={`color-input-${key}`}
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof BrandingConfig['brandColors'], e.target.value)}
                        className="text-sm font-mono"
                        data-testid={`color-text-${key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Customize fonts and text sizing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select
                    value={brandingConfig.typography.fontFamily}
                    onValueChange={(value) => updateBrandingMutation.mutate({
                      typography: { ...brandingConfig.typography, fontFamily: value }
                    })}
                  >
                    <SelectTrigger data-testid="select-body-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select
                    value={brandingConfig.typography.headingFont}
                    onValueChange={(value) => updateBrandingMutation.mutate({
                      typography: { ...brandingConfig.typography, headingFont: value }
                    })}
                  >
                    <SelectTrigger data-testid="select-heading-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={brandingConfig.typography.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => updateBrandingMutation.mutate({
                      typography: { ...brandingConfig.typography, fontSize: value }
                    })}
                  >
                    <SelectTrigger data-testid="select-font-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Branding</span>
              </CardTitle>
              <CardDescription>Customize email templates and signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Branding</Label>
                  <p className="text-sm text-muted-foreground">Apply your brand to all outgoing emails</p>
                </div>
                <Switch
                  checked={brandingConfig.emailBranding.enabled}
                  onCheckedChange={(checked) => updateBrandingMutation.mutate({
                    emailBranding: { ...brandingConfig.emailBranding, enabled: checked }
                  })}
                  data-testid="switch-email-branding"
                />
              </div>

              {brandingConfig.emailBranding.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Header Logo</Label>
                      <p className="text-sm text-muted-foreground">Show logo in email header</p>
                    </div>
                    <Switch
                      checked={brandingConfig.emailBranding.headerLogo}
                      onCheckedChange={(checked) => updateBrandingMutation.mutate({
                        emailBranding: { ...brandingConfig.emailBranding, headerLogo: checked }
                      })}
                      data-testid="switch-header-logo"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Footer Branding</Label>
                      <p className="text-sm text-muted-foreground">Show brand info in email footer</p>
                    </div>
                    <Switch
                      checked={brandingConfig.emailBranding.footerBranding}
                      onCheckedChange={(checked) => updateBrandingMutation.mutate({
                        emailBranding: { ...brandingConfig.emailBranding, footerBranding: checked }
                      })}
                      data-testid="switch-footer-branding"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Email Signature</Label>
                    <Textarea
                      placeholder="Add your custom email signature..."
                      value={brandingConfig.emailBranding.customSignature || ''}
                      onChange={(e) => updateBrandingMutation.mutate({
                        emailBranding: { ...brandingConfig.emailBranding, customSignature: e.target.value }
                      })}
                      data-testid="textarea-custom-signature"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Social Media Links</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-sm">Website</Label>
                        <Input
                          placeholder="https://yourbakery.com"
                          value={brandingConfig.emailBranding.socialLinks.website || ''}
                          onChange={(e) => updateBrandingMutation.mutate({
                            emailBranding: {
                              ...brandingConfig.emailBranding,
                              socialLinks: { ...brandingConfig.emailBranding.socialLinks, website: e.target.value }
                            }
                          })}
                          data-testid="input-website-link"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Instagram</Label>
                        <Input
                          placeholder="@yourbakery"
                          value={brandingConfig.emailBranding.socialLinks.instagram || ''}
                          onChange={(e) => updateBrandingMutation.mutate({
                            emailBranding: {
                              ...brandingConfig.emailBranding,
                              socialLinks: { ...brandingConfig.emailBranding.socialLinks, instagram: e.target.value }
                            }
                          })}
                          data-testid="input-instagram-link"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Facebook</Label>
                        <Input
                          placeholder="facebook.com/yourbakery"
                          value={brandingConfig.emailBranding.socialLinks.facebook || ''}
                          onChange={(e) => updateBrandingMutation.mutate({
                            emailBranding: {
                              ...brandingConfig.emailBranding,
                              socialLinks: { ...brandingConfig.emailBranding.socialLinks, facebook: e.target.value }
                            }
                          })}
                          data-testid="input-facebook-link"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Twitter</Label>
                        <Input
                          placeholder="@yourbakery"
                          value={brandingConfig.emailBranding.socialLinks.twitter || ''}
                          onChange={(e) => updateBrandingMutation.mutate({
                            emailBranding: {
                              ...brandingConfig.emailBranding,
                              socialLinks: { ...brandingConfig.emailBranding.socialLinks, twitter: e.target.value }
                            }
                          })}
                          data-testid="input-twitter-link"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="white-label" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>White Label Settings</span>
                <Badge variant="secondary">Premium</Badge>
              </CardTitle>
              <CardDescription>
                Remove BakerIQ branding and create a fully white-labeled experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable White Label</Label>
                  <p className="text-sm text-muted-foreground">Remove all BakerIQ branding</p>
                </div>
                <Switch
                  checked={brandingConfig.whiteLabel.enabled}
                  onCheckedChange={(checked) => updateBrandingMutation.mutate({
                    whiteLabel: { ...brandingConfig.whiteLabel, enabled: checked }
                  })}
                  data-testid="switch-white-label"
                />
              </div>

              {brandingConfig.whiteLabel.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Hide "Powered by BakerIQ"</Label>
                      <p className="text-sm text-muted-foreground">Remove footer attribution</p>
                    </div>
                    <Switch
                      checked={brandingConfig.whiteLabel.hidePoweredBy}
                      onCheckedChange={(checked) => updateBrandingMutation.mutate({
                        whiteLabel: { ...brandingConfig.whiteLabel, hidePoweredBy: checked }
                      })}
                      data-testid="switch-hide-powered-by"
                    />
                  </div>

                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Custom Favicon</CardTitle>
                      <CardDescription>Upload a custom favicon for your branded site</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {brandingConfig.whiteLabel.customFavicon ? (
                            <img
                              src={brandingConfig.whiteLabel.customFavicon}
                              alt="Favicon"
                              className="w-8 h-8 object-contain border rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted border rounded flex items-center justify-center">
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {brandingConfig.whiteLabel.customFavicon ? 'Custom Favicon' : 'No favicon set'}
                            </p>
                            <p className="text-sm text-muted-foreground">16x16 or 32x32 PNG/ICO</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => faviconInputRef.current?.click()}
                          data-testid="button-upload-favicon"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/png,image/x-icon"
                        className="hidden"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Embed Widget</CardTitle>
                      <CardDescription>Share your white-labeled quote widget</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={`https://${tenantId}.bakeriq.app/widget`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${tenantId}.bakeriq.app/widget`, '_blank')}
                          data-testid="button-open-widget"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={copyEmbedCode}
                        className="w-full"
                        data-testid="button-copy-embed-code"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Embed Code
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}