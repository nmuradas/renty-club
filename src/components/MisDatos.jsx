'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, Loader2, Camera, Calendar, Maximize2, X } from 'lucide-react'

export default function MisDatos({ user, profile, refreshData }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    birth_date: profile?.birth_date || '',
    avatar_pos: profile?.avatar_pos || 50
  })
  
  const [email, setEmail] = useState(user?.email || '')
  const [pass, setPass] = useState({ new: '', confirm: '' })

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setForm(prev => ({ ...prev, avatar_url: publicUrl, avatar_pos: 50 }))
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      avatar_url: form.avatar_url,
      birth_date: form.birth_date,
      avatar_pos: form.avatar_pos 
    }).eq('id', user.id)

    if (error) alert(error.message)
    else { 
      alert("¡Perfil guardado!")
      window.dispatchEvent(new Event('profileUpdated'))
      refreshData() 
    }
    setLoading(false)
  }

  const updateEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    alert(error ? error.message : "Revisa tu email para confirmar")
    setLoading(false)
  }

  const updatePass = async (e) => {
    e.preventDefault()
    if (pass.new !== pass.confirm) return alert("Las claves no coinciden")
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pass.new })
    alert(error ? error.message : "Contraseña actualizada")
    setPass({ new: '', confirm: '' })
    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20 text-black">
      <h1 className="text-3xl font-bold tracking-tight">Mis Datos</h1>

      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 space-y-8 shadow-sm">
        <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-40 h-40 bg-white rounded-full border-4 border-white shadow-2xl overflow-hidden relative group">
                {form.avatar_url ? (
                  <img 
                    src={form.avatar_url} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: `center ${form.avatar_pos}%` }} 
                    alt="Foto de perfil"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-4xl font-bold">
                    {form.full_name?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                )}
                
                <button 
                  type="button" 
                  onClick={() => setShowFullImage(true)}
                  className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  <Maximize2 className="text-white" size={32} />
                </button>
              </div>

              <label className="absolute bottom-2 right-2 bg-black text-white p-3 rounded-full cursor-pointer border-2 border-white shadow-lg hover:scale-110 transition-transform">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>

            {form.avatar_url && (
              <div className="mt-6 w-48 space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-widest">Encuadrar imagen</p>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={form.avatar_pos} 
                  onChange={(e) => setForm({...form, avatar_pos: e.target.value})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            )}
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                    <input className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha de Nacimiento</label>
                    <input type="date" className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} />
                </div>
            </div>
            <button type="submit" disabled={loading || uploading} className="bg-black text-white p-4 rounded-2xl font-bold text-sm w-full transition-all active:scale-95">
              {loading ? "Guardando..." : "Guardar Perfil"}
            </button>
        </form>
      </div>

      <form onSubmit={updateEmail} className="bg-gray-50 p-8 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2"><Mail size={20}/> Email</h3>
        <input className="w-full bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" className="bg-white border border-gray-200 text-black px-8 py-3 rounded-2xl font-bold text-sm">Actualizar Email</button>
      </form>

      <form onSubmit={updatePass} className="bg-gray-50 p-8 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={20}/> Seguridad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black" type="password" placeholder="Nueva clave" value={pass.new} onChange={e => setPass({...pass, new: e.target.value})} />
          <input className="bg-white border border-gray-200 p-4 rounded-2xl outline-none focus:border-black" type="password" placeholder="Repetir clave" value={pass.confirm} onChange={e => setPass({...pass, confirm: e.target.value})} />
        </div>
        <button type="submit" className="bg-white border border-gray-200 text-black px-8 py-3 rounded-2xl font-bold text-sm">Cambiar Contraseña</button>
      </form>

      {/* MODAL SIN ERRORES DE BUILD */}
      {showFullImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
              <button 
                onClick={() => setShowFullImage(false)} 
                className="absolute top-8 right-8 text-white bg-white bg-opacity-10 p-4 rounded-full hover:bg-opacity-20 transition-all"
              >
                  <X size={32} />
              </button>
              <div className="w-full max-w-lg aspect-square rounded-full overflow-hidden border-8 border-white border-opacity-20 shadow-2xl">
                  <img 
                    src={form.avatar_url} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: `center ${form.avatar_pos}%` }} 
                    alt="Previsualización"
                  />
              </div>
          </div>
      )}
    </div>
  )
}