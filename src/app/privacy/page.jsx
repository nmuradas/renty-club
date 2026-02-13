'use client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-8 tracking-tighter text-black">Política de Privacidad</h1>
        <div className="text-gray-600 space-y-6 leading-relaxed">
          <p className="font-bold text-black uppercase tracking-widest text-xs">Última actualización: 13 de Febrero, 2026</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">1. Información que recolectamos</h2>
            <p>En RentyClub recolectamos información personal que vos nos proporcionás directamente al crear una cuenta, como tu nombre, email, y datos de contacto. También recolectamos información sobre los espacios que publicás y las reservas que realizás para garantizar el funcionamiento del club.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">2. Uso de los datos</h2>
            <p>Utilizamos tu información para: gestionar tus reservas, permitir la comunicación entre dueños y productores, procesar pagos de forma segura a través de nuestros proveedores y enviarte notificaciones importantes sobre tu actividad en la plataforma.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">3. Protección de la información</h2>
            <p>Implementamos medidas de seguridad técnicas para proteger tus datos personales contra acceso no autorizado. Tus contraseñas están encriptadas y los datos sensibles de pago nunca se almacenan directamente en nuestros servidores.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-black">4. Compartir información</h2>
            <p>RentyClub no vende tus datos a terceros. Solo compartimos la información necesaria con el dueño del espacio o el productor para concretar una reserva aceptada.</p>
          </section>
        </div>
      </main>
     
    </div>
  )
}