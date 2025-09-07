import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTenant } from './TenantBrandProvider';
import { ChefHat, Settings, Home, BarChart3, Sparkles, Star, Info, CreditCard, UserPlus, Menu, X } from 'lucide-react';

export function NavigationHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
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

              <Button
                variant="outline"
                size="sm"
                asChild
                className="ml-2 border-2 border-blue-200 hover:border-blue-300 bg-blue-50/80 backdrop-blur-sm hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium"
                data-testid="nav-baker-login"
              >
                <Link href="/baker-login">
                  <ChefHat className="h-4 w-4 mr-1" />
                  <span>Baker Login</span>
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="ml-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6"
                data-testid="nav-signup"
              >
                <Link href="/signup">
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span>Sign Up</span>
                </Link>
              </Button>
            </>
          )}

          {tenant ? (
            <Button
              variant={location === '/admin' ? 'default' : 'ghost'}
              size="sm"
              asChild
              className={location === '/admin' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white' : 'hover:bg-pink-50 hover:text-pink-700'}
              data-testid="nav-my-bakery"
            >
              <Link href="/admin" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>My Bakery</span>
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="ml-2 border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-pink-50 text-gray-700 hover:text-pink-700"
              data-testid="nav-demo"
            >
              <Link href="/demo-tenant" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Live Demo</span>
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                data-testid="mobile-menu-trigger"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-md border-l border-pink-100">
              <div className="flex flex-col space-y-4 mt-8">
                {!tenant && (
                  <>
                    <Link 
                      href="/" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-home"
                    >
                      <Home className="h-5 w-5" />
                      <span className="font-medium">Home</span>
                    </Link>
                    
                    <Link 
                      href="/features" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/features' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-features"
                    >
                      <Star className="h-5 w-5" />
                      <span className="font-medium">Features</span>
                    </Link>
                    
                    <Link 
                      href="/about" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/about' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-about"
                    >
                      <Info className="h-5 w-5" />
                      <span className="font-medium">About</span>
                    </Link>
                    
                    <Link 
                      href="/pricing" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/pricing' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-pricing"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Pricing</span>
                    </Link>

                    <div className="border-t border-pink-100 pt-4 space-y-3">
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-nav-baker-login"
                      >
                        <ChefHat className="h-5 w-5" />
                        <span className="font-medium">Baker Login</span>
                      </Link>
                      
                      <Link 
                        href="/signup" 
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-nav-signup"
                      >
                        <UserPlus className="h-5 w-5" />
                        <span className="font-medium">Sign Up</span>
                      </Link>
                    </div>
                  </>
                )}

                {tenant && (
                  <>
                    <Link 
                      href="/admin" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/admin' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-my-bakery"
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span className="font-medium">My Bakery</span>
                    </Link>
                  </>
                )}

                {!tenant && (
                  <Link 
                    href="/demo-tenant" 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-demo"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Live Demo</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}