import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Code, Zap, Link2, ArrowLeft } from "lucide-react";

export default function ApiIntegration() {
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
            <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Code className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">API & Third-party Integrations</h1>
            <p className="text-lg text-gray-600">Connect BakerIQ with your existing tools and workflows</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-600" />
                  Available Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">API Documentation Coming Soon</h4>
                    <p className="text-blue-800 mb-4">
                      We're working on comprehensive API documentation and third-party integrations.
                    </p>
                    <div className="text-sm text-blue-700">
                      <p>Planned integrations include:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Accounting software (QuickBooks, Xero)</li>
                        <li>• Calendar systems (Google Calendar, Outlook)</li>
                        <li>• Email marketing (Mailchimp, Constant Contact)</li>
                        <li>• Social media platforms</li>
                      </ul>
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