// Seed YIC Recruitment OS with data from Excel template
// Run: node scripts/seed-supabase.js
// Run with --clear to wipe existing data first: node scripts/seed-supabase.js --clear
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://fgokxqgkuobwjnomsqew.supabase.co"
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2t4cWdrdW9id2pub21zcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEzOTMyOSwiZXhwIjoyMDkzNzE1MzI5fQ.PXJpbytPP5oSvEN9nmMeqIH1cxztx5OhnMHgUkHrCdA"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

const shouldClear = process.argv.includes("--clear")

// ===================== DATA =====================

const workerTypesData = [
  { name_ar: "سائق", name_en: "Driver" },
  { name_ar: "عامل منزلي", name_en: "Domestic Worker" },
  { name_ar: "طباخ", name_en: "Cook" },
  { name_ar: "حارس أمن", name_en: "Security" },
  { name_ar: "بستاني", name_en: "Gardener" },
  { name_ar: "عامل نظافة", name_en: "Cleaner" },
]

const intermediariesData = [
  { name: "None" },
  { name: "Local Broker" },
]

const clientsData = [
  { company_name: "Saudi Co. Ltd", contact_name: "Fahad Al-Otaibi", contact_email: "fahad@saudico.com", contact_phone: "+966501234567", status: "active" },
  { company_name: "Al-Otaibi Group", contact_name: "Abdullah Al-Otaibi", contact_email: "abdullah@alotaibi.com", contact_phone: "+966501234568", status: "active" },
  { company_name: "Bin Laden Group", contact_name: "Mohammed Bin Laden", contact_email: "mohammed@blg.com", contact_phone: "+966501234569", status: "active" },
  { company_name: "Al-Faisal Holding", contact_name: "Khalid Al-Faisal", contact_email: "khalid@alfaisal.com", contact_phone: "+966501234570", status: "active" },
]

const agenciesData = [
  { agency_name: "Al-Rajhi Recruitment", country: "Egypt", contact_name: "Mohamed Ali", contact_email: "mohamed@alrajhi.com", contact_phone: "+201234567890", status: "active" },
  { agency_name: "Global Manpower", country: "Philippines", contact_name: "Maria Santos", contact_email: "maria@globalmanpower.com", contact_phone: "+639123456789", status: "active" },
  { agency_name: "Star Recruitment", country: "India", contact_name: "Raj Patel", contact_email: "raj@starrecruit.com", contact_phone: "+919876543210", status: "active" },
  { agency_name: "Pak Recruiting", country: "Pakistan", contact_name: "Ahmed Khan", contact_email: "ahmed@pakrecruit.com", contact_phone: "+923001234567", status: "active" },
  { agency_name: "Bangla Manpower", country: "Bangladesh", contact_name: "Kamal Hossain", contact_email: "kamal@banglamanpower.com", contact_phone: "+8801712345678", status: "active" },
  { agency_name: "Lanka Recruit", country: "Sri Lanka", contact_name: "Nimal Perera", contact_email: "nimal@lankarecruit.com", contact_phone: "+947712345678", status: "active" },
  { agency_name: "Himalaya Recruitment", country: "Nepal", contact_name: "Rajendra Thapa", contact_email: "rajendra@himalayarecruit.com", contact_phone: "+9779812345678", status: "active" },
  { agency_name: "Indo Manpower", country: "Indonesia", contact_name: "Budi Santoso", contact_email: "budi@indomanpower.com", contact_phone: "+6281212345678", status: "active" },
  { agency_name: "Viet Labor", country: "Vietnam", contact_name: "Nguyen Van Minh", contact_email: "nguyen@vietlabor.com", contact_phone: "+849012345678", status: "active" },
  { agency_name: "Ethio Connect", country: "Ethiopia", contact_name: "Abebe Tesfaye", contact_email: "abebe@ethioconnect.com", contact_phone: "+251911234567", status: "active" },
  { agency_name: "East Africa Recruitment", country: "Kenya", contact_name: "John Omondi", contact_email: "john@eastafricarecruit.com", contact_phone: "+254712345678", status: "active" },
  { agency_name: "West Africa Link", country: "Ghana", contact_name: "Kwame Asante", contact_email: "kwame@westafricalink.com", contact_phone: "+233201234567", status: "active" },
  { agency_name: "Nigeria Manpower", country: "Nigeria", contact_name: "Chinonso Eze", contact_email: "chinonso@nigeriamanpower.com", contact_phone: "+2348012345678", status: "active" },
  { agency_name: "North Africa Recruitment", country: "Morocco", contact_name: "Hassan Al-Mansouri", contact_email: "hassan@northafricarecruit.com", contact_phone: "+212612345678", status: "active" },
  { agency_name: "Anatolia Recruitment", country: "Turkey", contact_name: "Mehmet Yilmaz", contact_email: "mehmet@anatoliarecruit.com", contact_phone: "+905301234567", status: "active" },
  { agency_name: "Levant Recruitment", country: "Jordan", contact_name: "Hassan Al-Masri", contact_email: "hassan@levantrecruit.com", contact_phone: "+962791234567", status: "active" },
  { agency_name: "Nile Recruitment", country: "Sudan", contact_name: "Ahmed Omer", contact_email: "ahmed@nilerecruit.com", contact_phone: "+249912345678", status: "active" },
  { agency_name: "Central Africa Recruit", country: "Cameroon", contact_name: "Emmanuel Tata", contact_email: "emmanuel@centralafricarecruit.com", contact_phone: "+237691234567", status: "active" },
  { agency_name: "Gulf Recruit", country: "Yemen", contact_name: "Ali Al-Amri", contact_email: "ali@gulfrecruit.com", contact_phone: "+967712345678", status: "active" },
]

