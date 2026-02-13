'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-8 tracking-tighter text-black">Política de Cookies</h1>
        <div className="text-gray-600 space-y-6 leading-relaxed">
          <p className="font-bold text-black uppercase tracking-widest text-xs">Transparencia Total</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se guardan en tu navegador cuando visitás RentyClub. Nos ayudan a recordar tus preferencias y a que la plataforma funcione de forma fluida.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">Cookies que utilizamos</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong className="text-black">Esenciales:</strong> Necesarias para que inicies sesión y tu cuenta se mantenga segura.</li>
              <li><strong className="text-black">Preferencias:</strong> Recuerdan filtros de búsqueda o tu ubicación en el mapa.</li>
              <li><strong className="text-black">Análisis:</strong> Nos ayudan a entender qué partes del club son las más usadas para mejorarlas.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">Control de cookies</h2>
            <p>Podés configurar tu navegador para bloquear o eliminar cookies, pero tené en cuenta que esto puede afectar el funcionamiento de algunas herramientas del club, como el chat o la gestión de reservas.</p>
          </section>
        </div>
      </main>
     
    </div>
  )
}