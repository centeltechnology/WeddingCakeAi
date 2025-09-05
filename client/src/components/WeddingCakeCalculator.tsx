import { useState } from "react";
import { Cake, Share, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import Calculator from "@/components/Calculator";
import BakerDirectory from "@/components/BakerDirectory";
import Profile from "@/components/Profile";
import Plans from "@/monetization/Plans";

const tabs = [
  { id: 'calculator', label: 'Calculator', icon: Cake },
  { id: 'bakers', label: 'Find Bakers', icon: 'fas fa-map-marker-alt' },
  { id: 'bakersPortal', label: 'For Bakers', icon: Store },
  { id: 'profile', label: 'Profile', icon: 'fas fa-user' }
];

export default function WeddingCakeCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Cake className="text-primary w-10 h-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Wedding Cake Calculator
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Professional Pricing & Planning
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">Free to Use</div>
                <div className="text-xs text-muted-foreground">No signup required</div>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200"
                data-testid="button-share-estimate"
              >
                <Share className="w-4 h-4 mr-2" />
                Share Estimate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-12">
          <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl w-fit shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'calculator' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
              data-testid="tab-calculator"
            >
              <Cake className="w-5 h-5" />
              <span>Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('bakers')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'bakers' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
              data-testid="tab-bakers"
            >
              <i className="fas fa-map-marker-alt w-5 h-5 flex items-center justify-center"></i>
              <span>Find Bakers</span>
            </button>
            <button
              onClick={() => setActiveTab('bakersPortal')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'bakersPortal' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
              data-testid="tab-bakers-portal"
            >
              <Store className="w-5 h-5" />
              <span>For Bakers</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
              data-testid="tab-profile"
            >
              <i className="fas fa-user w-5 h-5 flex items-center justify-center"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'bakers' && <BakerDirectory onSwitchToBakersPortal={() => setActiveTab('bakersPortal')} />}
        {activeTab === 'bakersPortal' && (
          <div className="flex justify-center">
            <div className="w-full">
              <Plans />
            </div>
          </div>
        )}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}
