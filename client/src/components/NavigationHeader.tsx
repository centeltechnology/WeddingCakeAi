import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTenant } from './TenantBrandProvider';
import { ChefHat, Settings, Home, BarChart3, Sparkles } from 'lucide-react';

export function NavigationHeader() {
  const [location] = useLocation();
  const { tenant, branding } = useTenant();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <ChefHat className="h-8 w-8 text-primary" />
            )}
            <div>
              <h1 className="text-xl font-bold text-primary">
                {tenant?.name || 'Bakewise'}
              </h1>
              {tenant && (
                <p className="text-xs text-muted-foreground">
                  Powered by Bakewise
                </p>
              )}
            </div>
          </Link>
          
          {tenant && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)}
            </Badge>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <Button
            variant={location === '/' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>

          {/* Baker-focused navigation */}
          {tenant ? (
            // Baker dashboard for multi-tenant customers
            <Button
              variant={location === '/admin' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href="/admin" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">My Bakery</span>
              </Link>
            </Button>
          ) : (
            // Main Bakewise platform navigation
            <>
              <Button
                variant={location === '/admin' ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/demo-tenant" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Live Demo</span>
                  <span className="sm:hidden">Demo</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}