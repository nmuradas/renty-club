'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([])
  useEffect(() => {
    supabase.from('spaces').select('*').then(({data}) => setSpaces(data || []))
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-24 px-6">
        <h1 className="text-4xl font-serif font-bold mb-10">Todos los Espacios</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {spaces.map(s => (
                <Link href={`/product?id=${s.id}`} key={s.id} className="block group">
                    <div className="h-64 bg-gray-100 rounded-2xl mb-4 overflow-hidden"><img src={s.image} className="w-full h-full object-cover group-hover:scale-105 transition"/></div>
                    <h3 className="font-bold text-lg">{s.title}</h3>
                    <p className="text-sm text-gray-500">{s.location}</p>
                    <p className="font-bold mt-2">${s.price}</p>
                </Link>
            ))}
        </div>
    </div>
  )
}