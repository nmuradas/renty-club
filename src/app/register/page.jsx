'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, User, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // 2. Guardar datos extra en tabla 'profiles'
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'user'
        })
        
        if (profileError) {
            // Si falla el perfil, avisamos pero no bloqueamos (el usuario ya se creó)
            console.error("Error creando perfil:", profileError)
        }
      }

      alert('¡Cuenta creada con éxito! Ahora ingresa.')
      router.push('/login')
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-card border border-border">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl italic mb-2">Bienvenido al club.</h1>
            <p className="text-secondary text-sm">Crea tu cuenta para empezar a explorar.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre Completo</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={16}/></div>
                    <input 
                        type="text" required 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition" 
                        placeholder="Ej. Juan Pérez"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16}/></div>
                    <input 
                        type="email" required 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:border-brand outline-none transition text-sm" 
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Contraseña</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16}/></div>
                    <input 
                        type="password" required 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:border-brand outline-none transition text-sm" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Confirmar Contraseña</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16}/></div>
                    <input 
                        type="password" required 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:border-brand outline-none transition text-sm" 
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg mt-6 flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-secondary">
            Al registrarte, aceptas nuestros <Link href="/legal" className="underline hover:text-black">Términos</Link> y <Link href="/legal" className="underline hover:text-black">Privacidad</Link>.
          </div>
        </div>

      </div>
    </div>
  )
}