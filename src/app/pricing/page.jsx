'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check, Shield, Zap, Star, Store, RotateCcw } from 'lucide-react' // Importaciones faltantes agregadas

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 text-black">
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Transparencia</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mt-6 mb-6">Simple, claro y sin costos ocultos.</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 text-black">
            <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 flex flex-col justify-between text-black">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6"><Store className="text-black" size={24} /></div>
                <h2 className="text-2xl font-bold mb-4 text-black">Para Dueños</h2>
                <p className="text-gray-500 mb-8">Publicar tu espacio es y siempre será gratuito.</p>
                <div className="flex items-baseline gap-2 mt-8"><span className="text-5xl font-bold text-black">10%</span><span className="text-gray-500 font-medium">de comisión</span></div>
              </div>
            </div>

            <div className="bg-black p-10 rounded-3xl text-white flex flex-col justify-between shadow-2xl">
              <div>
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6"><Zap className="text-white" size={24} /></div>
                <h2 className="text-2xl font-bold mb-4 text-white">Para Creadores</h2>
                <p className="text-gray-400 mb-8">Accedé a los espacios más exclusivos.</p>
                <div className="flex items-baseline gap-2 mt-8"><span className="text-5xl font-bold text-white">3%</span><span className="text-gray-400 font-medium">service fee</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    
    </div>
  )
}