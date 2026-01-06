"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Payment {
  id: string
  member_name: string
  amount: number
  payment_date: string
  receipt_url: string | null
  status: string
  notes: string | null
  payment_month?: string
}

interface PastMonthsHistoryProps {
  payments: Payment[]
}

export function PastMonthsHistory({ payments }: PastMonthsHistoryProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const pastPayments = payments.filter((p) => {
    const paymentMonth = p.payment_month || p.payment_date?.slice(0, 7)
    return paymentMonth && paymentMonth < currentMonth
  })

  // Group by month
  const paymentsByMonth = pastPayments.reduce(
    (acc, payment) => {
      const month = payment.payment_month || payment.payment_date?.slice(0, 7) || "unknown"
      if (!acc[month]) acc[month] = []
      acc[month].push(payment)
      return acc
    },
    {} as Record<string, Payment[]>,
  )

  const months = Object.keys(paymentsByMonth).sort((a, b) => b.localeCompare(a))

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMonthTotal = (monthPayments: Payment[]) => {
    return monthPayments.reduce((sum, p) => sum + p.amount, 0)
  }

  if (months.length === 0) {
    return (
      <Card className="shadow-lg border-slate-100">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
          <CardTitle className="text-2xl">Histórico de Meses Anteriores</CardTitle>
          <CardDescription>Pagamentos de meses passados</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhum histórico de meses anteriores ainda</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-slate-100">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardTitle className="text-2xl">Histórico de Meses Anteriores</CardTitle>
        <CardDescription>{months.length} meses com pagamentos registrados</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {months.map((month) => {
          const monthPayments = paymentsByMonth[month]
          const isExpanded = expandedMonth === month
          const totalPaid = getMonthTotal(monthPayments)

          return (
            <div key={month} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedMonth(isExpanded ? null : month)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{formatMonth(month)}</p>
                    <p className="text-sm text-gray-600">{monthPayments.length} pagamentos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg text-gray-900">R$ {totalPaid.toFixed(2)}</p>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 bg-white space-y-3 border-t">
                  {monthPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{payment.member_name}</p>
                        <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-green-700">R$ {payment.amount.toFixed(2)}</p>
                        {payment.status === "paid" || payment.status === "confirmed" ? (
                          <Badge className="bg-green-100 text-green-700">Pago</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Pendente
                          </Badge>
                        )}
                        {payment.receipt_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
