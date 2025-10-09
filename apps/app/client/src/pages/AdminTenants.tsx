import React from "react";
import { Building2 } from "lucide-react";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";

export default function AdminTenantsPage() {
  return (
    <AppLayout><div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-8 w-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Coming Soon</h2>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Tenant management UI is under development. You can access tenant controls from the Super Admin Dashboard.
                </p>
                <Link href="/super-admin">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Go to Super Admin
                  </button>
                </Link>
              </div>
            </div>
          </div></AppLayout>
  );
}
