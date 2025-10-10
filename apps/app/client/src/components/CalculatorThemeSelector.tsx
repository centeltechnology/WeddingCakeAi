import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Palette, Eye } from "lucide-react";

export interface CalculatorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    border: string;
    gradient: string;
  };
}

export const calculatorThemes: CalculatorTheme[] = [
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Traditional rose and blush with gold accents - perfect for romantic weddings',
    colors: {
      primary: 'hsl(340, 55%, 65%)',
      secondary: 'hsl(320, 20%, 90%)',
      accent: 'hsl(45, 85%, 70%)', // Gold accent
      background: 'hsl(350, 40%, 97%)',
      card: 'hsl(350, 40%, 95%)',
      border: 'hsl(320, 15%, 85%)',
      gradient: 'linear-gradient(135deg, hsl(340, 55%, 65%), hsl(45, 85%, 70%))'
    }
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean whites and soft grays - sleek and professional aesthetic',
    colors: {
      primary: 'hsl(220, 15%, 45%)',
      secondary: 'hsl(210, 15%, 85%)',
      accent: 'hsl(200, 95%, 60%)', // Bright blue accent
      background: 'hsl(0, 0%, 98%)',
      card: 'hsl(0, 0%, 100%)',
      border: 'hsl(210, 15%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(220, 15%, 45%), hsl(200, 95%, 60%))'
    }
  },
  {
    id: 'vintage-romance',
    name: 'Vintage Romance',
    description: 'Warm creams and dusty roses - nostalgic and charming style',
    colors: {
      primary: 'hsl(350, 35%, 70%)',
      secondary: 'hsl(30, 25%, 88%)',
      accent: 'hsl(25, 45%, 75%)', // Warm peach accent
      background: 'hsl(40, 20%, 96%)',
      card: 'hsl(35, 20%, 94%)',
      border: 'hsl(30, 15%, 82%)',
      gradient: 'linear-gradient(135deg, hsl(350, 35%, 70%), hsl(25, 45%, 75%))'
    }
  },
  {
    id: 'bold-contemporary',
    name: 'Bold Contemporary',
    description: 'Rich purples and modern gradients - striking and memorable design',
    colors: {
      primary: 'hsl(280, 65%, 55%)',
      secondary: 'hsl(260, 20%, 85%)',
      accent: 'hsl(320, 70%, 65%)', // Bright magenta accent
      background: 'hsl(270, 15%, 97%)',
      card: 'hsl(265, 15%, 95%)',
      border: 'hsl(260, 15%, 88%)',
      gradient: 'linear-gradient(135deg, hsl(280, 65%, 55%), hsl(320, 70%, 65%))'
    }
  }
];

interface CalculatorThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function CalculatorThemeSelector({ selectedTheme, onThemeChange }: CalculatorThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    setPreviewTheme(null);
  };

  const handleThemePreview = (themeId: string | null) => {
    setPreviewTheme(themeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <Label className="text-base font-semibold">Calculator Theme</Label>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Choose how your calculator appears to customers. This affects the embedded widget on your website.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculatorThemes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const isPreviewing = previewTheme === theme.id;
          
          return (
            <Card 
              key={theme.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => handleThemePreview(theme.id)}
              onMouseLeave={() => handleThemePreview(null)}
              onClick={() => handleThemeSelect(theme.id)}
              data-testid={`theme-${theme.id}`}
            >
              <CardContent className="p-4">
                {/* Theme Preview */}
                <div 
                  className="mb-3 h-20 rounded-lg border-2 relative overflow-hidden"
                  style={{
                    background: theme.colors.gradient,
                    borderColor: theme.colors.border
                  }}
                >
                  {/* Mini calculator preview */}
                  <div 
                    className="absolute inset-2 rounded-md p-2"
                    style={{ backgroundColor: theme.colors.card }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-1 rounded"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div 
                        className="w-8 h-1 rounded"
                        style={{ backgroundColor: theme.colors.border }}
                      />
                      <div 
                        className="w-6 h-1 rounded"
                        style={{ backgroundColor: theme.colors.border }}
                      />
                    </div>
                    <div 
                      className="absolute bottom-1 right-1 w-3 h-1.5 rounded text-[6px] flex items-center justify-center"
                      style={{ 
                        backgroundColor: theme.colors.accent,
                        color: 'white'
                      }}
                    />
                  </div>

                  {/* Selection checkmark */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{theme.name}</h4>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                  
                  {/* Color palette preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                  </div>
                </div>

                {/* Preview and Select Buttons */}
                <div className="flex gap-2 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`preview-theme-${theme.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preview: {theme.name}</DialogTitle>
                        <DialogDescription>{theme.description}</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        {/* Large theme preview */}
                        <div 
                          className="w-full h-32 rounded-lg border-4 relative overflow-hidden mb-4"
                          style={{
                            background: theme.colors.gradient,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div 
                            className="absolute inset-4 rounded-lg p-4"
                            style={{ backgroundColor: theme.colors.card }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <div 
                                className="w-20 h-3 rounded"
                                style={{ backgroundColor: theme.colors.secondary }}
                              />
                            </div>
                            <div className="space-y-2">
                              <div 
                                className="w-32 h-2 rounded"
                                style={{ backgroundColor: theme.colors.border }}
                              />
                              <div 
                                className="w-24 h-2 rounded"
                                style={{ backgroundColor: theme.colors.border }}
                              />
                              <div 
                                className="w-28 h-2 rounded"
                                style={{ backgroundColor: theme.colors.border }}
                              />
                            </div>
                            <div 
                              className="absolute bottom-2 right-2 w-12 h-6 rounded text-xs flex items-center justify-center text-white"
                              style={{ backgroundColor: theme.colors.accent }}
                            >
                              Button
                            </div>
                          </div>
                        </div>
                        
                        {/* Color palette */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Color Palette</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border"
                                style={{ backgroundColor: theme.colors.primary }}
                              />
                              <span className="text-sm">Primary</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border"
                                style={{ backgroundColor: theme.colors.accent }}
                              />
                              <span className="text-sm">Accent</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full border"
                                style={{ backgroundColor: theme.colors.secondary }}
                              />
                              <span className="text-sm">Secondary</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    size="sm" 
                    className={`flex-1 ${isSelected ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme.id);
                    }}
                    data-testid={`select-theme-${theme.id}`}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <strong>💡 Pro tip:</strong> Your theme will be applied to the calculator widget that customers see on your website. 
        Choose a theme that matches your brand and appeals to your target customers.
      </div>
    </div>
  );
}