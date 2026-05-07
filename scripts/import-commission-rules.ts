import * as fs from "fs"

async function main() {
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2t4cWdrdW9id2pub21zcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEzOTMyOSwiZXhwIjoyMDkzNzE1MzI5fQ.PXJpbytPP5oSvEN9nmMeqIH1cxztx5OhnMHgUkHrCdA"
  const url = "https://fgokxqgkuobwjnomsqew.supabase.co"

  // Sign in as import bot
  const sResp = await fetch(url + "/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({ email: "import-bot@yis-recruitment.com", password: "ImportBot2026!" }),
  })
  const { access_token } = await sResp.json()
  const hdrs = {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: "Bearer " + access_token,
    Prefer: "return=representation",
  }

  // Parse CSV
  const csvPath = `C:\\Users\\CEO Construction Art\\Desktop\\YIS\\الداش بورد\\04_Commission_Rules.csv`
  const text = fs.readFileSync(csvPath, "utf-8").replace(/^\uFEFF/, "")
  const lines: string[] = []
  let cur = "", inq = false
  for (const ch of text) {
    if (ch === '"') { inq = !inq; continue }
    if (ch === "\n" && !inq) { lines.push(cur); cur = ""; continue }
    if (ch === "\r") continue
    cur += ch
  }
  if (cur) lines.push(cur)
  console.log("CSV lines:", lines.length)

  if (lines.length < 2) { console.error("No data"); return }
  const h = lines[0].split(",").map((s: string) => s.trim())

  // Get agencies
  const aResp = await fetch(url + "/rest/v1/agencies?select=id,agency_name,notes", {
    headers: { apikey: key, Authorization: "Bearer " + access_token },
  })
  const agencies: any[] = await aResp.json()
  const aMap: Record<string, any> = {}
  agencies.forEach((a) => { aMap[a.agency_name] = a })

  // Process rules
  let count = 0
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const vals = lines[i].split(",").map((s: string) => s.trim())
    const row: Record<string, string> = {}
    h.forEach((header: string, idx: number) => { row[header] = vals[idx] || "" })

    const agentName = row["Agent"]
    if (!agentName || !aMap[agentName]) { console.log("  Skipping", row["Rule Name"], "- no agency"); continue }

    const agency = aMap[agentName]
    let notes = agency.notes || ""
    let rules: any[] = []
    try {
      const m = notes.match(/COMMISSION:(\[.*?\])/)
      if (m) rules = JSON.parse(m[1])
    } catch { }

    rules.push({
      rule: row["Rule Name"],
      category: row["Category"],
      gross: parseFloat(row["Gross USD"]) || 0,
      paidOut: parseFloat(row["Paid Out USD"]) || 0,
      netUSD: parseFloat(row["Net YIS USD"]) || 0,
      netSAR: parseFloat(row["Net YIS SAR"]) || 0,
      notes: row["Notes"],
    })

    notes = notes.replace(/COMMISSION:\[.*?\]/, "") + "COMMISSION:" + JSON.stringify(rules)

    await fetch(url + "/rest/v1/agencies?id=eq." + agency.id, {
      method: "PATCH", headers: hdrs,
      body: JSON.stringify({ notes }),
    })
    count++
  }
  console.log("Imported commission rules for", count, "agencies")
}

main().catch(console.error)
