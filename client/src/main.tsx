import { createRoot } from "react-dom/client";
import "./index.css";

// Minimal working app
function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-pink-200/50 rounded-full shadow-lg">
            <span className="text-sm font-medium text-gray-700">The #1 Platform for Cake Professionals</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              From Custom Cakes
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              to Sweet Success
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The all-in-one platform that helps cake decorators and bakeries grow their business 
            with professional tools, automated workflows, and beautiful customer experiences.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-900 font-semibold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg">
              Watch Demo
            </button>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Trusted by Thousands of Couples
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join the couples who found their perfect wedding cake through Bakewise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-sm border border-pink-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "Bakewise transformed my cake business! I went from spending hours on quotes to closing deals in minutes. My customers love how professional everything looks."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">Sarah Martinez</div>
                <div className="text-sm text-gray-600">Sweet Dreams Cakery</div>
                <div className="text-xs text-pink-600 mt-1">🏆 400% revenue increase</div>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm border border-pink-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "The calculator was incredibly accurate and we found a local baker who created exactly what we envisioned. The whole process was seamless."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                <div className="text-sm text-gray-600">Miami, FL • November 2024</div>
                <div className="text-xs text-pink-600 mt-1">5-tier tropical with orchids</div>
              </div>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm border border-pink-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "Love how detailed the estimates are! We used the platform to compare different designs and found the perfect balance of beauty and budget."
              </p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-semibold text-gray-900">Jessica Kim</div>
                <div className="text-sm text-gray-600">Seattle, WA • October 2024</div>
                <div className="text-xs text-pink-600 mt-1">4-tier red velvet with peonies</div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Ready to plan your dream wedding cake?
            </p>
            <div className="inline-flex items-center space-x-2 bg-pink-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium text-pink-600">
                Free to use • No signup required • Instant estimates
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);