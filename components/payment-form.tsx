"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Copy, CheckCircle, QrCode } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  config: {
    pix_key: string
    pix_type: string
    account_holder: string
    total_monthly_cost: number
    number_of_members: number
    paying_members?: number
  } | null
  perPersonAmount: string
}

export function PaymentForm({ config, perPersonAmount }: PaymentFormProps) {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const copyPixKey = () => {
    if (config?.pix_key) {
      navigator.clipboard.writeText(config.pix_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      let receiptUrl = null

      console.log("[v0] Starting payment submission for:", name)

      // Upload receipt if provided
      if (file) {
        console.log("[v0] Uploading receipt file:", file.name)
        const formData = new FormData()
        formData.append("file", file)

        const uploadResponse = await fetch("/api/upload-receipt", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("[v0] Upload failed with status:", uploadResponse.status, errorText)
          throw new Error(`Failed to upload receipt: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        receiptUrl = uploadData.url
        console.log("[v0] Receipt uploaded successfully:", receiptUrl)
      }

      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

      const paymentData = {
        member_name: name,
        amount: Number.parseFloat(perPersonAmount),
        receipt_url: receiptUrl,
        status: receiptUrl ? "paid" : "pending",
        notes: notes || null,
        payment_month: currentMonth,
      }

      console.log("[v0] Inserting payment data:", paymentData)

      // Insert payment record
      const { data, error } = await supabase.from("payments").insert(paymentData).select()

      if (error) {
        console.error("[v0] Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("[v0] Payment inserted successfully:", data)

      setSuccess(true)
      setName("")
      setNotes("")
      setFile(null)

      // Reset form and refresh after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("[v0] Error submitting payment:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao registrar pagamento: ${errorMessage}. Tente novamente.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Configuração não encontrada. Por favor, configure o sistema primeiro.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-green-100">
      <CardHeader className="space-y-1 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="text-2xl">Fazer Pagamento</CardTitle>
        <CardDescription>Valor individual: R$ {perPersonAmount} por mês</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-xl font-semibold text-green-700">Pagamento registrado com sucesso!</p>
          </div>
        ) : (
          <>
            {/* Pix Information */}
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-green-700" />
                <h3 className="font-semibold text-green-900">Informações do Pix</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Tipo de chave</p>
                  <p className="font-medium text-gray-900 capitalize">{config.pix_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chave Pix</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">{config.pix_key}</code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={copyPixKey}
                      className="shrink-0 bg-transparent"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nome do favorecido</p>
                  <p className="font-medium text-gray-900">{config.account_holder}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="text-2xl font-bold text-green-700">R$ {perPersonAmount}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome *</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Comprovante (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500">Envie uma foto ou PDF do comprovante de pagamento</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação sobre o pagamento?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Registrando..."
                ) : file ? (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Registrar Pagamento com Comprovante
                  </>
                ) : (
                  "Registrar que Paguei"
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
