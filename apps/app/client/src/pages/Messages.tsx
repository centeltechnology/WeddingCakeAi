import React from "react";
import { MessageSquare } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function MessagesPage() {
  return (
    <AppLayout><div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="h-8 w-8 text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">Coming Soon</h2>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Centralized messaging is under development. You can currently manage lead communications through the Dashboard → Leads tab.
                </p>
              </div>
            </div>
          </div></AppLayout>
  );
}
