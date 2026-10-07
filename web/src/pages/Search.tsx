import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import MapView from '../MapView'

type Mode = '' | 'eat_in' | 'delivery' | 'take_out'
type View = 'list' | 'map'

export default function Search() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('')
  const [view, setView] = useState<View>('list')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingFor, setBookingFor] = useState<number | null>(null)
  const [timeSlot, setTimeSlot] = useState('')
  const [bookingMessage, setBookingMessage] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .listings(mode ? { mode } : undefined)
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [mode])

  async function submitBooking(listingId: number, listingMode: string) {
    setBookingMessage(null)
    try {
      await api.book({ listingId, timeSlot, mode: listingMode })
      setBookingMessage('Booked! Check "My Bookings" to track it.')
      setBookingFor(null)
      setTimeSlot('')
    } catch (err) {
      setBookingMessage((err as Error).message)
    }
  }

  return (
    <div className="page">
      <h1>Find chefs near you</h1>
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

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && listings.length === 0 && <p>No listings yet.</p>}
      {bookingMessage && <p>{bookingMessage}</p>}

      {view === 'map' && !loading && !error && <MapView listings={listings} />}

      {view === 'list' && (
      <div className="listing-grid">
        {listings.map((l) => (
          <div className="listing-card" key={l.id}>
            <h3>{l.title}</h3>
            <p className="muted">
              by <Link to={`/chefs/${l.chef_user_id}`}>{l.chef_name}</Link>
            </p>
            {l.description && <p>{l.description}</p>}
            <span className="chip">{l.mode}</span>

            {user ? (
              bookingFor === l.id ? (
                <div className="booking-form">
                  <input
                    placeholder="Preferred time (e.g. Sat 7pm)"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  />
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
                <button className="btn btn-primary" onClick={() => setBookingFor(l.id)}>
                  Book
                </button>
              )
            ) : (
              <p className="hint">Log in to book this listing.</p>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
