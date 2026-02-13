'use client'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

// Fix para los iconos de Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

// Componente para recentrar el mapa
function RecenterMap({ lat, lng, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true })
  }, [lat, lng, zoom, map])
  return null
}

// Componente para detectar clicks
function MapEvents({ onClick }) {
  useMapEvents({
    click(e) { onClick?.(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

export default function DashboardMap({ lat, lng, interactive = false, onSelect, zoom = 17 }) {
  const safeLat = parseFloat(lat) || -34.6037
  const safeLng = parseFloat(lng) || -58.3816
  const position = [safeLat, safeLng]
  
  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 'inherit', overflow: 'hidden', isolation: 'isolate', position: 'relative' }}>
        {/* ESTILOS CSS INCRUSTADOS PARA FORZAR EL CURSOR NEGRO ESTÁNDAR
           Usamos !important para sobrescribir cualquier tema que lo ponga blanco.
        */}
        {interactive && (
            <style>
                {`
                    .leaflet-container.leaflet-grab { cursor: grab !important; cursor: -webkit-grab !important; }
                    .leaflet-container.leaflet-dragging { cursor: grabbing !important; cursor: -webkit-grabbing !important; }
                `}
            </style>
        )}

        <MapContainer 
            center={position} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={interactive ? 'center' : false}
            dragging={interactive || true}
            // Añadimos la clase 'leaflet-grab' si es interactivo para activar los estilos de arriba
            className={interactive ? 'leaflet-grab' : ''}
        >
            <TileLayer 
                attribution='&copy; <a href="https://www.carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
            />
            <Marker position={position} icon={icon} />
            <RecenterMap lat={safeLat} lng={safeLng} zoom={zoom} />
            {interactive && <MapEvents onClick={onSelect} />}
        </MapContainer>
    </div>
  )
}