'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link' // Importación faltante agregada
import { Search, MessageSquare, CalendarCheck, Camera, Star, ShieldCheck } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-24">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8 text-black">
              Tu próximo gran proyecto empieza en un espacio único.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              RentyClub es el puente entre mentes creativas y espacios con personalidad. 
            </p>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-32 text-black">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100">
                <Search size={28} />
              </div>
              <h3 className="text-2xl font-bold text-black">1. Explorá el Club</h3>
              <p className="text-gray-500">Usá nuestros filtros para encontrar el espacio que encaje con tu estética.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-2xl font-bold text-black">2. Conectá Directo</h3>
              <p className="text-gray-500">Hablá con el dueño a través de nuestro chat interno.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100">
                <CalendarCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-black">3. Reservá y Creá</h3>
              <p className="text-gray-500">Confirmá las fechas y realizá el pago seguro.</p>
            </div>
          </section>

          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-black">¿Listo para empezar?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/create" className="bg-black text-white px-8 py-4 rounded-2xl font-bold transition hover:bg-gray-800">
                Publicar mi Espacio
              </Link>
              <Link href="/" className="bg-gray-100 text-black px-8 py-4 rounded-2xl font-bold transition hover:bg-gray-200">
                Buscar un Lugar
              </Link>
            </div>
          </div>
        </div>
      </main>
    
    </div>
  )
}