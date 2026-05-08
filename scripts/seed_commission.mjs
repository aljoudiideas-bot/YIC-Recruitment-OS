import { createClient } from '@supabase/supabase-js'
const admin = createClient('https://fgokxqgkuobwjnomsqew.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2t4cWdrdW9id2pub21zcWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEzOTMyOSwiZXhwIjoyMDkzNzE1MzI5fQ.PXJpbytPP5oSvEN9nmMeqIH1cxztx5OhnMHgUkHrCdA', { auth: { autoRefreshToken: false, persistSession: false } })

const TID = '00000000-0000-0000-0000-000000000001'

// 1. Seed worker_types
const workerTypes = [
  { tenant_id: TID, name_ar: 'عاملة منزلية', name_en: 'Domestic Worker' },
  { tenant_id: TID, name_ar: 'سائق', name_en: 'Driver' },
  { tenant_id: TID, name_ar: 'عاملة مزرعة', name_en: 'Farm Worker' },
  { tenant_id: TID, name_ar: 'مربية أطفال', name_en: 'Nanny' },
  { tenant_id: TID, name_ar: 'ممرضة منزلية', name_en: 'Home Nurse' },
  { tenant_id: TID, name_ar: 'طباخ', name_en: 'Cook' },
]

const { data: wtData, error: wtErr } = await admin.from('worker_types').insert(workerTypes).select()
if (wtErr) { console.log('worker_types ERR:', wtErr.message); process.exit(1) }
console.log(`✓ ${wtData.length} worker types created`)
const wtMap = Object.fromEntries(wtData.map(w => [w.name_en.toLowerCase(), w.id]))

// 2. Seed intermediaries
const intermediaries = [
  { tenant_id: TID, name: 'n' },
  { tenant_id: TID, name: 'm' },
  { tenant_id: TID, name: 'ch' },
]

const { data: intData, error: intErr } = await admin.from('intermediaries').insert(intermediaries).select()
if (intErr) { console.log('intermediaries ERR:', intErr.message); process.exit(1) }
console.log(`✓ ${intData.length} intermediaries created`)
const intMap = Object.fromEntries(intData.map(i => [i.name.toLowerCase(), i.id]))

// 3. Get agencies and clients
const { data: agencies } = await admin.from('agencies').select('id, agency_name')
const { data: clients } = await admin.from('clients').select('id, company_name')
const agencyMap = Object.fromEntries((agencies || []).map(a => [a.agency_name.toLowerCase(), a.id]))
const clientMap = Object.fromEntries((clients || []).map(c => [c.company_name.toLowerCase(), c.id]))

console.log(`\nAgencies: ${agencies?.length || 0}, Clients: ${clients?.length || 0}`)
console.log(`\nReady to import commission rules from CSV.`)
console.log('\nWorker types:', Object.fromEntries(wtData.map(w => [w.name_en, w.id])))
console.log('Intermediaries:', Object.fromEntries(intData.map(i => [i.name, i.id])))
