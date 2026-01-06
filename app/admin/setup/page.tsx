"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function AdminSetupPage() {
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [hash, setHash] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    setMessage("")
    setHash("")

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setHash(data.hash)
      } else {
        setMessage(data.error || "Erro ao configurar admin")
      }
    } catch (error) {
      setMessage("Erro ao configurar admin")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Admin</CardTitle>
          <CardDescription>Configure o usuário admin com a senha desejada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha do Admin</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>

          <Button onClick={handleSetup} disabled={loading} className="w-full">
            {loading ? "Configurando..." : "Configurar Admin"}
          </Button>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("sucesso") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {hash && (
            <div className="p-3 rounded-lg text-xs bg-gray-100 text-gray-800 break-all">
              <strong>Hash gerado:</strong>
              <br />
              {hash}
            </div>
          )}

          {message.includes("sucesso") && (
            <div className="text-center">
              <a href="/admin/login" className="text-green-600 hover:underline text-sm">
                Ir para o login →
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
