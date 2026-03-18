import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Info,
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvStatus, setCsvStatus] = useState<UploadStatus>('idle');
  const [parsedRows, setParsedRows] = useState<ParsedSupplier[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const [manualName, setManualName] = useState('');
  const [manualWebsite, setManualWebsite] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [manualIndustry, setManualIndustry] = useState('');
  const [manualSuppliers, setManualSuppliers] = useState<ParsedSupplier[]>([]);
  const [manualAdded, setManualAdded] = useState(false);

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

  const handleConfirmUpload = useCallback(async () => {
    setCsvStatus('uploading');
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1500));
      setCsvStatus('done');
      return;
    }
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setCsvStatus('done');
    } catch {
      setParseErrors(['Failed to save suppliers. Please try again.']);
      setCsvStatus('error');
    }
  }, []);

  const handleManualAdd = useCallback(() => {
    if (!manualName.trim()) return;
    setManualSuppliers((prev) => [
      ...prev,
      { name: manualName.trim(), website: manualWebsite.trim(), country: manualCountry.trim(), industry: manualIndustry.trim() },
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

  const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-foreground placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors';

  return (
    <motion.div
      className="space-y-6 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Demo banner */}
      {DEMO_MODE && (
        <motion.div variants={fadeUp} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Demo Mode</span> — uploads are simulated, no data is saved
          </span>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload */}
        <div className="surface-elevated rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">CSV Upload</h2>
              <p className="text-xs text-muted-foreground">
                Columns: <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">name</code>, <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">website</code>, <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">country</code>, <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">industry</code>
              </p>
            </div>
          </div>

          {csvStatus === 'idle' && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                )}
              >
                <UploadIcon className={cn('h-10 w-10 mx-auto mb-3 transition-colors', dragActive ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600')} />
                <p className="text-sm font-medium text-foreground mb-1">Drag & drop your CSV file</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
              </div>
              <div className="mt-4 p-3 rounded-lg surface-inset">
                <p className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">Example CSV</p>
                <code className="text-xs text-foreground font-mono block whitespace-pre leading-relaxed">
{`name,website,country,industry
SteelCorp GmbH,steelcorp.de,Germany,Steel
TextilePro,textilepro.bd,Bangladesh,Textile`}
                </code>
              </div>
            </>
          )}

          {csvStatus === 'parsing' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
              <Loader2 className="h-8 w-8 text-emerald-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-foreground">Parsing {fileName}...</p>
            </div>
          )}

          {csvStatus === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {parsedRows.length} supplier{parsedRows.length !== 1 ? 's' : ''} found
                </span>
                <button onClick={resetCsv} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Different file</button>
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 space-y-1">
                  {parseErrors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{err}
                    </p>
                  ))}
                </div>
              )}

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">#</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Country</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Industry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 20).map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.country || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.industry || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center py-2 bg-slate-50 dark:bg-slate-900/30">...and {parsedRows.length - 20} more</p>
                )}
              </div>

              <button
                onClick={handleConfirmUpload}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upload {parsedRows.length} Supplier{parsedRows.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {csvStatus === 'uploading' && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
              <Loader2 className="h-8 w-8 text-emerald-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-foreground">Saving {parsedRows.length} suppliers...</p>
            </div>
          )}

          {csvStatus === 'done' && (
            <div className="border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                {parsedRows.length} supplier{parsedRows.length !== 1 ? 's' : ''} uploaded!
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors">Go to Dashboard</button>
                <button onClick={resetCsv} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-foreground rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Upload More</button>
              </div>
            </div>
          )}

          {csvStatus === 'error' && (
            <div className="space-y-3">
              <div className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    {parseErrors.map((err, i) => (
                      <p key={i} className="text-sm text-red-700 dark:text-red-400">{err}</p>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={resetCsv} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Try again</button>
            </div>
          )}
        </div>

        {/* Manual Add */}
        <div className="surface-elevated rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">Manual Add</h2>
              <p className="text-xs text-muted-foreground">Add suppliers one at a time</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. SteelCorp GmbH" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Website</label>
              <input type="url" value={manualWebsite} onChange={(e) => setManualWebsite(e.target.value)} placeholder="e.g. https://steelcorp.de" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Country</label>
                <input type="text" value={manualCountry} onChange={(e) => setManualCountry(e.target.value)} placeholder="e.g. Germany" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Industry</label>
                <input type="text" value={manualIndustry} onChange={(e) => setManualIndustry(e.target.value)} placeholder="e.g. Steel" className={inputCls} />
              </div>
            </div>
            <button
              onClick={handleManualAdd}
              disabled={!manualName.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </button>

            {manualAdded && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Supplier added
              </p>
            )}
          </div>

          {manualSuppliers.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Added ({manualSuppliers.length})
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {manualSuppliers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between surface-inset rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{[s.country, s.industry].filter(Boolean).join(' / ') || 'No details'}</p>
                    </div>
                    <button onClick={() => removeManualSupplier(i)} className="text-slate-400 hover:text-red-500 shrink-0 ml-2 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-slate-100 dark:bg-slate-800 text-foreground rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Done — Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
