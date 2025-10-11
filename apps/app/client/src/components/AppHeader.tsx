import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { logout } from '@/lib/auth';
import { trapFocus } from '@/lib/focusTrap';
import QuickActions from '@/components/QuickActions';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/Tooltip';

export default function AppHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Focus trap and focus management
  useEffect(() => {
    if (mobileMenuOpen && drawerRef.current) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in drawer
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
      );
      focusables[0]?.focus();
      
      // Setup focus trap
      const cleanup = trapFocus(drawerRef.current);
      return cleanup;
    } else if (!mobileMenuOpen && previousFocusRef.current) {
      // Restore focus to hamburger when closing
      hamburgerRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
  };

  const closeDrawer = () => {
    setMobileMenuOpen(false);
  };

  const handleDrawerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  };

  return (
    <>
      {/* Brand Dark Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand)] text-white border-b border-black/10">
        <div className="h-14 px-4 flex items-center justify-between gap-2">
          {/* Left: Brand + Hamburger (mobile) */}
          <div className="flex items-center gap-2">
            <button
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link 
              href="/baker/dashboard" 
              className="font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              BakerIQ
            </Link>
          </div>

          {/* Right: Quick Actions + Logout */}
          <div className="flex items-center gap-2">
            <QuickActions variant="compact" className="hidden sm:flex" />
            <Tooltip label="Logout">
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleLogout}
                className="text-sm"
              >
                Logout
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Mobile Drawer - Animated & Accessible */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in duration-200"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          
          {/* Drawer Panel */}
          <aside
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-xl z-50 md:hidden overflow-y-auto transform transition-transform duration-200 ease-in-out translate-x-0"
            onKeyDown={handleDrawerKeyDown}
          >
            <div className="p-4 border-b dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            </div>
            
            <div className="p-4">
              <Sidebar onNavigate={closeDrawer} />
            </div>
            
            {/* Mobile Quick Actions */}
            <div className="p-4 border-t dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
              <QuickActions variant="full" />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
