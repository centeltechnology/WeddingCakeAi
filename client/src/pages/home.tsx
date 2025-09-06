import { NavigationHeader } from "@/components/NavigationHeader";
import { useTenant } from "@/components/TenantBrandProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, Users, FileText, CreditCard, Globe, Sparkles, Heart, Zap } from "lucide-react";

export default function Home() {
  const { tenant, branding } = useTenant();

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-16 w-16 text-primary mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-primary mb-2">Bakewise</h1>
              <p className="text-lg text-muted-foreground">The sweetest way to run your bakery business</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">
            🧁 From Custom Cakes to Sweet Success
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The complete business platform designed for cake decorators, bakeries, and specialty dessert vendors. 
            Manage customers, create stunning quotes, handle contracts, and get paid—all in one deliciously simple platform.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700">
              <Link href="/signup">Start Your Sweet Journey</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/demo-tenant">See It In Action</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow border-pink-100">
            <CardHeader className="pb-3">
              <Users className="h-10 w-10 text-pink-600 mx-auto mb-3" />
              <CardTitle className="text-lg text-pink-900">Smart CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Keep track of all your sweet customers, wedding dates, preferences, and order history in one place</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader className="pb-3">
              <FileText className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <CardTitle className="text-lg text-purple-900">Quote Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create beautiful, professional quotes with templates, pricing tiers, and stunning visuals that wow your clients</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader className="pb-3">
              <FileText className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <CardTitle className="text-lg text-orange-900">Digital Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Generate contracts, collect e-signatures, and manage terms—all automated so you can focus on baking</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow border-green-100">
            <CardHeader className="pb-3">
              <CreditCard className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <CardTitle className="text-lg text-green-900">Easy Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Collect deposits, send invoices, and get paid faster with integrated payment processing</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* White-label Section */}
        <Card className="bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 mb-16">
          <CardHeader className="text-center">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2 text-gray-900">🎨 White-Label Magic</CardTitle>
            <CardDescription className="text-lg text-gray-800">
              Embed your quote builder anywhere with your own branding
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-pink-600" />
                <span className="text-gray-900">Branded widgets for your website</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-purple-600" />
                <span className="text-gray-900">Custom colors and styling</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-orange-600" />
                <span className="text-gray-900">Instant quote generation</span>
              </div>
            </div>
            <p className="text-gray-800 mb-6">
              Let your customers get instant quotes right from your website, 
              all while maintaining your unique brand identity.
            </p>
            <Link href="/demo-tenant">
              <Button variant="outline" size="lg">
                See Widget Demo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="text-center py-12">
            <p className="text-xl italic mb-6 text-orange-900">
              "Bakewise transformed my cake business! I went from spending hours on quotes 
              to closing deals in minutes. My customers love how professional everything looks."
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <p className="font-semibold text-orange-900">Sarah Martinez</p>
                <p className="text-sm text-orange-700">Sweet Dreams Cakery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}