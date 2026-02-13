'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const faqs = [
    { q: "¿Es gratis publicar?", a: "Sí, publicar en RentyClub es totalmente gratuito. Solo cobramos una pequeña comisión cuando se confirma una reserva." },
    { q: "¿Cómo se procesan los pagos?", a: "Usamos pasarelas de pago seguras y encriptadas. El dinero se libera al dueño una vez que el alquiler se completa con éxito." },
    { q: "¿Qué pasa si tengo que cancelar?", a: "Cada espacio tiene su política de cancelación. Podés verla en el detalle de la propiedad antes de reservar." }
  ]

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center gap-4 mb-8">
            <HelpCircle size={32} className="text-black" />
            <h1 className="text-4xl font-bold tracking-tighter text-black">Preguntas Frecuentes</h1>
        </div>
        <div className="space-y-12">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-xl font-bold text-black">{f.q}</h3>
              <p className="text-gray-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
   
    </div>
  )
}