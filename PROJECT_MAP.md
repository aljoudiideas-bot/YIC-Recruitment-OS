# YIC Recruitment OS — Project Map

> تاريخ الإنشاء: 2026-05-07 | آخر تحديث: 2026-05-07
> الحالة: MVP Foundation — ✅ مكتمل | TypeScript: ✅ صفر أخطاء

---

## TECH_STACK

| الطبقة | التقنية | الإصدار | السبب |
|--------|---------|---------|-------|
| Frontend | Next.js 16 (App Router) | 16.2.5 | Active LTS, Server Components |
| UI | Tailwind CSS v4 + shadcn/ui | 4.2.4 | Clean B2B SaaS design |
| Charts | Recharts | 3.8.1 | Flexible, React-native charts |
| Backend | Supabase (PostgreSQL) | — | Auth + DB + Storage + RLS |
| Auth | Supabase Auth | — | Session-based, cookie auth |
| Storage | Supabase Storage | — | Document uploads |
| Multi-tenant | Row Level Security (RLS) | — | tenant_id isolation per query |
| Language | TypeScript | 5.9.3 | Strict mode, noUncheckedIndexedAccess |
| Forms | React Hook Form + Zod | 7.75 + 4.4.3 | Type-safe validation |
| Currency | Multi-currency (USD primary) | — | Intl.NumberFormat |

---

## DATABASE SCHEMA

```
tenants (id, name, slug)
  └── profiles (id, tenant_id, full_name, email, role)
  ├── clients (id, tenant_id, company_name, industry, status)
  ├── agencies (id, tenant_id, agency_name, country, commission_rate, rating)
  ├── candidates (id, tenant_id, full_name, nationality, passport_number, job_role, medical_status)
  ├── cases (id, tenant_id, case_number, candidate_id, client_id, agency_id, current_stage, priority, status)
  │   ├── documents (id, tenant_id, case_id, document_type, file_url, status, expiry_date)
  │   ├── financial_transactions (id, tenant_id, case_id, transaction_type, amount, currency)
  │   └── tasks (id, tenant_id, case_id, title, assigned_to, due_date, status, priority)
  ├── activity_logs (id, tenant_id, user_id, entity_type, entity_id, action, old_values, new_values)
  └── notifications (id, tenant_id, user_id, type, title, message, is_read)
```

### RLS Policy Matrix

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| tenants | Own tenant only | — |
| profiles | Own tenant | Admin only |
| clients | Own tenant | Non-external only |
| agencies | Own tenant | Non-external only |
| candidates | Own tenant | Non-external only |
| cases | Own tenant | Non-external only |
| documents | Own tenant | Non-external only |
| financial_transactions | Admin, finance_officer, ops_manager | Admin, finance_officer |
| tasks | Own tenant | Own tenant |
| activity_logs | Own tenant (read-only) | — (trigger only) |
| notifications | User's own | User's own |

---

## SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                     YIC Recruitment OS                          │
├──────────────┬──────────────────────────────────────────────────┤
│ Dashboard    │ KPI cards → Charts → Active Cases → Alerts       │
├──────────────┼──────────────────────────────────────────────────┤
│ Cases        │ New Case → Documents → Medical → Visa →          │
│ (Core)       │ Ticketing → Departure → Arrival → Completed      │
├──────────────┼──────────────────────────────────────────────────┤
│ Candidates   │ Profile → Passport → Job Role → Agency → Medical │
├──────────────┼──────────────────────────────────────────────────┤
│ Clients      │ Saudi Companies → Industry → Contact → Status    │
├──────────────┼──────────────────────────────────────────────────┤
│ Agencies     │ International → Country → Commission → Rating    │
├──────────────┼──────────────────────────────────────────────────┤
│ Documents    │ Upload → Type → Status (Pending/Verified/Expired)│
├──────────────┼──────────────────────────────────────────────────┤
│ Finance      │ Revenue - (Commission + Costs) = Net Profit      │
├──────────────┼──────────────────────────────────────────────────┤
│ Tasks        │ Create → Assign → Due Date → Status Tracking     │
├──────────────┼──────────────────────────────────────────────────┤
│ Settings     │ Team Management + Activity Logs                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## ARCHITECTURE

```
YIC-Recruitment-OS/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx          # Login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + Header layout
│   │   │   ├── page.tsx                # Main dashboard (KPIs + charts)
│   │   │   ├── cases/                  # Recruitment cases CRUD
│   │   │   ├── candidates/             # Candidate profiles
│   │   │   ├── clients/                # Saudi clients
│   │   │   ├── agencies/               # International agencies
│   │   │   ├── documents/              # Document management
│   │   │   ├── finance/                # Financial tracking
│   │   │   ├── tasks/                  # Task management
│   │   │   └── settings/               # Users + activity logs
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives
│   │   ├── layout/                     # Sidebar, Header
│   │   ├── dashboard/                  # Charts, tables, alerts
│   │   ├── cases/                      # Case table, new case form
│   │   ├── candidates/                 # Candidate table
│   │   └── finance/                    # Finance components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   ├── server.ts               # Server Supabase client
│   │   │   └── middleware.ts           # Auth middleware + routing
│   │   └── utils.ts                    # cn, formatters, constants
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces
│   └── hooks/                          # React hooks
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Full DB schema + RLS + triggers
├── middleware.ts                        # Next.js auth middleware
├── .env.example
├── package.json
└── tsconfig.json
```

---

## WORKFLOW STAGES

```
New Request → Documents Collection → Medical → Visa Processing →
Ticketing → Departure → Arrival → Completed / Cancelled
```

### Financial Model

```
Net Profit = Revenue - (Agency Commission + Operational Costs)

Revenue:     Client payments (incoming)
Costs:       Agency commissions + Operational costs (outgoing)
Currency:    Multi-currency (USD primary, stored per transaction)
```

---

## ORPHANS & PENDING

| # | العنصر | الحالة | ملاحظات |
|---|--------|--------|---------|
| O1 | Supabase project | ⏳ User setup | إنشاء مشروع Supabase وتطبيق migration |
| O2 | Supabase Storage buckets | ⏳ Pending | إنشاء bucket للـ documents |
| O3 | Email provider | ⏳ Pending | Resend/SendGrid للإشعارات |
| O4 | New Candidate form | ⏳ Pending | صفحة إنشاء مرشح جديد |
| O5 | New Client/Agency forms | ⏳ Pending | صفحات CRUD كاملة |
| O6 | Document upload handler | ⏳ Pending | رفع ملفات لـ Supabase Storage |
| O7 | Case stage transition UI | ⏳ Pending | سحب وإفلات بين المراحل |
| O8 | Transaction form | ⏳ Pending | إضافة معاملات مالية |
| O9 | Task create/edit form | ⏳ Pending | نموذج إنشاء وتعديل المهام |
| O10 | Real-time subscriptions | ⏳ Pending | Supabase Realtime للتنبيهات |
| O11 | Deploy target | ⏳ Pending | Vercel recommended |

---

## MVP SUCCESS CRITERIA

| المعيار | الحالة |
|---------|--------|
| تتبع حالة توظيف من البداية للنهاية | ✅ Schema + UI جاهزة |
| الربح لكل حالة مرئي | ✅ Finance module |
| المستندات لا تضيع أبداً | ✅ Documents module + RLS |
| تحديث الحالة سريع | ✅ Direct DB update via Supabase |
| Dashboard يعكس العمليات الحقيقية | ✅ KPIs + charts + alerts |
| عزل بيانات المستأجرين | ✅ RLS على كل جدول |
| TypeScript type-safe | ✅ صفر أخطاء |
