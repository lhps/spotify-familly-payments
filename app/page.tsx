import { createClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/payment-form"

export default async function Home() {
  const supabase = await createClient()

  // Fetch configuration
  const { data: config } = await supabase.from("spotify_config").select("*").single()

  const perPersonAmount = config ? (config.total_cost / config.number_of_members).toFixed(2) : "0.00"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Pagamento Spotify Family</h1>
            <p className="text-lg text-gray-600">Contribua com sua parte do plano familiar</p>
          </div>

          {/* Payment Form */}
          <PaymentForm config={config} perPersonAmount={perPersonAmount} />
        </div>
      </div>
    </div>
  )
}
