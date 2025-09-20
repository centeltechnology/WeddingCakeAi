import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useTenant } from "@/components/TenantBrandProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, Users, FileText, CreditCard, Globe, Sparkles, Heart, Zap, ArrowRight, Star, Calendar } from "lucide-react";

export default function Home() {
  const { tenant, branding } = useTenant();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <SEOHead />
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-20">
            {/* Modern Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-gray-50 border border-gray-200 rounded-full shadow-sm">
              <ChefHat className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700">The Business Platform for Professional Bakeries</span>
            </div>
            
            {/* Modern Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Smart Cake Pricing &
              <br />
              <span className="text-primary">
                Planning Made Simple
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Bakewise helps cake designers and bakeries price, plan, and scale their business with ease. 
              <span className="text-gray-800 font-medium">Automate planning and client quotes. Understand margins and boost sales.</span>
            </p>
            
            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-base font-semibold" data-testid="button-start-trial">
                <Link href="/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 px-8 py-3 text-base font-semibold" data-testid="button-see-pricing">
                <Link href="#pricing">
                  See Pricing
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>500+ Professional Bakeries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>$2M+ Revenue Tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>40% Average Profit Increase</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              All your baking tools in one smart platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Manage quotes, track orders, and grow your bakery business with powerful automation and insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Accurate Pricing Card */}
            <Card className="group text-center p-6 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300" data-testid="card-accurate-pricing">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">Accurate Pricing</CardTitle>
              <CardDescription className="text-gray-600 text-sm leading-relaxed">AI-powered calculations for every order</CardDescription>
            </Card>
            
            {/* Save Time Card */}
            <Card className="group text-center p-6 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300" data-testid="card-save-time">
              <div className="w-12 h-12 mx-auto mb-4 bg-teal-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">Save Time</CardTitle>
              <CardDescription className="text-gray-600 text-sm leading-relaxed">Automate planning and client quotes</CardDescription>
            </Card>
            
            {/* Grow Profit Card */}
            <Card className="group text-center p-6 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300" data-testid="card-grow-profit">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">Grow Profit</CardTitle>
              <CardDescription className="text-gray-600 text-sm leading-relaxed">Understand margins and boost sales</CardDescription>
            </Card>
            
            {/* Always Accessible Card */}
            <Card className="group text-center p-6 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300" data-testid="card-always-accessible">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">Always Accessible</CardTitle>
              <CardDescription className="text-gray-600 text-sm leading-relaxed">Cloud-based and mobile friendly</CardDescription>
            </Card>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="border border-gray-200 bg-white shadow-lg" data-testid="card-tools">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Professional Bakery Tools
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to run and grow your bakery business efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-gray-800 font-medium">Cake Calculator</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-gray-800 font-medium">Wedding Planner</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-gray-800 font-medium">Order Tracker</span>
                </div>
              </div>
              <p className="text-base text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Professional tools designed specifically for bakery operations. Track orders, calculate accurate pricing, and manage your wedding projects efficiently.
              </p>
              <Button variant="outline" asChild size="lg" className="border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-8 py-3" data-testid="button-see-demo">
                <a href="/calculator" target="_blank" rel="noopener noreferrer">
                  Try Calculator
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Testimonials */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Professional Bakeries
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              See how Bakewise helps bakery owners streamline operations and increase profitability
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border-0 bg-gradient-to-br from-pink-50/80 to-rose-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" data-testid="card-testimonial-1">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "Bakewise transformed my cake business! I went from spending hours on quotes 
                  to closing deals in minutes. My revenue increased 400% in 6 months."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Martinez</p>
                    <p className="text-sm text-gray-600">Sweet Dreams Cakery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" data-testid="card-testimonial-2">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "The quote builder saves me 10 hours per week. My customers love the professional 
                  PDFs and the payment integration makes closing sales so much easier."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Maria Rodriguez</p>
                    <p className="text-sm text-gray-600">Elegant Occasions Cakes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-0 bg-gradient-to-br from-orange-50/80 to-pink-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" data-testid="card-testimonial-3">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "Managing customer relationships was chaos before Bakewise. Now I track every lead, 
                  follow up automatically, and my conversion rate doubled!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    J
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jessica Thompson</p>
                    <p className="text-sm text-gray-600">Artisan Cake Studio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}