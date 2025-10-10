import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { Share2, Camera, Users, ArrowLeft } from "lucide-react";

export default function SocialMedia() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <NavigationHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/help">
              <Button variant="ghost" className="mb-4 hover:bg-pink-50" data-testid="button-back-to-help">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="bg-pink-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Share2 className="h-10 w-10 text-pink-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Social Media Integration</h1>
            <p className="text-lg text-gray-600">Connect your social media accounts and share your work</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-pink-600" />
                  Platform Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 p-4 rounded-lg text-center">
                    <div className="bg-pink-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Instagram</h4>
                    <p className="text-sm text-gray-600">Share your cake photos automatically</p>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Facebook</h4>
                    <p className="text-sm text-gray-600">Connect with your business page</p>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg text-center">
                    <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Share2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">More Platforms</h4>
                    <p className="text-sm text-gray-600">Additional integrations coming soon</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Direct social media posting and integration features are in development.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}