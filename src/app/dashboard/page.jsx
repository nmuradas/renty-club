'use client'

import MisDatos from '@/components/MisDatos'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Building, Calendar, Shield, MessageSquare, 
  DollarSign, Eye, Store, MapPin, 
  Send, X, RotateCcw, Trash2, LogOut, Plus, Edit, Search, CheckCircle,
  User as UserIcon, Ticket, Users
} from 'lucide-react'

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), { ssr: false })

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatBodyRef = useRef(null)
  
  // UI State
  const [activeTab, setActiveTab] = useState('hosting')
  const [profile, setProfile] = useState(null)
  
  // SINCRONIZACIÓN DE PESTAÑA
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
        setActiveTab(tab)
    } else {
        setActiveTab('hosting')
    }
  }, [searchParams])

  // Data State
  const [mySpaces, setMySpaces] = useState([])
  const [requests, setRequests] = useState([]) 
  const [rentals, setRentals] = useState([])
  const [blocks, setBlocks] = useState([]) 
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [chatInput, setChatInput] = useState('')

  // Event State (NUEVO)
  const [myEvents, setMyEvents] = useState([])
  const [eventRegistrations, setEventRegistrations] = useState([])
  const [myInscriptions, setMyInscriptions] = useState([]) // NUEVO: Para ver a qué eventos me anoté

  // Admin State
  const [adminUsers, setAdminUsers] = useState([])
  const [adminSpaces, setAdminSpaces] = useState([])
  const [adminBookings, setAdminBookings] = useState([])
  const [adminEvents, setAdminEvents] = useState([]) // NUEVO
  const [adminRegistrations, setAdminRegistrations] = useState([]) // NUEVO
  const [adminStats, setAdminStats] = useState({ users: 0, spaces: 0, bookings: 0, events: 0 })
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  
  // Forms
  const [newUser, setNewUser] = useState({ email: '', password: '' })
  const [editForm, setEditForm] = useState(null)
  const [editEventForm, setEditEventForm] = useState(null)
  const [blockForm, setBlockForm] = useState({ spaceId: null, startDate: '', endDate: '' })

  const AMENITIES_LIST = ["Seguridad 24hs", "WiFi", "Aire Acondicionado", "Baño privado", "Cochera", "Cocina"];
  const EVENT_CATEGORIES = ['Networking', 'Talleres', 'Social', 'Corporativo'];
  const pendingRequestsCount = requests ? requests.filter(r => r.status === 'pending').length : 0

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) loadAllData()
  }, [user, authLoading])

  useEffect(() => {
    if (activeThread && chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [activeThread, threads])

  async function loadAllData() {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)

    // Espacios
    const { data: s } = await supabase.from('spaces').select('*').eq('owner_id', user.id)
    setMySpaces(s || [])
    
    // Solicitudes y Rentas
    const { data: r } = await supabase.from('bookings').select('*, spaces(title, image)').eq('owner_id', user.id).neq('status', 'blocked').order('created_at', { ascending: false })
    setRequests(r || [])
    const { data: b } = await supabase.from('bookings').select('*').eq('owner_id', user.id).eq('status', 'blocked')
    setBlocks(b || [])
    const { data: rt } = await supabase.from('bookings').select('*, spaces(title, image, location)').eq('renter_id', user.id).neq('status', 'blocked').order('created_at', { ascending: false })
    setRentals(rt || [])

    // NUEVO: Cargar eventos a los que YO me inscribí
    const { data: myInsc } = await supabase.from('event_bookings').select('*, events(title, image, date, location)').eq('user_id', user.id)
    setMyInscriptions(myInsc || [])

    // Eventos (NUEVO)
    const { data: evs } = await supabase.from('events').select('*').eq('organizer_id', user.id)
    setMyEvents(evs || [])
    
    // Registrados a mis eventos
    const myEventIds = evs?.map(e => e.id) || []
    let regsQuery = supabase.from('event_bookings').select('*, events(title)')
    if (p?.role !== 'super_admin') {
        regsQuery = regsQuery.in('event_id', myEventIds)
    }
    const { data: regs } = await regsQuery
    setEventRegistrations(regs || [])

    loadMessages()
    if (p?.role === 'super_admin') loadAdminPanel()
  }

  async function loadMessages() {
    const { data: msgs } = await supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(email), receiver:profiles!messages_receiver_id_fkey(email), spaces(title, image)').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', {ascending: true})
    if (!msgs) return
    const grouped = {}
    msgs.forEach(m => {
        const isMe = m.sender_id === user.id
        const otherId = isMe ? m.receiver_id : m.sender_id
        const otherEmail = isMe ? (m.receiver?.email || 'Usuario') : (m.sender?.email || 'Usuario')
        const spaceTitle = m.spaces?.title || 'Consulta de Evento'
        const key = `${m.space_id}-${otherId}`
        if (!grouped[key]) {
            grouped[key] = { id: key, otherId, otherEmail, spaceTitle, spaceId: m.space_id, spaceImg: m.spaces?.image, msgs: [], lastMsgContent: '', lastMsgTime: '' }
        }
        grouped[key].msgs.push(m)
        grouped[key].lastMsgContent = m.content
        grouped[key].lastMsgTime = new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    })
    const threadsArray = Object.values(grouped)
    setThreads(threadsArray)
    if (activeThread) {
        const updatedActive = threadsArray.find(t => t.id === activeThread.id)
        if (updatedActive) setActiveThread(updatedActive)
    }
  }

  async function loadAdminPanel() {
    const { count: u } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: s } = await supabase.from('spaces').select('*', { count: 'exact', head: true })
    const { count: b } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
    const { count: e } = await supabase.from('events').select('*', { count: 'exact', head: true })
    setAdminStats({ users: u || 0, spaces: s || 0, bookings: b || 0, events: e || 0 })

    const { data: uList } = await supabase.from('profiles').select('*').order('created_at', {ascending:false})
    setAdminUsers(uList || [])
    const { data: sList } = await supabase.from('spaces').select('*').order('created_at', {ascending:false})
    setAdminSpaces(sList || [])
    const { data: bList } = await supabase.from('bookings').select('*, spaces(title)').order('created_at', {ascending:false})
    setAdminBookings(bList || [])
    const { data: eList } = await supabase.from('events').select('*').order('created_at', {ascending:false})
    setAdminEvents(eList || [])
    const { data: rList } = await supabase.from('event_bookings').select('*, events(title)').order('created_at', {ascending:false})
    setAdminRegistrations(rList || [])
  }

  const handleUpdateStatus = async (id, status) => { await supabase.from('bookings').update({ status }).eq('id', id); loadAllData() }
  const handleDeleteSpace = async (id) => { if(confirm("¿Eliminar espacio?")) { await supabase.from('spaces').delete().eq('id', id); loadAllData() } }
  const handleDeleteEvent = async (id) => { if(confirm("¿Eliminar evento?")) { await supabase.from('events').delete().eq('id', id); loadAllData() } }
  const handleDeleteBlock = async (id) => { if(confirm("¿Liberar fechas?")) { await supabase.from('bookings').delete().eq('id', id); loadAllData() } }
  const handleDeleteUser = async (id) => { if(confirm("¿Eliminar usuario?")) { await supabase.from('profiles').delete().eq('id', id); loadAdminPanel() } }
  const handleChangeRole = async (id, role) => { if(confirm(`¿Cambiar rol a ${role}?`)) { await supabase.from('profiles').update({ role }).eq('id', id); loadAdminPanel() } }
  
  // FUNCIONES DE EVENTOS
  const handleDeleteRegistration = async (id) => { if(confirm("¿Eliminar este registro?")) { await supabase.from('event_bookings').delete().eq('id', id); loadAllData() } }
  const handleSaveEditEvent = async () => {
    const { error } = await supabase.from('events').update({ 
        title: editEventForm.title, 
        date: editEventForm.date, 
        location: editEventForm.location, 
        category: editEventForm.category,
        image: editEventForm.image,
        description: editEventForm.description,
        lat: editEventForm.lat,
        lng: editEventForm.lng
    }).eq('id', editEventForm.id)
    if(error) alert(error.message); else { setShowEditEventModal(false); loadAllData(); }
  }
  const handleEditEventSearch = async () => {
    if(!editEventForm.location) return
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editEventForm.location)}`)
        const data = await res.json()
        if(data[0]) setEditEventForm({...editEventForm, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon)})
    } catch (e) { console.error(e) }
  }

  const handleSendMessage = async () => {
    if(!chatInput.trim() || !activeThread) return
    const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: activeThread.otherId, space_id: activeThread.spaceId, content: chatInput })
    if(!error) { setChatInput(''); loadMessages(); }
  }

  const handleCreateUser = async () => {
    const { error } = await supabase.auth.signUp({ email: newUser.email, password: newUser.password })
    if (error) alert("Error: " + error.message); else { alert("Usuario creado"); setShowUserModal(false); loadAdminPanel(); }
  }

  const handleSaveEdit = async () => {
    const { error } = await supabase.from('spaces').update({ title: editForm.title, price: editForm.price, location: editForm.location, image: editForm.image, size: editForm.size, amenities: editForm.amenities, lat: editForm.lat, lng: editForm.lng }).eq('id', editForm.id)
    if(error) alert(error.message); else { setShowEditModal(false); loadAllData(); }
  }

  const handleEditSearch = async () => {
    if(!editForm.location) return
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editForm.location)}`)
        const data = await res.json()
        if(data[0]) setEditForm({...editForm, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon)})
    } catch (e) { console.error(e) }
  }

  const toggleAmenity = (am) => {
    const current = editForm.amenities || []
    if (current.includes(am)) setEditForm({ ...editForm, amenities: current.filter(item => item !== am) })
    else setEditForm({ ...editForm, amenities: [...current, am] })
  }

  const handleBlockDates = async () => {
    if(!blockForm.startDate || !blockForm.endDate) return alert("Selecciona fechas")
    await supabase.from('bookings').insert({ space_id: blockForm.spaceId, owner_id: user.id, renter_id: user.id, start_date: blockForm.startDate, end_date: blockForm.endDate, status: 'blocked', total_price: 0 })
    setShowBlockModal(false); loadAllData()
  }

  const openEdit = (s) => { setEditForm({ ...s, amenities: s.amenities || [] }); setShowEditModal(true); }
  const openEditEvent = (ev) => { setEditEventForm({ ...ev }); setShowEditEventModal(true); }
  const openBlock = (id) => { setBlockForm({...blockForm, spaceId: id}); setShowBlockModal(true); }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); }

  if (authLoading || !profile) return <div className="h-screen flex items-center justify-center font-bold text-black">Cargando...</div>

  return (
    <div className="flex bg-white text-black overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      
      <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col h-full shrink-0 z-20">
        <nav className="p-4 pt-8 space-y-1 flex-1 overflow-y-auto">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Menu Principal</p>
            <button onClick={() => setActiveTab('hosting')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='hosting' ? 'bg-white shadow-sm text-black border border-gray-200 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}><Store size={18}/> Mis Espacios</button>
            <button onClick={() => setActiveTab('rentals')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='rentals' ? 'bg-white shadow-sm text-black border border-gray-200 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}><Calendar size={18}/> Mis Reservas</button>
            <button onClick={() => setActiveTab('myevents')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='myevents' ? 'bg-white shadow-sm text-black border border-gray-200 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}><Ticket size={18}/> Mis Eventos</button>
            <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='messages' ? 'bg-white shadow-sm text-black border border-gray-200 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}><MessageSquare size={18}/> Mensajes</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='profile' ? 'bg-white shadow-sm text-black border border-gray-200 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}><UserIcon size={18}/> Mis Datos</button>
            
            {profile.role === 'super_admin' && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Admin</p>
                    <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab==='admin' ? 'bg-red-50 text-red-600 font-bold' : 'text-red-600 hover:bg-red-50'}`}><Shield size={18}/> Panel Maestro</button>
                </div>
            )}
        </nav>
        <div className="p-6 border-t border-gray-200 shrink-0">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors"><LogOut size={18}/> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-white">
        
        {activeTab === 'profile' && (
            <MisDatos user={user} profile={profile} refreshData={loadAllData} />
        )}

        {/* CONTENIDO MIS EVENTOS (DUEÑO) */}
        {activeTab === 'myevents' && (
          <div className="animate-fade-in-up space-y-12 text-black">
             <div className="flex justify-between items-end mb-10">
                <div><h1 className="text-3xl font-bold text-black">Tus Eventos</h1><p className="text-gray-500 text-sm mt-2">Gestiona las experiencias que organizas.</p></div>
                <Link href="/events/create" className="bg-black text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg flex items-center gap-2"><Plus size={16}/> Crear nuevo evento</Link>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="font-bold text-lg mb-6 text-black">Eventos Activos</h3>
                <div className="grid grid-cols-1 gap-4">
                  {myEvents.length === 0 ? <p className="text-gray-400">No has creado eventos todavía.</p> : 
                    myEvents.map(e => (
                      <div key={e.id} className="bg-gray-50 p-5 border border-gray-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4 text-black">
                          <img src={e.image} className="w-14 h-14 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-bold text-black">{e.title}</h4>
                            <p className="text-xs text-gray-500">{e.date} • {e.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={()=>openEditEvent(e)} className="p-2 text-gray-400 hover:text-black transition"><Edit size={18}/></button>
                           <button onClick={()=>handleDeleteEvent(e.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-black"><Users size={20}/> Registrados a mis eventos</h3>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm text-black">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-bold">Evento</th>
                        <th className="px-6 py-4 font-bold">Email Registrado</th>
                        <th className="px-6 py-4 font-bold text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {eventRegistrations.map(reg => (
                        <tr key={reg.id}>
                          <td className="px-6 py-4 font-bold">{reg.events?.title}</td>
                          <td className="px-6 py-4">{reg.email}</td>
                          <td className="px-6 py-4 text-right"><button onClick={()=>handleDeleteRegistration(reg.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hosting' && (
            <div className="animate-fade-in-up space-y-10">
                <div className="flex justify-between items-end mb-10">
                    <div><h1 className="text-3xl font-bold text-black">Hola, {profile.full_name?.split(' ')[0] || 'Usuario'} 👋</h1><p className="text-gray-500 text-sm mt-2">Gestiona tus publicaciones.</p></div>
                    <Link href="/create" className="bg-black text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg flex items-center gap-2"><Plus size={16}/> Publicar nuevo espacio</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-50 p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-32 rounded-2xl"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg mb-2"><Building size={20}/></div><div><p className="text-2xl font-bold text-black">{mySpaces.length}</p><p className="text-xs text-gray-400 font-medium">Espacios activos</p></div></div>
                    <div className="bg-gray-50 p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-32 rounded-2xl"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-lg mb-2"><DollarSign size={20}/></div><div><p className="text-2xl font-bold text-black">$0</p><p className="text-xs text-gray-400 font-medium">Ingresos totales</p></div></div>
                    <div className="bg-gray-50 p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-32 rounded-2xl"><div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-lg mb-2"><Eye size={20}/></div><div><p className="text-2xl font-bold text-black">0</p><p className="text-xs text-gray-400 font-medium">Vistas totales</p></div></div>
                    <div className="bg-gray-50 p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-32 rounded-2xl"><div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-lg mb-2"><Calendar size={20}/></div><div><p className="text-2xl font-bold text-black">{pendingRequestsCount}</p><p className="text-xs text-gray-400 font-medium">Solicitudes pendientes</p></div></div>
                </div>
                <div className="space-y-12">
                    <div>
                        <h3 className="font-bold text-lg mb-6">Solicitudes Recientes</h3>
                        <div className="space-y-4 text-black">
                            {requests.length === 0 ? <div className="bg-gray-50 p-8 border border-gray-200 text-center rounded-2xl"><MessageSquare className="text-3xl text-gray-300 mx-auto mb-3"/><p className="text-sm text-gray-500 font-medium">No tienes solicitudes pendientes.</p></div> : 
                                requests.map(r => (
                                    <div key={r.id} className="bg-gray-50 p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl text-black">
                                        <div className="flex items-center gap-4 text-black"><img src={r.spaces?.image} className="w-14 h-14 rounded-lg object-cover bg-gray-100 border border-gray-200" /><div className="text-black"><div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-sm text-black">{r.spaces?.title}</h4><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${r.status==='pending'?'bg-yellow-100 text-yellow-800':(r.status==='approved'?'bg-green-100 text-green-800':'bg-red-100 text-red-800')}`}>{r.status}</span></div><p className="text-xs text-gray-500 font-medium flex items-center gap-1"><Calendar size={12}/> {r.start_date} — {r.end_date}</p></div></div>
                                        <div className="flex gap-2">
                                            {r.status === 'pending' && (<><button onClick={()=>handleUpdateStatus(r.id, 'approved')} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition">Aprobar</button><button onClick={()=>handleUpdateStatus(r.id, 'rejected')} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition">Rechazar</button></>)}
                                            {r.status === 'approved' && (<button onClick={()=>handleUpdateStatus(r.id, 'cancelled')} className="text-red-500 text-xs font-bold hover:underline">Cancelar</button>)}
                                            {(r.status === 'cancelled' || r.status === 'rejected') && (<button onClick={()=>handleUpdateStatus(r.id, 'approved')} className="text-green-600 font-bold text-xs flex items-center gap-1 hover:underline"><RotateCcw size={12}/> Re-Aprobar</button>)}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-black">Mis Espacios</h3>
                        <div className="space-y-4">
                            {mySpaces.length === 0 ? <p className="text-gray-400">No tienes espacios publicados.</p> : 
                                mySpaces.map(s => {
                                    const spaceBlocks = blocks.filter(b => b.space_id === s.id)
                                    return (
                                        <div key={s.id} className="bg-gray-50 p-5 border border-gray-200 shadow-sm rounded-2xl text-black">
                                            <div className="flex gap-5 text-black">
                                                <img src={s.image} className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-200" />
                                                <div className="flex-1 flex flex-col justify-center text-black">
                                                    <h4 className="font-bold text-base text-black mb-1">{s.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12}/> {s.location}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={()=>openEdit(s)} className="text-xs font-bold text-black bg-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-300">Editar</button>
                                                        <button onClick={()=>openBlock(s.id)} className="text-xs font-bold text-gray-500 border border-gray-300 px-3 py-1.5 rounded-md hover:text-black">Bloquear</button>
                                                        <button onClick={()=>handleDeleteSpace(s.id)} className="text-xs font-bold text-red-400 hover:text-red-600 px-2 py-1.5">Eliminar</button>
                                                    </div>
                                                </div>
                                            </div>
                                            {spaceBlocks.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 text-black">
                                                    {spaceBlocks.map(sb => (
                                                        <div key={sb.id} className="bg-white border border-red-100 text-[10px] px-2 py-1 rounded flex items-center gap-2 text-gray-500"><Calendar size={10} className="text-red-400"/> {sb.start_date}<button onClick={()=>handleDeleteBlock(sb.id)} className="text-red-400 hover:text-red-600"><X size={12}/></button></div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'rentals' && (
            <div className="animate-fade-in-up space-y-12 text-black">
                <h1 className="text-3xl font-bold mb-8">Mis reservas</h1>
                
                {/* SECCIÓN ESPACIOS */}
                <div>
                  <h3 className="font-bold text-lg mb-6">Espacios</h3>
                  <div className="space-y-4 max-w-4xl text-black">
                      {rentals.map(r => (
                          <div key={r.id} className="bg-gray-50 border border-gray-200 shadow-sm p-4 flex gap-5 items-center rounded-2xl text-black">
                              <img src={r.spaces?.image} className="w-32 h-24 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1 text-black"><h4 className="font-bold text-black text-lg">{r.spaces?.title}</h4><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${r.status==='approved'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{r.status}</span></div>
                                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin size={12}/> {r.spaces?.location}</p>
                                  <div className="flex items-center gap-4 text-sm font-medium text-black"><span className="flex items-center gap-2 text-black"><Calendar size={14}/> {r.start_date} - {r.end_date}</span></div>
                                  {(r.status === 'pending' || r.status === 'approved') && (<button onClick={()=>handleUpdateStatus(r.id, 'cancelled')} className="text-red-400 text-xs font-bold hover:underline mt-2">Cancelar solicitud</button>)}
                              </div>
                          </div>
                      ))}
                      {rentals.length === 0 && <p className="text-gray-400 text-sm">No has reservado espacios todavía.</p>}
                  </div>
                </div>

                {/* NUEVA SECCIÓN: EVENTOS A LOS QUE ME ANOTÉ */}
                <div>
                  <h3 className="font-bold text-lg mb-6">Eventos a los que asistiré</h3>
                  <div className="space-y-4 max-w-4xl text-black">
                      {myInscriptions.map(er => (
                          <div key={er.id} className="bg-gray-50 border border-gray-200 shadow-sm p-4 flex gap-5 items-center rounded-2xl text-black">
                              <img src={er.events?.image} className="w-32 h-24 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                              <div className="flex-1">
                                  <h4 className="font-bold text-black text-lg">{er.events?.title}</h4>
                                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12}/> {er.events?.location}</p>
                                  <p className="text-sm font-bold flex items-center gap-2 text-black"><Calendar size={14}/> {er.events?.date}</p>
                                  <button onClick={()=>handleDeleteRegistration(er.id)} className="text-red-400 text-xs font-bold hover:underline mt-2">Cancelar mi lugar en el evento</button>
                              </div>
                          </div>
                      ))}
                      {myInscriptions.length === 0 && <p className="text-gray-400 text-sm">No te has registrado a ningún evento todavía.</p>}
                  </div>
                </div>
            </div>
        )}

        {activeTab === 'messages' && (
            <div className="grid grid-cols-12 bg-white border border-gray-200 shadow-sm overflow-hidden rounded-2xl" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="col-span-4 border-r border-gray-200 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-200 shrink-0 bg-gray-50"><h2 className="font-bold text-lg mb-2 text-black">Mensajes</h2><input className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs outline-none" placeholder="Buscar..."/></div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {threads.map(t => (
                            <div key={t.id} onClick={()=>setActiveThread(t)} className={`p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition flex items-start gap-3 border-b border-gray-50 last:border-0 ${activeThread?.id===t.id?'bg-gray-100':''}`}>
                                {t.spaceImg ? (
                                    <img src={t.spaceImg} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">E</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-xs text-black truncate" style={{ maxWidth: '120px' }}>{t.spaceTitle}</h4><span className="text-[10px] text-gray-400">{t.lastMsgTime}</span></div>
                                    <p className="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">{t.otherEmail}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{t.lastMsgContent}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-8 flex flex-col h-full overflow-hidden relative">
                    {activeThread ? (
                        <>
                            <div className="h-16 shrink-0 p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10"><h3 className="font-bold text-sm text-black">{activeThread.otherEmail}</h3></div>
                            <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gray-50">
                                {activeThread.msgs.map(m => (
                                    <div key={m.id} className={`flex flex-col ${m.sender_id===user.id?'items-end':'items-start'} w-full text-black`}>
                                        <div className={`${m.sender_id===user.id?'bg-black text-white rounded-br-none':'bg-white text-black border border-gray-200 rounded-bl-none'} px-4 py-2 rounded-xl max-w-xs text-sm shadow-sm break-all whitespace-pre-wrap`}>{m.content}</div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-20 shrink-0 p-4 border-t border-gray-200 bg-white flex items-center gap-2">
                                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-black" placeholder="Escribí un mensaje..." />
                                <button onClick={handleSendMessage} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center"><Send size={14}/></button>
                            </div>
                        </>
                    ) : <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10"><MessageSquare className="text-4xl text-gray-200 mb-2"/><p className="text-gray-400 text-sm">Seleccioná un chat</p></div>}
                </div>
            </div>
        )}

        {/* ADMIN (TODO RESTAURADO) */}
        {activeTab === 'admin' && (
            <div className="animate-fade-in-up space-y-12 text-black">
                <div className="bg-gray-50 p-8 border border-gray-200 shadow-sm rounded-2xl text-black">
                    <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-red-600">Super Admin</h2><button onClick={() => setShowUserModal(true)} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold">+ Nuevo Usuario</button></div>
                    <div className="grid grid-cols-4 gap-6 mb-12 text-black">
                        <div className="bg-black text-white p-6 rounded-2xl shadow-lg"><p className="text-xs font-bold opacity-60 mb-1 uppercase tracking-wide">Usuarios</p><p className="text-4xl font-bold">{adminStats.users}</p></div>
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-black"><p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Propiedades</p><p className="text-4xl font-bold text-black">{adminStats.spaces}</p></div>
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-black"><p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Reservas</p><p className="text-4xl font-bold text-black">{adminStats.bookings}</p></div>
                        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-black"><p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Eventos</p><p className="text-4xl font-bold text-black">{adminStats.events}</p></div>
                    </div>
                    
                    <div className="space-y-12 text-black">
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                            <p className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase text-gray-500">Usuarios</p>
                            <table className="min-w-full divide-y divide-gray-200 text-black"><tbody className="bg-white divide-y divide-gray-200 text-black">{adminUsers.map(u => (<tr key={u.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{u.email}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><select value={u.role} onChange={(e)=>handleChangeRole(u.id, e.target.value)} className="bg-white border border-gray-200 text-xs rounded-lg p-1 text-black"><option value="user">Usuario</option><option value="owner">Dueño</option><option value="super_admin">Super Admin</option></select></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={()=>handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">Eliminar</button></td></tr>))}</tbody></table>
                        </div>
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                            <p className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase text-gray-500">Propiedades Globales</p>
                            <table className="min-w-full divide-y divide-gray-200 text-black"><tbody className="bg-white divide-y divide-gray-200 text-black">{adminSpaces.map(s => (<tr key={s.id} className="hover:bg-gray-50 text-black"><td className="px-6 py-4 flex items-center gap-3 font-bold text-black"><img src={s.image} className="w-8 h-8 rounded object-cover"/>{s.title}</td><td className="px-6 py-4 text-right text-black"><button onClick={()=>openEdit(s)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit size={16}/></button><button onClick={()=>handleDeleteSpace(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
                        </div>
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                            <p className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase text-gray-500">Eventos Globales</p>
                            <table className="min-w-full divide-y divide-gray-200 text-black">
                                <tbody className="bg-white divide-y divide-gray-200 text-black">
                                    {adminEvents.map(e => (
                                        <tr key={e.id} className="hover:bg-gray-50 text-black">
                                            <td className="px-6 py-4 flex items-center gap-3 font-bold text-black"><img src={e.image} className="w-8 h-8 rounded object-cover"/>{e.title}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{e.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={()=>openEditEvent(e)} className="text-blue-500 mr-3"><Edit size={16}/></button>
                                                <button onClick={()=>handleDeleteEvent(e.id)} className="text-red-500"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="overflow-hidden border border-gray-200 rounded-xl text-black">
                            <p className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase text-gray-500">Registrados a Eventos (Global)</p>
                            <table className="min-w-full divide-y divide-gray-200 text-sm text-black">
                                <thead className="bg-gray-50"><tr className="text-black"><th className="px-6 py-3 text-left font-bold">Evento</th><th className="px-6 py-3 text-left font-bold">Email</th><th className="px-6 py-3 text-right">Acción</th></tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-black">{adminRegistrations.map(r => (<tr key={r.id} className="hover:bg-gray-50 text-black"><td className="px-6 py-4 font-bold text-black">{r.events?.title}</td><td className="px-6 py-4 text-black">{r.email}</td><td className="px-6 py-4 text-right"><button onClick={()=>handleDeleteRegistration(r.id)} className="text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody>
                            </table>
                        </div>
                        <div className="overflow-hidden border border-gray-200 rounded-xl text-black ">
                            <p className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase  text-black">Reservas Globales</p>
                            <table className="w-full text-sm text-black">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs  text-black">
                                    <tr><th className="px-6 py-3 text-left">Propiedad</th><th className="px-6 py-3 text-left">Fechas</th><th className="px-6 py-3 text-left">Estado</th><th className="px-6 py-3 text-right">Acción</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-black">
                                    {adminBookings.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition text-black">
                                            <td className="px-6 py-4 font-bold text-black">{b.spaces?.title}</td>
                                            <td className="px-6 py-4  text-xs text-black">{b.start_date} - {b.end_date}</td>
                                            <td className="px-6 py-4 uppercase font-bold text-xs text-black">{b.status}</td>
                                            <td className="px-6 py-4 text-right text-black">
                                                {(b.status === 'rejected' || b.status === 'cancelled') && (<button onClick={()=>handleUpdateStatus(b.id, 'approved')} className="text-green-600 font-bold text-xs mr-4"><RotateCcw size={12} className="inline mr-1"/> Re-Aprobar</button>)}
                                                <button onClick={()=>handleUpdateStatus(b.id, 'cancelled')} className="text-red-500 font-bold text-xs">Cancelar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* MODAL EDITAR EVENTO */}
      {showEditEventModal && editEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4  text-black">
            <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto text-black" style={{ maxHeight: '90vh' }}>
                <h3 className="text-xl font-bold mb-6 text-black">Editar Evento</h3>
                <div className="grid grid-cols-2 gap-4 mb-4 text-black">
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Título</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-black" value={editEventForm.title} onChange={e=>setEditEventForm({...editEventForm, title:e.target.value})}/></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase">Fecha</label><input type="date" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-black" value={editEventForm.date} onChange={e=>setEditEventForm({...editEventForm, date:e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-black">
                    <div><label className="text-xs font-bold  uppercase text-black">Categoría</label>
                      <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-black" value={editEventForm.category} onChange={e=>setEditEventForm({...editEventForm, category:e.target.value})}>
                        {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold  uppercase text-black">Ubicación</label>
                        <div className="flex gap-2 mt-1">
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-black" value={editEventForm.location} onChange={e=>setEditEventForm({...editEventForm, location:e.target.value})}/>
                            <button onClick={handleEditEventSearch} className="bg-black text-white px-4 rounded-xl text-xs font-bold">Buscar</button>
                        </div>
                    </div>
                </div>
                <div className="mb-6"><label className="text-xs font-bold  uppercase text-black">Imagen URL</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-black" value={editEventForm.image} onChange={e=>setEditEventForm({...editEventForm, image:e.target.value})}/></div>
                <div className="mb-6"><label className="text-xs font-bold  uppercase text-black">Descripción</label><textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl mt-1 text-black" rows="3" value={editEventForm.description} onChange={e=>setEditEventForm({...editEventForm, description:e.target.value})}/></div>
                <div className="h-48 border border-gray-200 rounded-xl mb-6 overflow-hidden"><DashboardMap lat={editEventForm.lat} lng={editEventForm.lng} /></div>
                <div className="flex gap-3"><button onClick={()=>setShowEditEventModal(false)} className="flex-1 font-bold text-gray-500 py-3">Cancelar</button><button onClick={handleSaveEditEvent} className="flex-1 bg-black  rounded-xl font-bold py-3 text-white">Guardar Cambios</button></div>
            </div>
        </div>
      )}

      {/* MODAL EDITAR ESPACIO */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 text-black">
            <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto" style={{ maxHeight: '90vh' }}>
                <h3 className="text-xl font-bold mb-6 text-black">Editar Propiedad</h3>
                <div className="grid grid-cols-2 gap-4 mb-4 text-black">
                    <div><label className="text-xs font-bold t0 uppercase text-black">Título</label><input className="w-full bg-gray-50 border p-3 rounded-xl mt-1 text-black" value={editForm.title} onChange={e=>setEditForm({...editForm, title:e.target.value})}/></div>
                    <div><label className="text-xs font-bold uppercase text-black">Precio</label><input type="number" className="w-full bg-gray-50 border p-3 rounded-xl mt-1 text-black" value={editForm.price} onChange={e=>setEditForm({...editForm, price:e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-black">
                    <div><label className="text-xs font-bold uppercase text-black">Tamaño (m²)</label><input type="number" className="w-full bg-gray-50 border p-3 rounded-xl mt-1 text-black" value={editForm.size || ''} onChange={e=>setEditForm({...editForm, size:e.target.value})}/></div>
                    <div>
                        <label className="text-xs font-bold uppercase text-black">Ubicación</label>
                        <div className="flex gap-2 mt-1 text-black">
                            <input className="w-full bg-gray-50 border p-3 rounded-xl text-black" value={editForm.location} onChange={e=>setEditForm({...editForm, location:e.target.value})}/>
                            <button onClick={handleEditSearch} className="bg-black text-white px-4 rounded-xl text-xs font-bold">Buscar</button>
                        </div>
                    </div>
                </div>
                <div className="mb-6"><label className="text-xs font-bold uppercase text-black">Imagen URL</label><input className="w-full bg-gray-50 border p-3 rounded-xl mt-1 text-black" value={editForm.image} onChange={e=>setEditForm({...editForm, image:e.target.value})}/></div>
                <div className="mb-6 text-black"><label className="text-xs font-bold uppercase mb-2 block text-black">Amenities</label><div className="grid grid-cols-3 gap-2">{AMENITIES_LIST.map(am => (<button key={am} onClick={()=>toggleAmenity(am)} className={`p-2 rounded-lg text-[10px] font-bold border ${editForm.amenities?.includes(am) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>{am}</button>))}</div></div>
                <div className="h-48 border rounded-xl mb-6 overflow-hidden text-black"><DashboardMap lat={editForm.lat} lng={editForm.lng} /></div>
                <div className="flex gap-3 text-black"><button onClick={()=>setShowEditModal(false)} className="flex-1 font-bold  py-3 ">Cancelar</button><button onClick={handleSaveEdit} className="flex-1 bg-black  rounded-xl font-bold py-3 text-white">Guardar Cambios</button></div>
            </div>
        </div>
      )}

      {/* MODAL NUEVO USUARIO */}
      {showUserModal && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 text-black"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-black"><h3 className="font-bold text-xl mb-6 text-black">Nuevo Usuario</h3><input className="w-full border border-gray-200 p-4 rounded-2xl mb-4 text-black outline-none" placeholder="Email" onChange={e=>setNewUser({...newUser, email: e.target.value})}/><input className="w-full border border-gray-200 p-4 rounded-2xl mb-8 text-black outline-none" type="password" placeholder="Pass" onChange={e=>setNewUser({...newUser, password: e.target.value})}/><div className="flex gap-3 text-black"><button onClick={()=>setShowUserModal(false)} className="flex-1 font-bold  text-black">Cerrar</button><button onClick={handleCreateUser} className="flex-1 bg-black text-white rounded-2xl py-4 font-bold shadow-xl">Crear</button></div></div></div>)}

      {/* MODAL BLOQUEAR */}
      {showBlockModal && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 text-black"><div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-black"><h3 className="font-bold text-xl mb-2 text-black">Bloquear Fechas</h3><p className="text-xs  mb-6 text-black">Elige el rango no disponible.</p><input type="date" className="w-full border border-gray-200 p-3 rounded-xl mb-2 text-black" onChange={e=>setBlockForm({...blockForm, startDate:e.target.value})}/><input type="date" className="w-full border border-gray-200 p-3 rounded-xl mb-6 text-black" onChange={e=>setBlockForm({...blockForm, endDate:e.target.value})}/><div className="flex gap-3 text-black"><button onClick={()=>setShowBlockModal(false)} className="flex-1 font-bold  text-black">Cancelar</button><button onClick={handleBlockDates} className="flex-1 bg-black text-white rounded-xl py-3 font-bold">Confirmar</button></div></div></div>)}
    </div>
  )
}