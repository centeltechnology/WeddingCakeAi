import React from "react";
import { Users } from "lucide-react";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function CustomersPage() {
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <AppLayout><div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Customer Management</h2>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  You can view and manage customers from the Baker Dashboard under the Leads and Quotes tabs.
                </p>
                <div className="flex gap-3">
                  <Link href="/baker/dashboard">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      Go to Dashboard
                    </button>
                  </Link>
                  {isDemo && (
                    <>
                      <Link href="/quotes">
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                          View Quotes
                        </button>
                      </Link>
                      <Link href="/contracts">
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                          View Contracts
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div></AppLayout>
  );
}
