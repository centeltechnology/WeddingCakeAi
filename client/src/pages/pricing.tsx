import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Plans from "@/monetization/Plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Star, 
  CheckCircle,
  ArrowRight,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Pricing - Bakewise SaaS Platform for Bakeries"
        description="Simple, transparent pricing for bakery businesses. Free plan available. Professional at $19/mo and Plus at $39/mo with advanced features."
      />
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Simple, Transparent<br />
            <span className="text-orange-500">SaaS Pricing</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Choose the perfect plan for your bakery business. Start free and upgrade 
            as you grow - no hidden fees, no long-term contracts.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Free plan forever</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <Plans />
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Bakeries Choose Our SaaS Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the results our customers typically achieve within their first 3 months
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-gray-200 text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">15+ hours</div>
                <div className="text-gray-600 font-medium mb-2">saved per week</div>
                <p className="text-sm text-gray-500">Less time on admin, more time baking</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">300%</div>
                <div className="text-gray-600 font-medium mb-2">average revenue increase</div>
                <p className="text-sm text-gray-500">More efficient quotes = more sales</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600 font-medium mb-2">customer satisfaction</div>
                <p className="text-sm text-gray-500">Professional presentation wins hearts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SaaS Benefits */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You Get with Our SaaS Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cloud-based software that grows with your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Always Updated</h3>
              <p className="text-gray-600">Automatic updates with new features and security patches</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Access</h3>
              <p className="text-gray-600">Manage your business from anywhere, anytime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scalable</h3>
              <p className="text-gray-600">Grows from startup to enterprise level</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Is the free plan really free forever?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes! Our free plan includes essential features forever with no time limit. Upgrade to Professional or Plus anytime for advanced features.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Can I cancel my subscription anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Absolutely. You can cancel your subscription at any time with no cancellation fees or penalties. Your data remains accessible.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, you can change your plan at any time. Upgrades take effect immediately, and billing is prorated for fairness.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">What kind of support do you offer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All plans include email support. Professional and Plus plans get priority support with faster response times.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Bakery Business?
            </h2>
            
            <p className="text-xl text-orange-100 leading-relaxed mb-8">
              Join hundreds of successful bakers who've transformed their businesses with our SaaS platform. 
              Start free and upgrade when you're ready.
            </p>
            
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-300 fill-current" />
              ))}
            </div>
            
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-3 text-xl font-semibold rounded-lg shadow-lg"
            >
              <Link href="/signup" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <p className="text-sm text-orange-200 mt-4">Free forever plan • No credit card required</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}