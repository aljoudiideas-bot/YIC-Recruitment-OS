"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, X } from "lucide-react"

export function DocumentUploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<{ id: string; case_number: string }[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const fetchCases = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("cases")
        .select("id, case_number")
        .order("case_number")
      if (data) setCases(data)
    }
    fetchCases()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedFile) {
      alert("Please select a file to upload")
      return
    }

    setLoading(true)
    setUploadProgress(10)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const caseId = formData.get("case_id") as string

    if (!caseId) {
      alert("Please select a case")
      setLoading(false)
      return
    }

    const fileExt = selectedFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${caseId}/${fileName}`

    setUploadProgress(30)

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      })

    setUploadProgress(70)

    if (uploadError) {
      setLoading(false)
      setUploadProgress(0)
      if (uploadError.message.includes("not found") || uploadError.message.includes("bucket")) {
        alert("Storage bucket 'documents' does not exist. Please create it in Supabase Dashboard first.")
      } else {
        alert("Upload error: " + uploadError.message)
      }
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath)

    setUploadProgress(90)

    const { error: dbError } = await supabase.from("documents").insert({
      case_id: caseId,
      document_type: formData.get("document_type"),
      file_url: publicUrl,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      status: "pending",
      expiry_date: (formData.get("expiry_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })

    setUploadProgress(100)
    setLoading(false)

    if (dbError) {
      alert("Database error: " + dbError.message)
    } else {
      router.push("/documents")
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Upload Document</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Related Case</label>
          <select name="case_id" required className="w-full border p-2 rounded">
            <option value="">Select case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.case_number}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <select name="document_type" required className="w-full border p-2 rounded">
            <option value="">Select type</option>
            <option value="passport">Passport</option>
            <option value="visa">Visa</option>
            <option value="medical_report">Medical Report</option>
            <option value="contract">Contract</option>
            <option value="ticket">Ticket</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to select a file</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
          <input name="expiry_date" type="date" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
          <textarea name="notes" rows={2} className="w-full border p-2 rounded" />
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !selectedFile}>
            {loading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </div>
  )
}
