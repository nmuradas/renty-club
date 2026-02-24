'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Search, Star, Key, CalendarCheck, 
  ShieldCheck, CreditCard, MessageSquare, 
  Clock, CheckCircle, Headset, ArrowRight 
} from 'lucide-react'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { Spanish } from 'flatpickr/dist/l10n/es.js'

// ==========================================
// COMPONENTE DE ANIMACIÓN (Aparición suave)
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

export default function HomePage() {
  const [allSpaces, setAllSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State para filtros
  const [location, setLocation] = useState('')
  const [type, setType] = useState('all')

  useEffect(() => {
    // Configuración de Flatpickr
    const endPicker = flatpickr("#end-date-search", {
      locale: Spanish,
      dateFormat: "Y-m-d",
      minDate: "today"
    })

    flatpickr("#start-date-search", {
      locale: Spanish,
      dateFormat: "Y-m-d",
      minDate: "today",
      onChange: (selectedDates, dateStr) => {
        if (selectedDates.length) {
          endPicker.set('minDate', dateStr)
        }
      }
    })

    loadSpaces()
  }, [])

  async function loadSpaces() {
    setLoading(true)
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setAllSpaces(data)
    setLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumSignificantDigits: 3
    }).format(price)
  }

  return (
    <div className="bg-white text-black selection:bg-black selection:text-white">
      
      {/* HERO SECTION */}
      <header className="relative flex items-center justify-center text-center bg-gray-900 overflow-hidden px-4" style={{ height: '80vh' }}>
        <div className="absolute inset-0 opacity-60">
           <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" alt="Hero Background" />
        </div>
        
        <div className="max-w-4xl w-full relative z-10 pt-10">
          <Reveal>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight text-white drop-shadow-2xl font-medium cursor-default">
              Encuentra tu espacio.<br/><i className="font-normal opacity-90 italic">Crea tu experiencia.</i>
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <div className="bg-white rounded-full p-2 flex flex-col md:flex-row w-full max-w-4xl mx-auto mt-10 text-left items-center shadow-2xl">
              
              <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-text group">
                <label htmlFor="loc-search" className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black cursor-text transition-colors">Ubicación</label>
                <input 
                  id="loc-search"
                  type="text" 
                  placeholder="¿Dónde buscas?" 
                  className="w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm rounded-full cursor-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-pointer group">
                <label htmlFor="start-date-search" className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black cursor-pointer transition-colors">Entrada</label>
                <input id="start-date-search" type="text" placeholder="Fecha inicio" className="rounded-full w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm cursor-pointer" readOnly />
              </div>
              
              <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-pointer group">
                <label htmlFor="end-date-search" className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black cursor-pointer transition-colors">Salida</label>
                <input id="end-date-search" type="text" placeholder="Fecha fin" className="rounded-full w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm cursor-pointer" readOnly />
              </div>
              
              <div className="flex-1 px-6 py-3 w-full hover:bg-gray-50 transition rounded-full cursor-pointer group">
                <label htmlFor="type-search" className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black cursor-pointer transition-colors">Tipo</label>
                <select 
                  id="type-search"
                  className="rounded-full w-full bg-transparent border-none outline-none text-black font-bold cursor-pointer appearance-none text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">Todo</option>
                  <option value="Local">Local</option>
                  <option value="Showroom">Showroom</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Depósito">Depósito</option>
                </select>
              </div>
              
              <button className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 hover:bg-gray-800 transition-all shadow-lg mx-2 shrink-0 cursor-pointer active:scale-95">
                <Search size={20} />
              </button>
            </div>
          </Reveal>
        </div>
      </header>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <h2 className="font-serif text-3xl text-black mb-10 font-bold tracking-tight cursor-default">Categorías destacadas</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0}>
              <Link href="/spaces?type=Local" className="block relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 no-underline" style={{ height: '400px' }}>
                <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt="Retail" />
                <div className="absolute inset-0 bg-linear-to-t from-black to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-serif text-3xl mb-1">Retail</h3>
                  <p className="text-sm opacity-90 font-medium tracking-wide text-white">Locales a la calle</p>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={100}>
              <Link href="/spaces?type=Showroom" className="block relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 no-underline" style={{ height: '400px' }}>
                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt="Showroom" />
                <div className="absolute inset-0 bg-linear-to-t from-black to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-serif text-3xl mb-1">Showroom</h3>
                  <p className="text-sm opacity-90 font-medium tracking-wide text-white">Galerías y Eventos</p>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={200}>
              <Link href="/spaces?type=Oficina" className="block relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 no-underline" style={{ height: '400px' }}>
                <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt="Workspace" />
                <div className="absolute inset-0 bg-linear-to-t from-black to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-8 left-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-serif text-3xl mb-1">Workspace</h3>
                  <p className="text-sm opacity-90 font-medium tracking-wide text-white">Oficinas privadas</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-24 bg-white border-b border-gray-200 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <h2 className="font-serif text-sm font-bold text-black mb-3 uppercase tracking-widest cursor-default">CÓMO FUNCIONA</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-base font-normal cursor-default">Alquilar un espacio nunca fue tan fácil. En tres simples pasos podés tener tu negocio funcionando.</p>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Reveal delay={0}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Search size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-black transition-colors">1. Buscá</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Explorá espacios disponibles por ubicación, tipo y duración. Filtrá según tus necesidades.</p>
              </div>
            </Reveal>
            
            <Reveal delay={150}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <CalendarCheck size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-black transition-colors">2. Reservá</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Enviá una solicitud al propietario con las fechas y detalles de tu proyecto.</p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col items-center group cursor-default">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Key size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-black transition-colors">3. Aparecé</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Una vez aprobada tu solicitud, coordiná la entrega y comenzá tu experiencia.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <Reveal>
              <div className="text-center mb-16 cursor-default">
                  <h2 className="font-serif text-3xl mb-4 text-black font-bold">Lo que dicen de nosotros</h2>
                  <div className="w-12 h-1 bg-black opacity-10 mx-auto rounded-full"></div>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Reveal delay={0}>
                  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                      <div className="text-black text-xs mb-6 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                      <p className="font-serif text-lg italic text-gray-600 mb-8 leading-relaxed">"RentyClub nos permitió abrir nuestro Pop-Up en Palermo en menos de 48 horas. La gestión fue impecable."</p>
                      <div className="flex items-center gap-4 text-black">
                          <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-12 h-12 rounded-full object-cover shadow-sm" alt="Sofia"/>
                          <div><p className="font-bold text-sm">Sofía M.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Fundadora, BohoStyle</p></div>
                      </div>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                      <div className="text-black text-xs mb-6 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                      <p className="font-serif text-lg italic text-gray-600 mb-8 leading-relaxed">"La flexibilidad para alquilar por semanas cambió nuestro modelo de negocio. Muy recomendado."</p>
                      <div className="flex items-center gap-4 text-black">
                          <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-12 h-12 rounded-full object-cover shadow-sm" alt="Julian"/>
                          <div><p className="font-bold text-sm">Julián A.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">CEO, TechStart</p></div>
                      </div>
                  </div>
                </Reveal>

                <Reveal delay={200}>
                  <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                      <div className="text-black text-xs mb-6 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                      <p className="font-serif text-lg italic text-gray-600 mb-8 leading-relaxed">"Encontramos un showroom increíble para la Fashion Week. El proceso de pago es muy seguro."</p>
                      <div className="flex items-center gap-4 text-black">
                          <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-12 h-12 rounded-full object-cover shadow-sm" alt="Carla"/>
                          <div><p className="font-bold text-sm">Carla P.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Event Planner</p></div>
                      </div>
                  </div>
                </Reveal>
            </div>
        </div>
      </section>

      {/* CATÁLOGO (LIMIT 10) */}
      <section id="catalogo" className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="flex justify-between items-end mb-12 text-black cursor-default">
              <div>
                <h2 className="font-serif text-4xl mb-2 font-bold tracking-tight text-black">Explora espacios</h2>
                <p className="font-medium text-gray-500">Lugares únicos seleccionados para ti.</p>
              </div>
              <Link href="/spaces" className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-1 hover:opacity-60 transition text-black cursor-pointer">
                VER TODOS LOS ESPACIOS <ArrowRight size={16}/>
              </Link>
            </div>
          </Reveal>
          
          {loading ? (
            <div className="text-center py-20"><CheckCircle size={32} className="animate-spin mx-auto text-gray-200" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 text-black">
              {allSpaces.map((s, index) => (
                <Reveal key={s.id} delay={index * 50}>
                  <Link href={`/spaces/${s.id}`} className="group cursor-pointer block no-underline text-black">
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                      <img src={s.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={s.title}/>
                      <span className="absolute top-3 left-3 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-widest shadow-md" style={{ fontSize: '10px' }}>{s.type}</span>
                    </div>
                    <div className="px-1 text-black">
                      <div className="flex justify-between items-start mb-1 text-black">
                        <h3 className="font-serif text-lg font-bold truncate pr-4 text-black group-hover:text-gray-600 transition-colors">{s.title}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-black bg-gray-50 px-2 py-1 rounded-md"><Star size={10} fill="black" /> 4.9</div>
                      </div>
                      <p className="text-sm truncate font-medium text-gray-500">{s.location}</p>
                      <p className="text-sm mt-3 text-black"><span className="font-bold text-lg text-black">{formatPrice(s.price)}</span> <span className="text-gray-400 font-medium">/ día</span></p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div className="mt-16 text-center md:hidden">
               <Link href="/spaces" className="bg-black text-white px-8 py-4 rounded-xl font-bold text-sm inline-block shadow-lg active:scale-95 cursor-pointer transition-transform">Ver todos los espacios</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECCIÓN CONFIANZA */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-20 text-white cursor-default">
              <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white font-bold">Reservá con <span className="text-gray-400 font-light italic">total confianza</span></h2>
              <p className="text-gray-400 font-light text-xl">Tu seguridad y satisfacción son nuestra prioridad</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <Reveal delay={0}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Reserva segura</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Tu pago está protegido hasta que confirmes que el espacio cumple con lo acordado.</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <CreditCard size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Pagos flexibles</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Pagá en cuotas con tarjeta o transferencia bancaria sin costos adicionales.</p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Comunicación directa</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Chateá con los propietarios antes de reservar para resolver todas tus dudas.</p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Clock size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Cancelación flexible</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Cancelá gratis hasta 48hs antes del inicio de tu reserva.</p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Espacios verificados</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Todos los espacios pasan por un proceso de verificación de calidad.</p>
              </div>
            </Reveal>

            <Reveal delay={500}>
              <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-2 transition-all duration-300 cursor-default group shadow-2xl">
                <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Headset size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">Soporte 24/7</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Nuestro equipo está disponible para ayudarte en cualquier momento.</p>
              </div>
            </Reveal>
          </div>

          {/* FOOTER CTA */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 border-t border-zinc-800 text-white cursor-default">
              
              <div className="flex flex-col h-full">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">PARA EMPRENDEDORES</p>
                <h3 className="font-serif text-3xl md:text-4xl mb-4 text-white">Hacé realidad tu idea</h3>
                <p className="text-gray-400 mb-10 leading-relaxed text-lg font-light max-w-sm grow">Encontrá el espacio perfecto para tu pop-up o negocio temporal. Sin contratos largos.</p>
                <Link href="/spaces" className="bg-white text-black px-8 py-4 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors inline-flex items-center gap-2 w-fit cursor-pointer no-underline shadow-lg active:scale-95 mt-auto">
                  Explorar espacios <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="flex flex-col h-full">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">PARA PROPIETARIOS</p>
                <h3 className="font-serif text-3xl md:text-4xl mb-4 text-white">Rentabilizá tu espacio</h3>
                <p className="text-gray-400 mb-10 leading-relaxed text-lg font-light max-w-sm grow">¿Tenés un local vacío o un espacio sin usar? Publicalo gratis y empezá a generar ingresos extra.</p>
                <Link href="/create" className="bg-white text-black px-8 py-4 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors inline-flex items-center gap-2 w-fit cursor-pointer no-underline shadow-lg active:scale-95 mt-auto">
                  Publicar espacio <ArrowRight size={16} />
                </Link>
              </div>

            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}