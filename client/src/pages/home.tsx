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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      <SEOHead />
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-20">
            {/* Modern Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-pink-200/50 rounded-full shadow-lg">
              <Star className="h-4 w-4 text-pink-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">The #1 Platform for Cake Professionals</span>
              <Sparkles className="h-4 w-4 text-pink-500 ml-2" />
            </div>
            
            {/* Modern Title */}
            <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                From Custom Cakes
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                to Sweet Success
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              The complete marketplace and business platform for cake decorators and bakeries. 
              <span className="text-pink-600 font-medium">Connect with customers through our public marketplace, manage bookings with advanced scheduling, create quotes, and handle contracts</span>
              —all in one deliciously simple platform.
            </p>
            
            {/* Modern CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg font-semibold" data-testid="button-start-journey">
                <Link href="/signup" className="flex items-center">
                  Start Your Sweet Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg font-semibold" data-testid="button-explore-marketplace">
                <Link href="/marketplace">
                  Explore Marketplace
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>500+ Happy Bakers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>$2M+ Revenue Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>10,000+ Quotes Created</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From customer management to AI-powered cake visualization, we've got every aspect of your cake business covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Marketplace Discovery Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-marketplace">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Public Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Get discovered by customers through our public marketplace with portfolio showcases and booking integration</CardDescription>
              </CardContent>
            </Card>
            
            {/* Advanced Booking Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-booking-system">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Let customers book consultations directly with intelligent scheduling, availability management, and automated reminders</CardDescription>
              </CardContent>
            </Card>
            
            {/* Smart CRM Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-smart-crm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Keep track of all your sweet customers, wedding dates, preferences, and order history in one place</CardDescription>
              </CardContent>
            </Card>
            
            {/* Easy Payments Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-easy-payments">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Easy Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Collect deposits, send invoices, and get paid faster with integrated payment processing</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* White-label Section */}
      <div className="relative py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="card-white-label">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
            <CardHeader className="text-center pb-6 relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Your Professional Website
              </CardTitle>
              <CardDescription className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get a beautiful, branded website that generates leads for your cake business - no existing website required
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Professional website instantly</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Generate leads 24/7</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Your brand, your domain</span>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Perfect for home and cottage bakers who need a professional online presence. 
                Get a complete website with quote builder, booking system, and payment processing - all with your own branding and custom domain.
              </p>
              <Button variant="outline" asChild size="lg" className="border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-3" data-testid="button-see-demo">
                <a href="/calculator" target="_blank" rel="noopener noreferrer">
                  See Live Demo
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
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Trusted by Growing Bakeries
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Bakewise helps cake professionals streamline their business and increase revenue
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