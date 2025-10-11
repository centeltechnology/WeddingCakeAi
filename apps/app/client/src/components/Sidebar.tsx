import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NAV, featureOn, type NavNode } from '@/config/nav';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Customers: true,
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location === href || location.startsWith(href + '/');
  };

  const renderNavNode = (node: NavNode, depth = 0) => {
    if (!featureOn(node.feature)) return null;

    if (node.children) {
      const isExpanded = expandedGroups[node.label] ?? false;
      return (
        <div key={node.label} className="mb-1">
          <button
            onClick={() => toggleGroup(node.label)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg',
              'text-slate-700 dark:text-slate-300',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'transition-colors'
            )}
          >
            <span>{node.label}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-2 mt-1 space-y-1">
              {node.children.map((child) => renderNavNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!node.href) return null;

    const active = isActive(node.href);

    return (
      <a
        key={node.href}
        href={node.href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
          depth > 0 && 'ml-3',
          active
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
      >
        {node.icon}
        <span>{node.label}</span>
      </a>
    );
  };

  return (
    <nav className="space-y-1">
      {NAV.map((node) => renderNavNode(node))}
    </nav>
  );
}
