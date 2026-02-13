'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, User, Wifi, Shield, ArrowLeft, 
  Calendar, CheckCircle, Share2, Heart, Loader2 
} from 'lucide-react'

// Mapa dinámico
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="w-full bg-gray-100 animate-pulse rounded-2xl" style={{ height: '300px' }}></div>
})

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
    
    // Calcular días
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

  // Preparar galería: combinamos la portada con el array de imágenes
  let gallery = []
  if (space.image) gallery.push(space.image)
  if (space.images && Array.isArray(space.images)) {
      const moreImages = space.images.filter(img => img !== space.image)
      gallery = [...gallery, ...moreImages]
  }
  
  // Limpieza de duplicados y vacíos
  gallery = [...new Set(gallery)].filter(Boolean)
  
  // Placeholder solo si no hay NADA
  if (gallery.length === 0) gallery = ['https://via.placeholder.com/800x600?text=Sin+Imagen']

  return (
    <div className="bg-white min-h-screen text-black pb-20">
      
      {/* NAV SIMPLE */}
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
        
        {/* TÍTULO */}
        <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-black">{space.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-black font-bold"><Star size={14} fill="black"/> 4.9</span>
                <span>•</span>
                <span className="underline">{space.location}</span>
            </div>
        </div>

        {/* GALERÍA DINÁMICA (Sin espacios vacíos) */}
        <div className="rounded-3xl overflow-hidden mb-12 relative" style={{ height: '500px' }}>
            
            {/* CASO 1: SOLO UNA FOTO */}
            {gallery.length === 1 && (
                <img src={gallery[0]} className="w-full h-full object-cover hover:scale-105 transition duration-700 cursor-pointer" alt="Main" />
            )}

            {/* CASO 2: DOS FOTOS (50/50) */}
            {gallery.length === 2 && (
                <div className="grid grid-cols-2 gap-2 h-full">
                    <img src={gallery[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" />
                    <img src={gallery[1]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" />
                </div>
            )}

            {/* CASO 3: TRES FOTOS (1 Grande, 2 Columna) */}
            {gallery.length === 3 && (
                <div className="grid grid-cols-3 gap-2 h-full">
                    <div className="col-span-2 h-full"><img src={gallery[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" /></div>
                    <div className="flex flex-col gap-2 h-full">
                        <img src={gallery[1]} className="h-1/2 w-full object-cover cursor-pointer hover:opacity-95 transition" />
                        <img src={gallery[2]} className="h-1/2 w-full object-cover cursor-pointer hover:opacity-95 transition" />
                    </div>
                </div>
            )}

            {/* CASO 4: CUATRO FOTOS (1 Grande, 3 Columna) */}
            {gallery.length === 4 && (
                <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="h-full"><img src={gallery[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" /></div>
                    <div className="grid grid-rows-3 gap-2 h-full">
                        <img src={gallery[1]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" />
                        <img src={gallery[2]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" />
                        <img src={gallery[3]} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" />
                    </div>
                </div>
            )}

            {/* CASO 5+: LAYOUT COMPLETO (1 Grande, 4 Pequeñas) */}
            {gallery.length >= 5 && (
                <div className="grid grid-cols-4 gap-2 h-full">
                    <div className="col-span-2 row-span-2 h-full bg-gray-100">
                        <img src={gallery[0]} className="w-full h-full object-cover hover:opacity-95 transition cursor-pointer" alt="Main" />
                    </div>
                    <div className="col-span-1 h-full bg-gray-100"><img src={gallery[1]} className="w-full h-full object-cover hover:opacity-95 transition" /></div>
                    <div className="col-span-1 h-full bg-gray-100"><img src={gallery[2]} className="w-full h-full object-cover hover:opacity-95 transition" /></div>
                    <div className="col-span-1 h-full bg-gray-100"><img src={gallery[3]} className="w-full h-full object-cover hover:opacity-95 transition" /></div>
                    <div className="col-span-1 h-full bg-gray-100 relative">
                        <img src={gallery[4]} className="w-full h-full object-cover hover:opacity-95 transition" />
                        {gallery.length > 5 && (
                            <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition text-black">
                                Ver todas
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* COLUMNA IZQUIERDA (Info) */}
            <div className="md:col-span-2 space-y-10">
                <div className="flex justify-between items-center border-b border-gray-100 pb-8">
                    <div>
                        <h2 className="text-xl font-bold mb-1 text-black">Espacio publicado por {space.profiles?.full_name?.split(' ')[0] || 'Anfitrión'}</h2>
                        <p className="text-gray-500 text-sm">{space.type} • {space.size} m²</p>
                    </div>
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-serif text-xl italic">
                        {space.profiles?.full_name ? space.profiles.full_name[0] : 'A'}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-black">Sobre este espacio</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{space.description}</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 text-black">Lo que ofrece este lugar</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(space.amenities || []).map(am => (
                            <div key={am} className="flex items-center gap-3 text-gray-600">
                                <CheckCircle size={18} className="text-black" /> {am}
                            </div>
                        ))}
                        {(!space.amenities || space.amenities.length === 0) && <p className="text-gray-400">Sin comodidades especificadas.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-10">
                    <h3 className="font-bold text-lg mb-6 text-black">Ubicación</h3>
                    <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: '320px' }}>
                        <DashboardMap lat={space.lat} lng={space.lng} interactive={false} />
                    </div>
                    <p className="mt-4 font-bold text-sm text-black">{space.location}</p>
                </div>
            </div>

            {/* COLUMNA DERECHA (Booking Sticky) */}
            <div className="relative">
                <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
                    <div className="flex justify-between items-end mb-6">
                        <p className="text-2xl font-bold text-black">${space.price} <span className="text-sm font-normal text-gray-500">/ día</span></p>
                        <div className="flex items-center gap-1 text-xs font-bold text-black"><Star size={12} fill="black"/> 4.9</div>
                    </div>

                    <div className="grid grid-cols-2 border border-gray-200 rounded-xl mb-4 overflow-hidden">
                        <div className="p-3 border-r border-gray-200">
                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Entrada</label>
                            <input type="date" className="w-full text-xs font-bold outline-none text-black" onChange={e => setBookingDates({...bookingDates, start: e.target.value})} />
                        </div>
                        <div className="p-3">
                            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Salida</label>
                            <input type="date" className="w-full text-xs font-bold outline-none text-black" onChange={e => setBookingDates({...bookingDates, end: e.target.value})} />
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
                        <div className="flex justify-between"><span>Tarifa de servicio</span><span>$2000</span></div>
                        <div className="flex justify-between font-bold text-black border-t border-gray-100 pt-3 text-lg"><span>Total</span><span>(Calculado al reservar)</span></div>
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  )
}