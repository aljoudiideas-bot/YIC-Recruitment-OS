import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

const supabaseUrl = "https://fgokxqgkuobwjnomsqew.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2t4cWdrdW9id2pub21zcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEzOTMyOSwiZXhwIjoyMDkzNzE1MzI5fQ.PXJpbytPP5oSvEN9nmMeqIH1cxztx5OhnMHgUkHrCdA"
const supabase = createClient(supabaseUrl, supabaseKey)

const TENANT_ID = "00000000-0000-0000-0000-000000000001"

function normalizeName(s: string): string {
  return s.trim().replace(/\s+/g, " ")
}

function normalizeNationality(s: string): string {
  const map: Record<string, string> = {
    kenya: "Kenya",
    uganda: "Uganda",
    indonsia: "Indonesia",
    burundi: "Burundi",
    ethiopia: "Ethiopia",
  }
  return map[s.trim().toLowerCase()] || s.trim()
}

function parseDate(s: string | undefined): string | null {
  if (!s || s.trim() === "") return null
  s = s.trim()
  // Handle formats: 2026-01-20 00:00:00, 2026/4/1, 26/1/2026, 2026/130, 2026/423
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`
  const m2 = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (m2) return `${m2[1]}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`
  const m3 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m3) return `${m3[3]}-${m3[2].padStart(2, "0")}-${m3[1].padStart(2, "0")}`
  const m4 = s.match(/^(\d{4})\/(\d{1,3})$/)
  if (m4) return `${m4[1]}-01-01`
  return null
}

function stageFromStatus(status: string): string {
  const s = status.trim().toLowerCase()
  if (s === "arrived" || s === "return") return "arrival"
  if (s === "under process" || s === "stamp visa") return "visa_processing"
  if (s === "ticket") return "ticketing"
  if (s === "failed") return "cancelled"
  if (s === "cancel visa") return "cancelled"
  return "new_request"
}

async function main() {
  const csvPath = "C:\\YIC-Recruitment-OS\\scripts\\Cleaned_Professional_Recruitment_File_FIXED.csv"
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found! Copy it to scripts/ folder first.")
    process.exit(1)
  }

  // Load existing clients and agencies into maps
  const { data: clients } = await supabase.from("clients").select("id, company_name")
  const clientMap: Record<string, string> = {}
  for (const c of clients || []) clientMap[c.company_name.toLowerCase()] = c.id

  const { data: agencies } = await supabase.from("agencies").select("id, agency_name")
  const agencyMap: Record<string, string> = {}
  for (const a of agencies || []) agencyMap[a.agency_name.toLowerCase()] = a.id

  // Load existing candidates by passport
  const { data: existingCands } = await supabase.from("candidates").select("id, passport_number, full_name")
  const existingByPassport: Record<string, any> = {}
  for (const c of existingCands || []) existingByPassport[c.passport_number.toUpperCase()] = c

  const fileStream = fs.createReadStream(csvPath, { encoding: "utf-8" })
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let lineNum = 0
  let imported = 0
  let updated = 0
  let errors = 0

  for await (const line of rl) {
    lineNum++
    if (lineNum === 1) continue // skip header
    if (!line.trim()) continue

    const cols = line.split(";").map((c) => c.trim())
    if (cols.length < 8) continue

    const rawName = cols[0] || ""
    const passport = (cols[1] || "").toUpperCase().trim()
    const nationality = normalizeNationality(cols[2] || "")
    const saudiOffice = normalizeName(cols[3] || "")
    const externalOffice = normalizeName(cols[4] || "")
    const jobRole = normalizeName(cols[5] || "")
    const rawStatus = cols[7] || ""
    const arrivalDate = parseDate(cols[9])

    if (!passport) {
      errors++
      continue
    }

    const clientId = clientMap[saudiOffice.toLowerCase()]
    const agencyId = agencyMap[externalOffice.toLowerCase()]

    if (!clientId) {
      console.log(`  WARN: Client not found for "${saudiOffice}"`)
    }
    if (!agencyId) {
      console.log(`  WARN: Agency not found for "${externalOffice}"`)
    }

    const existing = existingByPassport[passport]

    if (existing) {
      // Update candidate fields
      const updates: any = {}
      if (rawName) updates.full_name = normalizeName(rawName)
      if (nationality) updates.nationality = nationality
      if (jobRole) updates.job_role = jobRole

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("candidates").update(updates).eq("id", existing.id)
        if (error) console.log(`  ERROR updating ${passport}: ${error.message}`)
      }

      // Update corresponding case
      const { data: caseData } = await supabase
        .from("cases")
        .select("id, current_stage")
        .eq("candidate_id", existing.id)
        .single()

      if (caseData) {
        const caseUpdates: any = {}
        if (clientId) caseUpdates.client_id = clientId
        if (agencyId) caseUpdates.agency_id = agencyId
        const newStage = stageFromStatus(rawStatus)
        if (newStage && newStage !== caseData.current_stage) {
          caseUpdates.current_stage = newStage
        }
        if (arrivalDate) caseUpdates.actual_arrival = arrivalDate

        if (Object.keys(caseUpdates).length > 0) {
          const { error } = await supabase.from("cases").update(caseUpdates).eq("id", caseData.id)
          if (error) console.log(`  ERROR updating case ${passport}: ${error.message}`)
        }
      }

      updated++
    } else {
      // Insert new candidate
      const { data: newCand, error: candErr } = await supabase
        .from("candidates")
        .insert({
          tenant_id: TENANT_ID,
          full_name: normalizeName(rawName),
          nationality: nationality,
          passport_number: passport,
          job_role: jobRole,
          current_status: rawStatus.toLowerCase() === "arrived" ? "deployed" : "in_process",
        })
        .select("id")
        .single()

      if (candErr) {
        console.log(`  ERROR inserting ${passport}: ${candErr.message}`)
        errors++
        continue
      }

      // Create case
      const { error: caseErr } = await supabase.from("cases").insert({
        tenant_id: TENANT_ID,
        candidate_id: newCand!.id,
        client_id: clientId || undefined,
        agency_id: agencyId || undefined,
        current_stage: stageFromStatus(rawStatus),
        status: rawStatus.toLowerCase() === "cancelled" || rawStatus.toLowerCase() === "failed" ? "cancelled" : "active",
        actual_arrival: arrivalDate || undefined,
      })

      if (caseErr) {
        console.log(`  ERROR creating case ${passport}: ${caseErr.message}`)
      }

      imported++
    }

    if ((imported + updated) % 20 === 0) {
      console.log(`  Progress: ${imported} imported, ${updated} updated, ${errors} errors (line ${lineNum})`)
    }
  }

  console.log(`\nDone! ${imported} imported, ${updated} updated, ${errors} errors`)
}

main().catch(console.error)
