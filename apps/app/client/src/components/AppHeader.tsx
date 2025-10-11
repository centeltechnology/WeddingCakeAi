import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { logout } from '@/lib/auth';
import QuickActions from '@/components/QuickActions';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';

export default function AppHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Brand Dark Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand)] text-white border-b border-black/10">
        <div className="h-14 px-4 flex items-center justify-between gap-2">
          {/* Left: Brand + Hamburger (mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
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
            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogout}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-14 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-40 md:hidden overflow-y-auto">
            <div className="p-4">
              <Sidebar />
            </div>
            
            {/* Mobile Quick Actions */}
            <div className="p-4 border-t dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
              <QuickActions variant="full" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
