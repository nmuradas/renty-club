'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MessageCircle, Send, Loader2, CheckCircle, HelpCircle } from 'lucide-react'

export default function SupportPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Consulta General',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulación de envío (Aquí podrías usar una tabla 'support_tickets' en Supabase)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setForm({ name: '', email: '', subject: 'Consulta General', message: '' })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* COLUMNA IZQUIERDA: INFO DE CONTACTO */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-4">Estamos para <br/> ayudarte.</h1>
              <p className="text-gray-500 leading-relaxed">
                ¿Tenés dudas sobre cómo publicar tu espacio o cómo reservar? 
                Nuestro equipo de RentyClub responde en menos de 24hs.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <p className="font-bold">soporte@rentyclub.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">WhatsApp</p>
                  <p className="font-bold">+54 11 1234-5678</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Horario</p>
                  <p className="font-bold">Lunes a Viernes, 9hs a 18hs</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                  <input 
                    required 
                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black transition"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email de contacto</label>
                  <input 
                    required 
                    type="email"
                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black transition"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Asunto</label>
                  <select 
                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black transition"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  >
                    <option>Consulta General</option>
                    <option>Problema con una reserva</option>
                    <option>Soporte Técnico</option>
                    <option>Facturación / Pagos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mensaje</label>
                  <textarea 
                    required 
                    rows="4"
                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black transition resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition shadow-lg active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                  {loading ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">¡Mensaje enviado!</h2>
                  <p className="text-gray-500 text-sm">Gracias por contactarnos, {form.name}. <br/> Te responderemos a la brevedad.</p>
                </div>
                <button 
                  onClick={() => setSent(false)}
                  className="text-sm font-bold text-gray-400 hover:text-black transition"
                >
                  Enviar otro mensaje
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  )
}