const commissionRulesData = [
  { worker: "Driver", client: "Saudi Co. Ltd", agency: "Al-Rajhi Recruitment", intermediary: "None", agencyPays: 2000, clientPays: 15000, intermediaryFee: 1500 },
  { worker: "Driver", client: "Saudi Co. Ltd", agency: "Bangla Manpower", intermediary: "None", agencyPays: 1800, clientPays: 14000, intermediaryFee: 1200 },
  { worker: "Driver", client: "Saudi Co. Ltd", agency: "Indo Manpower", intermediary: "None", agencyPays: 1800, clientPays: 14000, intermediaryFee: 1200 },
  { worker: "Driver", client: "Al-Otaibi Group", agency: "Global Manpower", intermediary: "None", agencyPays: 2200, clientPays: 16000, intermediaryFee: 1800 },
  { worker: "Driver", client: "Al-Otaibi Group", agency: "Lanka Recruit", intermediary: "None", agencyPays: 1500, clientPays: 13000, intermediaryFee: 1000 },
  { worker: "Driver", client: "Bin Laden Group", agency: "Star Recruitment", intermediary: "None", agencyPays: 2500, clientPays: 18000, intermediaryFee: 2000 },
  { worker: "Driver", client: "Bin Laden Group", agency: "East Africa Recruitment", intermediary: "None", agencyPays: 1800, clientPays: 15000, intermediaryFee: 1500 },
  { worker: "Driver", client: "Bin Laden Group", agency: "Nigeria Manpower", intermediary: "None", agencyPays: 1600, clientPays: 13000, intermediaryFee: 1200 },
  { worker: "Driver", client: "Al-Faisal Holding", agency: "Himalaya Recruitment", intermediary: "None", agencyPays: 1700, clientPays: 14000, intermediaryFee: 1300 },
  { worker: "Driver", client: "Al-Faisal Holding", agency: "Pak Recruiting", intermediary: "None", agencyPays: 1900, clientPays: 14500, intermediaryFee: 1400 },
  { worker: "Domestic Worker", client: "Al-Otaibi Group", agency: "Global Manpower", intermediary: "None", agencyPays: 1500, clientPays: 12000, intermediaryFee: 1000 },
  { worker: "Domestic Worker", client: "Al-Otaibi Group", agency: "Lanka Recruit", intermediary: "None", agencyPays: 1200, clientPays: 10000, intermediaryFee: 800 },
  { worker: "Domestic Worker", client: "Al-Otaibi Group", agency: "Ethio Connect", intermediary: "None", agencyPays: 1000, clientPays: 9000, intermediaryFee: 700 },
  { worker: "Domestic Worker", client: "Bin Laden Group", agency: "East Africa Recruitment", intermediary: "None", agencyPays: 1300, clientPays: 11000, intermediaryFee: 900 },
  { worker: "Domestic Worker", client: "Bin Laden Group", agency: "Viet Labor", intermediary: "None", agencyPays: 1100, clientPays: 9500, intermediaryFee: 800 },
  { worker: "Domestic Worker", client: "Al-Faisal Holding", agency: "Himalaya Recruitment", intermediary: "None", agencyPays: 1000, clientPays: 9000, intermediaryFee: 700 },
  { worker: "Domestic Worker", client: "Al-Faisal Holding", agency: "East Africa Recruitment", intermediary: "None", agencyPays: 1100, clientPays: 9500, intermediaryFee: 800 },
  { worker: "Domestic Worker", client: "Saudi Co. Ltd", agency: "Indo Manpower", intermediary: "None", agencyPays: 1200, clientPays: 10000, intermediaryFee: 800 },
  { worker: "Cook", client: "Bin Laden Group", agency: "Star Recruitment", intermediary: "None", agencyPays: 1800, clientPays: 14000, intermediaryFee: 1200 },
  { worker: "Cook", client: "Bin Laden Group", agency: "Anatolia Recruitment", intermediary: "None", agencyPays: 2000, clientPays: 15000, intermediaryFee: 1500 },
  { worker: "Cook", client: "Al-Otaibi Group", agency: "Levant Recruitment", intermediary: "None", agencyPays: 1700, clientPays: 13000, intermediaryFee: 1100 },
  { worker: "Cook", client: "Al-Otaibi Group", agency: "Lanka Recruit", intermediary: "None", agencyPays: 1500, clientPays: 12000, intermediaryFee: 1000 },
  { worker: "Security", client: "Al-Faisal Holding", agency: "Himalaya Recruitment", intermediary: "None", agencyPays: 2000, clientPays: 16000, intermediaryFee: 1500 },
  { worker: "Security", client: "Al-Faisal Holding", agency: "Nile Recruitment", intermediary: "None", agencyPays: 1800, clientPays: 14000, intermediaryFee: 1200 },
  { worker: "Security", client: "Bin Laden Group", agency: "Nigeria Manpower", intermediary: "None", agencyPays: 2200, clientPays: 17000, intermediaryFee: 1800 },
  { worker: "Gardener", client: "Al-Faisal Holding", agency: "Pak Recruiting", intermediary: "None", agencyPays: 1400, clientPays: 11000, intermediaryFee: 1000 },
  { worker: "Cleaner", client: "Saudi Co. Ltd", agency: "Bangla Manpower", intermediary: "None", agencyPays: 1000, clientPays: 8000, intermediaryFee: 600 },
  { worker: "Cleaner", client: "Al-Otaibi Group", agency: "Viet Labor", intermediary: "None", agencyPays: 900, clientPays: 7500, intermediaryFee: 500 },
  { worker: "Driver", client: "Saudi Co. Ltd", agency: "Al-Rajhi Recruitment", intermediary: "Local Broker", agencyPays: 2000, clientPays: 15000, intermediaryFee: 2000 },
  { worker: "Driver", client: "Al-Otaibi Group", agency: "Global Manpower", intermediary: "Local Broker", agencyPays: 2200, clientPays: 16000, intermediaryFee: 2500 },
]

