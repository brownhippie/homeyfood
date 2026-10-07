import { useEffect, useRef } from 'react'
import L from 'leaflet'

export interface MapListing {
  id: number
  title: string
  chef_name: string
  chef_lat: number | null
  chef_lng: number | null
}

// Default center: used only when no listings have a location yet.
const FALLBACK_CENTER: [number, number] = [20, 0]

export default function MapView({ listings }: { listings: MapListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = L.map(containerRef.current).setView(FALLBACK_CENTER, 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const located = listings.filter(
      (l): l is MapListing & { chef_lat: number; chef_lng: number } => l.chef_lat != null && l.chef_lng != null
    )

    const markers = located.map((l) =>
      L.marker([l.chef_lat, l.chef_lng])
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(l.title)}</strong><br/>by ${escapeHtml(l.chef_name)}`)
    )

    if (located.length > 0) {
      const bounds = L.latLngBounds(located.map((l) => [l.chef_lat, l.chef_lng]))
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 })
    }

    return () => {
      markers.forEach((m) => m.remove())
    }
  }, [listings])

  const withoutLocation = listings.filter((l) => l.chef_lat == null || l.chef_lng == null).length

  return (
    <div>
      <div ref={containerRef} style={{ height: 420, borderRadius: 12, overflow: 'hidden' }} />
      {withoutLocation > 0 && (
        <p className="hint" style={{ marginTop: 8 }}>
          {withoutLocation} listing{withoutLocation === 1 ? '' : 's'} not shown — chef hasn't set a location yet.
        </p>
      )}
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
