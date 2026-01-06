import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Use default password if none provided
    const adminPassword = password || "admin123"

    const supabase = await createClient()

    // Check if admin already exists
    const { data: existingAdmin } = await supabase.from("admins").select("id").eq("username", "admin").single()

    // Generate proper bcrypt hash
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    console.log("[v0] Generated password hash:", passwordHash)

    if (existingAdmin) {
      // Update existing admin with new hash
      const { error: updateError } = await supabase
        .from("admins")
        .update({ password_hash: passwordHash })
        .eq("username", "admin")

      if (updateError) {
        console.error("[v0] Error updating admin:", updateError)
        return NextResponse.json({ error: "Erro ao atualizar admin" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Admin atualizado com sucesso",
        hash: passwordHash,
      })
    } else {
      // Create new admin
      const { error: insertError } = await supabase
        .from("admins")
        .insert([{ username: "admin", password_hash: passwordHash }])

      if (insertError) {
        console.error("[v0] Error creating admin:", insertError)
        return NextResponse.json({ error: "Erro ao criar admin" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Admin criado com sucesso",
        hash: passwordHash,
      })
    }
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Erro no setup" }, { status: 500 })
  }
}
