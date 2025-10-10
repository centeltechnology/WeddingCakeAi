import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTenant } from './TenantBrandProvider';
import { ThemeToggle } from './theme-toggle';
import { ChefHat, Settings, Home, BarChart3, Sparkles, Star, Info, CreditCard, UserPlus, Menu, X, HelpCircle } from 'lucide-react';

export function NavigationHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tenant, branding } = useTenant();

  return (
    <header className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group" data-testid="link-home-logo">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              <span className="text-orange-500">B</span>akerIQ
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {!tenant && (
            <>
              <Link 
                href="/features" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                data-testid="nav-features"
              >
                Features
              </Link>
              
              <Link 
                href="/pricing" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                data-testid="nav-pricing"
              >
                Pricing
              </Link>
              
              <Link 
                href="/marketplace" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                data-testid="nav-marketplace"
              >
                Find Bakers
              </Link>
              
              <Link 
                href="/help" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                data-testid="nav-support"
              >
                Support
              </Link>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="ml-4 border-2 border-orange-200 hover:border-orange-300 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                data-testid="nav-baker-login"
              >
                <Link href="/baker-login">
                  Baker Login
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-6"
                data-testid="nav-signup"
              >
                <Link href="/signup">
                  Get Started
                </Link>
              </Button>
              
              <div className="ml-4">
                <ThemeToggle />
              </div>
            </>
          )}

          {tenant ? (
            <>
              <Button
                variant={location === '/admin' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/admin' ? 'bg-primary hover:bg-primary/90 text-white' : 'hover:bg-gray-50 hover:text-gray-700'}
                data-testid="nav-my-bakery"
              >
                <Link href="/admin" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>My Bakery</span>
                </Link>
              </Button>
              
              <Button
                variant={location === '/help' ? 'default' : 'ghost'}
                size="sm"
                asChild
                className={location === '/help' ? 'bg-primary hover:bg-primary/90 text-white' : 'hover:bg-gray-50 hover:text-gray-700'}
                data-testid="nav-baker-support"
              >
                <Link href="/help" className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Support</span>
                </Link>
              </Button>
            </>
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
                    
                    <Link 
                      href="/help" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/help' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-support"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span className="font-medium">Support</span>
                    </Link>

                    <div className="border-t border-pink-100 pt-4 space-y-3">
                      <Link 
                        href="/baker-login" 
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
                    
                    <Link 
                      href="/help" 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        location === '/help' 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                          : 'hover:bg-pink-50 text-gray-700 hover:text-pink-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-baker-support"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span className="font-medium">Support</span>
                    </Link>
                  </>
                )}

                {!tenant && (
                  <Link 
                    href="/demo-tenant" 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-pink-200 text-gray-700 hover:bg-gray-50 hover:text-gray-700 transition-colors"
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