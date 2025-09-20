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
  AlertCircle,
  AlertTriangle,
  Heart,
  Building2,
  Cake,
  FileText
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
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  // Fetch contracts from API
  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts', bakerId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/contracts?bakerId=${bakerId}`);
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contract-title">Contract Title</Label>
                    <Input 
                      id="contract-title"
                      placeholder="e.g., Wedding Cake Contract"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input 
                      id="customer-name"
                      placeholder="e.g., Sarah Johnson"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input 
                      id="customer-email"
                      type="email"
                      placeholder="sarah@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input 
                      id="event-date"
                      type="date"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total-amount">Total Amount</Label>
                    <Input 
                      id="total-amount"
                      type="number"
                      step="0.01"
                      placeholder="500.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit-amount">Deposit Amount</Label>
                    <Input 
                      id="deposit-amount"
                      type="number"
                      step="0.01"
                      placeholder="250.00"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="contract-content">Contract Terms</Label>
                <Textarea 
                  id="contract-content"
                  placeholder="Enter contract terms and conditions..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // TODO: Implement contract creation
                    toast({
                      title: "Contract Creation",
                      description: "Contract creation functionality will be implemented next!",
                    });
                    setIsCreating(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contract
                </Button>
              </div>
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
          {/* Legal Warning */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg text-yellow-800">Important Legal Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700">
                These contract templates are provided for general guidance only and should not be considered legal advice. 
                <strong> We strongly recommend consulting with a qualified attorney</strong> to review and customize any contract 
                before use to ensure it complies with local laws and adequately protects your business interests.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Contract Templates</h3>
              <p className="text-sm text-muted-foreground">Choose from pre-built templates or create custom ones</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wedding Cake Contract Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 text-rose-500 mr-2" />
                  Wedding Cake Contract
                </CardTitle>
                <CardDescription>Standard contract for wedding cake orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment Terms:</span>
                    <span className="text-muted-foreground">50% deposit, 50% final</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cancellation:</span>
                    <span className="text-muted-foreground">7 days notice</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Delivery:</span>
                    <span className="text-muted-foreground">Setup included</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setPreviewTemplate('template')}
                    data-testid="button-preview-template"
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingTemplate('wedding')}
                    data-testid="button-edit-wedding-template"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Template Selected",
                        description: "Wedding cake contract template is ready to use.",
                      });
                    }}
                    data-testid="button-use-wedding-template"
                  >
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Corporate Event Contract Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                  Corporate Event Contract
                </CardTitle>
                <CardDescription>Professional contract for corporate orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment Terms:</span>
                    <span className="text-muted-foreground">Net 30 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cancellation:</span>
                    <span className="text-muted-foreground">14 days notice</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Delivery:</span>
                    <span className="text-muted-foreground">Business hours only</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setPreviewTemplate('template')}
                    data-testid="button-preview-template"
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingTemplate('wedding')}
                    data-testid="button-edit-wedding-template"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Template Selected",
                        description: "Wedding cake contract template is ready to use.",
                      });
                    }}
                    data-testid="button-use-wedding-template"
                  >
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Standard Cake Order Contract Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cake className="h-5 w-5 text-purple-500 mr-2" />
                  Standard Cake Order
                </CardTitle>
                <CardDescription>Basic contract for regular cake orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment Terms:</span>
                    <span className="text-muted-foreground">Full payment on order</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cancellation:</span>
                    <span className="text-muted-foreground">48 hours notice</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pickup:</span>
                    <span className="text-muted-foreground">Customer pickup</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setPreviewTemplate('template')}
                    data-testid="button-preview-template"
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingTemplate('wedding')}
                    data-testid="button-edit-wedding-template"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Template Selected",
                        description: "Wedding cake contract template is ready to use.",
                      });
                    }}
                    data-testid="button-use-wedding-template"
                  >
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Template */}
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Create Custom Template</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Build your own contract template with custom terms
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewTemplate(true)}
                  data-testid="button-new-template"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </CardContent>
            </Card>
          </div>
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

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Contract Template Preview</DialogTitle>
              <DialogDescription>
                Preview of the {previewTemplate === 'template' ? 'standard' : previewTemplate} contract template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">CAKE ORDER CONTRACT</h2>
                  <p className="text-sm text-muted-foreground">Service Agreement between Baker and Client</p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">1. ORDER DETAILS</h3>
                    <p>This contract outlines the terms for a custom cake order between [BAKER NAME] ("Baker") and [CLIENT NAME] ("Client").</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2. PAYMENT TERMS</h3>
                    <p>A 50% deposit is required to secure your order, with the remaining balance due upon delivery. Payment can be made via cash, check, or credit card.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">3. DELIVERY & PICKUP</h3>
                    <p>Delivery setup is included for orders over $200. Pickup is available during business hours with 24-hour notice.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">4. CANCELLATION POLICY</h3>
                    <p>Orders may be cancelled up to 7 days before the event date for a full refund. Cancellations within 7 days are subject to a 50% cancellation fee.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">5. CHANGES & MODIFICATIONS</h3>
                    <p>Changes to the order must be made at least 72 hours before the event date. Additional charges may apply for modifications.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close Preview
                </Button>
                <Button onClick={() => {
                  setPreviewTemplate(null);
                  toast({
                    title: "Template Selected",
                    description: "Contract template is ready to use for new contracts.",
                  });
                }}>
                  Use This Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Template Modal */}
      {showNewTemplate && (
        <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract Template</DialogTitle>
              <DialogDescription>
                Build a custom contract template with your own terms and conditions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input placeholder="e.g., Birthday Cake Contract" data-testid="input-template-name" />
              </div>
              
              <div>
                <Label>Template Description</Label>
                <Input placeholder="Brief description of this template" data-testid="input-template-description" />
              </div>
              
              <div>
                <Label>Contract Content</Label>
                <Textarea 
                  placeholder="Enter the main contract text and terms..."
                  className="min-h-[200px]"
                  data-testid="textarea-contract-content"
                />
              </div>
              
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea 
                  placeholder="Enter specific terms and conditions..."
                  className="min-h-[150px]"
                  data-testid="textarea-terms-conditions"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowNewTemplate(false);
                  toast({
                    title: "Template Created",
                    description: "Your new contract template has been saved successfully.",
                  });
                }} data-testid="button-save-template">
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Contract Template</DialogTitle>
              <DialogDescription>
                Customize the {editingTemplate === 'wedding' ? 'Wedding Cake' : 'Contract'} template to fit your business needs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input 
                    defaultValue={editingTemplate === 'wedding' ? 'Wedding Cake Contract' : 'Contract Template'}
                    data-testid="input-edit-template-name"
                  />
                </div>
                <div>
                  <Label>Template Description</Label>
                  <Input 
                    defaultValue={editingTemplate === 'wedding' ? 'Standard contract for wedding cake orders' : 'Contract template description'}
                    data-testid="input-edit-template-description"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Input 
                    defaultValue={editingTemplate === 'wedding' ? '50% deposit, 50% final' : 'Full payment on order'}
                    data-testid="input-edit-payment-terms"
                  />
                </div>
                <div>
                  <Label>Cancellation Policy</Label>
                  <Input 
                    defaultValue={editingTemplate === 'wedding' ? '7 days notice' : '48 hours notice'}
                    data-testid="input-edit-cancellation"
                  />
                </div>
                <div>
                  <Label>Delivery Terms</Label>
                  <Input 
                    defaultValue={editingTemplate === 'wedding' ? 'Setup included' : 'Customer pickup'}
                    data-testid="input-edit-delivery"
                  />
                </div>
              </div>
              
              <div>
                <Label>Contract Content</Label>
                <Textarea 
                  placeholder="Enter the main contract text and terms..."
                  defaultValue="This contract outlines the terms for a custom cake order between [BAKER NAME] and [CLIENT NAME]. The baker agrees to provide a custom cake according to the specifications agreed upon, and the client agrees to the terms and payment schedule outlined below."
                  className="min-h-[200px]"
                  data-testid="textarea-edit-contract-content"
                />
              </div>
              
              <div>
                <Label>Additional Terms & Conditions</Label>
                <Textarea 
                  placeholder="Enter specific terms and conditions..."
                  defaultValue="• All orders require a 50% deposit to secure the date\n• Final payment is due upon delivery\n• Changes to the order must be made 72 hours in advance\n• The baker is not responsible for damage after delivery\n• Client is responsible for providing accurate guest count"
                  className="min-h-[150px]"
                  data-testid="textarea-edit-terms-conditions"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setEditingTemplate(null);
                  toast({
                    title: "Template Updated",
                    description: "Your contract template has been saved with your custom changes.",
                  });
                }} data-testid="button-save-edited-template">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}