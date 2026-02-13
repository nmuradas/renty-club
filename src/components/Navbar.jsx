'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Para detectar la ruta actual
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Menu, User, LogOut, LayoutDashboard, Settings, Shield } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname() // Ruta actual (ej: "/" o "/events")
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const menuRef = useRef(null)

  const loadProfileData = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, avatar_pos, role')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      if (data.role === 'super_admin') setIsAdmin(true)
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [user])

  useEffect(() => {
    const handleProfileUpdate = () => loadProfileData()
    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate)
  }, [user])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuRef])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.push('/login')
  }

  const closeMenu = () => setIsMenuOpen(false)

  // Lógica de estilos activos
  const isEventsActive = pathname === '/events'
  const isSpacesActive = pathname === '/'

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-serif text-xl italic rounded-lg">R</div>
            <span className="text-xl font-bold tracking-tight text-black">RentyClub</span>
        </Link>

        {/* NAVEGACIÓN CENTRAL */}
        <div className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/" 
              className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 ${
                isSpacesActive 
                ? 'bg-gray-100 border border-gray-200 text-black' 
                : 'text-gray-500 hover:text-black'
              }`}
            >
              Espacios
            </Link>
            
            <Link 
              href="/events" 
              className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 ${
                isEventsActive 
                ? 'bg-gray-100 border border-gray-200 text-black' 
                : 'text-gray-500 hover:text-black'
              }`}
            >
              Eventos
            </Link>

            {/* PUBLICAR ESPACIO: Azul Gris Oscuro */}
            <Link 
              href="/create" 
              className="text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 bg-[#334155] text-white hover:bg-[#1e293b]"
            >
              Publicar Espacio
            </Link>
        </div>

        {/* DERECHA: USUARIO */}
        <div className="flex items-center gap-4 shrink-0">
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 border border-gray-200 rounded-full pl-3 pr-1 py-1 hover:shadow-md transition bg-white"
                >
                    <Menu size={18} className="text-black ml-1"/>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                       {profile?.avatar_url ? (
                         <img 
                            src={profile.avatar_url} 
                            className="w-full h-full object-cover" 
                            style={{ objectPosition: `center ${profile.avatar_pos || 50}%` }}
                         />
                       ) : (
                         <span className="font-bold text-xs text-gray-500">
                            {user?.email?.[0].toUpperCase()}
                         </span>
                       )}
                    </div>
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 flex flex-col z-50">
                        {user ? (
                            <>
                                <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Cuenta</p>
                                    <p className="text-sm font-bold text-black truncate">{user.email}</p>
                                </div>
                                <Link href="/dashboard?tab=hosting" onClick={closeMenu} className="px-4 py-3 text-sm font-medium text-black hover:bg-gray-50 flex items-center gap-3">
                                    <LayoutDashboard size={16}/> Panel de Control
                                </Link>
                                <Link href="/dashboard?tab=profile" onClick={closeMenu} className="px-4 py-3 text-sm font-medium text-black hover:bg-gray-50 flex items-center gap-3">
                                    <Settings size={16}/> Mis Datos
                                </Link>
                                {isAdmin && (
                                    <Link href="/dashboard?tab=admin" onClick={closeMenu} className="px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-50 mt-1">
                                        <Shield size={16}/> Panel Maestro
                                    </Link>
                                )}
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:text-red-500 flex items-center gap-3">
                                    <LogOut size={16}/> Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={closeMenu} className="px-4 py-3 text-sm font-bold text-black hover:bg-gray-50">Iniciar Sesión</Link>
                                <Link href="/register" onClick={closeMenu} className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">Registrarse</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </nav>
  )
}