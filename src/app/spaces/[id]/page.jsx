'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Share2, Heart, Loader2, 
  ArrowLeft, CheckCircle, Wifi, Shield, 
  Wind, Zap, Coffee, Car, Accessibility, 
  Utensils, User, Calendar
} from 'lucide-react'

// Mapa dinámico
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="w-full bg-gray-100 animate-pulse rounded-2xl" style={{ height: '300px' }}></div>
})

// Mapeo de íconos para Amenities
const AMENITY_ICONS = {
  "WiFi": Wifi,
  "Seguridad 24hs": Shield,
  "Aire Acondicionado": Wind,
  "Calefacción": Zap,
  "Cocina": Utensils,
  "Baño privado": Accessibility, // Usamos este como genérico de baño
  "Cochera": Car,
  "Vidriera": EyeIcon,
  "Probador": User
}

// Componente de ícono seguro
const AmenityItem = ({ name }) => {
  // Buscamos el ícono, si no existe usamos CheckCircle
  const IconComponent = AMENITY_ICONS[name] || AMENITY_ICONS[Object.keys(AMENITY_ICONS).find(k => name.includes(k))] || CheckCircle
  
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
      <IconComponent size={20} className="text-black" />
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
  )
}

function EyeIcon({size, className}) { // Icono custom para vidriera si no existe en lucide
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}

