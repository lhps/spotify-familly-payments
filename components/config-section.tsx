"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ConfigSectionProps {
  config: {
    id: string
    pix_key: string
    pix_holder_name: string
    total_cost: number
    number_of_members: number
    paying_members: number
    due_date: string
  } | null
  onConfigUpdate?: () => void
}

export function ConfigSection({ config, onConfigUpdate }: ConfigSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [pixKey, setPixKey] = useState(config?.pix_key || "")
  const [pixHolderName, setPixHolderName] = useState(config?.pix_holder_name || "")
  const [totalCost, setTotalCost] = useState(config?.total_cost.toString() || "34.90")
  const [members, setMembers] = useState(config?.number_of_members.toString() || "6")
  const [payingMembers, setPayingMembers] = useState(config?.paying_members.toString() || "5")
  const [dueDate, setDueDate] = useState(config?.due_date || "5")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("spotify_config")
        .update({
          pix_key: pixKey,
          pix_holder_name: pixHolderName,
          total_cost: Number.parseFloat(totalCost),
          number_of_members: Number.parseInt(members),
          paying_members: Number.parseInt(payingMembers),
          due_date: dueDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config?.id)

      if (error) throw error

      setIsEditing(false)
      if (onConfigUpdate) onConfigUpdate()
    } catch (error) {
      console.error("Error updating config:", error)
      alert("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!config) return null

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>Gerencie as informações do plano e pagamento</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pix-key">Chave Pix</Label>
              <Input id="pix-key" value={pixKey} onChange={(e) => setPixKey(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix-holder-name">Nome do Titular</Label>
              <Input
                id="pix-holder-name"
                value={pixHolderName}
                onChange={(e) => setPixHolderName(e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-cost">Valor Total (R$)</Label>
                <Input
                  id="total-cost"
                  type="number"
                  step="0.01"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="members">Total de Membros</Label>
                <Input
                  id="members"
                  type="number"
                  min="1"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paying-members">Pagantes</Label>
                <Input
                  id="paying-members"
                  type="number"
                  min="1"
                  value={payingMembers}
                  onChange={(e) => setPayingMembers(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Dia do Vencimento</Label>
                <Input
                  id="due-date"
                  type="number"
                  min="1"
                  max="31"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">R$ {config.total_cost.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Membros</p>
              <p className="text-xl font-bold text-gray-900">{config.number_of_members} pessoas</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pagantes</p>
              <p className="text-xl font-bold text-gray-900">{config.paying_members} pessoas</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Vencimento</p>
              <p className="text-xl font-bold text-gray-900">Dia {config.due_date}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
