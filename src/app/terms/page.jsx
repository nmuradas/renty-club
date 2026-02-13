'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-8 tracking-tighter text-black">Términos y Condiciones</h1>
        <div className="text-gray-600 space-y-6 leading-relaxed">
          <p className="font-bold text-black uppercase tracking-widest text-xs">Acuerdo de la Comunidad</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">1. Aceptación de términos</h2>
            <p>Al utilizar RentyClub, aceptás cumplir con nuestras reglas de convivencia y uso. El club es una plataforma de mediación entre dueños y arrendatarios de espacios.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">2. Responsabilidad del contenido</h2>
            <p>Como dueño, sos responsable de la veracidad de las fotos y la descripción de tu espacio. Como productor, sos responsable de cuidar el espacio alquilado y cumplir con el horario pactado.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">3. Reservas y Pagos</h2>
            <p>Una reserva se considera confirmada una vez que el dueño la aprueba y el pago se procesa. RentyClub retiene una comisión por el servicio de gestión y mantenimiento de la plataforma.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">4. Cancelaciones</h2>
            <p>Cada reserva está sujeta a la política de cancelación elegida por el dueño. En caso de conflicto, RentyClub actuará como mediador basándose en las evidencias presentadas por ambas partes.</p>
          </section>
        </div>
      </main>
     
    </div>
  )
}