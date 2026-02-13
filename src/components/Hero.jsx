import SearchForm from './SearchForm'

export default function Hero() {
  return (
    // CAMBIO: Usamos 'min-h-screen' en vez de [600px] para evitar alertas del editor
    <div className="relative w-full min-h-screen md:h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
        
        {/* IMAGEN DE FONDO */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover"
                alt="Fondo RentyClub"
            />
        </div>

        {/* CONTENIDO */}
        <div className="relative z-20 w-full max-w-5xl mx-auto pt-20 md:pt-0">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="font-serif text-5xl md:text-7xl italic mb-4 text-white drop-shadow-lg">
                    Crea tu experiencia.
                </h1>
                <p className="text-white/90 text-sm md:text-lg font-light tracking-widest uppercase">
                    Encuentra espacios únicos para tus eventos
                </p>
            </div>
            <SearchForm />
        </div>
    </div>
  )
}