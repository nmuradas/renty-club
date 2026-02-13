import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

// Configuración de fuentes
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: "Renty Club - Experiencias Únicas",
  description: "Alquiler de espacios temporales premium.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* FontAwesome backup (opcional, ya que usamos Lucide, pero lo dejo por si acaso) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      
      {/* Aplicamos las variables de fuente y estilos base */}
      <body className={`${jakarta.variable} ${playfair.variable} font-sans bg-white text-black antialiased`}>
        
        {/* Barra de navegación global */}
        <Navbar />
        
        {/* Contenido principal con padding superior para no quedar debajo del Navbar */}
        <main className="min-h-screen pt-20"> 
            {children}
        </main>
        
        {/* Pie de página global */}
        <Footer />
        
      </body>
    </html>
  );
}