const candidatesData = [
  { name: "Ahmed Mohamed Ali",            nat: "Egyptian",     pass: "EG1234567", job: "Driver",     gender: "male",   agency: "Al-Rajhi Recruitment" },
  { name: "Mohamed Hassan Ibrahim",       nat: "Egyptian",     pass: "EG2345678", job: "Driver",     gender: "male",   agency: "Al-Rajhi Recruitment" },
  { name: "Mahmoud Abdel Fattah",          nat: "Egyptian",     pass: "EG3456789", job: "Driver",     gender: "male",   agency: "Al-Rajhi Recruitment" },
  { name: "Carlos Reyes Santos",           nat: "Filipino",     pass: "PH1234567", job: "Maid",       gender: "male",   agency: "Global Manpower" },
  { name: "Maria Lopez Garcia",            nat: "Filipino",     pass: "PH2345678", job: "Maid",       gender: "female", agency: "Global Manpower" },
  { name: "Juan Dela Cruz",                nat: "Filipino",     pass: "PH3456789", job: "Driver",     gender: "male",   agency: "Global Manpower" },
  { name: "Rajesh Kumar Sharma",           nat: "Indian",       pass: "IN1234567", job: "Driver",     gender: "male",   agency: "Star Recruitment" },
  { name: "Priya Singh Patel",             nat: "Indian",       pass: "IN2345678", job: "Maid",       gender: "female", agency: "Star Recruitment" },
  { name: "Amit Verma Gupta",              nat: "Indian",       pass: "IN3456789", job: "Cook",       gender: "male",   agency: "Star Recruitment" },
  { name: "Muhammad Usman Khan",           nat: "Pakistani",    pass: "PK1234567", job: "Driver",     gender: "male",   agency: "Pak Recruiting" },
  { name: "Ali Raza Qureshi",              nat: "Pakistani",    pass: "PK2345678", job: "Driver",     gender: "male",   agency: "Pak Recruiting" },
  { name: "Hassan Mahmood Dar",            nat: "Pakistani",    pass: "PK3456789", job: "Gardener",   gender: "male",   agency: "Pak Recruiting" },
  { name: "Md. Kamal Hossain",             nat: "Bangladeshi",  pass: "BD1234567", job: "Driver",     gender: "male",   agency: "Bangla Manpower" },
  { name: "Md. Rafiq Islam",               nat: "Bangladeshi",  pass: "BD2345678", job: "Driver",     gender: "male",   agency: "Bangla Manpower" },
  { name: "Mohammad Hasan Ali",            nat: "Bangladeshi",  pass: "BD3456789", job: "Cleaner",    gender: "male",   agency: "Bangla Manpower" },
  { name: "Nimal Perera Silva",            nat: "Sri Lankan",   pass: "LK1234567", job: "Maid",       gender: "male",   agency: "Lanka Recruit" },
  { name: "Saman Kumara Fernando",         nat: "Sri Lankan",   pass: "LK2345678", job: "Driver",     gender: "male",   agency: "Lanka Recruit" },
  { name: "Anura De Silva",                nat: "Sri Lankan",   pass: "LK3456789", job: "Cook",       gender: "male",   agency: "Lanka Recruit" },
  { name: "Bikram Tamang Sherpa",          nat: "Nepalese",     pass: "NP1234567", job: "Driver",     gender: "male",   agency: "Himalaya Recruitment" },
  { name: "Rajendra Thapa Gurung",         nat: "Nepalese",     pass: "NP2345678", job: "Security",   gender: "male",   agency: "Himalaya Recruitment" },
  { name: "Sita Devi Poudel",              nat: "Nepalese",     pass: "NP3456789", job: "Maid",       gender: "female", agency: "Himalaya Recruitment" },
  { name: "Budi Santoso Wijaya",           nat: "Indonesian",   pass: "ID1234567", job: "Maid",       gender: "male",   agency: "Indo Manpower" },
  { name: "Dewi Lestari Putri",            nat: "Indonesian",   pass: "ID2345678", job: "Maid",       gender: "female", agency: "Indo Manpower" },
  { name: "Nguyen Van Minh",               nat: "Vietnamese",   pass: "VN1234567", job: "Driver",     gender: "male",   agency: "Viet Labor" },
  { name: "Tran Thi Lan",                  nat: "Vietnamese",   pass: "VN2345678", job: "Maid",       gender: "female", agency: "Viet Labor" },
  { name: "Abebe Tesfaye Kebede",          nat: "Ethiopian",    pass: "ET1234567", job: "Maid",       gender: "male",   agency: "Ethio Connect" },
  { name: "Mekdes Hailu Desta",            nat: "Ethiopian",    pass: "ET2345678", job: "Maid",       gender: "female", agency: "Ethio Connect" },
  { name: "John Omondi Otieno",            nat: "Kenyan",       pass: "KE1234567", job: "Driver",     gender: "male",   agency: "East Africa Recruitment" },
  { name: "Grace Akinyi Odhiambo",         nat: "Kenyan",       pass: "KE2345678", job: "Maid",       gender: "female", agency: "East Africa Recruitment" },
  { name: "Samuel Kizza Mukasa",           nat: "Ugandan",      pass: "UG1234567", job: "Driver",     gender: "male",   agency: "East Africa Recruitment" },
  { name: "Nakato Namubiru",               nat: "Ugandan",      pass: "UG2345678", job: "Maid",       gender: "female", agency: "East Africa Recruitment" },
  { name: "Kwame Asante Mensah",           nat: "Ghanaian",     pass: "GH1234567", job: "Driver",     gender: "male",   agency: "West Africa Link" },
  { name: "Abena Osei Bonsu",              nat: "Ghanaian",     pass: "GH2345678", job: "Maid",       gender: "female", agency: "West Africa Link" },
  { name: "Chinonso Eze Nwosu",            nat: "Nigerian",     pass: "NG1234567", job: "Security",   gender: "male",   agency: "Nigeria Manpower" },
  { name: "Fatima Bello Usman",            nat: "Nigerian",     pass: "NG2345678", job: "Maid",       gender: "female", agency: "Nigeria Manpower" },
  { name: "Emmanuel Tata Nkwi",            nat: "Cameroonian",  pass: "CM1234567", job: "Driver",     gender: "male",   agency: "Central Africa Recruit" },
  { name: "Ahmed Adam Omer",               nat: "Sudanese",     pass: "SD1234567", job: "Driver",     gender: "male",   agency: "Nile Recruitment" },
  { name: "Khalid Hassan Idris",           nat: "Sudanese",     pass: "SD2345678", job: "Security",   gender: "male",   agency: "Nile Recruitment" },
  { name: "Omar Al-Hakim",                 nat: "Syrian",       pass: "SY1234567", job: "Cook",       gender: "male",   agency: "Levant Recruitment" },
  { name: "Hassan Al-Masri",               nat: "Jordanian",    pass: "JO1234567", job: "Driver",     gender: "male",   agency: "Levant Recruitment" },
  { name: "Ali Al-Amri",                   nat: "Yemeni",       pass: "YE1234567", job: "Driver",     gender: "male",   agency: "Gulf Recruit" },
  { name: "Mohammed Al-Shami",             nat: "Lebanese",     pass: "LB1234567", job: "Cook",       gender: "male",   agency: "Levant Recruitment" },
  { name: "Hassan Al-Mansouri",            nat: "Moroccan",     pass: "MA1234567", job: "Driver",     gender: "male",   agency: "North Africa Recruitment" },
  { name: "Youssef Benali",                nat: "Tunisian",     pass: "TN1234567", job: "Driver",     gender: "male",   agency: "North Africa Recruitment" },
  { name: "Karim Bouchareb",               nat: "Algerian",     pass: "DZ1234567", job: "Security",   gender: "male",   agency: "North Africa Recruitment" },
  { name: "Mehmet Yilmaz",                 nat: "Turkish",      pass: "TR1234567", job: "Driver",     gender: "male",   agency: "Anatolia Recruitment" },
  { name: "Ahmet Demir Kaya",              nat: "Turkish",      pass: "TR2345678", job: "Cook",       gender: "male",   agency: "Anatolia Recruitment" },
  { name: "Aliyu Mohammed",                nat: "Nigerian",     pass: "NG3456789", job: "Driver",     gender: "male",   agency: "Nigeria Manpower" },
  { name: "Kebede Wolde",                  nat: "Ethiopian",    pass: "ET3456789", job: "Driver",     gender: "male",   agency: "Ethio Connect" },
  { name: "Pham Quoc Anh",                 nat: "Vietnamese",   pass: "VN3456789", job: "Cleaner",    gender: "male",   agency: "Viet Labor" },
]

