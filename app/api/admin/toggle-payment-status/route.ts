import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, newStatus } = await request.json()

    if (!paymentId || !newStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("payments")
      .update({ status: newStatus })
      .eq("id", paymentId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating payment status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, payment: data })
  } catch (error: any) {
    console.error("[v0] Error in toggle-payment-status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
