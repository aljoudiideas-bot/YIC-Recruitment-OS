export type UserRole = "admin" | "operations_manager" | "recruiter" | "finance_officer" | "external_agency"

export type CaseStage =
  | "new_request"
  | "documents_collection"
  | "medical"
  | "visa_processing"
  | "ticketing"
  | "departure"
  | "arrival"
  | "completed"
  | "cancelled"

export type CaseStatus = "active" | "on_hold" | "completed" | "cancelled"

export type CasePriority = "low" | "normal" | "high" | "urgent"

export type DocumentType = "passport" | "visa" | "medical_report" | "contract" | "ticket" | "other"

export type DocumentStatus = "pending" | "verified" | "expired" | "missing"

export type TaskStatus = "to_do" | "in_progress" | "done" | "cancelled"

export type TaskPriority = "low" | "normal" | "high" | "urgent"

export type NotificationType = "visa_delay" | "missing_document" | "payment_overdue" | "stage_change" | "task_due" | "general"

export type TransactionType = "client_payment" | "agency_commission" | "operational_cost" | "other"

export type ClientStatus = "active" | "inactive" | "blocked"

export type AgencyStatus = "active" | "inactive" | "suspended"

export type CandidateStatus = "new" | "in_process" | "deployed" | "cancelled"

export type MedicalStatus = "pending" | "passed" | "failed" | "not_started"

export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  tenantId: string
  fullName: string
  email: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  tenantId: string
  companyName: string
  industry: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  commercialRegistration: string | null
  status: ClientStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Agency {
  id: string
  tenantId: string
  agencyName: string
  country: string
  commissionRate: number
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  rating: number
  status: AgencyStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Candidate {
  id: string
  tenantId: string
  fullName: string
  nationality: string
  passportNumber: string
  passportExpiry: string | null
  dateOfBirth: string | null
  gender: "male" | "female" | null
  phone: string | null
  email: string | null
  jobRole: string
  agencyId: string | null
  medicalStatus: MedicalStatus
  currentStatus: CandidateStatus
  photoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface RecruitmentCase {
  id: string
  tenantId: string
  caseNumber: string
  candidateId: string
  clientId: string
  agencyId: string
  currentStage: CaseStage
  priority: CasePriority
  expectedArrival: string | null
  actualArrival: string | null
  status: CaseStatus
  assignedTo: string | null
  notes: string | null
  workerTypeId: string | null
  intermediaryId: string | null
  createdAt: string
  updatedAt: string
  candidate?: Candidate
  client?: Client
  agency?: Agency
  worker_type?: WorkerType
  intermediary?: Intermediary
}

export interface WorkerType {
  id: string
  tenantId: string
  nameAr: string
  nameEn: string
  createdAt: string
}

export interface Intermediary {
  id: string
  tenantId: string
  name: string
  createdAt: string
}

export interface CommissionRule {
  id: string
  tenantId: string
  workerTypeId: string
  externalAgencyId: string | null
  saudiClientId: string | null
  intermediaryId: string | null
  agencyPaysUs: number
  clientPaysUs: number
  intermediaryFee: number
}

export interface Document {
  id: string
  tenantId: string
  caseId: string
  documentType: DocumentType
  fileUrl: string
  fileName: string
  fileSize: number | null
  status: DocumentStatus
  expiryDate: string | null
  uploadedBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface FinancialTransaction {
  id: string
  tenantId: string
  caseId: string | null
  transactionType: TransactionType
  amount: number
  currency: string
  description: string | null
  transactionDate: string
  referenceNumber: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  tenantId: string
  caseId: string | null
  title: string
  description: string | null
  assignedTo: string | null
  dueDate: string | null
  status: TaskStatus
  priority: TaskPriority
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  tenantId: string
  userId: string | null
  entityType: string
  entityId: string
  action: string
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  description: string | null
  createdAt: string
}

export interface Notification {
  id: string
  tenantId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedEntityType: string | null
  relatedEntityId: string | null
  createdAt: string
}

export interface DashboardMetrics {
  activeCases: number
  monthlyRevenue: number
  netProfit: number
  delayedCases: number
  pendingDocuments: number
  arrivalsThisWeek: number
  caseStatusDistribution: { stage: string; count: number }[]
  profitByCountry: { country: string; profit: number }[]
  revenueTrend: { month: string; revenue: number; profit: number }[]
}
