-- Scope3Scout Initial Schema
-- Multi-tenant ESG Supply Chain Intelligence Platform

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  country TEXT,
  industry TEXT,
  status TEXT DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'unknown',
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans
CREATE TABLE scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  status TEXT DEFAULT 'running',
  total_suppliers INTEGER DEFAULT 0,
  completed_suppliers INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Tier 1 results
CREATE TABLE tier1_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  scan_id UUID REFERENCES scans(id),
  raw_findings JSONB,
  flag_severity TEXT DEFAULT 'none',
  discrepancies JSONB,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Violations
CREATE TABLE violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  type TEXT,
  severity TEXT,
  description TEXT,
  source_url TEXT,
  fine_amount_eur NUMERIC DEFAULT 0,
  found_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation outputs
CREATE TABLE simulation_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  risk_score INTEGER,
  risk_level TEXT,
  predictions JSONB,
  recommended_action TEXT,
  financial_exposure_eur NUMERIC,
  csrd_compliant BOOLEAN DEFAULT false,
  simulated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  supplier_id UUID REFERENCES suppliers(id),
  type TEXT,
  message TEXT,
  severity TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier1_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (org-scoped)

-- Organizations: users can see their own org
CREATE POLICY "Users see own organization"
ON organizations FOR ALL
USING (id IN (
  SELECT org_id FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Profiles: users can see/edit their own profile
CREATE POLICY "Users manage own profile"
ON profiles FOR ALL
USING (id = auth.uid());

-- Suppliers: users see suppliers in their org
CREATE POLICY "Users see own org suppliers"
ON suppliers FOR ALL
USING (org_id IN (
  SELECT org_id FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Scans: users see scans in their org
CREATE POLICY "Users see own org scans"
ON scans FOR ALL
USING (org_id IN (
  SELECT org_id FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Tier1 results: users see results for their org's suppliers
CREATE POLICY "Users see own org tier1 results"
ON tier1_results FOR ALL
USING (supplier_id IN (
  SELECT id FROM suppliers
  WHERE org_id IN (
    SELECT org_id FROM profiles
    WHERE profiles.id = auth.uid()
  )
));

-- Violations: users see violations for their org's suppliers
CREATE POLICY "Users see own org violations"
ON violations FOR ALL
USING (supplier_id IN (
  SELECT id FROM suppliers
  WHERE org_id IN (
    SELECT org_id FROM profiles
    WHERE profiles.id = auth.uid()
  )
));

-- Simulation outputs: users see simulations for their org's suppliers
CREATE POLICY "Users see own org simulations"
ON simulation_outputs FOR ALL
USING (supplier_id IN (
  SELECT id FROM suppliers
  WHERE org_id IN (
    SELECT org_id FROM profiles
    WHERE profiles.id = auth.uid()
  )
));

-- Alerts: users see alerts in their org
CREATE POLICY "Users see own org alerts"
ON alerts FOR ALL
USING (org_id IN (
  SELECT org_id FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_suppliers_org_id ON suppliers(org_id);
CREATE INDEX idx_scans_org_id ON scans(org_id);
CREATE INDEX idx_tier1_results_supplier_id ON tier1_results(supplier_id);
CREATE INDEX idx_tier1_results_scan_id ON tier1_results(scan_id);
CREATE INDEX idx_violations_supplier_id ON violations(supplier_id);
CREATE INDEX idx_simulation_outputs_supplier_id ON simulation_outputs(supplier_id);
CREATE INDEX idx_alerts_org_id ON alerts(org_id);
CREATE INDEX idx_alerts_supplier_id ON alerts(supplier_id);
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
