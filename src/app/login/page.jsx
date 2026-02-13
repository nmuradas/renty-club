'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Si todo sale bien, vamos al dashboard
      router.push('/dashboard')
      router.refresh() // Actualiza el estado del Navbar
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-card border border-border">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl italic mb-2">Bienvenido de nuevo.</h1>
            <p className="text-secondary text-sm">Ingresa a tu cuenta para gestionar tus reservas.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg text-center">
              {error === 'Invalid login credentials' ? 'Credenciales incorrectas' : error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Email</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={16} />
                    </div>
                    <input 
                        type="email" 
                        required 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:border-brand outline-none transition text-sm" 
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Contraseña</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={16} />
                    </div>
                    <input 
                        type="password" 
                        required 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl focus:border-brand outline-none transition text-sm" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg mt-6 flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-secondary">
            ¿No tienes cuenta? <Link href="/register" className="font-bold text-brand hover:underline">Regístrate gratis</Link>
          </div>
        </div>

      </div>
    </div>
  )
}