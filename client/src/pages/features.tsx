import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Users, 
  FileText, 
  CreditCard, 
  Globe, 
  Sparkles, 
  Heart, 
  Zap, 
  Star,
  ArrowRight,
  CheckCircle,
  Palette,
  Calculator,
  MessageSquare,
  Calendar,
  Shield,
  Smartphone
} from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
      </div>
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-pink-200/50 rounded-full shadow-lg">
            <Star className="h-4 w-4 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Powerful Features for Every Baker</span>
            <Sparkles className="h-4 w-4 text-pink-500 ml-2" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              in One Sweet Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            From public marketplace discovery to advanced booking management, 
            <span className="text-pink-600 font-medium"> discover the complete toolkit</span> that helps bakers grow their business and get found by customers.
          </p>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Core Business Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, quote, and grow your cake business professionally.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Public Marketplace Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-marketplace-discovery">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Marketplace Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">Get found by customers through our public marketplace with portfolio showcases, reviews, and direct booking</CardDescription>
              </CardContent>
            </Card>
            
            {/* Advanced Booking Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="card-advanced-booking">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Advanced Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">3-step booking process with availability management, customer info collection, and automated confirmations</CardDescription>
              </CardContent>
            </Card>
            
            {/* Smart CRM Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="feature-smart-crm">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed mb-4">Keep track of all your sweet customers, wedding dates, preferences, and order history in one place</CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Unlimited customer profiles</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Order history tracking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Automated follow-ups</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quote Builder Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="feature-quote-builder">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Quote Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed mb-4">Create beautiful, professional quotes with templates, pricing tiers, and stunning visuals that wow your clients</CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Professional templates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Real-time pricing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>PDF generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Digital Contracts Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="feature-digital-contracts">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Digital Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed mb-4">Generate contracts, collect e-signatures, and manage terms—all automated so you can focus on baking</CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>E-signature collection</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Legal template library</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Contract status tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Easy Payments Card */}
            <Card className="group text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-md hover:bg-white/90 transform hover:-translate-y-2" data-testid="feature-easy-payments">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Easy Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed mb-4">Set up your preferred payment methods and get paid your way—no complex setup required</CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Zelle, PayPal, CashApp & more</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Custom payment links</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Simple manual tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Marketplace & Booking Features */}
      <div className="relative py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Get Found & Get Booked
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with customers through our marketplace and streamline your booking process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="feature-marketplace-discovery">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
              <CardHeader className="pb-6 relative">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900 mb-2">Public Marketplace</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Get discovered by customers actively searching for cake artists
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Your business gets featured in our public marketplace where customers can browse portfolios, 
                  read reviews, filter by specialty and location, and book consultations directly.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Searchable portfolio showcase</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Location-based discovery</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Integrated booking system</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Customer reviews & ratings</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="feature-advanced-booking">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="pb-6 relative">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900 mb-2">Advanced Booking System</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  3-step consultation booking with intelligent scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Customers can book consultations through a seamless 3-step process: select date/time, 
                  provide details, and confirm. You manage availability and get all the information you need.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Real-time availability calendar</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Customer info collection</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Event details & requirements</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Automated confirmations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI & Advanced Features */}
      <div className="relative py-16 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              AI-Powered Innovation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Next-generation features that set you apart from the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="feature-ai-visualization">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
              <CardHeader className="pb-6 relative">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900 mb-2">AI Cake Visualization</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Let customers see their dream cake before you bake it
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our AI generates stunning, photorealistic images of custom cakes based on customer preferences. 
                  Increase quote acceptance rates by showing exactly what they'll get.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Photorealistic cake images</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Multiple design variations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Instant generation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="feature-smart-calculator">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="pb-6 relative">
                <div className="w-16 h-16 mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900 mb-2">Smart Pricing Calculator</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Dynamic pricing that adapts to complexity and market demand
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Intelligent pricing algorithms consider ingredients, labor time, complexity, and local market rates 
                  to ensure you're always profitable while staying competitive.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Cost analysis & profit margins</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Market-aware pricing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Seasonal adjustments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* White-label Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md shadow-2xl overflow-hidden" data-testid="feature-white-label">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
            <CardHeader className="text-center pb-6 relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Your Own Professional Landing Page
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
              
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3" data-testid="button-try-features">
                <Link href="/demo-tenant" className="flex items-center">
                  Try All Features Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}