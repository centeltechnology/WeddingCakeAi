import { useState } from "react";
import { Sparkles, Download, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

// Real AI image generation using Replicate API
async function generateCakeImage(prompt: string): Promise<string> {
  const response = await apiRequest('POST', '/api/generate-cake-image', { prompt });
  const data = await response.json() as { imageUrl: string };
  return data.imageUrl;
}

interface CakeConfiguration {
  tiers: number;
  baseSize: number;
  shape: string;
  cakeFlavor: string;
  filling: string;
  decorations: {
    fondant: boolean;
    flowers: boolean;
    goldAccents: boolean;
    customTopper: boolean;
  };
  specialRequests: string;
}

interface DreamCakeDesignerProps {
  config: CakeConfiguration;
  isOpen: boolean;
  onClose: () => void;
}

export function DreamCakeDesigner({ config, isOpen, onClose }: DreamCakeDesignerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPrompt = (config: CakeConfiguration): string => {
    const decorations = [];
    if (config.decorations.fondant) decorations.push("smooth fondant covering");
    if (config.decorations.flowers) decorations.push("fresh flowers");
    if (config.decorations.goldAccents) decorations.push("gold leaf accents");
    if (config.decorations.customTopper) decorations.push("custom cake topper");

    const complexityLevel = config.tiers >= 3 ? "elaborate multi-tiered" : 
                           config.tiers === 2 ? "elegant two-tiered" : "single-tier";

    return `A stunning professional wedding cake photograph featuring a ${complexityLevel} ${config.shape} cake with ${config.cakeFlavor.replace('-', ' ')} cake and ${config.filling.replace('-', ' ')} filling. ${decorations.length > 0 ? `Beautifully decorated with ${decorations.join(', ')}.` : ''} ${config.specialRequests ? `Special features: ${config.specialRequests}.` : ''} Shot in a professional photography studio with perfect lighting, white backdrop, photorealistic, high resolution 4K, award-winning food photography, elegant and luxurious presentation, masterpiece quality.`;
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const prompt = createPrompt(config);
      const imageUrl = await generateCakeImage(prompt);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error("Image generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (generatedImageUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `dreamcake-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleIncludeInQuote = () => {
    // TODO: Implement include in quote functionality
    console.log("Including image in quote");
    alert("Include in quote functionality will be implemented");
    onClose();
  };

  const handleClose = () => {
    setGeneratedImageUrl(null);
    setError(null);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border-0"
        data-testid="dreamcake-designer-modal"
      >
        <DialogHeader className="pb-6 border-b border-gray-100 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-3 text-2xl font-serif">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            DreamCake Designer
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Visualize your perfect wedding cake with AI-powered generation
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Configuration Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Your Cake Configuration:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tiers:</span>
                <span className="ml-2 font-medium">{config.tiers}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Shape:</span>
                <span className="ml-2 font-medium capitalize">{config.shape}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Flavor:</span>
                <span className="ml-2 font-medium capitalize">{config.cakeFlavor.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Filling:</span>
                <span className="ml-2 font-medium capitalize">{config.filling.replace('-', ' ')}</span>
              </div>
            </div>
            {Object.values(config.decorations).some(Boolean) && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Decorations:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {config.decorations.fondant && (
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs">
                      Fondant
                    </span>
                  )}
                  {config.decorations.flowers && (
                    <span className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full text-xs">
                      Fresh Flowers
                    </span>
                  )}
                  {config.decorations.goldAccents && (
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                      Gold Accents
                    </span>
                  )}
                  {config.decorations.customTopper && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                      Custom Topper
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generation Section */}
          {!generatedImageUrl && !isGenerating && !error && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to see your dream cake?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Our AI will create a stunning visualization based on your configuration
              </p>
              <Button
                onClick={handleGenerateImage}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-generate-cake"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Dream Cake
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-16">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 rounded-full animate-pulse mx-auto"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Creating your dream cake...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is crafting the perfect visualization for you
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Generation Failed</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button
                onClick={handleGenerateImage}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900"
                data-testid="button-retry-generate"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Generated Image */}
          {generatedImageUrl && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Your Dream Cake Visualization</h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                  <img
                    src={generatedImageUrl}
                    alt="Generated wedding cake visualization"
                    className="max-w-full h-auto rounded-xl mx-auto shadow-md"
                    style={{ maxHeight: '400px' }}
                    data-testid="generated-cake-image"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleDownloadImage}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-download-image"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <Button
                  onClick={handleIncludeInQuote}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-include-in-quote"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Include in Quote
                </Button>
              </div>

              {/* Generate Another */}
              <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button
                  onClick={handleGenerateImage}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900"
                  disabled={isGenerating}
                  data-testid="button-generate-another"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Another Variation
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}