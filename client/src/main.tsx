import { createRoot } from "react-dom/client";
import "./index.css";

// Complete Bakewise homepage with all sections
function BakewiseApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-serif font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Bakewise
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-pink-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-pink-600 transition-colors">Pricing</a>
            <a href="#about" className="text-gray-700 hover:text-pink-600 transition-colors">About</a>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300">
            Sign Up
          </button>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-pink-200/50 rounded-full shadow-lg">
            <span className="text-sm font-medium text-gray-700">⭐ The #1 Platform for Cake Professionals ✨</span>
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
        
        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From quote generation to payment processing, we've got all your business needs covered
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Quote Builder</h3>
              <p className="text-gray-600">Create professional quotes with our AI-powered calculator. Get accurate pricing every time.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer CRM</h3>
              <p className="text-gray-600">Manage all your customers, orders, and communications in one beautiful dashboard.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Processing</h3>
              <p className="text-gray-600">Accept payments seamlessly with built-in Stripe integration and automated invoicing.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Embeddable Widgets</h3>
              <p className="text-gray-600">Add cake calculators to your website with custom branding and styling.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Contracts</h3>
              <p className="text-gray-600">Send and sign contracts digitally with e-signature integration and automated reminders.</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">Get intelligent recommendations for pricing, designs, and business growth opportunities.</p>
            </div>
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
        
        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-serif font-bold mb-4">
              Ready to Transform Your Cake Business?
            </h2>
            <p className="text-xl mb-8 text-pink-100">
              Join thousands of successful bakers who've grown their business with Bakewise
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="w-full sm:w-auto bg-white text-pink-600 hover:text-pink-700 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg">
                Start Your Free Trial
              </button>
              <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-pink-600 font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-lg">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-32 bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-serif font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">
                Bakewise
              </div>
              <p className="text-gray-400 mb-4">
                The complete platform for cake professionals to grow their business and delight customers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">📱</a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">🐦</a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">📘</a>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">📷</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-pink-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-pink-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-pink-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bakewise. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BakewiseApp />);