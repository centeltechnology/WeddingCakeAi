import { useState } from "react";
import { Cake, Share, Store, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme-toggle";
import Calculator from "@/components/Calculator";
import BakerDirectory from "@/components/BakerDirectory";
import Profile from "@/components/Profile";
import Plans from "@/monetization/Plans";
import Testimonials from "@/components/Testimonials";
import Blog from "@/components/Blog";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import logoImage from "@assets/Minimalist Golden-Brown Wedding Cake Design_1757101253561.png";

const tabs = [
  { id: 'calculator', label: 'Calculator', icon: Cake },
  { id: 'bakers', label: 'Find Bakers', icon: 'fas fa-map-marker-alt' },
  { id: 'bakersPortal', label: 'For Bakers', icon: Store },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: 'fas fa-user' }
];

export default function WeddingCakeCalculator() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen">
      <SEOHead />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="Wedding CakeAI Logo" 
                  className="w-12 h-12 object-contain" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Wedding CakeAI
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
              <ThemeToggle />
              <SocialShare />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-12">
          <div className="flex space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-2 rounded-2xl w-fit shadow-lg border border-white/20 dark:border-gray-700/20">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'calculator' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
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
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
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
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              data-testid="tab-bakers-portal"
            >
              <Store className="w-5 h-5" />
              <span>For Bakers</span>
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'blog' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              data-testid="tab-blog"
            >
              <BookOpen className="w-5 h-5" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === 'profile' 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
              data-testid="tab-profile"
            >
              <i className="fas fa-user w-5 h-5 flex items-center justify-center"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && (
          <>
            <Calculator />
            <Testimonials />
          </>
        )}
        {activeTab === 'bakers' && <BakerDirectory onSwitchToBakersPortal={() => setActiveTab('bakersPortal')} />}
        {activeTab === 'bakersPortal' && (
          <div className="flex justify-center">
            <div className="w-full">
              <Plans />
            </div>
          </div>
        )}
        {activeTab === 'blog' && <Blog />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
}
