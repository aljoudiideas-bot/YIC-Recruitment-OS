import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const CSV_DIR = `C:\\Users\\CEO Construction Art\\Desktop\\YIS\\الداش بورد`

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function parseCsv(filePath: string): Record<string, string>[] {
  const text = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "")
  const lines: string[] = []
  let current = ""
  let inQuotes = false
  for (const ch of text) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === "\n" && !inQuotes) { lines.push(current); current = ""; continue }
    if (ch === "\r") continue
    current += ch
  }
  if (current) lines.push(current)
  if (lines.length < 2) { console.error(`Empty CSV: ${filePath}`); return [] }
  const headers = lines[0].split(",").map(h => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const vals: string[] = []
    let v = "", q = false
    for (const ch of lines[i]) {
      if (ch === '"') { q = !q; continue }
      if (ch === "," && !q) { vals.push(v.trim()); v = ""; continue }
      v += ch
    }
    vals.push(v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = vals[idx] || "" })
    rows.push(row)
  }
  return rows
}

function norm(v: string | undefined | null): string { return (v || "").trim() }
function num(v: string | undefined | null): number { return parseFloat((v || "").replace(/[^0-9.\-]/g, "")) || 0 }

// Use an authenticated user's JWT to insert (bypasses tenant_id stripping issue with service_role)
async function getAuthToken(): Promise<string> {
  const importEmail = "import-bot@yis-recruitment.com"
  const importPassword = "ImportBot2026!"

  // Check if user already exists
  const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const { users } = await resp.json()
  let existingUser = users?.find((u: any) => u.email === importEmail)

  if (!existingUser) {
    const createResp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ email: importEmail, password: importPassword, email_confirm: true }),
    })
    existingUser = await createResp.json()
    console.log(`Created import user: ${existingUser.id}`)
  }

  // Sign in
  const signinResp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey },
    body: JSON.stringify({ email: importEmail, password: importPassword }),
  })
  const session = await signinResp.json()
  if (!session.access_token) throw new Error("Failed to get auth token")

  // Ensure profile exists with correct tenant
  const { data: profile } = await supabase
    .from("profiles").select("id, tenant_id").eq("id", existingUser.id).single()

  if (!profile || profile.tenant_id !== "00000000-0000-0000-0000-000000000001") {
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${existingUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tenant_id: "00000000-0000-0000-0000-000000000001", role: "admin" }),
    })
  }

  return session.access_token
}

