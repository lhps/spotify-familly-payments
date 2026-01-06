"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ConfigSection } from "@/components/config-section"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { CurrentMonthPayments } from "@/components/current-month-payments"
import { PastMonthsHistory } from "@/components/past-months-history"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("admin_session")
    if (!sessionToken) {
      router.push("/admin/login")
      return
    }

    setIsAuthenticated(true)
    loadData()
  }, [router])

  const loadData = async () => {
    console.log("[v0] Loading admin data...")
    const supabase = createClient()

    try {
      // Fetch configuration
      console.log("[v0] Fetching configuration...")
      const { data: configData, error: configError } = await supabase.from("spotify_config").select("*").single()

      if (configError) {
        console.error("[v0] Config error:", configError)
      } else {
        console.log("[v0] Config loaded:", configData)
        setConfig(configData)
      }

      // Fetch payments
      console.log("[v0] Fetching payments...")
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (paymentsError) {
        console.error("[v0] Payments error:", paymentsError)
      } else {
        console.log("[v0] Payments loaded:", paymentsData?.length, "payments")
        setPayments(paymentsData || [])
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Spotify Family payment settings</p>
            </div>
            <div className="flex gap-2">
              <ChangePasswordDialog onPasswordChanged={loadData} />
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Public Page
                </Link>
              </Button>
              <LogoutButton />
            </div>
          </div>

          <CurrentMonthPayments payments={payments} config={config} onUpdate={loadData} />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Config Section */}
            <ConfigSection config={config} onConfigUpdate={loadData} />

            <PastMonthsHistory payments={payments} />
          </div>
        </div>
      </div>
    </div>
  )
}
