-- Scope3Scout Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Suppliers table
create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  org_id text default 'default',
  name text not null,
  website text,
  country text,
  industry text,
  status text default 'pending' check (status in ('pending', 'scanning', 'scanned', 'flagged', 'cleared')),
  risk_score integer default 0,
  risk_level text default 'unknown' check (risk_level in ('unknown', 'low', 'medium', 'high', 'critical')),
  last_scanned_at timestamptz,
  created_at timestamptz default now()
);

-- Violations table
create table if not exists public.violations (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references public.suppliers(id) on delete cascade,
  type text not null check (type in ('environmental', 'labour', 'legal', 'financial')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  source_url text,
  source_name text,
  source_excerpt text,
  fine_amount_eur numeric default 0,
  found_at timestamptz default now()
);

-- Simulation outputs table
create table if not exists public.simulation_outputs (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references public.suppliers(id) on delete cascade,
  risk_score integer default 0,
  risk_level text default 'unknown',
  predictions jsonb default '[]'::jsonb,
  recommended_action text,
  financial_exposure_eur numeric default 0,
  csrd_compliant boolean default false,
  simulated_at timestamptz default now()
);

-- Alerts table
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  org_id text default 'default',
  supplier_id uuid references public.suppliers(id) on delete cascade,
  type text not null,
  message text not null,
  severity text default 'low' check (severity in ('low', 'medium', 'high', 'critical')),
  read boolean default false,
  created_at timestamptz default now()
);

-- Scans table
create table if not exists public.scans (
  id uuid primary key default uuid_generate_v4(),
  org_id text default 'default',
  status text default 'running' check (status in ('running', 'completed', 'failed')),
  total_suppliers integer default 0,
  completed_suppliers integer default 0,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- Enable Row Level Security
alter table public.suppliers enable row level security;
alter table public.violations enable row level security;
alter table public.simulation_outputs enable row level security;
alter table public.alerts enable row level security;
alter table public.scans enable row level security;

-- Allow authenticated users full access (for hackathon simplicity)
create policy "Allow authenticated access" on public.suppliers for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.violations for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.simulation_outputs for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.alerts for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.scans for all using (auth.role() = 'authenticated');

-- Indexes for performance
create index if not exists idx_suppliers_risk on public.suppliers(risk_score desc);
create index if not exists idx_violations_supplier on public.violations(supplier_id);
create index if not exists idx_alerts_read on public.alerts(read, created_at desc);
create index if not exists idx_simulations_supplier on public.simulation_outputs(supplier_id);
