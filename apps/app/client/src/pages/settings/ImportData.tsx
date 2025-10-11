import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Users, Package } from 'lucide-react';

type ImportType = 'customers' | 'catalog' | null;

interface ValidationResult {
  total: number;
  valid: number;
  invalid: number;
  errors: Array<{
    row: number;
    data: Record<string, string>;
    errors: string[];
  }>;
  preview: any[];
}

export default function ImportData() {
  const [importType, setImportType] = useState<ImportType>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleValidate = async () => {
    if (!csvData || !importType) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/import/validate/${importType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) throw new Error('Validation failed');

      const result = await response.json();
      setValidation(result);

      if (result.invalid > 0) {
        toast({
          title: 'Validation Warnings',
          description: `${result.valid} valid rows, ${result.invalid} invalid rows`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Validation Successful',
          description: `All ${result.valid} rows are valid`,
        });
      }
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: 'Failed to validate CSV file',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!csvData || !importType || !validation) return;

    if (validation.invalid > 0) {
      toast({
        title: 'Cannot Import',
        description: 'Please fix invalid rows before importing',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch(`/api/import/${importType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      toast({
        title: 'Import Successful',
        description: `Imported ${result.imported} ${importType}`,
      });

      // Reset form
      setCsvFile(null);
      setCsvData('');
      setValidation(null);
      setImportType(null);
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = async (type: 'customers' | 'catalog') => {
    try {
      const response = await fetch(`/api/import/template/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download Error',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  if (!importType) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Import Data</h1>
          <p className="text-slate-600 mt-2">
            Import customers, leads, or catalog items from CSV files
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="cursor-pointer"
            onClick={() => setImportType('customers')}
          >
            <Card className="p-6 hover:border-slate-400 transition-colors">
              <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Import Customers & Leads
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bulk import customer contact information and lead data
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTemplate('customers');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
              </div>
            </Card>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => setImportType('catalog')}
          >
            <Card className="p-6 hover:border-slate-400 transition-colors">
              <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Import Catalog Items
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bulk import products and services to your catalog
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTemplate('catalog');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Import {importType === 'customers' ? 'Customers & Leads' : 'Catalog Items'}
          </h1>
          <p className="text-slate-600 mt-2">
            Upload a CSV file to import data
          </p>
        </div>
        <Button variant="outline" onClick={() => setImportType(null)}>
          Back
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <FileText className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-sm font-medium">
                  {csvFile ? csvFile.name : 'Click to upload CSV file'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  or drag and drop
                </span>
              </label>
            </div>
          </div>

          {csvFile && (
            <div className="flex gap-2">
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadTemplate(importType as 'customers' | 'catalog')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          )}
        </div>
      </Card>

      {validation && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold">{validation.total}</div>
                <div className="text-sm text-slate-600">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{validation.valid}</div>
                <div className="text-sm text-slate-600">Valid Rows</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{validation.invalid}</div>
                <div className="text-sm text-slate-600">Invalid Rows</div>
              </div>
            </div>

            {validation.invalid > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-red-600">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {validation.errors.map((error, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="text-sm font-medium">Row {error.row}:</div>
                      <ul className="text-sm text-red-600 ml-4 mt-1">
                        {error.errors.map((err, errIdx) => (
                          <li key={errIdx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.preview.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Preview (first 5 rows):</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(validation.preview, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>

          {validation.invalid === 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                size="lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Importing...' : `Import ${validation.valid} Rows`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
