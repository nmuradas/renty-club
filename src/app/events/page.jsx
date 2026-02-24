'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Calendar, MapPin, ArrowRight, Plus, X, CheckCircle, Loader2, Mail, MessageSquare, Send, AlertCircle } from 'lucide-react'

const EventDetailMap = dynamic(() => import('@/components/DashboardMap'), { ssr: false })

// ==========================================
// COMPONENTE TOAST (Notificación Flotante)
// ==========================================
function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-100 animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-4 shadow-2xl ${type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`} style={{ borderRadius: '30px' }}>
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-bold tracking-wide">{message}</span>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition cursor-pointer"><X size={16} /></button>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [emailConfirm, setEmailConfirm] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [isReserved, setIsReserved] = useState(false)

  const [showMessageForm, setShowMessageForm] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  
  // Estado del Toast
  const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToastConfig({ show: true, message, type });
    setTimeout(() => setToastConfig({ show: false, message: '', type: 'success' }), 4000);
  }

  const categories = ['Todos', 'Networking', 'Talleres', 'Social', 'Corporativo']

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (user?.email) {
      setSenderEmail(user.email)
      setEmailConfirm(user.email)
    }
  }, [user])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })
    if (data) setEvents(data)
    setLoading(false)
  }

  const handleBookEvent = async () => {
    if (!emailConfirm.includes('@')) {
        showToast("Por favor, ingresá un email válido", "error");
        return;
    }
    setBookingLoading(true)
    
    try {
      const { error } = await supabase.from('event_bookings').insert({
        event_id: selectedEvent.id,
        user_id: user?.id || null,
        email: emailConfirm
      })
      if (error) throw error
      setIsReserved(true)
      showToast("¡Lugar reservado con éxito!", "success")
    } catch (error) {
      showToast("Error al registrar la reserva", "error")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!user) {
        showToast("Debes iniciar sesión para enviar mensajes", "error");
        return;
    }
    if (!messageText.trim() || !senderName || !senderEmail) {
        showToast("Por favor, completa todos los campos", "error");
        return;
    }
    setSendingMsg(true)

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedEvent.organizer_id,
        content: `EVENTO: ${selectedEvent.title}\nDE: ${senderName} (${senderEmail})\n\nMENSAJE: ${messageText}`,
        space_id: null 
      })
      if (error) throw error
      
      showToast("¡Mensaje enviado al organizador!", "success")
      setShowMessageForm(false)
      setMessageText('')
    } catch (error) {
      showToast("Error al enviar el mensaje", "error")
    } finally {
      setSendingMsg(false)
    }
  }

  const filteredEvents = filter === 'Todos' ? events : events.filter(e => e.category === filter)

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white pb-20">
      <Navbar />

      {/* RENDER DEL TOAST */}
      {toastConfig.show && (
        <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig({ show: false, message: '' })} />
      )}

      <main className="flex-1 pt-20 pb-20">
        
        {/* HERO BANNER */}
        <div className="relative w-full bg-black overflow-hidden mb-16" style={{ height: '480px' }}>
          <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 cursor-default">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-4">Comunidad</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">Eventos que <br/> conectan.</h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-8">Descubrí experiencias exclusivas y expandí tu red.</p>
            {user && (
              <Link href="/events/create" className="flex items-center justify-center gap-2 bg-white text-black px-6 py-4 font-bold text-xs uppercase tracking-widest w-fit hover:bg-gray-200 transition-all shadow-lg active:scale-95 cursor-pointer" style={{ borderRadius: '30px' }}>
                <Plus size={18} /> Crear mi evento
              </Link>
            )}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 w-full">
          
          {/* SELECTOR DE CATEGORÍAS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 cursor-default">
            <h2 className="text-2xl font-bold text-black tracking-tight">Próximos Eventos</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)} 
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95 uppercase tracking-widest ${filter === cat ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* GRID DE EVENTOS */}
          {loading ? (
            <div className="flex justify-center py-20 text-black"><Loader2 className="animate-spin" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-black">
              {filteredEvents.map((event) => (
                <div key={event.id} onClick={() => { setSelectedEvent(event); setIsReserved(false); setShowMessageForm(false); }} className="group cursor-pointer">
                  <div className="relative rounded-3xl overflow-hidden mb-5 border border-gray-100 bg-gray-50 shadow-sm" style={{ paddingBottom: '65%' }}>
                    <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white bg-opacity-90 text-black text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest shadow-sm">{event.category}</span>
                    </div>
                  </div>
                  <div className="space-y-3 px-1">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                      <Calendar size={14} className="text-black" /> {event.date}
                    </div>
                    <h3 className="text-xl font-bold text-black group-hover:text-gray-600 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm"><MapPin size={14} /> {event.location}</div>
                    <div className="pt-4 flex items-center text-black font-bold text-xs gap-2 border-t border-transparent group-hover:border-gray-100 transition-all uppercase tracking-widest">RESERVAR LUGAR <ArrowRight size={14} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="py-24 text-center border border-dashed border-gray-200 bg-gray-50 cursor-default" style={{ borderRadius: '24px' }}>
                <p className="text-gray-500 font-medium text-lg mb-6">No hay eventos en esta categoría.</p>
                <button 
                  onClick={() => setFilter('Todos')}
                  className="inline-block text-xs font-bold uppercase tracking-widest border border-black px-8 py-4 hover:bg-black hover:text-white transition cursor-pointer shadow-md active:scale-95" 
                  style={{ borderRadius: '30px' }}
                >
                  Ver todos los eventos
                </button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DETALLE DE EVENTO */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative text-black" style={{ maxHeight: '90vh', borderRadius: '24px' }}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:rotate-90 transition-all text-black cursor-pointer"><X size={20} /></button>

            <div className="md:w-1/2 h-48 md:h-auto relative bg-gray-100 flex flex-col">
              <img src={selectedEvent.image} className="w-full h-1/2 object-cover" />
              <div className="w-full flex-1" style={{ minHeight: '280px' }}>
                <EventDetailMap lat={selectedEvent.lat || -34.60} lng={selectedEvent.lng || -58.38} />
              </div>
            </div>

            <div className="md:w-1/2 p-8 overflow-y-auto flex flex-col text-black">
              {!isReserved ? (
                <>
                  <div className="flex-1">
                    <span className="bg-gray-100 text-black text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest cursor-default">{selectedEvent.category}</span>
                    <h2 className="text-3xl font-bold text-black mt-4 mb-6 leading-tight cursor-default">{selectedEvent.title}</h2>
                    
                    {!showMessageForm ? (
                      <button onClick={() => setShowMessageForm(true)} className="w-full border border-gray-200 text-gray-600 py-4 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 mb-6 transition cursor-pointer active:scale-95 shadow-sm" style={{ borderRadius: '30px' }}><MessageSquare size={16} /> Consultar al organizador</button>
                    ) : (
                      <div className="bg-gray-50 p-6 border border-gray-200 mb-6 text-black shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input className="bg-white border border-gray-200 p-3 text-xs outline-none text-black cursor-text" style={{ borderRadius: '8px' }} placeholder="Nombre" value={senderName} onChange={e=>setSenderName(e.target.value)} />
                          <input className="bg-white border border-gray-200 p-3 text-xs outline-none text-black cursor-text" style={{ borderRadius: '8px' }} placeholder="Email" value={senderEmail} onChange={e=>setSenderEmail(e.target.value)} />
                        </div>
                        <textarea className="w-full bg-white border border-gray-200 p-3 outline-none text-xs text-black cursor-text resize-none" style={{ borderRadius: '8px' }} rows="4" placeholder="Escribe tu mensaje..." value={messageText} onChange={e=>setMessageText(e.target.value)} />
                        <div className="flex gap-3 mt-4">
                          <button onClick={()=>setShowMessageForm(false)} className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition cursor-pointer">Cancelar</button>
                          <button onClick={handleSendMessage} disabled={sendingMsg} className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50" style={{ borderRadius: '30px' }}>{sendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar</button>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-6 border border-gray-100 mb-6 text-black shadow-sm" style={{ borderRadius: '16px' }}>
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block tracking-widest cursor-text">Confirmar Email de Reserva</label>
                      <input type="email" value={emailConfirm} onChange={e=>setEmailConfirm(e.target.value)} className="w-full bg-white border border-gray-200 p-3 outline-none focus:border-black text-black cursor-text transition-colors" style={{ borderRadius: '8px' }} />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light cursor-default">{selectedEvent.description || "Unite a esta experiencia única y sé parte de nuestra comunidad."}</p>
                  </div>

                  <button onClick={handleBookEvent} disabled={bookingLoading} className="w-full bg-black text-white py-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-lg cursor-pointer disabled:opacity-50" style={{ borderRadius: '30px' }}>
                    {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Confirmar mi lugar
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 cursor-default">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-sm border border-green-100"><CheckCircle size={40} /></div>
                  <h2 className="text-3xl font-serif font-bold text-black">¡Lugar Reservado!</h2>
                  <p className="text-gray-500 font-light text-sm">Enviamos los detalles de acceso y el ticket a <br/><span className="font-bold text-black">{emailConfirm}</span></p>
                  <button onClick={()=>{setSelectedEvent(null); setIsReserved(false);}} className="bg-gray-100 text-black px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition cursor-pointer" style={{ borderRadius: '30px', marginTop: '2rem' }}>Cerrar y volver</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}