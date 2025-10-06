import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthTest() {
  const [bakerEmail, setBakerEmail] = useState('live@test.com');
  const [bakerPassword, setBakerPassword] = useState('password123');
  const [adminUsername, setAdminUsername] = useState('bwadmin');
  const [adminPassword, setAdminPassword] = useState('password');
  const [results, setResults] = useState<Record<string, any>>({});

  const testBakerLogin = async () => {
    try {
      const response = await fetch('/api/bakers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bakerEmail, password: bakerPassword })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, baker: { status: response.status, data } }));
      if (data.token) {
        localStorage.setItem('baker_token', data.token);
      }
    } catch (error) {
      setResults(prev => ({ ...prev, baker: { error: (error as Error).message } }));
    }
  };

  const testBakerLoginWithCSRF = async () => {
    try {
      const { makeAuthenticatedRequest } = await import('@/lib/csrf');
      const response = await makeAuthenticatedRequest('/api/bakers/login', {
        method: 'POST',
        body: JSON.stringify({ email: bakerEmail, password: bakerPassword })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, bakerCSRF: { status: response.status, data } }));
    } catch (error) {
      setResults(prev => ({ ...prev, bakerCSRF: { error: (error as Error).message } }));
    }
  };

  const testAdminLogin = async () => {
    try {
      const response = await fetch('/api/clean-auth/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, admin: { status: response.status, data } }));
      if (data.token) {
        localStorage.setItem('super_admin_token', data.token);
      }
    } catch (error) {
      setResults(prev => ({ ...prev, admin: { error: (error as Error).message } }));
    }
  };

  const testBakerRegister = async () => {
    const timestamp = Date.now();
    try {
      const response = await fetch('/api/bakers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Bakery ${timestamp}`,
          email: `test${timestamp}@test.com`,
          password: 'password123',
          address: '123 Test Street',
          phone: '555-1234'
        })
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, register: { status: response.status, data } }));
    } catch (error) {
      setResults(prev => ({ ...prev, register: { error: (error as Error).message } }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Baker Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={bakerEmail} onChange={(e) => setBakerEmail(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={bakerPassword} onChange={(e) => setBakerPassword(e.target.value)} />
              </div>
              <Button onClick={testBakerLogin} className="w-full">Test Baker Login (Direct)</Button>
              <Button onClick={testBakerLoginWithCSRF} className="w-full mt-2" variant="outline">Test Baker Login (CSRF)</Button>
              {results.baker && (
                <Alert className="mt-2">
                  <AlertDescription>
                    <strong>Direct Fetch:</strong>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(results.baker, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
              {results.bakerCSRF && (
                <Alert className="mt-2">
                  <AlertDescription>
                    <strong>CSRF Wrapper:</strong>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(results.bakerCSRF, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Admin Login Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              </div>
              <Button onClick={testAdminLogin} className="w-full">Test Admin Login</Button>
              {results.admin && (
                <Alert>
                  <AlertDescription>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(results.admin, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Baker Registration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Creates a new baker account with a timestamp to ensure uniqueness</p>
            <Button onClick={testBakerRegister} className="w-full">Test Registration</Button>
            {results.register && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(results.register, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}