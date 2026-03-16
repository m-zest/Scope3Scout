export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          org_id: string | null;
          email: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          org_id?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          website: string | null;
          country: string | null;
          industry: string | null;
          status: string;
          risk_score: number;
          risk_level: string;
          last_scanned_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          website?: string | null;
          country?: string | null;
          industry?: string | null;
          status?: string;
          risk_score?: number;
          risk_level?: string;
          last_scanned_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          website?: string | null;
          country?: string | null;
          industry?: string | null;
          status?: string;
          risk_score?: number;
          risk_level?: string;
          last_scanned_at?: string | null;
          created_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          org_id: string | null;
          status: string;
          total_suppliers: number;
          completed_suppliers: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          status?: string;
          total_suppliers?: number;
          completed_suppliers?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          status?: string;
          total_suppliers?: number;
          completed_suppliers?: number;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      tier1_results: {
        Row: {
          id: string;
          supplier_id: string | null;
          scan_id: string | null;
          raw_findings: Record<string, unknown> | null;
          flag_severity: string;
          discrepancies: Record<string, unknown>[] | null;
          scanned_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          scan_id?: string | null;
          raw_findings?: Record<string, unknown> | null;
          flag_severity?: string;
          discrepancies?: Record<string, unknown>[] | null;
          scanned_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string | null;
          scan_id?: string | null;
          raw_findings?: Record<string, unknown> | null;
          flag_severity?: string;
          discrepancies?: Record<string, unknown>[] | null;
          scanned_at?: string;
        };
      };
      violations: {
        Row: {
          id: string;
          supplier_id: string | null;
          type: string | null;
          severity: string | null;
          description: string | null;
          source_url: string | null;
          fine_amount_eur: number;
          found_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          type?: string | null;
          severity?: string | null;
          description?: string | null;
          source_url?: string | null;
          fine_amount_eur?: number;
          found_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string | null;
          type?: string | null;
          severity?: string | null;
          description?: string | null;
          source_url?: string | null;
          fine_amount_eur?: number;
          found_at?: string;
        };
      };
      simulation_outputs: {
        Row: {
          id: string;
          supplier_id: string | null;
          risk_score: number | null;
          risk_level: string | null;
          predictions: Record<string, unknown>[] | null;
          recommended_action: string | null;
          financial_exposure_eur: number | null;
          csrd_compliant: boolean;
          simulated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          risk_score?: number | null;
          risk_level?: string | null;
          predictions?: Record<string, unknown>[] | null;
          recommended_action?: string | null;
          financial_exposure_eur?: number | null;
          csrd_compliant?: boolean;
          simulated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string | null;
          risk_score?: number | null;
          risk_level?: string | null;
          predictions?: Record<string, unknown>[] | null;
          recommended_action?: string | null;
          financial_exposure_eur?: number | null;
          csrd_compliant?: boolean;
          simulated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          org_id: string | null;
          supplier_id: string | null;
          type: string | null;
          message: string | null;
          severity: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          supplier_id?: string | null;
          type?: string | null;
          message?: string | null;
          severity?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          supplier_id?: string | null;
          type?: string | null;
          message?: string | null;
          severity?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
