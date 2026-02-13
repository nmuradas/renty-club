'use client'

import { useState, useEffect } from 'react'
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
    <div className="bg-white text-black">
      
      {/* HERO SECTION */}
      <header className="relative flex items-center justify-center text-center bg-gray-900 overflow-hidden px-4" style={{ height: '80vh' }}>
        <div className="absolute inset-0 opacity-60">
           <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" alt="Hero Background" />
        </div>
        
        <div className="max-w-4xl w-full relative z-10 animate-fade-in-up pt-10">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight text-white drop-shadow-lg font-medium">
            Encuentra tu espacio.<br/><i className="font-normal opacity-90 italic">Crea tu experiencia.</i>
          </h1>
          
          <div className="bg-white rounded-full p-2 flex flex-col md:flex-row w-full max-w-4xl mx-auto mt-10 text-left items-center shadow-2xl ">
            <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-pointer group ">
              <label className=" text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black">Ubicación</label>
              <input 
                type="text" 
                placeholder="¿Dónde buscas?" 
                className="w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm rounded-full"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-pointer group">
              <label className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black">Entrada</label>
              <input id="start-date-search" type="text" placeholder="Fecha inicio" className="rounded-full w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm cursor-pointer" readOnly />
            </div>
            
            <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 transition rounded-full cursor-pointer group">
              <label className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black">Salida</label>
              <input id="end-date-search" type="text" placeholder="Fecha fin" className="rounded-full w-full bg-transparent border-none outline-none text-black font-bold placeholder-gray-400 text-sm cursor-pointer" readOnly />
            </div>
            
            <div className="flex-1 px-6 py-3 w-full hover:bg-gray-50 transition rounded-full cursor-pointer group">
              <label className="text-xs uppercase font-bold text-gray-500 block tracking-widest mb-1 group-hover:text-black">Tipo</label>
              <select 
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
            
            <button className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg mx-2 shrink-0">
              <Search size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-black mb-10 font-bold tracking-tight">Categorías destacadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500" style={{ height: '400px' }}>
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Retail" />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition"></div>
              <div className="absolute bottom-8 left-8 text-white"><h3 className="font-serif text-3xl mb-1">Retail</h3><p className="text-sm opacity-90 font-medium tracking-wide text-white">Locales a la calle</p></div>
            </div>

            <div className="relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500" style={{ height: '400px' }}>
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Showroom" />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition"></div>
              <div className="absolute bottom-8 left-8 text-white"><h3 className="font-serif text-3xl mb-1">Showroom</h3><p className="text-sm opacity-90 font-medium tracking-wide text-white">Galerías y Eventos</p></div>
            </div>

            <div className="relative rounded-2xl cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500" style={{ height: '400px' }}>
              <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="Workspace" />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition"></div>
              <div className="absolute bottom-8 left-8 text-white"><h3 className="font-serif text-3xl mb-1">Workspace</h3><p className="text-sm opacity-90 font-medium tracking-wide text-white">Oficinas privadas</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-16 bg-white border-b border-gray-200 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-sm font-bold text-black mb-3 uppercase tracking-widest">CÓMO FUNCIONA</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-base font-normal">Alquilar un espacio nunca fue tan fácil. En tres simples pasos podés tener tu negocio funcionando.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white transition duration-300">
                <Search size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">1. Buscá</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Explorá espacios disponibles por ubicación, tipo y duración. Filtrá según tus necesidades.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white transition duration-300">
                <CalendarCheck size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">2. Reservá</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Enviá una solicitud al propietario con las fechas y detalles de tu proyecto.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-xl text-black border border-gray-200 group-hover:bg-black group-hover:text-white transition duration-300">
                <Key size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-black">3. Aparecé</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-sans">Una vez aprobada tu solicitud, coordiná la entrega y comenzá tu experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="font-serif text-3xl mb-3 text-black font-bold">Lo que dicen de nosotros</h2>
                <div className="w-12 h-1 bg-black opacity-10 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-black text-xs mb-4 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                    <p className="font-serif text-lg italic text-gray-600 mb-6 leading-relaxed">"RentyClub nos permitió abrir nuestro Pop-Up en Palermo en menos de 48 horas. La gestión fue impecable."</p>
                    <div className="flex items-center gap-3 text-black">
                        <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full object-cover" alt="Sofia"/>
                        <div><p className="font-bold text-sm">Sofía M.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Fundadora, BohoStyle</p></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-black text-xs mb-4 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                    <p className="font-serif text-lg italic text-gray-600 mb-6 leading-relaxed">"La flexibilidad para alquilar por semanas cambió nuestro modelo de negocio. Muy recomendado."</p>
                    <div className="flex items-center gap-3 text-black">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-10 h-10 rounded-full object-cover" alt="Julian"/>
                        <div><p className="font-bold text-sm">Julián A.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">CEO, TechStart</p></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-black text-xs mb-4 flex gap-1"><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/><Star size={12} fill="black"/></div>
                    <p className="font-serif text-lg italic text-gray-600 mb-6 leading-relaxed">"Encontramos un showroom increíble para la Fashion Week. El proceso de pago es muy seguro."</p>
                    <div className="flex items-center gap-3 text-black">
                        <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-10 h-10 rounded-full object-cover" alt="Carla"/>
                        <div><p className="font-bold text-sm">Carla P.</p><p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Event Planner</p></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CATÁLOGO (LIMIT 10) */}
      <section id="catalogo" className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10 text-black">
            <div>
              <h2 className="font-serif text-4xl mb-2 font-bold tracking-tight text-black">Explora espacios</h2>
              <p className=" font-medium text-black">Lugares únicos seleccionados para ti.</p>
            </div>
            <Link href="/spaces" className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-1 hover:opacity-60 transition text-black">
              VER TODOS LOS ESPACIOS <ArrowRight size={16}/>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-20"><CheckCircle size={32} className="animate-spin mx-auto text-gray-200" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 text-black">
              {allSpaces.map(s => (
                <Link href={`/spaces/${s.id}`} key={s.id} className="group cursor-pointer block no-underline text-black">
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                    <img src={s.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" alt={s.title}/>
                    <span className="absolute top-3 left-3 bg-white opacity-90 text-black text-xs font-bold px-3 py-1 rounded-md uppercase tracking-widest shadow-sm">{s.type}</span>
                  </div>
                  <div className="px-1 text-black">
                    <div className="flex justify-between items-start mb-1 text-black">
                      <h3 className="font-serif text-lg font-bold truncate pr-4 text-black">{s.title}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-black"><Star size={10} fill="black" /> 4.9</div>
                    </div>
                    <p className="text-sm  truncate font-medium text-black">{s.location}</p>
                    <p className="text-sm mt-2 text-black"><span className="font-bold text-lg text-black">{formatPrice(s.price)}</span> / día</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
             <Link href="/spaces" className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm inline-block">Ver todos los espacios</Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN CONFIANZA - FIXED: CARDS GRISES SÓLIDAS */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 text-white">
            <h2 className="font-serif text-3xl mb-3 text-white font-bold">Reservá con <span className="text-gray-300 font-light italic">total confianza</span></h2>
            <p className="text-gray-400 font-light text-lg">Tu seguridad y satisfacción son nuestra prioridad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* CARD 1 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Reserva segura</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Tu pago está protegido hasta que confirmes que el espacio cumple con lo acordado.</p>
            </div>

            {/* CARD 2 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Pagos flexibles</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Pagá en cuotas con tarjeta o transferencia bancaria sin costos adicionales.</p>
            </div>

            {/* CARD 3 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Comunicación directa</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Chateá con los propietarios antes de reservar para resolver todas tus dudas.</p>
            </div>

            {/* CARD 4 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Cancelación flexible</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Cancelá gratis hasta 48hs antes del inicio de tu reserva.</p>
            </div>

            {/* CARD 5 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <CheckCircle size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Espacios verificados</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Todos los espacios pasan por un proceso de verificación de calidad.</p>
            </div>

            {/* CARD 6 */}
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                <Headset size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Soporte 24/7</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Nuestro equipo está disponible para ayudarte en cualquier momento.</p>
            </div>
          </div>

          {/* FOOTER CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 border-t border-zinc-800 text-white">
            <div>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">PARA EMPRENDEDORES</p>
              <h3 className="font-serif text-3xl mb-4 text-white">Hacé realidad tu idea</h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg font-light">Encontrá el espacio perfecto para tu pop-up o negocio temporal. Sin contratos largos.</p>
              <Link href="/spaces" className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2 w-fit cursor-pointer no-underline">
                Explorar espacios <ArrowRight size={16} />
              </Link>
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">PARA PROPIETARIOS</p>
              <h3 className="font-serif text-3xl mb-4 text-white">Rentabilizá tu espacio</h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg font-light">¿Tenés un local vacío o un espacio sin usar? Publicalo gratis y empezá a generar ingresos extra.</p>
              <Link href="/create" className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition inline-block no-underline">
                Publicar espacio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}