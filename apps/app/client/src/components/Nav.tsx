import { Link } from "wouter";
import { useMe } from "@/lib/useMe";
import LogoutButton from "./LogoutButton";
import React from "react";
import { useCreditsModal } from "@/components/ai/CreditsModalContext";

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

export function Nav() {
  const { loading, error, me } = useMe();
  const credits = useAiCredits();
  const creditsModal = useCreditsModal();

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <nav className="border-b bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-red-600 dark:text-red-400 text-sm">
              Failed to load user data. Please refresh the page.
            </span>
          </div>
        </div>
      </nav>
    );
  }

  if (!me) {
    return null;
  }

  const { role } = me;
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/baker/dashboard" className="text-gray-900 dark:text-white font-semibold">
              BakerIQ
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {/* Common Links */}
              <Link href="/baker/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                Dashboard
              </Link>
              <Link href="/quotes" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                Quotes
              </Link>
              
              {/* Demo Mode or Baker: Show Contracts, Invoices, AI Lab */}
              {(isDemo || role === "baker") && (
                <>
                  <Link href="/contracts" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Contracts
                  </Link>
                  <Link href="/invoices" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Invoices
                  </Link>
                  <Link href="/ai-lab" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    AI Lab
                  </Link>
                </>
              )}
              
              {/* Admin Links */}
              {role === "admin" && (
                <>
                  <Link href="/admin/tenants" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Tenants
                  </Link>
                  <Link href="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Users
                  </Link>
                </>
              )}
              
              {/* Baker-only Links (not shown in demo for non-bakers) */}
              {role === "baker" && (
                <>
                  <Link href="/customers" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Customers
                  </Link>
                  <Link href="/settings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Settings
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {typeof credits === "number" && (
              <div className="ml-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full border bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">✨ {credits} credits</span>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                  onClick={() => creditsModal.open({ reason: "Top up credits" })}
                >
                  Top-Up
                </button>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
