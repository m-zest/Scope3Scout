import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DemoScanResult } from '@/data/demoSuppliers';

interface ScanResultEntry {
  supplierId: string;
  supplierName: string;
  result: DemoScanResult & { id: string };
  scannedAt: number;
}

interface AlertEntry {
  id: string;
  supplier_id: string;
  supplier_name: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

interface ScanResultContextValue {
  scanResults: Record<string, ScanResultEntry>;
  saveScanResult: (supplierId: string, supplierName: string, result: DemoScanResult & { id: string }) => void;
  getScanResult: (supplierId: string) => ScanResultEntry | undefined;
  liveAlerts: AlertEntry[];
  addAlert: (alert: Omit<AlertEntry, 'id' | 'created_at' | 'read'>) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
}

const ScanResultContext = createContext<ScanResultContextValue | null>(null);

export function ScanResultProvider({ children }: { children: ReactNode }) {
  const [scanResults, setScanResults] = useState<Record<string, ScanResultEntry>>({});
  const [liveAlerts, setLiveAlerts] = useState<AlertEntry[]>([]);

  const saveScanResult = useCallback((supplierId: string, supplierName: string, result: DemoScanResult & { id: string }) => {
    setScanResults((prev) => ({
      ...prev,
      [supplierId]: { supplierId, supplierName, result, scannedAt: Date.now() },
    }));

    // Auto-generate alerts from scan results
    const newAlerts: AlertEntry[] = [];

    // Violation alerts
    for (const violation of result.violations) {
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        supplier_id: supplierId,
        supplier_name: supplierName,
        type: violation.type === 'environmental' ? 'violation_detected' : violation.type === 'labour' ? 'labour_dispute' : 'violation_detected',
        message: `${violation.severity === 'critical' ? 'Critical' : 'High'} violation found: ${violation.description}`,
        severity: violation.severity as AlertEntry['severity'],
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    // Contradiction/greenwashing alerts
    for (const disc of result.tier1_result.discrepancies) {
      newAlerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        supplier_id: supplierId,
        supplier_name: supplierName,
        type: 'greenwashing',
        message: `Greenwashing detected: ${disc.claim} contradicted by ${disc.finding}`,
        severity: disc.confidence > 0.85 ? 'critical' : 'high',
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    // CSRD compliance alert
    if (!result.simulation_output.csrd_compliant) {
      newAlerts.push({
        id: `alert-${Date.now()}-csrd-${Math.random().toString(36).slice(2)}`,
        supplier_id: supplierId,
        supplier_name: supplierName,
        type: 'csrd_risk',
        message: `CSRD non-compliance risk: Risk score ${result.risk_score}/100. Financial exposure EUR ${result.simulation_output.financial_exposure_eur.toLocaleString()}`,
        severity: result.risk_score >= 70 ? 'critical' : 'high',
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    // Scan complete alert for clean suppliers
    if (result.violations.length === 0) {
      newAlerts.push({
        id: `alert-${Date.now()}-clean-${Math.random().toString(36).slice(2)}`,
        supplier_id: supplierId,
        supplier_name: supplierName,
        type: 'scan_complete',
        message: `Scan completed: No violations detected. Supplier is CSRD compliant with low risk score (${result.risk_score}/100)`,
        severity: 'low',
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    if (newAlerts.length > 0) {
      setLiveAlerts((prev) => [...newAlerts, ...prev]);
    }
  }, []);

  const getScanResult = useCallback((supplierId: string) => {
    return scanResults[supplierId];
  }, [scanResults]);

  const addAlert = useCallback((alert: Omit<AlertEntry, 'id' | 'created_at' | 'read'>) => {
    setLiveAlerts((prev) => [{
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString(),
      read: false,
    }, ...prev]);
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setLiveAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setLiveAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  return (
    <ScanResultContext.Provider value={{ scanResults, saveScanResult, getScanResult, liveAlerts, addAlert, markAlertRead, markAllAlertsRead }}>
      {children}
    </ScanResultContext.Provider>
  );
}

export function useScanResults() {
  const ctx = useContext(ScanResultContext);
  if (!ctx) throw new Error('useScanResults must be used within ScanResultProvider');
  return ctx;
}
