'use client'
import Link from 'next/link'
import { Instagram, Twitter, Mail, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 text-black">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* LOGO E INFO */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl tracking-tighter">RentyClub.</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            La comunidad exclusiva para conectar espacios únicos con experiencias inolvidables.
          </p>
          <div className="flex gap-4">
            <Instagram size={20} className="text-gray-400 hover:text-black cursor-pointer transition" />
            <Twitter size={20} className="text-gray-400 hover:text-black cursor-pointer transition" />
            <Mail size={20} className="text-gray-400 hover:text-black cursor-pointer transition" />
          </div>
        </div>

        {/* PLATAFORMA */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Plataforma</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><Link href="/how-it-works" className="hover:text-black transition">Cómo funciona</Link></li>
            <li><Link href="/pricing" className="hover:text-black transition">Precios y Tarifas</Link></li>
            <li><Link href="/events" className="hover:text-black transition">Eventos</Link></li>
          </ul>
        </div>

        {/* SOPORTE */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Soporte</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><Link href="/support" className="hover:text-black transition">Contacto / Soporte</Link></li>
            <li><Link href="/faq" className="hover:text-black transition">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-medium text-gray-500">
            <li><Link href="/privacy" className="hover:text-black transition">Política de Privacidad</Link></li>
            <li><Link href="/cookies" className="hover:text-black transition">Cookies</Link></li>
            <li><Link href="/terms" className="hover:text-black transition">Términos y Condiciones</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400 font-bold">© 2026 RentyClub. Todos los derechos reservados.</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Pago Seguro Protegido
        </div>
      </div>
    </footer>
  )
}