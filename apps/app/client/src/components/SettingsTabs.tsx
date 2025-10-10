import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Building2, Palette, Share2, Wallet, Image, FileText } from 'lucide-react';

const tabs = [
  {
    name: 'Calculator',
    href: '/settings',
    icon: Palette,
  },
  {
    name: 'Business Profile',
    href: '/settings/profile',
    icon: Building2,
  },
  {
    name: 'Social Links',
    href: '/settings/social',
    icon: Share2,
  },
  {
    name: 'Payment Options',
    href: '/settings/payments',
    icon: Wallet,
  },
  {
    name: 'Media Library',
    href: '/settings/media',
    icon: Image,
  },
  {
    name: 'Templates',
    href: '/settings/templates',
    icon: FileText,
  },
];

export function SettingsTabs() {
  const [location, navigate] = useLocation();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Settings">
        {tabs.map((tab) => {
          const isActive = location === tab.href;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.href)}
              className={cn(
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300',
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors'
              )}
            >
              <Icon
                className={cn(
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  'mr-2 h-5 w-5'
                )}
              />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
