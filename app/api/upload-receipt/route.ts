import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Upload receipt API called")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Uploading file to Vercel Blob:", file.name, "Size:", file.size)

    const timestamp = Date.now()
    const uniqueFileName = `receipt-${timestamp}-${file.name}`

    const blob = await put(uniqueFileName, file, {
      access: "public",
    })

    console.log("[v0] File uploaded successfully:", blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Error uploading receipt:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to upload receipt: ${errorMessage}` }, { status: 500 })
  }
}
