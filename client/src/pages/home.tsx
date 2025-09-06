import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useTenant } from "@/components/TenantBrandProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, Users, FileText, CreditCard, Globe, Sparkles, Heart, Zap, ArrowRight, Star } from "lucide-react";

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
              The complete business platform designed for cake decorators, bakeries, and specialty dessert vendors. 
              <span className="text-pink-600 font-medium"> Manage customers, create stunning quotes, handle contracts, and get paid</span>
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
              <Button variant="outline" asChild size="lg" className="border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg font-semibold" data-testid="button-see-demo">
                <Link href="/demo-tenant">
                  See It In Action
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
            {/* Smart CRM Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-smart-crm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Keep track of all your sweet customers, wedding dates, preferences, and order history in one place</CardDescription>
              </CardContent>
            </Card>
            
            {/* Quote Builder Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-quote-builder">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Quote Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Create beautiful, professional quotes with templates, pricing tiers, and stunning visuals that wow your clients</CardDescription>
              </CardContent>
            </Card>
            
            {/* Digital Contracts Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-digital-contracts">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Digital Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Generate contracts, collect e-signatures, and manage terms—all automated so you can focus on baking</CardDescription>
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
                White-Label Magic
              </CardTitle>
              <CardDescription className="text-xl text-gray-600 max-w-2xl mx-auto">
                Embed your quote builder anywhere with your own branding and watch your conversions soar
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Branded widgets for your website</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Custom colors and styling</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">Instant quote generation</span>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Let your customers get instant quotes right from your website, 
                all while maintaining your unique brand identity and professional appearance.
              </p>
              <Button variant="outline" asChild size="lg" className="border-2 border-pink-200 hover:border-pink-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-3" data-testid="button-widget-demo">
                <Link href="/demo-tenant">
                  See Widget Demo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-orange-50/80 to-pink-50/80 backdrop-blur-md shadow-2xl overflow-hidden max-w-4xl mx-auto" data-testid="card-testimonial">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5"></div>
            <CardContent className="text-center py-16 relative">
              <div className="mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-3xl font-serif italic mb-8 text-gray-800 leading-relaxed max-w-3xl mx-auto">
                  "Bakewise transformed my cake business! I went from spending hours on quotes 
                  to closing deals in minutes. My customers love how professional everything looks."
                </blockquote>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4">
                  S
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg text-gray-900">Sarah Martinez</p>
                  <p className="text-gray-600">Founder, Sweet Dreams Cakery</p>
                  <p className="text-sm text-gray-500">🏆 400% revenue increase in 6 months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}