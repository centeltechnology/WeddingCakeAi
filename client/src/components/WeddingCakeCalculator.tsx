import { useState } from "react";
import { Cake, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import Calculator from "@/components/Calculator";
import BakerDirectory from "@/components/BakerDirectory";
import Profile from "@/components/Profile";

const tabs = [
  { id: 'calculator', label: 'Calculator', icon: Cake },
  { id: 'bakers', label: 'Find Bakers', icon: 'fas fa-map-marker-alt' },
  { id: 'profile', label: 'Profile', icon: 'fas fa-user' }
];

export default function WeddingCakeCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Cake className="text-primary text-2xl w-8 h-8" />
              <h1 className="text-xl font-serif font-semibold text-foreground">
                Wedding Cake Calculator
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Professional Cake Pricing Tool
              </span>
              <Button variant="default" size="sm" data-testid="button-share-estimate">
                <Share className="w-4 h-4 mr-2" />
                Share Estimate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'calculator' ? 'tab-active' : 'tab-inactive'
              }`}
              data-testid="tab-calculator"
            >
              <Cake className="w-4 h-4" />
              <span>Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('bakers')}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'bakers' ? 'tab-active' : 'tab-inactive'
              }`}
              data-testid="tab-bakers"
            >
              <i className="fas fa-map-marker-alt"></i>
              <span>Find Bakers</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'profile' ? 'tab-active' : 'tab-inactive'
              }`}
              data-testid="tab-profile"
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'bakers' && <BakerDirectory />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}
