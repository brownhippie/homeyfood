import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { api, type Booking, type Recipe, type VideoPost } from '../api'

export default function ChefDashboard() {
  const { user, refresh } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState('eat_in')
  const [keywords, setKeywords] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [category, setCategory] = useState('')
  const [servingTimeFrom, setServingTimeFrom] = useState('')
  const [servingTimeTo, setServingTimeTo] = useState('')
  const [continuedDates, setContinuedDates] = useState('')
  const [capacity, setCapacity] = useState('')
  const [ratePerHead, setRatePerHead] = useState('')
  const [portionSize, setPortionSize] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [spiceLevel, setSpiceLevel] = useState('')
  const [dishPrepInfo, setDishPrepInfo] = useState('')
  const [packagingPreference, setPackagingPreference] = useState('')
  const [eatInQty, setEatInQty] = useState('')
  const [takeOutQty, setTakeOutQty] = useState('')
  const [deliveryQty, setDeliveryQty] = useState('')
  const [allergens, setAllergens] = useState<string[]>([])
  const [allergenOptions, setAllergenOptions] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeDescription, setRecipeDescription] = useState('')

  const [videos, setVideos] = useState<VideoPost[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCaption, setVideoCaption] = useState('')
  const [contentError, setContentError] = useState<string | null>(null)

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  function loadBookings() {
    api
      .chefBookings()
      .then(setBookings)
      .catch((err) => setBookingsError(err.message))
  }

  function loadContent() {
    if (!user) return
    api.chefRecipes(user.id).then(setRecipes).catch((err) => setContentError(err.message))
    api.chefVideos(user.id).then(setVideos).catch((err) => setContentError(err.message))
  }

  useEffect(() => {
    if (user?.isChef) {
      loadBookings()
      loadContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    api.allergens().then(setAllergenOptions).catch(() => {})
  }, [])

  if (!user) return <div className="page">Log in to view your chef dashboard.</div>

  async function enableChef() {
    await api.setRole({ enableChef: true, activeRole: 'chef' })
    await refresh()
  }

  function toggleAllergen(a: string) {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  async function createListing(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!window.confirm('Submit this listing?')) return
    try {
      await api.createListing({
        title,
        description,
        mode,
        keywords,
        cuisine,
        category,
        servingTimeFrom,
        servingTimeTo,
        continuedDates,
        capacity: capacity ? Number(capacity) : undefined,
        ratePerHeadCents: ratePerHead ? Math.round(Number(ratePerHead) * 100) : undefined,
        allergens,
        portionSize,
        dietaryPreference,
        spiceLevel,
        dishPrepInfo,
        packagingPreference,
        eatInQty: eatInQty ? Number(eatInQty) : undefined,
        takeOutQty: takeOutQty ? Number(takeOutQty) : undefined,
        deliveryQty: deliveryQty ? Number(deliveryQty) : undefined,
      })
      setMessage('Listing created.')
      setTitle('')
      setDescription('')
      setKeywords('')
      setCuisine('')
      setCategory('')
      setServingTimeFrom('')
      setServingTimeTo('')
      setContinuedDates('')
      setCapacity('')
      setRatePerHead('')
      setAllergens([])
      setPortionSize('')
      setDietaryPreference('')
      setSpiceLevel('')
      setDishPrepInfo('')
      setPackagingPreference('')
      setEatInQty('')
      setTakeOutQty('')
      setDeliveryQty('')
    } catch (err) {
      setMessage((err as Error).message)
    }
  }

  async function respond(id: number, status: 'confirmed' | 'declined' | 'completed') {
    if (status === 'declined' && !window.confirm('Decline this booking?')) return
    try {
      await api.updateBookingStatus(id, status)
      loadBookings()
    } catch (err) {
      setBookingsError((err as Error).message)
    }
  }

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault()
    setContentError(null)
    try {
      await api.addRecipe({ title: recipeTitle, description: recipeDescription })
      setRecipeTitle('')
      setRecipeDescription('')
      loadContent()
    } catch (err) {
      setContentError((err as Error).message)
    }
  }

  async function removeRecipe(id: number) {
    try {
      await api.deleteRecipe(id)
      loadContent()
    } catch (err) {
      setContentError((err as Error).message)
    }
  }

  async function addVideoLink(e: React.FormEvent) {
    e.preventDefault()
    setContentError(null)
    try {
      await api.addVideo({ videoUrl, caption: videoCaption })
      setVideoUrl('')
      setVideoCaption('')
      loadContent()
    } catch (err) {
      setContentError((err as Error).message)
    }
  }

  async function removeVideo(id: number) {
    try {
      await api.deleteVideo(id)
      loadContent()
    } catch (err) {
      setContentError((err as Error).message)
    }
  }

  function useMyLocation() {
    setLocationMessage(null)
    if (!navigator.geolocation) {
      setLocationMessage('Your browser does not support location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          await api.updateChefProfile({ lat, lng })
          setLocation({ lat, lng })
          setLocationMessage('Location saved — you\'ll now show up on the map search.')
        } catch (err) {
          setLocationMessage((err as Error).message)
        }
      },
      () => setLocationMessage('Could not get your location. Check browser permissions.')
    )
  }

  if (!user.isChef) {
    return (
      <div className="page narrow">
        <h1>Become a chef</h1>
        <p>Switch on chef mode to create listings, take bookings, and go live.</p>
        <button className="btn btn-primary" onClick={enableChef}>
          Switch to Chef
        </button>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <h1>Chef dashboard</h1>

      <h2>Bookings</h2>
      {bookingsError && <p className="error">{bookingsError}</p>}
      {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
      <div className="booking-list">
        {bookings.map((b) => (
          <div className="booking-row" key={b.id}>
            <div>
              <strong>{b.title}</strong>
              <p className="muted">
                guest: {b.guest_name} · {b.mode} {b.time_slot ? `· ${b.time_slot}` : ''}
              </p>
            </div>
            <div className="booking-row-right">
              <span className={`status status-${b.status}`}>{b.status}</span>
              {b.status === 'pending' && (
                <>
                  <button className="btn btn-primary" onClick={() => respond(b.id, 'confirmed')}>
                    Confirm
                  </button>
                  <button className="btn btn-ghost" onClick={() => respond(b.id, 'declined')}>
                    Decline
                  </button>
                </>
              )}
              {b.status === 'confirmed' && (
                <button className="btn btn-ghost" onClick={() => respond(b.id, 'completed')}>
                  Mark completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2>Location</h2>
      <p className="hint">Set your location so guests can find you on the map search.</p>
      <button className="btn btn-primary" onClick={useMyLocation}>
        Use my current location
      </button>
      {location && (
        <p className="muted">
          Saved: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
      {locationMessage && <p>{locationMessage}</p>}

      <h2>New listing</h2>
      <form onSubmit={createListing} className="form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="eat_in">Eat in</option>
            <option value="delivery">Delivery</option>
            <option value="take_out">Take Out</option>
          </select>
        </label>
        <label>
          Keywords
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. spicy, vegetarian, family-style"
          />
        </label>
        <label>
          Cuisine(s)
          <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Italian, Thai (comma-separated)" />
        </label>
        <label>
          Category(ies)
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Dinner, Dessert (comma-separated)" />
        </label>
        <div className="qty-row">
          <label>
            Serving time from
            <input type="time" value={servingTimeFrom} onChange={(e) => setServingTimeFrom(e.target.value)} />
          </label>
          <label>
            Serving time to
            <input type="time" value={servingTimeTo} onChange={(e) => setServingTimeTo(e.target.value)} />
          </label>
        </div>
        <label>
          Number of people
          <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </label>
        <label>
          Rate per head ($)
          <input type="number" min="0" step="0.01" value={ratePerHead} onChange={(e) => setRatePerHead(e.target.value)} />
        </label>
        <label>
          Continued dates
          <input
            value={continuedDates}
            onChange={(e) => setContinuedDates(e.target.value)}
            placeholder="e.g. 2026-10-10, 2026-10-12 (comma-separated, leave blank if one-off)"
          />
        </label>
        <label>
          Portion size(s)
          <input value={portionSize} onChange={(e) => setPortionSize(e.target.value)} placeholder="e.g. Small, Large (comma-separated)" />
        </label>
        <label>
          Dietary preference(s)
          <input
            value={dietaryPreference}
            onChange={(e) => setDietaryPreference(e.target.value)}
            placeholder="e.g. Vegetarian, Vegan, Halal (comma-separated)"
          />
        </label>
        <label>
          Spice level(s)
          <input value={spiceLevel} onChange={(e) => setSpiceLevel(e.target.value)} placeholder="e.g. Mild, Medium, Hot (comma-separated)" />
        </label>
        <label>
          Preparation method
          <input
            value={dishPrepInfo}
            onChange={(e) => setDishPrepInfo(e.target.value)}
            placeholder="e.g. Grilled, Slow-cooked (comma-separated)"
          />
        </label>
        <label>
          Packaging type(s)
          <input
            value={packagingPreference}
            onChange={(e) => setPackagingPreference(e.target.value)}
            placeholder="e.g. Eco-friendly, Reusable (comma-separated)"
          />
        </label>
        <div className="qty-row">
          <label>
            Eat in qty
            <input type="number" min="0" value={eatInQty} onChange={(e) => setEatInQty(e.target.value)} />
          </label>
          <label>
            Take out qty
            <input type="number" min="0" value={takeOutQty} onChange={(e) => setTakeOutQty(e.target.value)} />
          </label>
          <label>
            Delivery qty
            <input type="number" min="0" value={deliveryQty} onChange={(e) => setDeliveryQty(e.target.value)} />
          </label>
        </div>
        <p className="hint">Mode above sets the primary listing; quantities let a dish be offered across multiple modes at once.</p>
        <div>
          <p className="hint">Allergens present</p>
          <div className="allergen-grid">
            {allergenOptions.map((a) => (
              <label key={a} className="allergen-chip">
                <input type="checkbox" checked={allergens.includes(a)} onChange={() => toggleAllergen(a)} />
                {a}
              </label>
            ))}
          </div>
        </div>
        {message && <p>{message}</p>}
        <button className="btn btn-primary" type="submit">
          Create listing
        </button>
      </form>

      {contentError && <p className="error">{contentError}</p>}

      <h2>Recipes</h2>
      <form onSubmit={addRecipe} className="form">
        <label>
          Title
          <input value={recipeTitle} onChange={(e) => setRecipeTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={recipeDescription} onChange={(e) => setRecipeDescription(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Add recipe
        </button>
      </form>
      <div className="content-list">
        {recipes.length === 0 && <p className="muted">No recipes posted yet.</p>}
        {recipes.map((r) => (
          <div className="content-row" key={r.id}>
            <div>
              <strong>{r.title}</strong>
              {r.description && <p className="muted">{r.description}</p>}
            </div>
            <button className="btn btn-ghost" onClick={() => removeRecipe(r.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <h2>Videos</h2>
      <p className="hint">
        Link to a video you've already uploaded elsewhere (e.g. YouTube) — this app doesn't host video files.
      </p>
      <form onSubmit={addVideoLink} className="form">
        <label>
          Video URL
          <input
            type="url"
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
        </label>
        <label>
          Caption
          <input value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Add video link
        </button>
      </form>
      <div className="content-list">
        {videos.length === 0 && <p className="muted">No video links yet.</p>}
        {videos.map((v) => (
          <div className="content-row" key={v.id}>
            <div>
              <a href={v.video_url} target="_blank" rel="noreferrer">
                {v.caption || v.video_url}
              </a>
            </div>
            <button className="btn btn-ghost" onClick={() => removeVideo(v.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
