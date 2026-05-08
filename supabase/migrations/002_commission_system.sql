-- Commission System for YIC Recruitment OS
-- Run this in Supabase Dashboard → SQL Editor

-- 1. WORKER TYPES
create table if not exists worker_types (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  created_at timestamptz default now()
);

-- 2. INTERMEDIARIES (n, m, ch, عبدالمنان)
create table if not exists intermediaries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- 3. COMMISSION RULES (replaces old commission_rules)
drop table if exists commission_rules cascade;

create table commission_rules (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  worker_type_id uuid not null references worker_types(id) on delete cascade,
  external_agency_id uuid references agencies(id) on delete cascade,
  saudi_client_id uuid references clients(id) on delete cascade,
  intermediary_id uuid references intermediaries(id) on delete set null,
  agency_pays_us numeric(10,2) not null default 0,
  client_pays_us numeric(10,2) not null default 0,
  intermediary_fee numeric(10,2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Add columns to cases
alter table cases add column if not exists worker_type_id uuid references worker_types(id);
alter table cases add column if not exists intermediary_id uuid references intermediaries(id);

-- RLS
alter table worker_types enable row level security;
alter table intermediaries enable row level security;
alter table commission_rules enable row level security;

-- Worker types
drop policy if exists "Tenant members can view worker types" on worker_types;
create policy "Tenant members can view worker types"
  on worker_types for select using (tenant_id = get_user_tenant());

drop policy if exists "Non-external users can manage worker types" on worker_types;
create policy "Non-external users can manage worker types"
  on worker_types for all using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- Intermediaries
drop policy if exists "Tenant members can view intermediaries" on intermediaries;
create policy "Tenant members can view intermediaries"
  on intermediaries for select using (tenant_id = get_user_tenant());

drop policy if exists "Non-external users can manage intermediaries" on intermediaries;
create policy "Non-external users can manage intermediaries"
  on intermediaries for all using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- Commission rules
drop policy if exists "Tenant members can view commission rules" on commission_rules;
create policy "Tenant members can view commission rules"
  on commission_rules for select using (tenant_id = get_user_tenant());

drop policy if exists "Non-external users can manage commission rules" on commission_rules;
create policy "Non-external users can manage commission rules"
  on commission_rules for all using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- Indexes
create index if not exists idx_worker_types_tenant on worker_types(tenant_id);
create index if not exists idx_intermediaries_tenant on intermediaries(tenant_id);
create index if not exists idx_commission_rules_tenant on commission_rules(tenant_id);
create index if not exists idx_commission_rules_worker on commission_rules(tenant_id, worker_type_id);
create index if not exists idx_commission_rules_agency on commission_rules(tenant_id, external_agency_id);
create index if not exists idx_commission_rules_client on commission_rules(tenant_id, saudi_client_id);
