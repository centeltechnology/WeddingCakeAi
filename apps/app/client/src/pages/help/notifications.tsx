import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { Bell, Mail, Settings, ArrowLeft } from "lucide-react";

export default function Notifications() {
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
            <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Bell className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Notification Settings</h1>
            <p className="text-lg text-gray-600">Manage how and when you receive updates from BakerIQ</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-yellow-600" />
                  Notification Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Email Notifications</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>New quote requests</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Payment confirmations</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Order updates</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">In-App Notifications</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>New messages</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Quote responses</span>
                        <span className="text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>System updates</span>
                        <span className="text-green-600">✓ Enabled</span>
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