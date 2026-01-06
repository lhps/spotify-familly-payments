"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink, DollarSign, Users, TrendingUp, CheckCheck, XCircle } from "lucide-react"
import { useState } from "react"

interface Payment {
  id: string
  member_name: string
  amount: number
  payment_date: string
  receipt_url: string | null
  status: string
  notes: string | null
  payment_month: string
}

interface CurrentMonthPaymentsProps {
  payments: Payment[]
  config: any
  onUpdate: () => void
}

export function CurrentMonthPayments({ payments, config, onUpdate }: CurrentMonthPaymentsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const currentMonthPayments = payments.filter((p) => p.payment_month === currentMonth)

  const totalPaid = currentMonthPayments
    .filter((p) => p.status === "paid" || p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPlan = config?.total_monthly_cost || 0
  const remaining = totalPlan - totalPaid
  const payingMembers = config?.paying_members || config?.number_of_members || 0
  const paidCount = currentMonthPayments.filter((p) => p.status === "paid" || p.status === "confirmed").length
  const pendingCount = currentMonthPayments.filter((p) => p.status === "pending").length

  const handleToggleStatus = async (paymentId: string, currentStatus: string) => {
    setLoading(paymentId)
    try {
      const newStatus = currentStatus === "paid" ? "pending" : "paid"
      const response = await fetch("/api/admin/toggle-payment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, newStatus }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error toggling payment status:", error)
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]
    return `${monthNames[Number.parseInt(monthNum) - 1]} ${year}`
  }

  return (
    <Card className="shadow-lg border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="text-2xl">Pagamentos - {formatMonth(currentMonth)}</CardTitle>
        <CardDescription>Resumo e controle dos pagamentos do mês atual</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <DollarSign className="w-4 h-4" />
              <p className="text-xs font-medium">Total do Plano</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">R$ {totalPlan.toFixed(2)}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs font-medium">Já Pago</p>
            </div>
            <p className="text-2xl font-bold text-green-900">R$ {totalPaid.toFixed(2)}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <Clock className="w-4 h-4" />
              <p className="text-xs font-medium">Faltam</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">R$ {remaining.toFixed(2)}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <Users className="w-4 h-4" />
              <p className="text-xs font-medium">Pagantes</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {paidCount}/{payingMembers}
            </p>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-green-600" />
            Pagos ({paidCount})
          </h3>
          {currentMonthPayments
            .filter((p) => p.status === "paid" || p.status === "confirmed")
            .map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{payment.member_name}</p>
                  <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                  <p className="text-lg font-bold text-green-700 mt-1">R$ {payment.amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.receipt_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(payment.id, payment.status)}
                    disabled={loading === payment.id}
                    className="bg-white"
                  >
                    {loading === payment.id ? "..." : "Marcar Pendente"}
                  </Button>
                </div>
              </div>
            ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-orange-600" />
            Pendentes ({pendingCount})
          </h3>
          {currentMonthPayments
            .filter((p) => p.status === "pending")
            .map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{payment.member_name}</p>
                  <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                  <p className="text-lg font-bold text-orange-700 mt-1">R$ {payment.amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.receipt_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleToggleStatus(payment.id, payment.status)}
                    disabled={loading === payment.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading === payment.id ? "..." : "Marcar Pago"}
                  </Button>
                </div>
              </div>
            ))}
          {pendingCount === 0 && <p className="text-center text-gray-500 py-4">Nenhum pagamento pendente</p>}
        </div>
      </CardContent>
    </Card>
  )
}
