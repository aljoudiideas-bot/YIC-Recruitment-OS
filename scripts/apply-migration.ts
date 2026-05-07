import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sql = `
alter table clients add column if not exists city text;
alter table clients add column if not exists tier text;

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

alter table commission_rules enable row level security;

drop policy if exists "Tenant members can view commission rules" on commission_rules;
create policy "Tenant members can view commission rules"
  on commission_rules for select
  using (tenant_id = get_user_tenant());

drop policy if exists "Non-external users can manage commission rules" on commission_rules;
create policy "Non-external users can manage commission rules"
  on commission_rules for all
  using (tenant_id = get_user_tenant() and get_user_role() != 'external_agency');

create index if not exists idx_commission_rules_tenant on commission_rules(tenant_id);
create index if not exists idx_commission_rules_agency on commission_rules(tenant_id, agency_id);
`

async function main() {
  const { data, error } = await supabase.rpc("exec_sql", { query: sql } as any)
  if (error) {
    console.error("RPC error:", error.message)
    // Try REST API directly
    const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    })
    const result = await resp.text()
    console.log("REST result:", result)
  } else {
    console.log("Migration applied successfully:", data)
  }
}

main().catch(console.error)
