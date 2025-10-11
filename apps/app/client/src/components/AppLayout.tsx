import React from 'react';
import AppHeader from '@/components/AppHeader';
import { Sidebar } from '@/components/Sidebar';

const AntiNestStyles = () => (
  <style>{`#marketing-nav{display:none!important;visibility:hidden!important}`}</style>
);

export default function AppLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <AntiNestStyles />
      <AppHeader />
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block sticky top-0 h-screen p-4 border-r border-slate-200 dark:border-slate-800">
          <Sidebar />
        </aside>
        <main className="px-4 pt-6 pb-28">
          {children}
        </main>
      </div>
    </div>
  );
}
