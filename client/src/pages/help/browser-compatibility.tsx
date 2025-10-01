import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Monitor, Smartphone, Tablet, ArrowLeft, CheckCircle } from "lucide-react";

export default function BrowserCompatibility() {
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
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Monitor className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Browser & Device Compatibility</h1>
            <p className="text-lg text-gray-600">Supported browsers and devices for the best BakerIQ experience</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                  Supported Browsers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Recommended Browsers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                        <span>Chrome 90+ (Recommended)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                        <span>Firefox 88+</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                        <span>Safari 14+</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                        <span>Edge 90+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Mobile Browsers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Smartphone className="h-4 w-4 text-blue-600 mr-3" />
                        <span>Chrome Mobile</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Smartphone className="h-4 w-4 text-blue-600 mr-3" />
                        <span>Safari Mobile (iOS)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Smartphone className="h-4 w-4 text-blue-600 mr-3" />
                        <span>Samsung Internet</span>
                      </div>
                    </div>
                  </div>
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