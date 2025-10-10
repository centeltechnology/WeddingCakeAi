import { Link, useLocation } from 'wouter';
import { NAV_ITEMS, NavItem } from '@/navigation/navConfig';
import { useMe } from '@/lib/useMe';
import { useCreditsModal } from '@/components/ai/CreditsModalContext';
import PreviewButtons from '@/components/PreviewButtons';
import { ChevronDown } from 'lucide-react';
import React from 'react';

function useAiCredits() {
  const [credits, setCredits] = React.useState<number | null>(null);

  const fetchBal = React.useCallback(() => {
    fetch("/api/ai/credits/me", { credentials: "include" })
      .then(r => r.json())
      .then(j => setCredits(typeof j.balance === "number" ? j.balance : null))
      .catch(() => setCredits(null));
  }, []);

  React.useEffect(() => {
    fetchBal();
    const onUpdated = () => fetchBal();
    window.addEventListener("ai-credits:updated", onUpdated as EventListener);
    return () => window.removeEventListener("ai-credits:updated", onUpdated as EventListener);
  }, [fetchBal]);

  return credits;
}

const AntiNestStyles = () => (
  <style>{`#marketing-nav{display:none!important;visibility:hidden!important}`}</style>
);

function NavDropdown({ item, location }: { item: NavItem; location: string }) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const children = item.children || [];
  const filteredChildren = children.filter(child => {
    if (child.requiresFlag && import.meta.env[child.requiresFlag] !== 'true') return false;
    return true;
  });
  
  const isActive = filteredChildren.some(child => 
    child.href && (location === child.href || location.startsWith(child.href + '/'))
  );

  // Close dropdown when clicking/touching outside or pressing Escape
  React.useEffect(() => {
    function handleOutsideInteraction(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleOpen = () => setOpen(prev => !prev);

  // Handle focus leaving the dropdown
  const handleBlur = (e: React.FocusEvent) => {
    // Check if focus is moving outside the dropdown
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={handleBlur}
    >
      <button
        onClick={toggleOpen}
        onFocus={() => setOpen(true)}
        className={`px-2 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
          isActive 
            ? 'bg-black dark:bg-white text-white dark:text-black' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && filteredChildren.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded shadow-lg py-1 min-w-[140px] z-50">
          {filteredChildren.map(child => child.href && (
            <Link
              key={child.href}
              href={child.href}
              className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ 
  children, 
  headerActions 
}: { 
  children: React.ReactNode; 
  headerActions?: React.ReactNode;
}) {
  const [location] = useLocation();
  const { me } = useMe();
  const credits = useAiCredits();
  const creditsModal = useCreditsModal();
  const demo = import.meta.env.VITE_DEMO_MODE === 'true';

  const items = NAV_ITEMS.filter(i => {
    if (i.demoOnly && !demo) return false;
    if (i.requiresFlag && import.meta.env[i.requiresFlag] !== 'true') return false;
    return true;
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <AntiNestStyles />
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-gray-900/90 dark:border-gray-800">
        <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-3">
            <Link href="/baker/dashboard" className="font-semibold text-gray-900 dark:text-white">
              BakerIQ
            </Link>
            {items.map(it => {
              if (it.children) {
                return <NavDropdown key={it.label} item={it} location={location} />;
              }
              if (!it.href) return null;
              const active = location === it.href || location.startsWith(it.href + '/');
              return (
                <Link 
                  key={it.href} 
                  href={it.href} 
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    active 
                      ? 'bg-black dark:bg-white text-white dark:text-black' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {headerActions}
            {typeof credits === "number" && (
              <>
                <span className="text-xs px-2 py-1 rounded-full border bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  ✨ {credits} credits
                </span>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                  onClick={() => creditsModal.open({ reason: "Top up credits" })}
                >
                  Top-Up
                </button>
              </>
            )}
            <PreviewButtons size="sm" className="hidden md:flex" />
            {me && (
              <button 
                onClick={handleLogout}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content padded under header and above SaveBar */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>
    </div>
  );
}
