-- ============================================================
-- YIC Recruitment OS — Supabase Database Schema
-- Multi-tenant SaaS with Row Level Security (RLS)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. TENANTS (SaaS Organizations)
-- ============================================================
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. PROFILES (User accounts linked to tenants)
-- Extends Supabase auth.users
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade not null,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin', 'operations_manager', 'recruiter', 'finance_officer', 'external_agency')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. CLIENTS (Saudi Companies)
-- ============================================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  company_name text not null,
  industry text,
  contact_name text,
  contact_email text,
  contact_phone text,
  commercial_registration text,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. AGENCIES (International Recruitment Agencies)
-- ============================================================
create table agencies (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  agency_name text not null,
  country text not null,
  commission_rate numeric(10,2) default 0,
  contact_name text,
  contact_email text,
  contact_phone text,
  rating numeric(2,1) default 0 check (rating >= 0 and rating <= 5),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 5. CANDIDATES
-- ============================================================
create table candidates (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  full_name text not null,
  nationality text not null,
  passport_number text unique not null,
  passport_expiry date,
  date_of_birth date,
  gender text check (gender in ('male', 'female')),
  phone text,
  email text,
  job_role text not null,
  agency_id uuid references agencies(id) on delete set null,
  medical_status text default 'pending' check (medical_status in ('pending', 'passed', 'failed', 'not_started')),
  current_status text default 'new' check (current_status in ('new', 'in_process', 'deployed', 'cancelled')),
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_candidates_tenant on candidates(tenant_id);
create index idx_candidates_passport on candidates(tenant_id, passport_number);

-- ============================================================
-- 6. RECRUITMENT CASES (Core Module)
-- Each case = one candidate's full lifecycle
-- ============================================================
create table cases (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  case_number text unique not null,
  candidate_id uuid references candidates(id) on delete restrict not null,
  client_id uuid references clients(id) on delete restrict not null,
  agency_id uuid references agencies(id) on delete restrict not null,
  current_stage text not null default 'new_request' check (current_stage in (
    'new_request',
    'documents_collection',
    'medical',
    'visa_processing',
    'ticketing',
    'departure',
    'arrival',
    'completed',
    'cancelled'
  )),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  expected_arrival date,
  actual_arrival date,
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'cancelled')),
  assigned_to uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_cases_tenant on cases(tenant_id);
create index idx_cases_stage on cases(tenant_id, current_stage);
create index idx_cases_status on cases(tenant_id, status);
create index idx_cases_client on cases(tenant_id, client_id);
create index idx_cases_candidate on cases(tenant_id, candidate_id);

-- ============================================================
-- 7. DOCUMENTS
-- ============================================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  case_id uuid references cases(id) on delete cascade not null,
  document_type text not null check (document_type in ('passport', 'visa', 'medical_report', 'contract', 'ticket', 'other')),
  file_url text not null,
  file_name text not null,
  file_size integer,
  status text not null default 'pending' check (status in ('pending', 'verified', 'expired', 'missing')),
  expiry_date date,
  uploaded_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_documents_tenant on documents(tenant_id);
create index idx_documents_case on documents(tenant_id, case_id);

-- ============================================================
-- 8. FINANCIAL TRANSACTIONS
-- ============================================================
create table financial_transactions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  case_id uuid references cases(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('client_payment', 'agency_commission', 'operational_cost', 'other')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  description text,
  transaction_date date not null default now(),
  reference_number text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_financial_tenant on financial_transactions(tenant_id);
create index idx_financial_case on financial_transactions(tenant_id, case_id);
create index idx_financial_type on financial_transactions(tenant_id, transaction_type);
create index idx_financial_date on financial_transactions(tenant_id, transaction_date);

-- ============================================================
-- 9. TASKS
-- ============================================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles(id) on delete set null,
  due_date date,
  status text not null default 'to_do' check (status in ('to_do', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tasks_tenant on tasks(tenant_id);
create index idx_tasks_assigned on tasks(tenant_id, assigned_to);
create index idx_tasks_status on tasks(tenant_id, status);

-- ============================================================
-- 10. ACTIVITY LOGS
-- ============================================================
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  user_id uuid references profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  description text,
  created_at timestamptz default now()
);

create index idx_activity_tenant on activity_logs(tenant_id);
create index idx_activity_entity on activity_logs(tenant_id, entity_type, entity_id);
create index idx_activity_created on activity_logs(tenant_id, created_at desc);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null,
  user_id uuid references profiles(id) on delete cascade,
  type text not null check (type in ('visa_delay', 'missing_document', 'payment_overdue', 'stage_change', 'task_due', 'general')),
  title text not null,
  message text not null,
  is_read boolean default false,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz default now()
);

create index idx_notifications_tenant on notifications(tenant_id);
create index idx_notifications_user on notifications(tenant_id, user_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Every table is isolated per tenant
-- ============================================================

-- Enable RLS on all tables
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table agencies enable row level security;
alter table candidates enable row level security;
alter table cases enable row level security;
alter table documents enable row level security;
alter table financial_transactions enable row level security;
alter table tasks enable row level security;
alter table activity_logs enable row level security;
alter table notifications enable row level security;

-- Helper function to get user's tenant
create or replace function get_user_tenant()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- Helper function to get user's role
create or replace function get_user_role()
returns text as $$
  select role from profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- TENANTS: Users can only see their own tenant
create policy "Users can view own tenant"
  on tenants for select
  using (id = get_user_tenant());

-- PROFILES: Users can see profiles in their tenant
create policy "Users can view tenant profiles"
  on profiles for select
  using (tenant_id = get_user_tenant());

create policy "Admin can manage all profiles"
  on profiles for all
  using (get_user_role() = 'admin');

-- CLIENTS: Full CRUD within tenant
create policy "Tenant members can view clients"
  on clients for select
  using (tenant_id = get_user_tenant());

create policy "Non-external users can manage clients"
  on clients for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- AGENCIES
create policy "Tenant members can view agencies"
  on agencies for select
  using (tenant_id = get_user_tenant());

create policy "Non-external users can manage agencies"
  on agencies for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- CANDIDATES
create policy "Tenant members can view candidates"
  on candidates for select
  using (tenant_id = get_user_tenant());

create policy "Non-external users can manage candidates"
  on candidates for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- CASES
create policy "Tenant members can view cases"
  on cases for select
  using (tenant_id = get_user_tenant());

create policy "Non-external users can manage cases"
  on cases for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- DOCUMENTS
create policy "Tenant members can view documents"
  on documents for select
  using (tenant_id = get_user_tenant());

create policy "Non-external users can manage documents"
  on documents for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

-- FINANCIAL: Only admin, finance_officer, operations_manager
create policy "Authorized roles can view financial"
  on financial_transactions for select
  using (
    tenant_id = get_user_tenant()
    and get_user_role() in ('admin', 'finance_officer', 'operations_manager')
  );

create policy "Authorized roles can manage financial"
  on financial_transactions for all
  using (
    tenant_id = get_user_tenant()
    and get_user_role() in ('admin', 'finance_officer')
  );

-- TASKS
create policy "Tenant members can view tasks"
  on tasks for select
  using (tenant_id = get_user_tenant());

create policy "Tenant members can manage tasks"
  on tasks for all
  using (tenant_id = get_user_tenant());

-- ACTIVITY LOGS: Read only
create policy "Tenant members can view activity logs"
  on activity_logs for select
  using (tenant_id = get_user_tenant());

-- NOTIFICATIONS
create policy "Users can view own notifications"
  on notifications for select
  using (tenant_id = get_user_tenant() and user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update
  using (tenant_id = get_user_tenant() and user_id = auth.uid())
  with check (tenant_id = get_user_tenant() and user_id = auth.uid());

-- ============================================================
-- AUTOMATED FUNCTIONS
-- ============================================================

-- Auto-generate case number
create or replace function generate_case_number()
returns trigger as $$
begin
  new.case_number := 'YIC-' || to_char(now(), 'YYYY') || '-' || lpad(
    (select count(*) + 1 from cases where tenant_id = new.tenant_id)::text, 5, '0'
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_generate_case_number
  before insert on cases
  for each row
  execute function generate_case_number();

-- Log activity on case stage changes
create or replace function log_case_changes()
returns trigger as $$
begin
  if (old.current_stage is distinct from new.current_stage) or
     (old.status is distinct from new.status) then
    insert into activity_logs (tenant_id, user_id, entity_type, entity_id, action, old_values, new_values, description)
    values (
      new.tenant_id,
      auth.uid(),
      'case',
      new.id,
      'status_change',
      jsonb_build_object('stage', old.current_stage, 'status', old.status),
      jsonb_build_object('stage', new.current_stage, 'status', new.status),
      'Case ' || new.case_number || ' changed from ' || old.current_stage || ' to ' || new.current_stage
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_log_case_changes
  after update on cases
  for each row
  execute function log_case_changes();

-- Auto-create notification for visa delays (>14 days in visa_processing)
create or replace function check_visa_delays()
returns trigger as $$
begin
  if new.current_stage = 'visa_processing' and
     new.updated_at < now() - interval '14 days' then
    insert into notifications (tenant_id, user_id, type, title, message, related_entity_type, related_entity_id)
    select
      new.tenant_id,
      p.id,
      'visa_delay',
      'Visa Processing Delay',
      'Case ' || new.case_number || ' has been in visa processing for over 14 days',
      'case',
      new.id
    from profiles p
    where p.tenant_id = new.tenant_id
      and p.role in ('admin', 'operations_manager');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_visa_delay
  after update on cases
  for each row
  when (old.current_stage is distinct from new.current_stage)
  execute function check_visa_delays();

-- ============================================================
-- SEED DATA (Optional — for testing)
-- ============================================================
-- Uncomment after creating your first tenant and user:
--
-- insert into tenants (id, name, slug) values
--   ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo-company');
--
-- insert into profiles (id, tenant_id, full_name, email, role) values
--   ('REPLACE_WITH_AUTH_USER_ID', '00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@demo.com', 'admin');
