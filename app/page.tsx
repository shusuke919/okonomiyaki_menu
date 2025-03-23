import OrderForm from "@/components/order-form"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#8C2D18]">芦屋 お好み焼き 寛 中目黒店</h1>
          <p className="text-lg text-[#594A3C] mt-2">熟練の技が光る、米粉のお好み焼＆ネギ焼き</p>
        </div>
        <OrderForm />
      </div>
      <Toaster />
    </main>
  )
}

