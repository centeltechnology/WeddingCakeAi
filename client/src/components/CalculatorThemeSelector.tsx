import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Palette } from "lucide-react";

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

                {/* Preview/Select Button */}
                <Button 
                  variant={isSelected ? "default" : "outline"}
                  size="sm" 
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThemeSelect(theme.id);
                  }}
                  data-testid={`select-theme-${theme.id}`}
                >
                  {isSelected ? 'Selected' : isPreviewing ? 'Preview' : 'Select Theme'}
                </Button>
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