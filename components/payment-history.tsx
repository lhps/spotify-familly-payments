"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Payment {
  id: string
  member_name: string
  amount: number
  payment_date: string
  receipt_url: string | null
  status: string
  notes: string | null
}

interface PaymentHistoryProps {
  payments: Payment[]
  onUpdate?: () => void
}

export function PaymentHistory({ payments, onUpdate }: PaymentHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )
    }
  }

  return (
    <Card className="shadow-lg border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-2xl">Histórico de Pagamentos</CardTitle>
        <CardDescription>Últimos {payments.length} pagamentos registrados</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhum pagamento registrado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{payment.member_name}</p>
                    <p className="text-sm text-gray-500">{formatDate(payment.payment_date)}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-lg text-green-700">R$ {payment.amount.toFixed(2)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>

                {payment.notes && <p className="text-sm text-gray-600 italic">{payment.notes}</p>}

                {payment.receipt_url && (
                  <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                    <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Comprovante
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