async function clearTenantData(tenantId) {
  console.log("\n🧹 Clearing existing data for tenant...")
  const tables = [
    "commission_rules",
    "notifications",
    "activity_logs",
    "tasks",
    "financial_transactions",
    "documents",
    "cases",
    "candidates",
    "agencies",
    "clients",
    "intermediaries",
    "worker_types",
  ]
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("tenant_id", tenantId)
    if (error) console.warn(`  ⚠️  Could not clear ${table}: ${error.message}`)
    else console.log(`  ✅ Cleared ${table}`)
  }
}

async function main() {
  console.log("Connecting to Supabase...")

  // 1. Get or create tenant
  let tenantId
  const { data: tenants } = await supabase.from("tenants").select("id").limit(1)
  if (tenants?.length) {
    tenantId = tenants[0].id
    console.log("Using existing tenant:", tenantId)
  } else {
    const { data: t, error: te } = await supabase
      .from("tenants").insert({ name: "YIC Recruitment", slug: "yic-recruitment" }).select("id").single()
    if (te) throw new Error("Tenant: " + te.message)
    tenantId = t.id
    console.log("Created tenant:", tenantId)
  }

  if (shouldClear) {
    await clearTenantData(tenantId)
  }

  // 2. Insert worker types
  const { data: wtData, error: wtErr } = await supabase
    .from("worker_types").insert(workerTypesData.map(w => ({ ...w, tenant_id: tenantId }))).select()
  if (wtErr) throw new Error("Worker types: " + wtErr.message)
  const wtMap = Object.fromEntries(wtData.map(w => [w.name_en, w.id]))
  console.log(wtData.length + " worker types inserted")

  // 3. Insert intermediaries
  const { data: imData, error: imErr } = await supabase
    .from("intermediaries").insert(intermediariesData.map(i => ({ ...i, tenant_id: tenantId }))).select()
  if (imErr) throw new Error("Intermediaries: " + imErr.message)
  const imMap = Object.fromEntries(imData.map(i => [i.name, i.id]))
  console.log(imData.length + " intermediaries inserted")

  // 4. Insert clients
  const { data: clData, error: clErr } = await supabase
    .from("clients").insert(clientsData.map(c => ({ ...c, tenant_id: tenantId }))).select()
  if (clErr) throw new Error("Clients: " + clErr.message)
  const clMap = Object.fromEntries(clData.map(c => [c.company_name, c.id]))
  console.log(clData.length + " clients inserted")

  // 5. Insert agencies
  const { data: agData, error: agErr } = await supabase
    .from("agencies").insert(agenciesData.map(a => ({ ...a, tenant_id: tenantId }))).select()
  if (agErr) throw new Error("Agencies: " + agErr.message)
  const agMap = Object.fromEntries(agData.map(a => [a.agency_name, a.id]))
  console.log(agData.length + " agencies inserted")

  // 6. Insert commission rules
  const rules = commissionRulesData.map(r => ({
    tenant_id: tenantId,
    worker_type_id: wtMap[r.worker],
    external_agency_id: agMap[r.agency],
    saudi_client_id: clMap[r.client],
    intermediary_id: imMap[r.intermediary],
    agency_pays_us: r.agencyPays,
    client_pays_us: r.clientPays,
    intermediary_fee: r.intermediaryFee,
  }))
  const { error: crErr } = await supabase.from("commission_rules").insert(rules)
  if (crErr) throw new Error("Commission rules: " + crErr.message)
  console.log(rules.length + " commission rules inserted")

  // 7. Insert candidates
  const candidates = candidatesData.map(c => ({
    tenant_id: tenantId,
    full_name: c.name,
    nationality: c.nat,
    passport_number: c.pass,
    job_role: c.job,
    gender: c.gender,
    agency_id: agMap[c.agency] || null,
    medical_status: "not_started",
    current_status: "new",
  }))
  const { data: candData, error: candErr } = await supabase.from("candidates").insert(candidates).select()
  if (candErr) throw new Error("Candidates: " + candErr.message)
  console.log(candData.length + " candidates inserted")

  console.log("\nDone! All data seeded successfully.")
  console.log("Refresh your Lovable app to see the data.")
}

main().catch(e => { console.error("Error:", e.message); process.exit(1) })
