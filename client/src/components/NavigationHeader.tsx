import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTenant } from './TenantBrandProvider';
import { ChefHat, Settings, Home, BarChart3, Sparkles, Star, Info, CreditCard, UserPlus } from 'lucide-react';

export function NavigationHeader() {
  const [location] = useLocation();
  const { tenant, branding } = useTenant();

  return (
    <header className="border-0 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home-logo">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-10 w-auto" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {tenant?.name || 'Bakewise'}
              </h1>
              {tenant && (
                <p className="text-xs text-gray-500 font-medium">
                  Powered by Bakewise
                </p>
              )}
            </div>
          </Link>
          
          {tenant && (
            <Badge variant="secondary" className="hidden sm:inline-flex bg-pink-100 text-pink-700 border-pink-200">
              {tenant.subscriptionPlan.charAt(0).toUpperCase() + tenant.subscriptionPlan.slice(1)}
            </Badge>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {/* Main Navigation Menu */}
          {!tenant && (
            <>
              <Button
                variant={location === '/' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
                data-testid="nav-home"
              >
                <Link href="/">
                  <span>Home</span>
                </Link>
              </Button>
              
              <Button
                variant={location === '/features' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/features' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
                data-testid="nav-features"
              >
                <Link href="/features">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Features</span>
                </Link>
              </Button>
              
              <Button
                variant={location === '/about' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/about' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
                data-testid="nav-about"
              >
                <Link href="/about">
                  <Info className="h-4 w-4 mr-1" />
                  <span>About</span>
                </Link>
              </Button>
              
              <Button
                variant={location === '/pricing' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/pricing' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
                data-testid="nav-pricing"
              >
                <Link href="/pricing">
                  <CreditCard className="h-4 w-4 mr-1" />
                  <span>Pricing</span>
                </Link>
              </Button>

              {/* CTA Button */}
              <Button
                asChild
                size="sm"
                className="ml-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6"
                data-testid="nav-signup"
              >
                <Link href="/signup">
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span>Sign Up</span>
                </Link>
              </Button>
            </>
          )}

          {/* Baker-focused navigation */}
          {tenant ? (
            // Baker dashboard for multi-tenant customers
            <Button
              variant={location === '/admin' ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={location === '/admin' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
              data-testid="nav-my-bakery"
            >
              <Link href="/admin" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">My Bakery</span>
              </Link>
            </Button>
          ) : (
            // Demo link for main platform
            <Button
              variant="outline"
              size="sm"
              asChild
              className="ml-2 border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-pink-50 text-gray-700 hover:text-pink-700"
              data-testid="nav-demo"
            >
              <Link href="/demo-tenant" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Live Demo</span>
                <span className="sm:hidden">Demo</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}