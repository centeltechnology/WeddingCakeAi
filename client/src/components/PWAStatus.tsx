import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Download, Smartphone } from 'lucide-react';

export function PWAStatus() {
  const { isInstallable, isInstalled, isOffline, installApp } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Offline/Online Status */}
      <Badge 
        variant={isOffline ? "destructive" : "secondary"} 
        className="flex items-center gap-1"
      >
        {isOffline ? (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="hidden sm:inline">Offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-3 w-3" />
            <span className="hidden sm:inline">Online</span>
          </>
        )}
      </Badge>

      {/* Install Status */}
      {isInstalled && (
        <Badge variant="outline" className="flex items-center gap-1 text-rose-600 border-rose-200">
          <Smartphone className="h-3 w-3" />
          <span className="hidden sm:inline">App Installed</span>
        </Badge>
      )}

      {/* Install Button */}
      {isInstallable && !isInstalled && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={installApp}
          className="flex items-center gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
          data-testid="button-install-app"
        >
          <Download className="h-3 w-3" />
          <span className="hidden sm:inline">Install App</span>
        </Button>
      )}
    </div>
  );
}