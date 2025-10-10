import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { Shield, Eye, Lock, ArrowLeft } from "lucide-react";

export default function DataPrivacy() {
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
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Privacy & Data Protection</h1>
            <p className="text-lg text-gray-600">How we protect your personal information and respect your privacy</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-green-600" />
                  Data Collection & Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">What We Collect</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Contact information (name, email, phone)</li>
                      <li>• Order and preference data</li>
                      <li>• Usage analytics (anonymized)</li>
                      <li>• Communication records</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">How We Use Your Data</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Provide and improve our services</li>
                      <li>• Process orders and payments</li>
                      <li>• Send important account notifications</li>
                      <li>• Personalize your experience</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-purple-600" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Data Control</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Access your personal data</li>
                      <li>• Request data corrections</li>
                      <li>• Delete your account</li>
                      <li>• Export your data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Communication Preferences</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Opt out of marketing emails</li>
                      <li>• Control notification settings</li>
                      <li>• Manage cookie preferences</li>
                      <li>• Update privacy settings</li>
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