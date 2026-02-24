'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Star, Loader2, MapPin, Search, X } from 'lucide-react'

// ==========================================
// COMPONENTE DE ANIMACIÓN
// ==========================================
function Reveal({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ==========================================
// CONTENIDO PRINCIPAL (FULL WIDTH)
// ==========================================
function SpacesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialType = searchParams.get('type') || 'all'

  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [filterType, setFilterType] = useState(initialType)
  const [filterLocation, setFilterLocation] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'Local', label: 'Locales' },
    { id: 'Showroom', label: 'Showrooms' },
    { id: 'Oficina', label: 'Oficinas' },
    { id: 'Depósito', label: 'Depósitos' }
  ]

  useEffect(() => {
    fetchSpaces()
  }, [filterType, searchTerm])

  async function fetchSpaces() {
    setLoading(true)
    
    let query = supabase.from('spaces').select('*').order('created_at', { ascending: false })
    
    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    if (searchTerm.trim() !== '') {
      query = query.ilike('location', `%${searchTerm}%`)
    }

    const { data } = await query
    setSpaces(data || [])
    setLoading(false)
  }

  const handleLocationSearch = (e) => {
    e.preventDefault()
    setSearchTerm(filterLocation)
  }

  const clearLocation = () => {
    setFilterLocation('')
    setSearchTerm('')
  }

  const handleTypeChange = (typeId) => {
    setFilterType(typeId)
    setFilterLocation('') 
    setSearchTerm('')     
    
    if (typeId === 'all') {
      router.push('/spaces', { scroll: false })
    } else {
      router.push(`/spaces?type=${typeId}`, { scroll: false })
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumSignificantDigits: 3
    }).format(price)
  }

  return (
    // ACÁ ESTÁ EL CAMBIO CLAVE: w-full y márgenes laterales grandes (px-6 md:px-16 lg:px-24) en vez de max-w-7xl
    <div className="w-full mx-auto py-24 px-6 md:px-16 lg:px-24 min-h-screen bg-white text-black selection:bg-black selection:text-white" style={{ maxWidth: '1920px' }}>
        
        {/* ENCABEZADO */}
        <Reveal>
          <div className="mb-12 cursor-default">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-black">
              Catálogo de Espacios
            </h1>
            <p className="text-gray-500 text-lg font-light">
              Explorá nuestra selección curada y encontrá tu locación ideal.
            </p>
          </div>
        </Reveal>

        {/* BARRA DE FILTROS HORIZONTAL */}
        <Reveal delay={100}>
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-16 border-b border-gray-100 pb-8">
            
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = filterType === cat.id
                return (
                  <button 
                    key={cat.id}
                    onClick={() => handleTypeChange(cat.id)}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border shadow-sm active:scale-95 ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'}`}
                    style={{ borderRadius: '30px' }}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            <form onSubmit={handleLocationSearch} className="relative flex items-center w-full md:w-auto">
              <MapPin size={16} className="absolute left-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar ciudad o barrio..." 
                className="w-full md:w-80 pl-11 pr-12 py-3 border border-gray-200 outline-none text-sm font-bold text-black placeholder-gray-400 cursor-text shadow-sm focus:border-black transition-colors"
                style={{ borderRadius: '30px' }}
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
              
              {filterLocation ? (
                <button type="button" onClick={clearLocation} className="absolute right-4 text-gray-400 hover:text-black transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              ) : (
                <button type="submit" className="absolute right-4 text-gray-400 hover:text-black transition-colors cursor-pointer">
                  <Search size={16} />
                </button>
              )}
            </form>

          </div>
        </Reveal>

        {/* GRILLA DE RESULTADOS (Ahora llega hasta 4 columnas en pantallas gigantes) */}
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className="animate-spin text-black" size={40} /></div>
          ) : spaces.length === 0 ? (
            <Reveal>
              <div className="py-24 text-center border border-dashed border-gray-200 bg-gray-50 cursor-default" style={{ borderRadius: '24px' }}>
                <p className="text-gray-500 font-medium text-lg mb-6">No encontramos espacios con estos filtros.</p>
                <button 
                  onClick={() => handleTypeChange('all')}
                  className="inline-block text-xs font-bold uppercase tracking-widest border border-black px-8 py-4 hover:bg-black hover:text-white transition cursor-pointer shadow-md active:scale-95" 
                  style={{ borderRadius: '30px' }}
                >
                  Ver todos los espacios
                </button>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-10">
                {spaces.map((s, index) => (
                    <Reveal key={s.id} delay={index * 50}>
                        <Link href={`/spaces/${s.id}`} className="block group cursor-pointer no-underline text-black">
                            
                            <div className="bg-gray-100 mb-6 overflow-hidden relative border border-gray-100 group-hover:shadow-2xl transition-all duration-500" style={{ height: '320px', borderRadius: '24px' }}>
                                <img src={s.image || 'https://via.placeholder.com/800x600?text=Sin+Imagen'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={s.title}/>
                                {s.type && (
                                  <span className="absolute top-4 left-4 bg-white text-black font-bold px-3 py-1.5 uppercase tracking-widest shadow-md" style={{ fontSize: '10px', borderRadius: '8px' }}>
                                    {s.type}
                                  </span>
                                )}
                            </div>

                            <div className="px-2">
                                <div className="flex justify-between items-start mb-2 text-black">
                                    <h3 className="font-serif text-2xl font-bold truncate pr-4 group-hover:text-gray-600 transition-colors">{s.title}</h3>
                                    <div className="flex items-center gap-1 text-xs font-bold bg-gray-50 border border-gray-100 px-2 py-1" style={{ borderRadius: '6px' }}>
                                      <Star size={10} fill="black" /> 4.9
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 font-medium truncate mb-4">{s.location}</p>
                                <div className="w-full h-px bg-gray-100 mb-4"></div>
                                <p className="text-sm text-black flex items-baseline gap-1">
                                  <span className="font-bold text-2xl text-black">{formatPrice(s.price)}</span> 
                                  <span className="text-gray-400 font-medium text-xs uppercase tracking-widest">/ día</span>
                                </p>
                            </div>

                        </Link>
                    </Reveal>
                ))}
            </div>
          )}
        </div>

    </div>
  )
}

// ==========================================
// ENVOLTORIO SUSPENSE
// ==========================================
export default function SpacesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans text-gray-400 uppercase tracking-widest text-xs">Cargando catálogo...</div>}>
      <SpacesContent />
    </Suspense>
  )
}