'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Layers } from 'lucide-react'
// Importamos Flatpickr para las fechas (asegúrate de haberlo instalado)
import "flatpickr/dist/themes/light.css";
import Flatpickr from "react-flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";

export default function SearchForm() {
  const [location, setLocation] = useState('')
  const [dates, setDates] = useState([])
  const [type, setType] = useState('Todo')

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Buscando:", { location, dates, type })
    // Aquí luego redirigiremos a la página de resultados
  }

  return (
    <div className="glass-search w-full max-w-4xl mx-auto rounded-3xl md:rounded-full p-6 md:p-2 mt-8 animate-fade-in-up shadow-2xl bg-white/95 backdrop-blur-md border border-white/20">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
        
        {/* 1. Ubicación */}
        <div className="w-full md:w-1/3 px-6 py-4 md:py-3 relative group">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                <MapPin size={12} /> Ubicación
            </label>
            <input 
                type="text" 
                placeholder="¿Dónde buscas?" 
                className="w-full bg-transparent border-none p-0 text-brand placeholder-gray-400 font-bold focus:ring-0 text-sm outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
        </div>

        {/* 2. Fechas (Rango) */}
        <div className="w-full md:w-1/3 px-6 py-4 md:py-3 relative">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                <Calendar size={12} /> Fechas
            </label>
            <Flatpickr
                options={{
                    mode: "range",
                    minDate: "today",
                    locale: Spanish,
                    dateFormat: "d M",
                }}
                className="w-full bg-transparent border-none p-0 text-brand placeholder-gray-400 font-bold focus:ring-0 text-sm outline-none cursor-pointer"
                placeholder="Seleccionar fechas"
                value={dates}
                onChange={([date1, date2]) => setDates([date1, date2])}
            />
        </div>

        {/* 3. Tipo y Botón */}
        <div className="w-full md:w-1/3 flex flex-col md:flex-row items-center">
            <div className="w-full px-6 py-4 md:py-3 relative">
                 <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    <Layers size={12} /> Tipo
                 </label>
                 <select 
                    className="w-full bg-transparent border-none p-0 text-brand font-bold focus:ring-0 text-sm appearance-none cursor-pointer outline-none"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                 >
                    <option>Todo</option>
                    <option>Pop-up Store</option>
                    <option>Evento</option>
                    <option>Sesión de Fotos</option>
                    <option>Showroom</option>
                 </select>
            </div>

            <div className="p-2 w-full md:w-auto mt-2 md:mt-0">
                <button type="submit" className="w-full md:w-12 h-12 bg-black text-white rounded-xl md:rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg hover:shadow-xl">
                    <Search size={18} />
                    <span className="md:hidden ml-2 font-bold text-sm">Buscar</span>
                </button>
            </div>
        </div>

      </form>
    </div>
  )
}