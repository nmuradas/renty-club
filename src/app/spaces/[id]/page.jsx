'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Share2, Heart, Loader2, 
  ArrowLeft, CheckCircle, Wifi, Shield, 
  Wind, Zap, Coffee, Car, Accessibility, 
  Utensils, User, Calendar, MessageCircle, Info, X, Send, Maximize,
  Award, Clock, Sparkles
} from 'lucide-react'

import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Spanish } from 'flatpickr/dist/l10n/es.js'

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="w-full bg-gray-100 animate-pulse rounded-3xl" style={{ height: '350px' }}></div>
})

const AMENITY_ICONS = {
  "WiFi": Wifi, "Seguridad 24hs": Shield, "Aire Acondicionado": Wind,
  "Calefacción": Zap, "Cocina": Utensils, "Baño privado": Accessibility,
  "Cochera": Car, "Vidriera": Maximize, "Probador": User
}

const AmenityItem = ({ name }) => {
  const IconComponent = AMENITY_ICONS[name] || CheckCircle
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-black transition-colors duration-300 shadow-sm">
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
        <IconComponent size={20} className="text-black" />
      </div>
      <span className="text-sm font-bold text-gray-800">{name}</span>
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
  const [chatMessage, setChatMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)

  useEffect(() => { if (id) loadSpace() }, [id])

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
    const disableConfig = data?.map(b => ({ from: b.start_date, to: b.end_date })) || []

    const endPicker = flatpickr("#checkout-picker", {
        locale: Spanish, dateFormat: "Y-m-d", disable: disableConfig, minDate: "today",
        onChange: (selectedDates, dateStr) => setBookingDates(prev => ({ ...prev, end: dateStr }))
    })

    flatpickr("#checkin-picker", {
        locale: Spanish, dateFormat: "Y-m-d", disable: disableConfig, minDate: "today",
        onChange: (selectedDates, dateStr) => {
            setBookingDates(prev => ({ ...prev, start: dateStr }))
            endPicker.set("minDate", dateStr)
        }
    })
  }

  const billing = useMemo(() => {
    if (!bookingDates.start || !bookingDates.end || !space) return null
    const days = Math.ceil((new Date(bookingDates.end) - new Date(bookingDates.start)) / (1000 * 60 * 60 * 24)) + 1 
    if (days <= 0) return null
    const subtotal = days * space.price
    const discount = days >= 28 ? subtotal * 0.30 : days >= 7 ? subtotal * 0.15 : 0
    const discountLabel = days >= 28 ? "Descuento mensual (30%)" : "Descuento semanal (15%)"
    const platformFee = (subtotal - discount) * 0.10
    return { days, subtotal, discount, discountLabel, platformFee, total: (subtotal - discount) + platformFee }
  }, [bookingDates, space])

  const handleBooking = async () => {
    if (!user) return router.push('/login')
    setBookingLoading(true)
    const { error } = await supabase.from('bookings').insert({
        space_id: space.id, renter_id: user.id, owner_id: space.owner_id,
        start_date: bookingDates.start, end_date: bookingDates.end,
        total_price: billing.total, status: 'pending'
    })
    if (!error) { alert('¡Solicitud enviada!'); router.push('/dashboard?tab=rentals') }
    setBookingLoading(false)
  }

  const handleSendQuickMessage = async () => {
    if (!chatMessage.trim()) return
    setSendingMsg(true)
    const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: space.owner_id, space_id: space.id, content: chatMessage })
    if (!error) { setChatMessage(''); setShowChatModal(false); alert('Mensaje enviado') }
    setSendingMsg(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-black" size={40}/></div>
  if (!space) return null

  let gallery = []
  if (space.image) gallery.push(space.image)
  if (space.images && Array.isArray(space.images)) {
      const extra = space.images.filter(img => img !== space.image)
      gallery = [...gallery, ...extra]
  }
  gallery = [...new Set(gallery)].filter(Boolean)

  return (
    <div className="bg-gray-50 min-h-screen text-black pb-20">
      <nav className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-xl z-50 border-b border-gray-100 h-20 flex items-center px-6 justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-bold hover:bg-gray-100 px-4 py-2 rounded-full transition text-black"><ArrowLeft size={20} /> Volver</button>
        <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><Share2 size={20}/></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><Heart size={20}/></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28">
        <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">{space.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
                  <Star size={14} fill="white"/> 4.96
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full font-bold text-gray-600">
                  <MapPin size={14}/> {space.location}
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full font-bold text-gray-600 uppercase tracking-tighter">
                  <Maximize size={14}/> {space.size} m²
                </div>
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full font-bold text-blue-600">
                  <Sparkles size={14}/> {space.type}
                </div>
            </div>
        </div>
        
        <div className="overflow-hidden mb-16 relative shadow-2xl border-8 border-white bg-white" style={{ height: '550px', borderRadius: '40px' }}>
            {gallery.length === 1 ? (
                <img src={gallery[0]} className="w-full h-full object-cover" />
            ) : gallery.length === 2 ? (
                <div className="grid grid-cols-2 gap-2 h-full">
                    <img src={gallery[0]} className="w-full h-full object-cover" />
                    <img src={gallery[1]} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
                    <div className="col-span-2 row-span-2"><img src={gallery[0]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 row-span-1"><img src={gallery[1]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 row-span-1"><img src={gallery[2]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 row-span-1"><img src={gallery[3] || gallery[0]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 row-span-1 relative">
                        <img src={gallery[4] || gallery[0]} className="w-full h-full object-cover" />
                        {gallery.length > 5 && <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white font-bold cursor-pointer">+{gallery.length - 5} fotos</div>}
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="md:col-span-2 space-y-16">
                
                <div className="flex justify-between items-start border-b border-gray-100 pb-10">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-serif font-bold">Anfitrión: {space.profiles?.full_name}</h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase"><Clock size={14}/> Responde en 1h</div>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase"><Award size={14}/> Top Anfitrión</div>
                        </div>
                        <button onClick={() => user ? setShowChatModal(true) : router.push('/login')} className="flex items-center gap-2 text-sm font-bold bg-white border-2 border-black px-6 py-3 rounded-2xl hover:bg-black hover:text-white transition-all duration-300 shadow-md active:scale-95">
                            <MessageCircle size={18} /> Hablar con el dueño
                        </button>
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-tr from-gray-900 to-gray-600 text-white rounded-full flex items-center justify-center font-serif text-3xl italic shadow-xl border-4 border-white">
                        {space.profiles?.full_name?.[0]}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold flex items-center gap-3 underline underline-offset-8">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{space.description}</p>
                </div>

                <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-bold flex items-center gap-3 underline underline-offset-8">Amenities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(space.amenities || []).map(am => <AmenityItem key={am} name={am} />)}
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-bold flex items-center gap-3 underline underline-offset-8">Ubicación exacta</h3>
                    <p className="text-gray-500 font-bold mb-2 flex items-center gap-2 text-sm"><MapPin size={16}/> {space.location}</p>
                    <div className="w-full overflow-hidden border-8 border-white shadow-2xl" style={{ height: '400px', borderRadius: '32px' }}>
                        <DashboardMap lat={space.lat} lng={space.lng} interactive={false} />
                    </div>
                </div>

                <div className="space-y-10 pt-10 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-serif font-bold flex items-center gap-3 underline underline-offset-8"><Star fill="black" size={24}/> 4.96 · 12 Reseñas</h3>
                        <button className="text-sm font-bold underline">Ver todas</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: "Carlos R.", date: "Hace 2 semanas", text: "Excelente luz natural para fotos. Muy recomendado.", color: "bg-blue-100 text-blue-600" },
                            { name: "Sofía M.", date: "Hace 1 mes", text: "El anfitrión fue muy amable y el espacio estaba impecable.", color: "bg-pink-100 text-pink-600" }
                        ].map((rev, i) => (
                            <div key={i} className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300" style={{ borderRadius: '32px' }}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 ${rev.color} rounded-full flex items-center justify-center font-bold shadow-inner text-xl font-serif italic`}>{rev.name[0]}</div>
                                    <div><p className="font-bold text-black">{rev.name}</p><p className="text-xs text-gray-400 font-bold uppercase">{rev.date}</p></div>
                                </div>
                                <div className="flex text-yellow-400 mb-3"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                                <p className="text-gray-600 text-sm leading-relaxed italic">"{rev.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="sticky top-28 bg-white border border-gray-100 shadow-2xl p-8 text-black" style={{ borderRadius: '40px' }}>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-3xl font-serif font-bold">${space.price}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">por día</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold text-sm bg-gray-50 px-3 py-1 rounded-full"><Star size={12} fill="black"/> 4.9</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 border-2 border-gray-50 rounded-3xl mb-6 overflow-hidden bg-gray-50">
                        <div className="p-4 border-r border-white hover:bg-white transition-all cursor-pointer">
                            <label className="text-xs font-bold text-gray-400 block uppercase mb-1" style={{ fontSize: '10px' }}>Entrada</label>
                            <input id="checkin-picker" placeholder="Añadir" className="w-full text-sm font-bold outline-none bg-transparent" readOnly />
                        </div>
                        <div className="p-4 hover:bg-white transition-all cursor-pointer">
                            <label className="text-xs font-bold text-gray-400 block uppercase mb-1" style={{ fontSize: '10px' }}>Salida</label>
                            <input id="checkout-picker" placeholder="Añadir" className="w-full text-sm font-bold outline-none bg-transparent" readOnly />
                        </div>
                    </div>

                    {billing ? (
                        <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-gray-500 underline underline-offset-4 decoration-dotted">${space.price} x {billing.days} días</span>
                                <span className="font-bold">${billing.subtotal}</span>
                            </div>
                            {billing.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                    <span className="flex items-center gap-1"><Sparkles size={14}/> {billing.discountLabel}</span>
                                    <span>-${billing.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-400 font-medium">
                                <span className="flex items-center gap-1 underline underline-offset-4 decoration-dotted">Tarifa Renty (10%) <Info size={12}/></span>
                                <span>+${billing.platformFee.toFixed(0)}</span>
                            </div>
                            <div className="pt-4 border-t border-white font-serif font-bold text-3xl flex justify-between">
                                <span>Total</span>
                                <span>${billing.total.toFixed(0)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                             <p className="text-sm text-gray-400 font-medium leading-relaxed italic">Elegí las fechas para ver el presupuesto final.</p>
                        </div>
                    )}

                    <button onClick={handleBooking} disabled={bookingLoading || !billing} className="w-full bg-black text-white py-5 font-bold text-xl disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3" style={{ borderRadius: '24px' }}>
                        {bookingLoading ? <Loader2 className="animate-spin" /> : 'Reservar Espacio'}
                    </button>

                    <div className="mt-8 space-y-4 border-t border-gray-50 pt-6">
                        <div className="flex items-start gap-4 text-xs text-gray-500">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600"><Shield size={16}/></div>
                            <p className="leading-tight"><strong className="text-black">Protección Renty:</strong> Pago seguro y reembolsos garantizados.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {showChatModal && (
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
            <div className="bg-white w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden" style={{ borderRadius: '48px' }}>
                <div className="p-10 flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-serif italic text-xl">{space.profiles?.full_name?.[0]}</div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-black">Contactar a {space.profiles?.full_name?.split(' ')[0]}</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Consultá disponibilidad o detalles</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowChatModal(false)} className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition text-gray-500"><X size={20}/></button>
                </div>
                <div className="px-10 pb-10 space-y-6">
                    <textarea 
                        autoFocus 
                        value={chatMessage} 
                        onChange={(e) => setChatMessage(e.target.value)} 
                        placeholder="Hola! Me interesa este espacio para..." 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl p-6 text-lg min-h-48 outline-none transition-all text-black resize-none" 
                    />
                    <div className="flex items-center gap-4">
                        <button onClick={handleSendQuickMessage} disabled={sendingMsg || !chatMessage.trim()} className="flex-1 bg-black text-white py-5 font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-95 disabled:opacity-30" style={{ borderRadius: '24px' }}>
                            {sendingMsg ? <Loader2 className="animate-spin" size={24}/> : <><Send size={20}/> Enviar mensaje</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}