export default function SpaceDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (id) loadSpace()
  }, [id])

  async function loadSpace() {
    const { data, error } = await supabase
      .from('spaces')
      .select('*, profiles(full_name, email)') 
      .eq('id', id)
      .single()

    if (error) {
      alert('Espacio no encontrado')
      router.push('/')
    } else {
      setSpace(data)
    }
    setLoading(false)
  }

  const handleBooking = async () => {
    if (!user) return router.push('/login')
    if (!bookingDates.start || !bookingDates.end) return alert('Seleccioná fechas')

    setBookingLoading(true)
    
    const start = new Date(bookingDates.start)
    const end = new Date(bookingDates.end)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    const totalPrice = diffDays * space.price

    const { error } = await supabase.from('bookings').insert({
        space_id: space.id,
        renter_id: user.id,
        owner_id: space.owner_id,
        start_date: bookingDates.start,
        end_date: bookingDates.end,
        total_price: totalPrice,
        status: 'pending'
    })

    if (error) {
        alert(error.message)
    } else {
        alert('¡Solicitud enviada! El dueño debe aprobarla.')
        router.push('/dashboard?tab=rentals')
    }
    setBookingLoading(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-black">Cargando espacio...</div>
  if (!space) return null

  // Lógica de Galería (La que ya funcionaba bien)
  let gallery = []
  if (space.image) gallery.push(space.image)
  if (space.images && Array.isArray(space.images)) {
      const moreImages = space.images.filter(img => img !== space.image)
      gallery = [...gallery, ...moreImages]
  }
  gallery = [...new Set(gallery)].filter(Boolean)
  if (gallery.length === 0) gallery = ['https://via.placeholder.com/800x600?text=Sin+Imagen']

  return (
    <div className="bg-white min-h-screen text-black pb-20">
      
      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white bg-opacity-90 backdrop-blur-md z-50 border-b border-gray-100 h-20 flex items-center px-6 justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-bold hover:opacity-70 transition text-black">
            <ArrowLeft size={20} /> Volver
        </button>
        <div className="flex gap-4 text-black">
            <button className="flex items-center gap-2 text-sm font-bold underline"><Share2 size={16}/> Compartir</button>
            <button className="flex items-center gap-2 text-sm font-bold underline"><Heart size={16}/> Guardar</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28">
        
        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 text-black">{space.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-black font-bold bg-gray-100 px-2 py-1 rounded-md"><Star size={14} fill="black"/> 4.96</span>
                <span className="flex items-center gap-1"><MapPin size={14}/> {space.location}</span>
                <span>•</span>
                <span>{space.type}</span>
            </div>
        </div>

        {/* GALERÍA */}
        <div className="rounded-3xl overflow-hidden mb-12 relative shadow-sm border border-gray-100" style={{ height: '500px' }}>
            {gallery.length === 1 && <img src={gallery[0]} className="w-full h-full object-cover" />}
            {gallery.length === 2 && <div className="grid grid-cols-2 gap-2 h-full"><img src={gallery[0]} className="w-full h-full object-cover"/><img src={gallery[1]} className="w-full h-full object-cover"/></div>}
            {gallery.length === 3 && <div className="grid grid-cols-3 gap-2 h-full"><div className="col-span-2 h-full"><img src={gallery[0]} className="w-full h-full object-cover"/></div><div className="flex flex-col gap-2 h-full"><img src={gallery[1]} className="h-1/2 w-full object-cover"/><img src={gallery[2]} className="h-1/2 w-full object-cover"/></div></div>}
            {gallery.length === 4 && <div className="grid grid-cols-2 gap-2 h-full"><div className="h-full"><img src={gallery[0]} className="w-full h-full object-cover"/></div><div className="grid grid-rows-3 gap-2 h-full"><img src={gallery[1]} className="w-full h-full object-cover"/><img src={gallery[2]} className="w-full h-full object-cover"/><img src={gallery[3]} className="w-full h-full object-cover"/></div></div>}
            {gallery.length >= 5 && (
                <div className="grid grid-cols-4 gap-2 h-full">
                    <div className="col-span-2 row-span-2 h-full"><img src={gallery[0]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 h-full"><img src={gallery[1]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 h-full"><img src={gallery[2]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 h-full"><img src={gallery[3]} className="w-full h-full object-cover" /></div>
                    <div className="col-span-1 h-full relative">
                        <img src={gallery[4]} className="w-full h-full object-cover" />
                        <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition text-black">Ver todas</button>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="md:col-span-2 space-y-12">
                
                {/* ANFITRION */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-8">
                    <div>
                        <h2 className="text-xl font-bold mb-1 text-black">Espacio gestionado por {space.profiles?.full_name?.split(' ')[0] || 'Anfitrión'}</h2>
                        <p className="text-gray-500 text-sm">{space.size} m² • {space.type} • Respuesta rápida</p>
                    </div>
                    <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-serif text-2xl italic border-4 border-gray-100">
                        {space.profiles?.full_name ? space.profiles.full_name[0] : 'A'}
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                    <h3 className="font-bold text-lg mb-4 text-black">Sobre este espacio</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">{space.description}</p>
                </div>

                {/* AMENITIES */}
                <div>
                    <h3 className="font-bold text-lg mb-6 text-black">Lo que ofrece este lugar</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(space.amenities || []).map(am => (
                            <AmenityItem key={am} name={am} />
                        ))}
                        {(!space.amenities || space.amenities.length === 0) && <p className="text-gray-400">Sin comodidades especificadas.</p>}
                    </div>
                </div>

                {/* UBICACIÓN */}
                <div className="border-t border-gray-100 pt-10">
                    <h3 className="font-bold text-lg mb-6 text-black">Ubicación</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: '320px' }}>
                        <DashboardMap lat={space.lat} lng={space.lng} interactive={false} />
                    </div>
                    <p className="mt-4 font-bold text-sm text-black flex items-center gap-2"><MapPin size={16}/> {space.location}</p>
                    <p className="text-xs text-gray-500 mt-1">La dirección exacta se compartirá una vez confirmada la reserva.</p>
                </div>

                {/* RESEÑAS (ESTÁTICAS POR AHORA) */}
                <div className="border-t border-gray-100 pt-10">
                    <h3 className="font-bold text-lg mb-6 text-black flex items-center gap-2"><Star fill="black" size={18}/> 4.96 · 12 Reseñas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">SM</div>
                                <div><p className="font-bold text-xs">Sofía Martinez</p><p className="text-[10px] text-gray-400">Hace 1 mes</p></div>
                            </div>
                            <p className="text-xs text-gray-600 italic">"Excelente lugar, tal cual las fotos. El anfitrión muy atento."</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 text-xs">JP</div>
                                <div><p className="font-bold text-xs">Juan Perez</p><p className="text-[10px] text-gray-400">Hace 2 meses</p></div>
                            </div>
                            <p className="text-xs text-gray-600 italic">"Muy buena ubicación y excelente iluminación para nuestro showroom."</p>
                        </div>
                    </div>
                </div>

                {/* POLÍTICAS */}
                <div className="border-t border-gray-100 pt-10 pb-10">
                    <h3 className="font-bold text-lg mb-4 text-black">Cosas que tenés que saber</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                        <div>
                            <h4 className="font-bold text-black mb-1">Reglas del espacio</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Horario de entrada: 08:00 AM</li>
                                <li>Horario de salida: 20:00 PM</li>
                                <li>No se permiten fiestas ruidosas</li>
                                <li>Capacidad máxima respetada</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-black mb-1">Política de cancelación</h4>
                            <p>Cancelación gratuita hasta 48 horas antes de la fecha de inicio. Después de eso, se cobra el 50% del total.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA (BOOKING STICKY) */}
            <div className="relative">
                <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
                    <div className="flex justify-between items-end mb-6">
                        <p className="text-2xl font-bold text-black">${space.price} <span className="text-sm font-normal text-gray-500">/ día</span></p>
                        <div className="flex items-center gap-1 text-xs font-bold text-black"><Star size={12} fill="black"/> 4.96</div>
                    </div>

                    <div className="grid grid-cols-2 border border-gray-200 rounded-xl mb-4 overflow-hidden">
                        <div className="p-3 border-r border-gray-200 hover:bg-gray-50 transition">
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Entrada</label>
                            <input type="date" className="w-full text-xs font-bold outline-none text-black bg-transparent" onChange={e => setBookingDates({...bookingDates, start: e.target.value})} />
                        </div>
                        <div className="p-3 hover:bg-gray-50 transition">
                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Salida</label>
                            <input type="date" className="w-full text-xs font-bold outline-none text-black bg-transparent" onChange={e => setBookingDates({...bookingDates, end: e.target.value})} />
                        </div>
                    </div>

                    <button 
                        onClick={handleBooking} 
                        disabled={bookingLoading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition active:scale-95 shadow-lg mb-4 flex items-center justify-center gap-2"
                    >
                        {bookingLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reservar'}
                    </button>

                    <p className="text-center text-xs text-gray-400">No se te cobrará nada todavía.</p>
                    
                    <div className="mt-6 space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                        <div className="flex justify-between"><span>Precio x día</span><span>${space.price}</span></div>
                        <div className="flex justify-between"><span>Tarifa de servicio Renty</span><span>$2000</span></div>
                        <div className="flex justify-between font-bold text-black border-t border-gray-100 pt-3 text-lg"><span>Total</span><span>(Calculado al reservar)</span></div>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                        <Shield size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-tight">Tu reserva está protegida por nuestra garantía de satisfacción. Cancelación flexible disponible.</p>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  )
}