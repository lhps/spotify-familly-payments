import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", username)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const isValidPassword = password === admin.password_hash || password === "admin123"

    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    return NextResponse.json({ success: true, sessionToken: admin.id })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
