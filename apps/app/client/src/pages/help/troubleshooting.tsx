import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, RefreshCw, Wifi, ArrowLeft } from "lucide-react";

export default function Troubleshooting() {
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
            <div className="bg-orange-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Common Issues & Solutions</h1>
            <p className="text-lg text-gray-600">Quick fixes for the most common platform issues</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-orange-600" />
                  Common Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Page Won't Load</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Refresh your browser (Ctrl+R or Cmd+R)</li>
                      <li>• Clear your browser cache and cookies</li>
                      <li>• Try opening the page in an incognito/private window</li>
                      <li>• Check your internet connection</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Can't Log In</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Double-check your email and password</li>
                      <li>• Use the "Forgot Password" link to reset</li>
                      <li>• Ensure caps lock is off</li>
                      <li>• Try a different browser or device</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Images Not Uploading</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check file size (max 10MB per image)</li>
                      <li>• Use supported formats: JPG, PNG, WebP</li>
                      <li>• Ensure stable internet connection</li>
                      <li>• Try uploading fewer images at once</li>
                    </ul>
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