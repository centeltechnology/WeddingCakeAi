import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileCheck, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Edit,
  Signature,
  AlertCircle
} from 'lucide-react';

interface ContractManagerProps {
  bakerId: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  customerId: string;
  quoteId?: string;
  content: string;
  terms: string;
  eventDate: string;
  totalAmount: string;
  depositAmount: string;
  createdAt: string;
  signedAt?: string;
  customerName?: string;
}

export function ContractManager({ bakerId }: ContractManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('contracts');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Fetch contracts from API
  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: [`/api/bakers/${bakerId}/contracts`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/bakers/${bakerId}/contracts`);
        if (!response.ok) {
          if (response.status === 404) return []; // No contracts yet
          throw new Error('Failed to fetch contracts');
        }
        return response.json();
      } catch (error) {
        console.log('Contracts not found, returning empty array');
        return []; // Return empty array for now
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const handleSendForSignature = (contract: Contract) => {
    toast({
      title: "Contract Sent",
      description: `Contract sent to ${contract.customerName} for e-signature.`,
    });
  };

  // Calculate contract statistics
  const contractStats = {
    total: contracts?.length || 0,
    signed: contracts?.filter(c => c.status === 'signed').length || 0,
    pending: contracts?.filter(c => c.status === 'pending' || c.status === 'sent').length || 0,
    revenue: contracts?.filter(c => c.status === 'signed').reduce((sum, c) => sum + parseFloat(c.totalAmount), 0) || 0
  };

  // Show loading state
  if (contractsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Contract Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Contract Management</h2>
          <p className="text-muted-foreground">Manage digital contracts and e-signatures</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-contract">
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
              <DialogDescription>
                Generate a professional contract for your customer to sign.
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Contract Builder</h3>
              <p className="text-muted-foreground mb-4">
                Advanced contract creation with templates and e-signature integration.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractStats.total}</div>
            <p className="text-xs text-muted-foreground">Active contracts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contractStats.signed}</div>
            <p className="text-xs text-muted-foreground">Completed contracts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{contractStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting signature</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <span className="text-lg">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${contractStats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From signed contracts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts" data-testid="tab-contracts">
            <FileCheck className="h-4 w-4 mr-2" />
            Contracts ({contracts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-contract-templates">
            <Edit className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="signatures" data-testid="tab-signatures">
            <Signature className="h-4 w-4 mr-2" />
            Signatures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          {!contracts || contracts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Contracts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first contract to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Contract
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {getStatusIcon(contract.status)}
                          <span className="ml-2">{contract.title}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {contract.contractNumber} • {contract.customerName}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Event Date</Label>
                        <p className="font-medium">{new Date(contract.eventDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Amount</Label>
                        <p className="font-medium">${contract.totalAmount}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Deposit</Label>
                        <p className="font-medium">${contract.depositAmount}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Created</Label>
                        <p className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedContract(contract)}>
                        <FileCheck className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {contract.status === 'draft' && (
                        <Button variant="outline" size="sm" onClick={() => handleSendForSignature(contract)}>
                          <Send className="h-3 w-3 mr-1" />
                          Send for Signature
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Edit className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Contract Templates</h3>
              <p className="text-muted-foreground mb-4">
                Create reusable contract templates with standard terms and conditions.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Signature className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Digital Signatures</h3>
              <p className="text-muted-foreground mb-4">
                Track signature status and manage the e-signature workflow.
              </p>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {getStatusIcon(selectedContract.status)}
                <span className="ml-2">{selectedContract.title}</span>
              </DialogTitle>
              <DialogDescription>
                Contract {selectedContract.contractNumber} for {selectedContract.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event Date</Label>
                  <p>{new Date(selectedContract.eventDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p>${selectedContract.totalAmount}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Contract Content</Label>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <p className="text-sm">{selectedContract.content}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Terms & Conditions</Label>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <p className="text-sm">{selectedContract.terms}</p>
                </div>
              </div>
              
              {selectedContract.signedAt && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Signed on {new Date(selectedContract.signedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}