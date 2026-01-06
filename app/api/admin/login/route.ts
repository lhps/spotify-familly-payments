import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Login attempt for username:", username)

    if (!username || !password) {
      return NextResponse.json({ error: "Username e senha são obrigatórios" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("[v0] Querying admins table for username:", username)

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", username)
      .single()

    console.log("[v0] Query result - admin:", admin, "error:", error)

    if (error || !admin) {
      console.log("[v0] Admin not found or error occurred")
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    console.log("[v0] Admin found, comparing passwords")
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    console.log("[v0] Login successful for admin:", admin.id)
    return NextResponse.json({ success: true, sessionToken: admin.id })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