async function main() {
  console.log("Starting CSV import...\n")

  const authToken = await getAuthToken()
  const authHeaders = {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${authToken}`,
    Prefer: "return=representation",
  }

  const TENANT_ID = "00000000-0000-0000-0000-000000000001"

  // Helper: authenticated insert via raw fetch
  async function insert(table: string, payload: any) {
    const resp = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: "POST", headers: authHeaders, body: JSON.stringify(payload),
    })
    const result = await resp.json()
    if (!resp.ok) throw new Error(`${table}: ${result.message || JSON.stringify(result)}`)
    return Array.isArray(result) ? result[0] : result
  }

  async function exists(table: string, filters: Record<string, string>): Promise<boolean> {
    const qs = Object.entries(filters).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&")
    const resp = await fetch(`${supabaseUrl}/rest/v1/${table}?${qs}&limit=1`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${authToken}` },
    })
    const data = await resp.json()
    return Array.isArray(data) && data.length > 0
  }

  // ── 1. AGENCIES ──
  console.log("── Agencies ──")
  const agencyRows = parseCsv(path.join(CSV_DIR, "02_External_Agents.csv"))
  const agencyMap: Record<string, string> = {}
  for (const row of agencyRows) {
    const name = norm(row["Agent Name"])
    if (!name) continue
    if (await exists("agencies", { tenant_id: TENANT_ID, agency_name: name })) {
      const r = await fetch(`${supabaseUrl}/rest/v1/agencies?tenant_id=eq.${TENANT_ID}&agency_name=eq.${encodeURIComponent(name)}&select=id`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${authToken}` },
      }).then(r => r.json())
      agencyMap[name] = r[0].id
      console.log(`  OK: ${name}`)
      continue
    }
    const ins = await insert("agencies", {
      tenant_id: TENANT_ID, agency_name: name, country: norm(row["Country"]),
      contact_name: norm(row["Contact Name"]), contact_phone: norm(row["WhatsApp"]),
      contact_email: norm(row["Email"]),
      status: norm(row["Agent Status"]).toLowerCase() === "active" ? "active" : "inactive",
      notes: norm(row["Contract Notes"]), commission_rate: 0, rating: 0,
    })
    agencyMap[name] = ins.id
    console.log(`  + ${name}`)
  }
  console.log(`  Total: ${agencyRows.length}\n`)

  // ── 2. CLIENTS ──
  console.log("── Clients ──")
  const clientRows = parseCsv(path.join(CSV_DIR, "03_Saudi_Offices.csv"))
  const clientMap: Record<string, string> = {}
  for (const row of clientRows) {
    const name = norm(row["Office Name"])
    if (!name) continue
    if (await exists("clients", { tenant_id: TENANT_ID, company_name: name })) {
      const r = await fetch(`${supabaseUrl}/rest/v1/clients?tenant_id=eq.${TENANT_ID}&company_name=eq.${encodeURIComponent(name)}&select=id`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${authToken}` },
      }).then(r => r.json())
      clientMap[name] = r[0].id
      console.log(`  OK: ${name}`)
      continue
    }
    const city = norm(row["City"]); const tier = norm(row["Tier"])
    const notes = [city ? `City: ${city}` : "", tier ? `Tier: ${tier}` : ""].filter(Boolean).join(" | ")
    const ins = await insert("clients", {
      tenant_id: TENANT_ID, company_name: name, contact_name: norm(row["Contact Person"]),
      contact_phone: norm(row["WhatsApp"]), industry: "Recruitment", status: "active",
      notes: notes || null,
    })
    clientMap[name] = ins.id
    console.log(`  + ${name}`)
  }
  console.log(`  Total: ${clientRows.length}\n`)

  // ── 3. WORKERS ──
  console.log("── Workers ──")
  const workerRows = parseCsv(path.join(CSV_DIR, "01_Workers.csv"))
  let cCount = 0, caseCount = 0, finCount = 0
  for (const row of workerRows) {
    const fullName = norm(row["Worker Name"])
    if (!fullName) continue
    const passport = norm(row["Passport No."])
    const rawStatus = norm(row["Status"])
    const candStatus = rawStatus.includes("Arrived") ? "deployed" : rawStatus.includes("Failed") ? "cancelled" : "new"

    if (passport && await exists("candidates", { tenant_id: TENANT_ID, passport_number: passport })) {
      console.log(`  OK: ${fullName} (exists)`)
      continue
    }

    const cand = await insert("candidates", {
      tenant_id: TENANT_ID, full_name: fullName,
      nationality: norm(row["Nationality"]) || "Unknown",
      passport_number: passport || `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      job_role: norm(row["Category"]) || "Unknown",
      agency_id: agencyMap[norm(row["External Agent"])] || null,
      current_status: candStatus, medical_status: "not_started",
    })
    cCount++; console.log(`  + ${fullName}`)

    const stage = rawStatus.includes("Arrived") ? "arrival" : rawStatus.includes("Failed") ? "cancelled" : "new_request"
    const arrivalDate = norm(row["Arrival Date"]); const processStart = norm(row["Process Start"])
    const notes = [norm(row["Visa Block No."]), norm(row["Doc Type"]), norm(row["Invoice Ref"]), norm(row["Notes"])].filter(Boolean).join(" | ") || null

    const caseData = await insert("cases", {
      tenant_id: TENANT_ID, candidate_id: cand.id,
      client_id: clientMap[norm(row["Saudi Office"])] || null,
      agency_id: agencyMap[norm(row["External Agent"])] || null,
      current_stage: stage, priority: "normal",
      status: rawStatus.includes("Failed") ? "cancelled" : "active",
      expected_arrival: processStart || null, actual_arrival: arrivalDate || null, notes,
    })
    caseCount++

    const gross = num(row["Gross Commission $"]); const paidOut = num(row["Paid Out $"])
    if (gross > 0) {
      const txnDate = arrivalDate || processStart || new Date().toISOString().split("T")[0]
      await insert("financial_transactions", {
        tenant_id: TENANT_ID, case_id: caseData.id, transaction_type: "client_payment",
        amount: gross, currency: "USD", description: `Gross commission - ${fullName}`,
        transaction_date: txnDate, reference_number: norm(row["Invoice Ref"]) || null,
      })
      finCount++
      if (paidOut > 0) {
        await insert("financial_transactions", {
          tenant_id: TENANT_ID, case_id: caseData.id, transaction_type: "agency_commission",
          amount: paidOut, currency: "USD", description: `Paid out - ${fullName}`,
          transaction_date: txnDate,
        })
        finCount++
      }
    }
  }

  console.log(`\n── Summary ──`)
  console.log(`  Agencies: ${agencyRows.length}`)
  console.log(`  Clients: ${clientRows.length}`)
  console.log(`  Candidates: ${cCount}`)
  console.log(`  Cases: ${caseCount}`)
  console.log(`  Financial Txns: ${finCount}`)

  // ── 4. Commission Rules (only if table exists) ──
  const { error: ruleCheck } = await supabase.from("commission_rules").select("id").limit(1)
  if (ruleCheck?.message?.includes("does not exist")) {
    console.log(`\n⚠ Commission Rules table not yet created.`)
    console.log(`  To create it, run this SQL in Supabase Dashboard SQL Editor:`)
    console.log(`  https://supabase.com/dashboard/project/fgokxqgkuobwjnomsqew/sql/new`)
    console.log(`  (see scripts/run-migration.sql for the SQL)`)
  } else {
    console.log(`\n── Commission Rules ──`)
    const rulesRows = parseCsv(path.join(CSV_DIR, "04_Commission_Rules.csv"))
    let rCount = 0
    for (const row of rulesRows) {
      const ruleName = norm(row["Rule Name"]); const agentName = norm(row["Agent"])
      if (!ruleName || !agentName) continue
      const aid = agencyMap[agentName]
      if (!aid) { console.warn(`  SKIP: ${ruleName} (agency not found)`); continue }
      await insert("commission_rules", {
        tenant_id: TENANT_ID, agency_id: aid, rule_name: ruleName,
        category: norm(row["Category"]), gross_usd: num(row["Gross USD"]),
        paid_out_usd: num(row["Paid Out USD"]), net_yis_usd: num(row["Net YIS USD"]),
        net_yis_sar: num(row["Net YIS SAR"]), notes: norm(row["Notes"]),
      })
      rCount++; console.log(`  + ${ruleName}`)
    }
    console.log(`  Total: ${rCount}`)
  }

  console.log(`\n✅ Import complete!`)
}

main().catch(console.error)
