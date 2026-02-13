'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { MapPin, Star, ShieldCheck, CheckCircle, Share2, Heart, LayoutGrid, Clock } from 'lucide-react'

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-3xl" />
})

function ProductContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
        supabase.from('spaces').select('*').eq('id', id).single().then(({data}) => {
            setSpace(data)
            setLoading(false)
        })
    }
  }, [id])

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-black">Cargando experiencia...</div>
  if (!space) return null

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto text-black">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
            <span className="bg-gray-100 border border-gray-200 text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest">{space.type}</span>
            <div className="flex items-center gap-1 text-xs font-bold ml-2 text-black"><Star size={14} className="fill-black"/> 5.0 (24 reseñas)</div>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{space.title}</h1>
        <div className="flex items-center gap-6 text-gray-500">
            <span className="flex items-center gap-1 text-sm font-medium"><MapPin size={16}/> {space.location}</span>
            <span className="flex items-center gap-1 text-sm font-medium"><LayoutGrid size={16}/> {space.size || '50'} m²</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* IMAGEN PRINCIPAL (CORREGIDA) */}
          <div 
            className="w-full overflow-hidden border border-gray-100 shadow-2xl bg-gray-50 relative"
            style={{ height: '500px', borderRadius: '32px' }}
          >
            <img src={space.image} className="w-full h-full object-cover" alt={space.title} />
            <div className="absolute top-6 right-6 flex gap-3">
                <button className="bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition text-black"><Share2 size={18}/></button>
                <button className="bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition text-black"><Heart size={18}/></button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h3 className="font-serif text-2xl font-bold mb-4">Sobre el espacio</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{space.description || "Sin descripción detallada."}</p>
          </div>

          {/* UBICACIÓN */}
          <div className="pt-10 border-t border-gray-100">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">Ubicación exacta</h3>
            <div className="overflow-hidden border border-gray-200" style={{ height: '400px', borderRadius: '32px' }}>
              <DashboardMap lat={space.lat} lng={space.lng} />
            </div>
          </div>

          {/* VALORIZACIÓN */}
          <div className="pt-10 border-t border-gray-100">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2"><Star className="fill-black"/> 4.9 · 18 reseñas</h3>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 border border-gray-100" style={{ borderRadius: '24px' }}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-bold text-xs">SM</div>
                        <div><p className="font-bold text-sm">Sofia M.</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hace 1 semana</p></div>
                    </div>
                    <p className="text-gray-600 italic text-sm leading-relaxed">"Excelente lugar para mi evento pop-up. La iluminación es perfecta y el anfitrión muy profesional."</p>
                </div>
            </div>
          </div>
        </div>

        {/* CARD RESERVA */}
        <div className="space-y-6">
          <div className="bg-white p-8 border border-gray-100 shadow-2xl sticky top-24" style={{ borderRadius: '32px' }}>
            <div className="flex justify-between items-end mb-8">
                <div><span className="text-4xl font-bold">${space.price}</span><span className="text-gray-400 text-sm"> / día</span></div>
            </div>
            
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-100 p-3 rounded-2xl">
                        <label className="block text-[9px] font-bold uppercase text-gray-400">Entrada</label>
                        <input type="date" className="w-full text-xs font-bold outline-none bg-transparent"/>
                    </div>
                    <div className="border border-gray-100 p-3 rounded-2xl">
                        <label className="block text-[9px] font-bold uppercase text-gray-400">Salida</label>
                        <input type="date" className="w-full text-xs font-bold outline-none bg-transparent"/>
                    </div>
                </div>
            </div>

            <button className="w-full bg-black text-white py-5 rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition">Solicitar Reserva</button>
            <p className="text-center text-[10px] text-gray-400 mt-4 font-bold">No se te cobrará nada todavía</p>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><ShieldCheck size={24}/></div>
              <div>
                <p className="font-bold text-sm">Reserva con confianza</p>
                <p className="text-[11px] text-gray-500 leading-relaxed mt-1">Tu dinero se retiene de forma segura hasta 24hs después del check-in.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 flex items-center gap-4 border border-gray-100" style={{ borderRadius: '24px' }}>
            <div className="w-12 h-12 bg-black rounded-full text-white flex items-center justify-center font-bold text-sm italic">R</div>
            <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Anfitrión</p>
                <h4 className="font-bold text-sm">RentyClub Premium</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
    return <Suspense fallback={null}><ProductContent /></Suspense>
}