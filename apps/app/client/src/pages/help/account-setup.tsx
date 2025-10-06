import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, Settings, Lock, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function AccountSetup() {
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
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Account Setup & Profile Management</h1>
            <p className="text-lg text-gray-600">Complete guide to setting up and managing your BakerIQ account</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Account Creation</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Choose between Customer or Baker account</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Verify your email address</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Complete your profile information</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Set up payment methods</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Profile Optimization</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="bg-pink-50 border border-pink-200 p-3 rounded">
                          <p className="font-medium text-pink-800">Baker Profiles:</p>
                          <p className="text-pink-700">Add photos, specialties, pricing, and service areas</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="font-medium text-blue-800">Customer Profiles:</p>
                          <p className="text-blue-700">Save preferences, addresses, and favorite bakers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-600" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Password Security</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="border border-gray-200 p-3 rounded">
                        <h5 className="font-medium text-gray-800">Strong Password Requirements</h5>
                        <ul className="space-y-1 mt-2">
                          <li>• At least 8 characters long</li>
                          <li>• Include uppercase and lowercase letters</li>
                          <li>• Contains numbers and special characters</li>
                          <li>• Avoid common words or personal information</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Two-Factor Authentication</h4>
                    <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                      <p className="font-medium text-green-800 mb-2">Enhanced Security</p>
                      <p className="text-green-700">
                        Enable 2FA for an extra layer of protection. We support SMS and authenticator apps.
                      </p>
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