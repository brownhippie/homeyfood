import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import MapView from '../MapView'

type Mode = '' | 'eat_in' | 'delivery' | 'take_out'
type View = 'list' | 'map'

const CARD_COLORS = ['#e8622c', '#2c7be8', '#8b4fe8', '#2ca882', '#e84f8b', '#e8a62c']

function colorFor(id: number) {
  return CARD_COLORS[id % CARD_COLORS.length]
}

export default function Search() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialMode = (searchParams.get('mode') as Mode) || ''
  const query = searchParams.get('q') || ''
  const [mode, setMode] = useState<Mode>(initialMode)
  const [view, setView] = useState<View>('list')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingFor, setBookingFor] = useState<number | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingMessage, setBookingMessage] = useState<string | null>(null)
  const [allergenOptions, setAllergenOptions] = useState<string[]>([])
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([])

  useEffect(() => {
    api.allergens().then(setAllergenOptions).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .listings({ ...(mode ? { mode } : {}), excludeAllergen: excludeAllergens })
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [mode, excludeAllergens])

  function toggleExcludeAllergen(a: string) {
    setExcludeAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  const visibleListings = useMemo(() => {
    if (!query) return listings
    const q = query.toLowerCase()
    return listings.filter(
      (l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
    )
  }, [listings, query])

  async function submitBooking(listingId: number, listingMode: string) {
    setBookingMessage(null)
    try {
      await api.book({ listingId, timeSlot: bookingDate, mode: listingMode })
      setBookingMessage('Booked! Check "My Bookings" to track it.')
      setBookingFor(null)
      setBookingDate('')
    } catch (err) {
      setBookingMessage((err as Error).message)
    }
  }

  return (
    <div className="page">
      <h1>{query ? `Results for "${query}"` : 'Find chefs near you'}</h1>
      <div className="filter-bar">
        {(['', 'eat_in', 'delivery', 'take_out'] as Mode[]).map((m) => (
          <button
            key={m || 'all'}
            className={`chip ${mode === m ? 'chip-active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === '' ? 'All' : m === 'eat_in' ? 'Eat in' : m === 'delivery' ? 'Delivery' : 'Take Out'}
          </button>
        ))}
        <span className="view-toggle">
          <button className={`chip ${view === 'list' ? 'chip-active' : ''}`} onClick={() => setView('list')}>
            List View
          </button>
          <button className={`chip ${view === 'map' ? 'chip-active' : ''}`} onClick={() => setView('map')}>
            Map view
          </button>
        </span>
      </div>

      {allergenOptions.length > 0 && (
        <div className="allergen-filter">
          <p className="hint">Exclude listings containing:</p>
          <div className="allergen-grid">
            {allergenOptions.map((a) => (
              <label key={a} className="allergen-chip">
                <input
                  type="checkbox"
                  checked={excludeAllergens.includes(a)}
                  onChange={() => toggleExcludeAllergen(a)}
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && visibleListings.length === 0 && <p>No listings yet.</p>}
      {bookingMessage && <p className="booking-toast">{bookingMessage}</p>}

      {view === 'map' && !loading && !error && <MapView listings={visibleListings} />}

      {view === 'list' && (
        <div className="listing-grid">
          {visibleListings.map((l) => (
            <div className="listing-card" key={l.id}>
              <div className="listing-thumb" style={{ background: `linear-gradient(145deg, ${colorFor(l.id)}, #1a1a1a)` }}>
                <span className="mode-badge">{l.mode === 'eat_in' ? 'Eat in' : l.mode === 'delivery' ? 'Delivery' : 'Take Out'}</span>
              </div>
              <div className="listing-card-body">
                <h3>{l.title}</h3>
                <p className="muted">
                  by <Link to={`/chefs/${l.chef_user_id}`}>{l.chef_name}</Link>
                </p>
                {l.description && <p className="listing-desc">{l.description}</p>}

                {user ? (
                  bookingFor === l.id ? (
                    <div className="booking-form">
                      <label className="hint">
                        Choose a date
                        <input
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          required
                        />
                      </label>
                      <div className="booking-form-actions">
                        <button className="btn btn-primary" onClick={() => submitBooking(l.id, l.mode)}>
                          Confirm booking
                        </button>
                        <button className="btn btn-ghost" onClick={() => setBookingFor(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-block" onClick={() => setBookingFor(l.id)}>
                      Book
                    </button>
                  )
                ) : (
                  <p className="hint">Log in to book this listing.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
