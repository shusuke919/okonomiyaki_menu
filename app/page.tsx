import OrderForm from "@/components/order-form"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#8C2D18]">大阪屋</h1>
          <p className="text-lg text-[#594A3C] mt-2">本格的なお好み焼きをご自宅で</p>
        </div>
        <OrderForm />
      </div>
      <Toaster />
    </main>
  )
}

