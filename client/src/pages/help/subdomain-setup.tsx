import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Globe, Settings } from "lucide-react";

export default function SubdomainSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/help">
            <Button variant="ghost" className="mb-6" data-testid="button-back-to-help">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Setting Up Your Professional Subdomain</h1>
            <p className="text-xl text-gray-600">
              Create your branded bakewiseapp.com subdomain to establish your professional online presence
            </p>
          </div>

          {/* Overview Card */}
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Globe className="h-6 w-6 mr-2" />
                What You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Professional URL: yourbakery.bakewiseapp.com
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Custom branding and colors
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Enhanced customer trust and credibility
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  SEO benefits for your business
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Step-by-Step Guide */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Step-by-Step Setup</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Access Your Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Log into your Bakewise account and navigate to your baker dashboard.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click on your profile icon in the top right</li>
                  <li>Select "Dashboard" from the dropdown menu</li>
                  <li>Look for the "Subdomain Settings" section</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Choose Your Subdomain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Select a subdomain that represents your bakery brand.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2"><strong>Tips for choosing a good subdomain:</strong></p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Keep it short and memorable</li>
                    <li>Use your business name if available</li>
                    <li>Avoid special characters or numbers</li>
                    <li>Consider SEO keywords related to your specialty</li>
                  </ul>
                </div>
                <p className="text-gray-600">
                  <strong>Examples:</strong> sweetcakes.bakewiseapp.com, rosebakery.bakewiseapp.com, artisancakes.bakewiseapp.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Customize Your Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Personalize your subdomain with your brand colors and styling.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Upload your logo (recommended size: 200x80px)</li>
                  <li>Choose your primary brand color</li>
                  <li>Set your accent color for buttons and highlights</li>
                  <li>Add your business tagline or description</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Configure Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Set up your subdomain preferences and features.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Enable/disable customer testimonials</li>
                  <li>Set up your contact information display</li>
                  <li>Configure your business hours</li>
                  <li>Choose which portfolio images to showcase</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-pink-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                  Launch & Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Activate your subdomain and start sharing it with customers.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Click "Activate Subdomain" to go live</li>
                  <li>Test your subdomain to ensure everything works</li>
                  <li>Add the URL to your business cards and social media</li>
                  <li>Update your website and marketing materials</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Troubleshooting */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900">Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-900">Subdomain already taken</h4>
                  <p className="text-yellow-800 text-sm">Try variations with your location, specialty, or add descriptive words like "custom", "artisan", or "specialty".</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900">Changes not appearing</h4>
                  <p className="text-yellow-800 text-sm">Allow up to 24 hours for DNS propagation. Clear your browser cache and try again.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900">Need to change subdomain</h4>
                  <p className="text-yellow-800 text-sm">Contact support for subdomain changes. Note that changing may affect SEO and existing customer bookmarks.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need additional help with your subdomain setup?</p>
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => window.location.href = 'mailto:support@bakewiseapp.com?subject=Subdomain Setup Help'}
              data-testid="button-contact-subdomain-support"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}