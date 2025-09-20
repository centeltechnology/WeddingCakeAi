import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Calculator,
  Clock,
  TrendingUp,
  Smartphone,
  Users,
  FileText,
  CreditCard,
  Globe,
  Calendar,
  Shield,
  Check,
  Star,
  ArrowRight
} from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Features - Bakewise SaaS Platform for Bakeries"
        description="Powerful SaaS tools for bakery businesses. Manage customers, create quotes, process payments, and grow your bakery business efficiently."
      />
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Everything You Need to<br />
            <span className="text-orange-500">Run Your Bakery Business</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Our comprehensive SaaS platform provides all the tools professional bakeries need 
            to manage customers, create quotes, and grow their business efficiently.
          </p>

          <Button 
            asChild 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-lg"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>

      {/* Core SaaS Features */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core SaaS Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cloud-based tools designed specifically for bakery business management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Customer Management */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Complete CRM system to track all your customers, their preferences, and order history
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited customer profiles
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Order history tracking
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Automated follow-ups
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Builder */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-teal-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Professional Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Generate beautiful, professional quotes with templates and automated pricing
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Professional templates
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Real-time pricing
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    PDF generation
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Processing */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Payment Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Flexible payment options with easy setup and tracking
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Multiple payment methods
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Payment tracking
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Automated reminders
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking System */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Online Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Let customers book consultations directly through your professional website
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Real-time availability
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Automated confirmations
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Calendar integration
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Listing */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Marketplace Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Get discovered by customers through our public marketplace directory
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Portfolio showcase
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Customer reviews
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Location-based search
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-2 border-gray-200 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-indigo-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-400 dark:text-gray-300">Business Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white dark:text-white mb-4">
                  Track your business performance with detailed analytics and reporting
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Revenue tracking
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Customer insights
                  </div>
                  <div className="flex items-center text-sm text-white dark:text-white">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Performance metrics
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SaaS Benefits */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our SaaS Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cloud-based software that grows with your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Always Updated</h3>
              <p className="text-gray-600">Automatic updates with new features and security patches</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-gray-600">Access your business from anywhere on any device</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scalable</h3>
              <p className="text-gray-600">Grows with your business from startup to enterprise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Website Feature */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Get Your Professional Website Instantly
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Every Bakewise account includes a beautiful, professional website that generates 
                leads for your bakery business 24/7.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-lg text-gray-700">Professional design templates</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-lg text-gray-700">Online booking integration</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-lg text-gray-700">Portfolio showcase</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-lg text-gray-700">SEO optimized</span>
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
              >
                <Link href="/marketplace">View Example Sites</Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Sweet Dreams Bakery</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 bg-orange-100 rounded"></div>
                      <div className="h-20 bg-orange-100 rounded"></div>
                    </div>
                    <Button className="w-full bg-orange-500 text-white">
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Bakery Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful bakers using our SaaS platform to grow their business.
          </p>
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <Button 
            asChild 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-xl font-semibold rounded-lg"
          >
            <Link href="/signup" className="flex items-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">Free forever plan available • No credit card required</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}