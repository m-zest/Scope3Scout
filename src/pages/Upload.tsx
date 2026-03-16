import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { DEMO_MODE } from '@/lib/tinyfish';
import { cn } from '@/lib/utils';

interface ParsedSupplier {
  name: string;
  website: string;
  country: string;
  industry: string;
}

type UploadStatus = 'idle' | 'parsing' | 'preview' | 'uploading' | 'done' | 'error';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV state
  const [csvStatus, setCsvStatus] = useState<UploadStatus>('idle');
  const [parsedRows, setParsedRows] = useState<ParsedSupplier[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  // Manual add state
  const [manualName, setManualName] = useState('');
  const [manualWebsite, setManualWebsite] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [manualIndustry, setManualIndustry] = useState('');
  const [manualSuppliers, setManualSuppliers] = useState<ParsedSupplier[]>([]);
  const [manualAdded, setManualAdded] = useState(false);

  // Parse CSV file
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Please upload a .csv file']);
      setCsvStatus('error');
      return;
    }

    setFileName(file.name);
    setCsvStatus('parsing');
    setParseErrors([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        const errors: string[] = [];
        const suppliers: ParsedSupplier[] = [];

        results.data.forEach((row, index) => {
          const name = row['name'] || row['supplier_name'] || row['company'] || row['supplier'] || '';
          if (!name.trim()) {
            errors.push(`Row ${index + 2}: Missing supplier name`);
            return;
          }

          suppliers.push({
            name: name.trim(),
            website: (row['website'] || row['url'] || row['site'] || '').trim(),
            country: (row['country'] || row['location'] || row['region'] || '').trim(),
            industry: (row['industry'] || row['sector'] || row['type'] || '').trim(),
          });
        });

        if (suppliers.length === 0) {
          errors.push('No valid suppliers found. Make sure your CSV has a "name" column.');
          setCsvStatus('error');
        } else {
          setCsvStatus('preview');
        }

        setParsedRows(suppliers);
        setParseErrors(errors);
      },
      error: (err) => {
        setParseErrors([`Parse error: ${err.message}`]);
        setCsvStatus('error');
      },
    });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Confirm upload
  const handleConfirmUpload = useCallback(async () => {
    setCsvStatus('uploading');

    if (DEMO_MODE) {
      // Simulate upload delay
      await new Promise((r) => setTimeout(r, 1500));
      setCsvStatus('done');
      return;
    }

    // TODO: Real Supabase insert
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setCsvStatus('done');
    } catch {
      setParseErrors(['Failed to save suppliers. Please try again.']);
      setCsvStatus('error');
    }
  }, []);

  // Manual add
  const handleManualAdd = useCallback(() => {
    if (!manualName.trim()) return;

    setManualSuppliers((prev) => [
      ...prev,
      {
        name: manualName.trim(),
        website: manualWebsite.trim(),
        country: manualCountry.trim(),
        industry: manualIndustry.trim(),
      },
    ]);

    setManualName('');
    setManualWebsite('');
    setManualCountry('');
    setManualIndustry('');
    setManualAdded(true);
    setTimeout(() => setManualAdded(false), 2000);
  }, [manualName, manualWebsite, manualCountry, manualIndustry]);

  const removeManualSupplier = useCallback((index: number) => {
    setManualSuppliers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetCsv = useCallback(() => {
    setCsvStatus('idle');
    setParsedRows([]);
    setParseErrors([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Demo banner */}
      {DEMO_MODE && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
          <span className="text-base">🎬</span>
          <span className="font-medium">Demo Mode</span>
          <span className="text-amber-700">
            — uploads are simulated, no data is saved to database
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <UploadIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Upload Suppliers
          </h1>
          <p className="text-muted-foreground">
            Import suppliers via CSV or add manually
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CSV Upload ── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">CSV Upload</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV with columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">name</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">website</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">country</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">industry</code>
          </p>

          {/* Drop zone */}
          {csvStatus === 'idle' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              )}
            >
              <UploadIcon className={cn(
                'h-12 w-12 mx-auto mb-3 transition-colors',
                dragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <p className="text-foreground font-medium mb-1">
                Drag & drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Parsing */}
          {csvStatus === 'parsing' && (
            <div className="border border-border rounded-lg p-8 text-center">
              <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-foreground">Parsing {fileName}...</p>
            </div>
          )}

          {/* Preview */}
          {csvStatus === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {parsedRows.length} supplier{parsedRows.length !== 1 ? 's' : ''} found in {fileName}
                  </span>
                </div>
                <button
                  onClick={resetCsv}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Upload different file
                </button>
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                  {parseErrors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">#</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Country</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Industry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.country || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.industry || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2 bg-muted/30">
                    ...and {parsedRows.length - 20} more
                  </p>
                )}
              </div>

              <button
                onClick={handleConfirmUpload}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Upload {parsedRows.length} Supplier{parsedRows.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Uploading */}
          {csvStatus === 'uploading' && (
            <div className="border border-border rounded-lg p-8 text-center">
              <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-foreground">Saving {parsedRows.length} suppliers...</p>
            </div>
          )}

          {/* Done */}
          {csvStatus === 'done' && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
              <p className="text-green-800 font-medium">
                {parsedRows.length} supplier{parsedRows.length !== 1 ? 's' : ''} uploaded successfully!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={resetCsv}
                  className="px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80"
                >
                  Upload More
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {csvStatus === 'error' && (
            <div className="space-y-3">
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    {parseErrors.map((err, i) => (
                      <p key={i} className="text-sm text-red-700">{err}</p>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={resetCsv}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* CSV template hint */}
          {csvStatus === 'idle' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground font-medium mb-1">Example CSV format:</p>
              <code className="text-xs text-foreground block whitespace-pre">
{`name,website,country,industry
SteelCorp GmbH,steelcorp.de,Germany,Steel
TextilePro,textilepro.bd,Bangladesh,Textile`}
              </code>
            </div>
          )}
        </div>

        {/* ── Manual Add ── */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Manual Add</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Add suppliers one by one using the form below.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Supplier Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. SteelCorp GmbH"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website
              </label>
              <input
                type="url"
                value={manualWebsite}
                onChange={(e) => setManualWebsite(e.target.value)}
                placeholder="e.g. https://steelcorp.de"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  placeholder="e.g. Germany"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={manualIndustry}
                  onChange={(e) => setManualIndustry(e.target.value)}
                  placeholder="e.g. Steel Manufacturing"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              onClick={handleManualAdd}
              disabled={!manualName.trim()}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>

            {manualAdded && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Supplier added!
              </p>
            )}
          </div>

          {/* Manual suppliers list */}
          {manualSuppliers.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Added ({manualSuppliers.length}):
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {manualSuppliers.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[s.country, s.industry].filter(Boolean).join(' · ') || 'No details'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeManualSupplier(i)}
                      className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-2 px-4 mt-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2"
              >
                Done — Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
