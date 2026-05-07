-- Run this in Supabase Dashboard → SQL Editor

-- Add city and tier to clients
alter table clients add column if not exists city text;
alter table clients add column if not exists tier text;

-- Create commission_rules table
create table if not exists commission_rules (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  agency_id uuid references agencies(id) on delete cascade,
  rule_name text not null,
  category text not null,
  gross_usd numeric(10,2) default 0,
  paid_out_usd numeric(10,2) default 0,
  net_yis_usd numeric(10,2) default 0,
  net_yis_sar numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table commission_rules enable row level security;

drop policy if exists "Tenant members can view commission rules" on commission_rules;
create policy "Tenant members can view commission rules"
  on commission_rules for select
  using (tenant_id = get_user_tenant());

drop policy if exists "Non-external users can manage commission rules" on commission_rules;
create policy "Non-external users can manage commission rules"
  on commission_rules for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- Indexes
create index if not exists idx_commission_rules_tenant on commission_rules(tenant_id);
create index if not exists idx_commission_rules_agency on commission_rules(tenant_id, agency_id);
