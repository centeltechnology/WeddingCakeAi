import React from "react";
import { FileText } from "lucide-react";
import { Link } from "wouter";

export default function QuotesPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotes</h1>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Quote Management</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            You can manage all your quotes from the Baker Dashboard.
          </p>
          <Link href="/baker/dashboard">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
