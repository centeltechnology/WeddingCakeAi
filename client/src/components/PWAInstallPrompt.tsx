import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Zap, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setHasBeenDismissed(true);
        return;
      }
    }

    // Always show for testing - remove the installable requirement temporarily
    if (!hasBeenDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        console.log('PWA Install Prompt: Showing prompt for testing');
      }, 3000); // Show after 3 seconds for testing

      return () => clearTimeout(timer);
    }
  }, [hasBeenDismissed]); // Removed isInstallable dependency for testing

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasBeenDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt || !isInstallable || hasBeenDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-sm">
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🍰</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install Bakewise</h3>
                <p className="text-sm text-gray-600">Get the full app experience</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              data-testid="button-dismiss-install"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4 text-rose-500" />
              <span>Works like a native mobile app</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wifi className="h-4 w-4 text-rose-500" />
              <span>Available offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-rose-500" />
              <span>Faster loading times</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              data-testid="button-install-pwa"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              data-testid="button-not-now"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}