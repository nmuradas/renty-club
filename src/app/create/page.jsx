'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  MapPin, Search, DollarSign, Type, Maximize, 
  Image as ImageIcon, FileText, CheckCircle, Loader2, 
  ArrowLeft, Upload, X 
} from 'lucide-react'

// Importación dinámica del mapa
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="w-full bg-gray-100 animate-pulse rounded-2xl" style={{ height: '300px' }}></div>
})

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [uploadedImages, setUploadedImages] = useState([]) 

  const [form, setForm] = useState({
    title: '',
    price: '',
    type: 'Local comercial',
    size: '',
    location: '',
    image: '', 
    description: '',
    lat: -34.6037,
    lng: -58.3816,
    amenities: []
  })

  const AMENITIES_LIST = [
    "Seguridad 24hs", "WiFi", "Aire Acondicionado", 
    "Baño privado", "Cochera", "Cocina", 
    "Vidriera", "Probador", "Calefacción"
  ];

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  const handleSearchAddress = async () => {
    if (!form.location) return
    setIsSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const first = data[0]
        setForm(prev => ({
          ...prev,
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon)
        }))
      } else {
        alert("No se encontró la dirección.")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleImageUpload = async (e) => {
    if (uploadedImages.length >= 6) {
        alert("Máximo 6 fotos permitidas.")
        return
    }
    
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('spaces')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('spaces').getPublicUrl(filePath)
      setUploadedImages([...uploadedImages, data.publicUrl])
      
    } catch (error) {
      alert('Error subiendo imagen: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (indexToRemove) => {
    setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove))
  }

  const toggleAmenity = (amenity) => {
    setForm(prev => {
      const exists = prev.amenities.includes(amenity)
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    let finalGallery = [...uploadedImages]
    if (form.image && form.image.trim() !== '') {
        finalGallery.push(form.image)
    }

    if (finalGallery.length === 0) {
        alert("Debes subir al menos una foto o ingresar una URL.")
        return
    }

    const coverImage = finalGallery[0]

    if (!form.title || !form.price || !form.location) {
      alert("Por favor completa los campos obligatorios.")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from('spaces').insert({
      owner_id: user.id,
      title: form.title,
      price: parseFloat(form.price),
      type: form.type,
      size: parseFloat(form.size) || 0,
      location: form.location,
      image: coverImage, 
      images: finalGallery, 
      description: form.description,
      lat: form.lat,
      lng: form.lng,
      amenities: form.amenities,
      created_at: new Date()
    })

    if (error) {
      alert("Error: " + error.message)
      setIsSubmitting(false)
    } else {
      alert("¡Espacio publicado con éxito!")
      router.push('/dashboard')
    }
  }

  if (authLoading) return <div className="h-screen flex items-center justify-center font-bold text-black">Cargando...</div>

  return (
    <div className="bg-gray-50 min-h-screen text-black">
      <div className="max-w-4xl mx-auto py-12 px-6">
        
        {/* BOTÓN VOLVER (Limpio y afuera de la card) */}
        <Link href="/spaces" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition font-bold mb-8 no-underline">
            <ArrowLeft size={20} /> Volver
        </Link>

        {/* TARJETA DEL FORMULARIO CON ENCABEZADO NEGRO */}
        <div className="bg-white border border-gray-200 shadow-2xl overflow-hidden" style={{ borderRadius: '32px' }}>
            
            {/* ENCABEZADO ESTILO TARJETA (FONDO NEGRO) */}
            <div className="bg-[#334155] p-10 text-white">
                <h1 className="font-serif text-3xl font-bold mb-2 text-white">Publicar nuevo espacio</h1>
                <p className="text-gray-400">Completa todos los campos para que tu propiedad destaque.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            
            {/* SECCIÓN 1: GALERÍA */}
            <div>
                <h3 className="font-bold text-xl border-b border-gray-100 pb-4 mb-6 text-black flex justify-between items-center">
                    Galería de Fotos
                    <span className="text-xs text-gray-400 font-normal">{uploadedImages.length + (form.image ? 1 : 0)}/7</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Botón Subir */}
                    {uploadedImages.length < 6 && (
                        <label className="border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
                            {uploading ? (
                                <Loader2 className="animate-spin text-gray-400" size={24} />
                            ) : (
                                <>
                                    <Upload className="text-black mb-2" size={20} />
                                    <span className="text-xs font-bold text-gray-500">Subir foto</span>
                                </>
                            )}
                        </label>
                    )}

                    {/* Fotos Subidas */}
                    {uploadedImages.map((img, index) => (
                        <div key={index} className="relative h-32 rounded-2xl overflow-hidden border border-gray-200 group">
                            <img src={img} className="w-full h-full object-cover" alt={`Foto ${index + 1}`} />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition"><X size={12} /></button>
                            {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1">PORTADA</span>}
                        </div>
                    ))}

                    {/* Preview URL */}
                    {form.image && (
                        <div className="relative h-32 rounded-2xl overflow-hidden border border-gray-200 group">
                            <img src={form.image} className="w-full h-full object-cover" alt="URL Preview" onError={(e) => e.target.style.display = 'none'} />
                            <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-[10px] font-bold text-center py-1">DESDE URL</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">O pegar URL (Opcional)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-3.5 text-gray-400"><ImageIcon size={18}/></div>
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition text-sm text-black"
                            placeholder="https://..."
                            value={form.image}
                            onChange={e => setForm({...form, image: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
            <div>
                <h3 className="font-bold text-xl border-b border-gray-100 pb-4 mb-6 text-black">Información Básica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Título del anuncio</label>
                    <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400"><Type size={18}/></div>
                    <input className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition text-black" placeholder="Ej: Showroom luminoso" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Precio por día (ARS)</label>
                    <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400"><DollarSign size={18}/></div>
                    <input type="number" className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition text-black" placeholder="0.00" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                    </div>
                </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo de espacio</label>
                    <div className="relative">
                    <select className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl outline-none focus:ring-2 ring-black transition appearance-none text-black" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                        <option>Local comercial</option><option>Pop-up Store</option><option>Estudio fotográfico</option><option>Espacio de eventos</option><option>Oficina temporal</option><option>Depósito</option>
                    </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tamaño (m²)</label>
                    <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400"><Maximize size={18}/></div>
                    <input type="number" className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition text-black" placeholder="Ej: 50" value={form.size} onChange={e => setForm({...form, size: e.target.value})} />
                    </div>
                </div>
                </div>
            </div>

            {/* SECCIÓN 3: UBICACIÓN */}
            <div>
                <h3 className="font-bold text-xl border-b border-gray-100 pb-4 mb-6 text-black">Ubicación</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Dirección exacta</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                        <div className="absolute left-4 top-3.5 text-gray-400"><MapPin size={18}/></div>
                        <input className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition text-black" placeholder="Dirección completa" value={form.location} onChange={e => setForm({...form, location: e.target.value})} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())} required />
                        </div>
                        <button type="button" onClick={handleSearchAddress} className="bg-black text-white px-6 rounded-xl font-bold hover:opacity-80 transition flex items-center gap-2">{isSearching ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}<span className="hidden md:inline">Buscar</span></button>
                    </div>
                    </div>
                    <div className="w-full border border-gray-200 overflow-hidden relative" style={{ height: '320px', borderRadius: '24px' }}>
                    <DashboardMap lat={form.lat} lng={form.lng} interactive={true} onSelect={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))} />
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"><span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-gray-200 text-black">Haz clic en el mapa para ajustar</span></div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: DETALLES */}
            <div>
                <h3 className="font-bold text-xl border-b border-gray-100 pb-4 mb-6 text-black">Detalles Adicionales</h3>
                
                <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Descripción detallada</label>
                <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-400"><FileText size={18}/></div>
                    <textarea rows="5" className="w-full bg-gray-50 border border-gray-200 p-3.5 pl-12 rounded-xl outline-none focus:ring-2 ring-black transition resize-none text-black" placeholder="Describe los beneficios..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                </div>

                <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES_LIST.map(amenity => {
                    const isSelected = form.amenities.includes(amenity)
                    return (
                        <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}>
                        <CheckCircle size={16} className={isSelected ? 'text-white' : 'text-gray-300'} /> {amenity}
                        </button>
                    )
                    })}
                </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <button type="submit" disabled={isSubmitting || uploading} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] transition disabled:opacity-50">
                {isSubmitting ? 'Publicando...' : 'Publicar mi espacio ahora'}
                </button>
            </div>

            </form>
        </div>
      </div>
    </div>
  )
}