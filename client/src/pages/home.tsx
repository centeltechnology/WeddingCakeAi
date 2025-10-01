import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useTenant } from "@/components/TenantBrandProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calculator, Clock, TrendingUp, Smartphone, Check, Star } from "lucide-react";

export default function Home() {
  const { tenant, branding } = useTenant();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="BakerIQ - Smart Cake Pricing & Planning Made Simple"
        description="BakerIQ helps cake designers and bakeries price, plan, and scale their business with ease. Automate planning and client quotes."
      />
      
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Smart Cake<br />
              Pricing & Planning<br />
              Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              BakerIQ helps cake designers and bakeries price, plan, and scale 
              their business with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-lg"
                data-testid="button-get-started"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 text-lg font-semibold rounded-lg hover:bg-gray-50"
                data-testid="button-see-pricing"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
          
          {/* Product Mockup */}
          <div className="relative">
            <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Cake Calculator</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cake Size</span>
                      <span className="font-medium">8-inch</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Servings</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Flavor</span>
                      <span className="font-medium">Vanilla</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold text-orange-500">$125</span>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile mockup */}
            <div className="absolute -bottom-8 -right-8 bg-gray-900 rounded-2xl p-4 shadow-xl w-48">
              <div className="bg-white rounded-lg p-3">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">Order #1234</div>
                  <div className="text-xs text-gray-600">Wedding Cake - 3 Tier</div>
                  <div className="text-sm font-bold text-orange-500">$350</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <Calculator className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Accurate Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">AI powered calculations for every order</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Save Time</h3>
              <p className="text-gray-600 dark:text-gray-300">Automate planning and client quotes</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grow Profit</h3>
              <p className="text-gray-600 dark:text-gray-300">Understand margins and boost sales</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Always Accessible</h3>
              <p className="text-gray-600 dark:text-gray-300">Cloud-based and mobile friendly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Platform Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">
                All you baking tools in<br />
                one smart platform.
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Cake Calculator</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Wedding Planner</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Order Tracker</span>
                </div>
              </div>
            </div>
            
            {/* Large Product Mockup */}
            <div className="relative">
              <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">Order Dashboard</h3>
                      <div className="text-sm text-gray-500">Today</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                          <span className="font-medium">Wedding Cake - Smith</span>
                        </div>
                        <span className="text-green-600 font-semibold">$450</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="font-medium">Birthday Cake - Johnson</span>
                        </div>
                        <span className="text-green-600 font-semibold">$125</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <span className="font-medium">Anniversary Cake - Davis</span>
                        </div>
                        <span className="text-green-600 font-semibold">$200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Bakers Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Join hundreds of successful bakers growing their business with BakerIQ</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white mb-4 italic">
                  "BakerIQ has completely transformed how we run our cake business. I'm booking 3x more orders and spending half the time on admin work!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-500">SH</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300">Sarah Henderson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Sweet Dreams Bakery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white mb-4 italic">
                  "The professional quotes and automated booking system helped me scale from a home kitchen to a full bakery. My customers love the seamless experience!"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-500">MR</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300">Maria Rodriguez</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Delicate Delights</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white mb-4 italic">
                  "Being featured in the marketplace brought me so many new customers. The payment tracking and contract management saves me hours every week."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-500">JC</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300">James Chen</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Artisan Cake Co.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
            <p className="text-xl text-gray-600">Start pricing smarter today.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 rounded-2xl p-8">
              <CardHeader className="text-center space-y-4 pb-8">
                <CardTitle className="text-2xl font-bold">Free</CardTitle>
                <div>
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600">/forever</span>
                </div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-orange-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center space-y-4 pb-8">
                <CardTitle className="text-2xl font-bold">Professional</CardTitle>
                <div>
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-gray-600">/mo</span>
                </div>
                <CardDescription>Perfect for growing cottage bakers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plus Plan */}
            <Card className="border-2 border-gray-200 rounded-2xl p-8">
              <CardHeader className="text-center space-y-4 pb-8">
                <CardTitle className="text-2xl font-bold">Plus</CardTitle>
                <div>
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-gray-600">/mo</span>
                </div>
                <CardDescription>For established bakeries scaling up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button variant="outline" className="w-full border-2 border-gray-300 rounded-lg">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-50 px-12 py-4 text-xl font-bold rounded-2xl shadow-lg"
            data-testid="button-final-cta"
          >
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}