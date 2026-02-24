'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import { 
  Star, Share2, Heart, Loader2, ArrowLeft, 
  CheckCircle, Shield, Maximize, Clock, 
  AlertCircle, MapPin, Check, X, Calendar as CalendarIcon, 
  MessageCircle, Briefcase, User, Mail, Phone, FileText, Send,
  ChevronLeft, ChevronRight 
} from 'lucide-react'

import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Spanish } from 'flatpickr/dist/l10n/es.js'

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="bg-gray-50 animate-pulse" style={{ height: '400px', borderRadius: '16px' }}></div>
})

// ==========================================
// COMPONENTE TOAST (Notificación Flotante)
// ==========================================
function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-4 shadow-2xl ${type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`} style={{ borderRadius: '30px' }}>
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-bold tracking-wide">{message}</span>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition cursor-pointer"><X size={16} /></button>
      </div>
    </div>
  )
}

export default function SpaceDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' })

  const [bookingLoading, setBookingLoading] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  const [showLightbox, setShowLightbox] = useState(false)
  const [currentImgIdx, setCurrentImgIdx] = useState(0)

  const [chatMessage, setChatMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: 'success' })

  const pickers = useRef({ start: null, end: null })

  const [bookingForm, setBookingForm] = useState({
    name: '', email: '', phone: '', business: '', use: ''
  })

  const showToast = (message, type = 'success') => {
    setToastConfig({ show: true, message, type });
    setTimeout(() => setToastConfig({ show: false, message: '', type: 'success' }), 4000);
  }

  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  useEffect(() => { if (id) loadSpace() }, [id])

  useEffect(() => {
    return () => {
      if (pickers.current.start) pickers.current.start.destroy()
      if (pickers.current.end) pickers.current.end.destroy()
    }
  }, [])

  async function loadSpace() {
    const { data } = await supabase.from('spaces').select('*, profiles(id, full_name, email)').eq('id', id).single()
    if (data) {
        setSpace(data)
        loadBlockedDates(data.id)
    }
    setLoading(false)
  }

  async function loadBlockedDates(spaceId) {
    const { data } = await supabase.from('bookings').select('start_date, end_date').eq('space_id', spaceId).in('status', ['approved', 'blocked'])
    const disableConfig = data?.map(b => ({ 
        from: new Date(b.start_date + 'T00:00:00'), 
        to: new Date(b.end_date + 'T00:00:00') 
    })) || []

    const commonConfig = {
        locale: Spanish, dateFormat: "j M Y", disable: disableConfig, 
        minDate: "today", altInput: false, allowInput: false
    }

    if (pickers.current.end) pickers.current.end.destroy()
    if (pickers.current.start) pickers.current.start.destroy()

    pickers.current.end = flatpickr("#checkout-picker", {
        ...commonConfig,
        onChange: (selectedDates) => {
            if (selectedDates[0]) {
              const isoDate = selectedDates[0].toLocaleDateString('sv-SE')
              setBookingDates(prev => ({ ...prev, end: isoDate }))
            }
        }
    })

    pickers.current.start = flatpickr("#checkin-picker", {
        ...commonConfig,
        onChange: (selectedDates) => {
            if (selectedDates[0]) {
              const isoDate = selectedDates[0].toLocaleDateString('sv-SE')
              setBookingDates(prev => ({ ...prev, start: isoDate }))
              if (pickers.current.end) {
                  pickers.current.end.set("minDate", selectedDates[0])
              }
            }
        }
    })
  }
  
  const billing = useMemo(() => {
    if (!bookingDates.start || !bookingDates.end || !space) return null
    const days = Math.ceil((new Date(bookingDates.end) - new Date(bookingDates.start)) / (1000 * 60 * 60 * 24)) + 1 
    if (days <= 0) return null
    const subtotal = days * space.price
    const discount = days >= 28 ? subtotal * 0.30 : days >= 7 ? subtotal * 0.15 : 0
    const platformFee = (subtotal - discount) * 0.10
    return { days, subtotal, discount, platformFee, total: (subtotal - discount) + platformFee }
  }, [bookingDates, space])

  const openBookingProcess = () => {
    if (!user) return router.push('/login')
    setShowBookingModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.email || !bookingForm.business || !bookingForm.use) {
      showToast("Por favor completá todos los campos para presentarte al dueño.", "error")
      return
    }

    setBookingLoading(true)
    
    try {
      const { error: bookingError } = await supabase.from('bookings').insert({
          space_id: space.id, renter_id: user.id, owner_id: space.owner_id,
          start_date: bookingDates.start, end_date: bookingDates.end,
          total_price: billing.total, status: 'pending'
      })
      if (bookingError) throw bookingError

      const pitchMessage = `¡Hola! He solicitado una reserva.\n\n👤 DATOS DE CONTACTO:\nNombre: ${bookingForm.name}\nEmail: ${bookingForm.email}\nTeléfono: ${bookingForm.phone}\n\n🏢 MI NEGOCIO:\n${bookingForm.business}\n\n🎯 ¿QUÉ HARÉ EN EL ESPACIO?\n${bookingForm.use}`

      await supabase.from('messages').insert({
        sender_id: user.id, receiver_id: space.owner_id, space_id: space.id, content: pitchMessage
      })

      setShowBookingModal(false)
      showToast('¡Solicitud enviada al propietario!', 'success')
      setTimeout(() => router.push('/dashboard?tab=rentals'), 2000)

    } catch (error) {
      showToast('Hubo un error al procesar tu solicitud', 'error')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleSendQuickMessage = async () => {
    if (!chatMessage.trim()) return
    setSendingMsg(true)
    const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: space.owner_id, space_id: space.id, content: chatMessage })
    
    if (error) {
       showToast('Error al enviar el mensaje', 'error');
    } else {
       setChatMessage(''); setShowChatModal(false); showToast('¡Mensaje enviado!', 'success');
    }
    setSendingMsg(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumSignificantDigits: 3 }).format(price)
  }

  const nextImg = (e) => { e.stopPropagation(); setCurrentImgIdx((prev) => (prev + 1) % gallery.length) }
  const prevImg = (e) => { e.stopPropagation(); setCurrentImgIdx((prev) => (prev - 1 + gallery.length) % gallery.length) }

  if (loading) return <div className="h-screen flex items-center justify-center font-sans text-gray-400 uppercase tracking-widest text-xs">Cargando Espacio...</div>
  if (!space) return null

  let gallery = space.image ? [space.image] : []
  if (space.images) gallery = [...new Set([...gallery, ...space.images])].filter(Boolean)

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white pb-32">
      
      {toastConfig.show && (
        <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig({ show: false, message: '' })} />
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-6 md:px-12 justify-between transition-all" style={{ zIndex: 90 }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition cursor-pointer">
            <ArrowLeft size={16} /> Volver a explorar
        </button>
        <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 px-4 py-2 transition cursor-pointer" style={{ borderRadius: '30px' }}><Share2 size={14}/> Compartir</button>
            <button className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 px-4 py-2 transition cursor-pointer" style={{ borderRadius: '30px' }}><Heart size={14}/> Guardar</button>
        </div>
      </nav>

      <main className="w-full mx-auto px-6 md:px-12 lg:px-24 pt-32" style={{ maxWidth: '1600px' }}>
        
        {/* ENCABEZADO */}
        <header className="mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 tracking-tight text-black">{space.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-black">
                <span className="flex items-center gap-1 font-bold"><Star size={16} fill="black"/> 4.96</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-gray-600 underline cursor-pointer hover:text-black transition"><MapPin size={14}/> {space.location}</span>
                <span className="text-gray-300">•</span>
                <span className="bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-bold uppercase tracking-widest" style={{ borderRadius: '8px' }}>{space.type}</span>
            </div>
        </header>

        {/* GALERÍA */}
        <div 
          className="mb-16 relative overflow-hidden group cursor-pointer" 
          style={{ height: '65vh', minHeight: '450px', borderRadius: '24px' }}
          onClick={() => setShowLightbox(true)}
        >
            <img src={gallery[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" alt="Espacio" />
            <button className="absolute bottom-8 right-8 bg-white text-black px-6 py-4 font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 transition active:scale-95" style={{ borderRadius: '40px' }}>
                <Maximize size={16} /> Ver todas las fotos
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            <div className="lg:col-span-8 space-y-16">
                <section className="flex justify-between items-center pb-12 border-b border-gray-100">
                    <div>
                        <h2 className="text-3xl font-serif font-bold mb-3">Anfitrión: {space.profiles?.full_name}</h2>
                        <div className="flex items-center gap-6 text-sm text-gray-500 font-light">
                            <span className="flex items-center gap-2"><Maximize size={18} className="text-gray-300"/> {space.size} m²</span>
                            <span className="flex items-center gap-2"><Briefcase size={18} className="text-gray-300"/> Ideal para eventos</span>
                            <span className="flex items-center gap-2"><Clock size={18} className="text-gray-300"/> Flexible</span>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-serif text-2xl shadow-md uppercase">
                        {space.profiles?.full_name ? space.profiles.full_name[0] : 'U'}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16 border-b border-gray-100">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">El Espacio</h3>
                        <p className="text-lg text-gray-700 leading-relaxed font-light whitespace-pre-line pr-4">{space.description}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Equipamiento</h3>
                        <div className="flex flex-col gap-4">
                            {(space.amenities || []).map(am => (
                                <div key={am} className="flex items-center gap-4 text-gray-700">
                                    <Check size={20} className="text-gray-300" />
                                    <span className="font-light text-lg">{am}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-6 pb-16 border-b border-gray-100">
                    <h3 className="text-2xl font-serif font-bold">Ubicación</h3>
                    <p className="text-gray-500 font-light">{space.location}</p>
                    <div className="w-full overflow-hidden bg-gray-50 shadow-sm" style={{ height: '480px', borderRadius: '24px' }}>
                        <DashboardMap lat={space.lat} lng={space.lng} interactive={false} />
                    </div>
                </section>

                <section className="space-y-12">
                    <h3 className="text-3xl font-serif font-bold flex items-center gap-3"><Star fill="black" size={28}/> 4.96 · 12 Opiniones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[
                            { name: "C. RUIZ", date: "ENERO 2024", text: "El espacio es minimalista y la luz es perfecta. El proceso de entrada fue muy ágil." },
                            { name: "S. MOURA", date: "DICIEMBRE 2023", text: "Excelente ubicación para marcas que buscan visibilidad premium." }
                        ].map((rev, i) => (
                            <div key={i} className="space-y-4 p-6 bg-gray-50 border border-gray-100" style={{ borderRadius: '16px' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center font-bold text-xs shadow-sm uppercase">{rev.name[0]}</div>
                                    <div><p className="font-bold text-sm text-black">{rev.name}</p><p className="font-bold text-gray-400" style={{ fontSize: '10px' }}>{rev.date}</p></div>
                                </div>
                                <p className="text-gray-600 text-sm italic font-light leading-relaxed">"{rev.text}"</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* COLUMNA DERECHA - ORDEN CORREGIDO */}
            <div className="lg:col-span-4 relative">
                <div className="sticky top-28 space-y-4">
                    <div className="bg-white border border-gray-200 p-8 shadow-2xl" style={{ borderRadius: '24px' }}>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-3xl font-serif font-bold">{formatPrice(space.price)}</span>
                            <span className="text-sm text-gray-500 font-light">/ día</span>
                        </div>
                        <div className="border border-gray-300 mb-6 flex overflow-hidden cursor-pointer" style={{ borderRadius: '12px' }}>
                            <div className="w-1/2 p-3 border-r border-gray-300 hover:bg-gray-50 transition">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-black block mb-1">Llegada</label>
                                <input id="checkin-picker" placeholder="Añadir fecha" className="w-full text-sm font-bold outline-none bg-transparent cursor-pointer text-gray-700" readOnly />
                            </div>
                            <div className="w-1/2 p-3 hover:bg-gray-50 transition">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-black block mb-1">Salida</label>
                                <input id="checkout-picker" placeholder="Añadir fecha" className="w-full text-sm font-bold outline-none bg-transparent cursor-pointer text-gray-700" readOnly />
                            </div>
                        </div>

                        {/* DESGLOSE AHORA ARRIBA DEL BOTÓN */}
                        {billing && (
                            <div className="mb-6 space-y-4 animate-fade-in">
                                <div className="flex justify-between text-gray-600 text-sm font-light"><span className="underline">Alquiler x {billing.days} días</span><span>{formatPrice(billing.subtotal)}</span></div>
                                {billing.discount > 0 && <div className="flex justify-between text-green-600 font-medium text-sm bg-green-50 p-2 rounded-md"><span>Descuento</span><span>-{formatPrice(billing.discount)}</span></div>}
                                <div className="flex justify-between text-gray-600 text-sm font-light border-b border-gray-100 pb-4"><span className="underline">Tarifa por servicio</span><span>{formatPrice(billing.platformFee)}</span></div>
                                <div className="pt-2 font-bold text-xl flex justify-between text-black"><span>Total</span><span>{formatPrice(billing.total)}</span></div>
                            </div>
                        )}

                        <button onClick={openBookingProcess} disabled={!billing} className="w-full text-white py-4 font-bold text-sm tracking-wide transition shadow-lg active:scale-95 cursor-pointer disabled:opacity-30 rounded-xl" style={{ background: 'linear-gradient(to right, #000000, #333333)' }}>Solicitar Reserva</button>
                        <p className="text-center text-xs text-gray-400 mt-4 font-light">No se te cobrará nada aún</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-6 shadow-sm flex flex-col items-center gap-3" style={{ borderRadius: '24px' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">¿Tienes alguna duda?</p>
                        <button onClick={() => user ? setShowChatModal(true) : router.push('/login')} className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-white transition cursor-pointer p-4 border border-black rounded-xl"><MessageCircle size={16} /> Consultar al anfitrión</button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* LIGHTBOX */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black z-200 flex items-center justify-center select-none animate-fade-in" onClick={() => setShowLightbox(false)}>
            <button onClick={() => setShowLightbox(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition z-210 cursor-pointer"><X size={40}/></button>
            <button onClick={prevImg} className="absolute left-8 text-white/50 hover:text-white transition cursor-pointer p-4 z-210"><ChevronLeft size={48}/></button>
            <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={gallery[currentImgIdx]} className="max-w-full max-h-[85vh] object-contain shadow-2xl" alt="Ampliación" />
            </div>
            <button onClick={nextImg} className="absolute right-8 text-white/50 hover:text-white transition cursor-pointer p-4 z-210"><ChevronRight size={48}/></button>
            <div className="absolute bottom-8 text-white/60 font-bold tracking-widest text-xs uppercase">{currentImgIdx + 1} / {gallery.length}</div>
        </div>
      )}

      {/* MODAL DE RESERVA - EMAIL AGREGADO */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-100">
            <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col rounded-24px" style={{ maxHeight: '90vh' }}>
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-2xl font-serif font-bold text-black">Solicitud de Reserva</h3>
                    <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-black transition cursor-pointer"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-400">Nombre completo</label><input type="text" value={bookingForm.name} onChange={e=>setBookingForm({...bookingForm, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black transition" /></div>
                      <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-400">Teléfono</label><input type="tel" value={bookingForm.phone} onChange={e=>setBookingForm({...bookingForm, phone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black transition" /></div>
                    </div>
                    
                    {/* CAMPO DE EMAIL AGREGADO */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400">Email</label>
                        <input type="email" value={bookingForm.email} onChange={e=>setBookingForm({...bookingForm, email: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-black transition" placeholder="tu@email.com"/>
                    </div>

                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-400">Sobre tu marca</label><textarea value={bookingForm.business} onChange={e=>setBookingForm({...bookingForm, business: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl min-h-80px outline-none focus:border-black transition resize-none" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-gray-400">¿Qué harás en el espacio?</label><textarea value={bookingForm.use} onChange={e=>setBookingForm({...bookingForm, use: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl min-h-80px outline-none focus:border-black transition resize-none" /></div>
                </div>
                <div className="p-8 border-t border-gray-100 bg-white"><button onClick={handleConfirmBooking} disabled={bookingLoading} className="w-full bg-black text-white py-5 font-bold uppercase transition rounded-xl flex justify-center items-center gap-2">{bookingLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />} Enviar Solicitud</button></div>
            </div>
        </div>
      )}

      {/* MODAL DE CHAT */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-100">
            <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden rounded-24px">
                <div className="p-8 flex justify-between items-center border-b border-gray-100 bg-gray-50"><h3 className="text-xl font-serif font-bold text-black">Contactar al anfitrión</h3><button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-black cursor-pointer rounded-full p-2 border border-gray-200 bg-white"><X size={16}/></button></div>
                <div className="p-8 space-y-6"><textarea autoFocus value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Escribe aquí..." className="w-full border border-gray-200 p-4 rounded-2xl min-h-150px outline-none focus:border-black transition resize-none" /><button onClick={handleSendQuickMessage} disabled={sendingMsg || !chatMessage.trim()} className="w-full bg-black text-white py-4 font-bold uppercase rounded-xl flex justify-center items-center gap-2">{sendingMsg ? <Loader2 className="animate-spin" size={18}/> : <MessageCircle size={18} />} Enviar Mensaje</button></div>
            </div>
        </div>
      )}
    </div>
  )
}