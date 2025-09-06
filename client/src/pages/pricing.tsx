import { NavigationHeader } from "@/components/NavigationHeader";
import { Plans } from "@/monetization/Plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Star, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Zap,
  Crown
} from "lucide-react";

export default function Pricing() {
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
            <DollarSign className="h-4 w-4 text-pink-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Simple, Transparent Pricing</span>
            <Sparkles className="h-4 w-4 text-pink-500 ml-2" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              Sweet Success Plan
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            From solo bakers to large bakeries, we have the perfect plan to help you 
            <span className="text-pink-600 font-medium"> grow your business and delight customers</span>.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="relative">
        <div className="container mx-auto px-4">
          <Plans />
        </div>
      </div>

      {/* ROI Section */}
      <div className="relative py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              See Your Return on Investment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our customers typically see these results within their first 3 months
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg text-center" data-testid="roi-time-savings">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">15 hours</div>
                <div className="text-gray-600 font-medium mb-2">saved per week</div>
                <p className="text-sm text-gray-500">Less time on admin, more time baking</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg text-center" data-testid="roi-revenue-increase">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-pink-600 mb-2">300%</div>
                <div className="text-gray-600 font-medium mb-2">average revenue increase</div>
                <p className="text-sm text-gray-500">More efficient quotes = more sales</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg text-center" data-testid="roi-customer-satisfaction">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600 font-medium mb-2">customer satisfaction</div>
                <p className="text-sm text-gray-500">Professional presentation wins hearts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg" data-testid="faq-trial">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Is there really a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes! You get 14 days to try all features completely free. No credit card required to start.</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg" data-testid="faq-cancel">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Absolutely. You can cancel your subscription at any time with no cancellation fees or penalties.</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg" data-testid="faq-upgrade">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Yes, you can change your plan at any time. Changes take effect immediately and billing is prorated.</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-md shadow-lg" data-testid="faq-support">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">What kind of support do you offer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All plans include email support. Pro and Plus plans get priority support and phone assistance.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md shadow-2xl overflow-hidden max-w-4xl mx-auto" data-testid="cta-get-started">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5"></div>
            <CardContent className="text-center py-16 relative">
              <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ready to Grow Your Sweet Business?
              </h2>
              
              <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
                Join hundreds of successful bakers who've transformed their businesses with Bakewise. 
                Start your free trial today and see the difference professional tools can make.
              </p>
              
              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold" data-testid="button-start-free-trial">
                <Link href="/signup" className="flex items-center">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}