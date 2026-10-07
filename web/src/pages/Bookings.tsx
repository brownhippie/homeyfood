import { useEffect, useState } from 'react'
import { api, type Booking } from '../api'
import { useAuth } from '../AuthContext'

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewFor, setReviewFor] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewMessage, setReviewMessage] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .myBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) load()
    else setLoading(false)
  }, [user])

  if (!user) return <div className="page">Log in to see your bookings.</div>

  async function cancel(id: number) {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api.updateBookingStatus(id, 'cancelled')
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function submitReview(bookingId: number) {
    setReviewMessage(null)
    try {
      await api.addReview(bookingId, { rating, text: reviewText })
      setReviewFor(null)
      setRating(5)
      setReviewText('')
      load()
    } catch (err) {
      setReviewMessage((err as Error).message)
    }
  }

  return (
    <div className="page">
      <h1>My bookings</h1>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && bookings.length === 0 && <p>No bookings yet — go find a chef!</p>}

      <div className="booking-list">
        {bookings.map((b) => (
          <div className="booking-row" key={b.id}>
            <div>
              <strong>{b.title}</strong>
              <p className="muted">
                with {b.chef_name} · {b.mode} {b.time_slot ? `· ${b.time_slot}` : ''}
              </p>

              {b.status === 'completed' && !Boolean(b.has_review) && (
                <>
                  {reviewFor === b.id ? (
                    <div className="booking-form" style={{ marginTop: 10 }}>
                      <label>
                        Rating
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n === 1 ? '' : 's'}
                            </option>
                          ))}
                        </select>
                      </label>
                      <textarea
                        placeholder="How was it?"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                      {reviewMessage && <p className="error">{reviewMessage}</p>}
                      <div className="booking-form-actions">
                        <button className="btn btn-primary" onClick={() => submitReview(b.id)}>
                          Submit review
                        </button>
                        <button className="btn btn-ghost" onClick={() => setReviewFor(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setReviewFor(b.id)}>
                      Leave a review
                    </button>
                  )}
                </>
              )}
              {b.status === 'completed' && Boolean(b.has_review) && <p className="hint">You reviewed this booking.</p>}
            </div>
            <div className="booking-row-right">
              <span className={`status status-${b.status}`}>{b.status}</span>
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <button className="btn btn-ghost" onClick={() => cancel(b.id)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
