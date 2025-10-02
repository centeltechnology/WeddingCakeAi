import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  FileText,
  DollarSign,
  Layers,
  Cake,
  Save,
  X,
} from "lucide-react";
import type { QuoteTemplate } from "@shared/schema";

interface QuoteTemplateManagerProps {
  bakerId: string;
}

export function QuoteTemplateManager({ bakerId }: QuoteTemplateManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "wedding",
    subcategory: "",
    basePrice: "",
    pricePerServing: "",
    minimumOrder: "",
    pricingModel: "fixed",
  });

  // Fetch templates
  const { data: templates = [], isLoading, isError, error, refetch } = useQuery<QuoteTemplate[]>({
    queryKey: ['/api/quote-templates', bakerId],
    queryFn: async () => {
      const response = await fetch(`/api/quote-templates?bakerId=${bakerId}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return await apiRequest('POST', '/api/quote-templates', {
        ...templateData,
        bakerId,
        basePrice: templateData.basePrice ? parseFloat(templateData.basePrice) : null,
        pricePerServing: templateData.pricePerServing ? parseFloat(templateData.pricePerServing) : null,
        minimumOrder: templateData.minimumOrder ? parseFloat(templateData.minimumOrder) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      toast({
        title: "Template Created",
        description: "Your quote template has been created successfully!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/quote-templates/${id}`, {
        ...data,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : null,
        pricePerServing: data.pricePerServing ? parseFloat(data.pricePerServing) : null,
        minimumOrder: data.minimumOrder ? parseFloat(data.minimumOrder) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      toast({
        title: "Template Updated",
        description: "Your quote template has been updated successfully!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/quote-templates/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      toast({
        title: "Template Deleted",
        description: "Your quote template has been deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/quote-templates/${id}/duplicate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quote-templates', bakerId] });
      toast({
        title: "Template Duplicated",
        description: "Your quote template has been duplicated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate template",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (template?: QuoteTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        category: template.category || "wedding",
        subcategory: template.subcategory || "",
        basePrice: template.basePrice || "",
        pricePerServing: template.pricePerServing || "",
        minimumOrder: template.minimumOrder || "",
        pricingModel: template.pricingModel || "fixed",
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        category: "wedding",
        subcategory: "",
        basePrice: "",
        pricePerServing: "",
        minimumOrder: "",
        pricingModel: "fixed",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      category: "wedding",
      subcategory: "",
      basePrice: "",
      pricePerServing: "",
      minimumOrder: "",
      pricingModel: "fixed",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        data: formData,
      });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplateMutation.mutate(id);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'wedding':
        return 'bg-pink-100 text-pink-800';
      case 'birthday':
        return 'bg-blue-100 text-blue-800';
      case 'corporate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingModelLabel = (model: string) => {
    switch (model) {
      case 'fixed':
        return 'Fixed Price';
      case 'per_serving':
        return 'Per Serving';
      case 'tiered':
        return 'Tiered';
      case 'custom':
        return 'Custom';
      default:
        return model;
    }
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-muted-foreground">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Templates</h3>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'An error occurred while loading your templates'}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              data-testid="button-retry-templates"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-white/30 shadow-2xl">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-serif font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Quote Templates
            </CardTitle>
            <CardDescription className="mt-2">
              Create and manage reusable quote templates for your most common cake orders
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            data-testid="button-create-template"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first quote template to streamline your pricing process
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              data-testid="button-create-first-template"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing Model</TableHead>
                  <TableHead className="text-right">Base Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} data-testid={`template-row-${template.id}`}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-gray-900">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(template.category || 'other')}>
                        {template.category || 'Other'}
                      </Badge>
                      {template.subcategory && (
                        <span className="ml-2 text-sm text-gray-500">{template.subcategory}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPricingModelLabel(template.pricingModel || 'fixed')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {template.basePrice ? (
                        <span className="font-semibold text-gray-900">
                          ${parseFloat(template.basePrice).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(template)}
                          data-testid={`button-edit-${template.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template.id)}
                          disabled={duplicateTemplateMutation.isPending}
                          data-testid={`button-duplicate-${template.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleteTemplateMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${template.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update your quote template details"
                : "Create a reusable quote template for common cake orders"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Classic Wedding Cake"
                  required
                  data-testid="input-template-name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this template..."
                  rows={3}
                  data-testid="textarea-template-description"
                />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="anniversary">Anniversary</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g., Rustic, Modern"
                    data-testid="input-subcategory"
                  />
                </div>
              </div>

              {/* Pricing Model */}
              <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model</Label>
                <Select
                  value={formData.pricingModel}
                  onValueChange={(value) => setFormData({ ...formData, pricingModel: value })}
                >
                  <SelectTrigger data-testid="select-pricing-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="per_serving">Price Per Serving</SelectItem>
                    <SelectItem value="tiered">Tiered Pricing</SelectItem>
                    <SelectItem value="custom">Custom Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-base-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerServing">Per Serving ($)</Label>
                  <Input
                    id="pricePerServing"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerServing}
                    onChange={(e) => setFormData({ ...formData, pricePerServing: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-price-per-serving"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-minimum-order"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a basic template setup. You can add tiers, flavors, and add-ons after creation through the advanced editor.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                data-testid="button-cancel"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                data-testid="button-save-template"
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
