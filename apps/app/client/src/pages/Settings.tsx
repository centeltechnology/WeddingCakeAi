import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Calculator as CalculatorIcon, Eye, Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import CalculatorThemeSelector from "@/components/CalculatorThemeSelector";
import Calculator from "@/components/Calculator";
import { useCalculatorTheme } from "@/hooks/useCalculatorTheme";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import { SettingsTabs } from "@/components/SettingsTabs";

export default function Settings() {
  const { toast } = useToast();
  const { currentTheme } = useCalculatorTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.id);
  const [showPreview, setShowPreview] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the baker's profile via API
    toast({
      title: "Settings saved",
      description: "Your calculator theme has been updated successfully.",
    });
  };

  const handlePreviewCalculator = () => {
    setShowPreview(true);
  };

  return (
    <AppLayout>
            <SEOHead 
              title="Calculator Settings - BakerIQ"
              description="Customize your calculator themes and appearance settings"
            />
            
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              <div className="mb-6">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-foreground">
                    Settings
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your calculator and business profile settings
                  </p>
                </div>
              </div>
              </div>

              <SettingsTabs />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Theme Selector */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalculatorIcon className="w-5 h-5 text-primary" />
                      Calculator Appearance
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose a theme that reflects your brand and appeals to your target customers. 
                      Your calculator will be embedded on your website with your selected theme.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CalculatorThemeSelector 
                      selectedTheme={selectedTheme}
                      onThemeChange={handleThemeChange}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Current Theme Preview & Actions */}
              <div className="lg:col-span-1 space-y-6">
                {/* Current Theme Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-medium">{currentTheme.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentTheme.description}
                      </p>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Colors</p>
                      <div className="flex gap-1">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: currentTheme.colors.primary }}
                          title="Primary"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: currentTheme.colors.accent }}
                          title="Accent"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: currentTheme.colors.secondary }}
                          title="Secondary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview & Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handlePreviewCalculator}
                          data-testid="button-preview-calculator"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Calculator
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Calculator Preview - {currentTheme.name}</DialogTitle>
                          <DialogDescription>
                            This is how your calculator will appear to customers on your website
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <Calculator themeId={selectedTheme} />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Separator />

                    <Button 
                      onClick={handleSaveSettings}
                      className="w-full"
                      data-testid="button-save-settings"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Usage Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 font-medium">💡 Embedding Your Calculator</p>
                        <p className="text-blue-700 mt-1">
                          Copy your calculator embed code from the "Embed" section to add it to your website with your selected theme.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 font-medium">🎨 Theme Tips</p>
                        <p className="text-green-700 mt-1">
                          Choose colors that match your brand and website design for a professional, cohesive look.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
    </AppLayout>
  );
}