import { Link, useLocation } from 'wouter';
import { NAV_ITEMS } from '@/navigation/navConfig';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const demo = import.meta.env.VITE_DEMO_MODE === 'true';

  const items = NAV_ITEMS.filter(i => demo || !i.demoOnly);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <div className="font-semibold text-gray-900 dark:text-white">BakerIQ</div>
          <nav className="flex gap-3">
            {items.map(it => {
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
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
