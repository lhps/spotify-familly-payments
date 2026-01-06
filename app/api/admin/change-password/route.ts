import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, adminToken } = await request.json()

    if (!adminToken) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senhas são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", adminToken)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from("admins")
      .update({ password_hash: hashedNewPassword })
      .eq("id", admin.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}
