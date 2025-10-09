import React from "react";
import { Sparkles, TrendingUp, FileText, MessageSquare } from "lucide-react";

export default function AiToolsCard() {
  const handleNavToQuotes = () => {
    const tabsElement = document.querySelector('[value="quotes"]') as HTMLElement;
    if (tabsElement) tabsElement.click();
    setTimeout(() => {
      document.getElementById('ai-price')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="p-4 border rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <div className="text-base font-semibold text-gray-900 dark:text-white">AI-Powered Features</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* AI Price Suggestion - Working */}
        <button
          onClick={handleNavToQuotes}
          className="text-left p-3 border border-purple-200 dark:border-purple-700 rounded-xl hover:shadow-md hover:border-purple-400 transition bg-white dark:bg-gray-800"
        >
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div className="font-medium text-gray-900 dark:text-white">Price Suggestion</div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">AI calculates smart price ranges</div>
        </button>

        {/* Lead Scoring - Coming Soon */}
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 opacity-75">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div className="font-medium text-gray-600 dark:text-gray-400">Lead Scoring</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Coming soon</div>
        </div>

        {/* Auto-response - Coming Soon */}
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 opacity-75">
          <div className="flex items-center space-x-2 mb-1">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <div className="font-medium text-gray-600 dark:text-gray-400">Auto-Reply</div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">Coming soon</div>
        </div>
      </div>
    </div>
  );
}
