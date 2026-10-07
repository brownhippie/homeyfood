import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { run, get, all, initDb } from './db.js'
import { signToken, requireAuth } from './auth.js'

const app = express()
const PORT = process.env.PORT || 4000

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

await initDb()

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    isGuest: !!u.is_guest,
    isChef: !!u.is_chef,
    activeRole: u.active_role,
    avatarUrl: u.avatar_url,
    address: {
      aptSuite: u.apt_suite,
      streetAddress: u.street_address,
      cityAddress: u.city_address,
      stateSubdivision: u.state_subdivision,
      zipCodeAddress: u.zip_code_address,
      country: u.country,
    },
  }
}

// --- Auth ---

app.post('/api/auth/signup', async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    role,
    governmentId,
    aptSuite,
    streetAddress,
    cityAddress,
    stateSubdivision,
    zipCodeAddress,
    country,
  } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password are required' })
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }
  const isChef = role === 'chef'
  if (isChef && !governmentId) {
    return res.status(400).json({ error: 'A government ID is required to sign up as a chef' })
  }
  const existing = await get('SELECT id FROM users WHERE email = ?', [email])
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const { id } = await run(
    `INSERT INTO users (
       name, email, password_hash, is_guest, is_chef, active_role, government_id,
       apt_suite, street_address, city_address, state_subdivision, zip_code_address, country
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      passwordHash,
      isChef ? 0 : 1,
      isChef ? 1 : 0,
      isChef ? 'chef' : 'guest',
      governmentId || null,
      aptSuite || null,
      streetAddress || null,
      cityAddress || null,
      stateSubdivision || null,
      zipCodeAddress || null,
      country || null,
    ]
  )
  if (isChef) {
    await run('INSERT INTO chef_profiles (user_id) VALUES (?)', [id])
  }
  const user = await get('SELECT * FROM users WHERE id = ?', [id])
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const user = await get('SELECT * FROM users WHERE email = ?', [email])
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  const ok = await bcrypt.compare(password || '', user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/api/me', requireAuth, async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(publicUser(user))
})

app.put('/api/me/address', requireAuth, async (req, res) => {
  const { aptSuite, streetAddress, cityAddress, stateSubdivision, zipCodeAddress, country } = req.body || {}
  await run(
    `UPDATE users SET apt_suite = ?, street_address = ?, city_address = ?,
     state_subdivision = ?, zip_code_address = ?, country = ? WHERE id = ?`,
    [
      aptSuite || null,
      streetAddress || null,
      cityAddress || null,
      stateSubdivision || null,
      zipCodeAddress || null,
      country || null,
      req.user.id,
    ]
  )
  const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
  res.json(publicUser(user))
})

// Enable the other role (guest <-> chef) and/or switch active view
app.post('/api/me/role', requireAuth, async (req, res) => {
  const { enableChef, enableGuest, activeRole } = req.body || {}
  const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
  if (!user) return res.status(404).json({ error: 'User not found' })

  const isChef = enableChef ? 1 : user.is_chef
  const isGuest = enableGuest ? 1 : user.is_guest
  const nextActive = activeRole === 'chef' || activeRole === 'guest' ? activeRole : user.active_role

  if (enableChef && !user.is_chef) {
    const existingProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [user.id])
    if (!existingProfile) await run('INSERT INTO chef_profiles (user_id) VALUES (?)', [user.id])
  }

  await run('UPDATE users SET is_chef = ?, is_guest = ?, active_role = ? WHERE id = ?', [
    isChef,
    isGuest,
    nextActive,
    user.id,
  ])
  const updated = await get('SELECT * FROM users WHERE id = ?', [user.id])
  res.json(publicUser(updated))
})

// --- Chef profiles ---

app.get('/api/chefs/:userId', async (req, res) => {
  const profile = await get(
    `SELECT cp.*, u.name, u.avatar_url FROM chef_profiles cp
     JOIN users u ON u.id = cp.user_id WHERE cp.user_id = ?`,
    [req.params.userId]
  )
  if (!profile) return res.status(404).json({ error: 'Chef profile not found' })
  res.json(profile)
})

app.put('/api/me/chef-profile', requireAuth, async (req, res) => {
  const { bio, coverPhotoUrl, lat, lng, eatIn, delivery, takeOut } = req.body || {}
  const profile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!profile) return res.status(404).json({ error: 'Not a chef yet — enable chef role first' })
  await run(
    `UPDATE chef_profiles SET bio = ?, cover_photo_url = ?, lat = ?, lng = ?,
     eat_in = ?, delivery = ?, take_out = ? WHERE user_id = ?`,
    [bio, coverPhotoUrl, lat, lng, eatIn ? 1 : 0, delivery ? 1 : 0, takeOut ? 1 : 0, req.user.id]
  )
  res.json({ ok: true })
})

// --- Recipes ---

app.get('/api/chefs/:userId/recipes', async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.params.userId])
  if (!chefProfile) return res.status(404).json({ error: 'Chef profile not found' })
  res.json(await all('SELECT * FROM recipes WHERE chef_id = ? ORDER BY created_at DESC', [chefProfile.id]))
})

app.post('/api/me/recipes', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  const { title, description, mediaUrl } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title is required' })
  const { id } = await run(
    'INSERT INTO recipes (chef_id, title, description, media_url) VALUES (?, ?, ?, ?)',
    [chefProfile.id, title, description || null, mediaUrl || null]
  )
  res.status(201).json(await get('SELECT * FROM recipes WHERE id = ?', [id]))
})

app.delete('/api/me/recipes/:id', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  const recipe = await get('SELECT * FROM recipes WHERE id = ?', [req.params.id])
  if (!recipe || recipe.chef_id !== chefProfile.id) return res.status(404).json({ error: 'Recipe not found' })
  await run('DELETE FROM recipes WHERE id = ?', [req.params.id])
  res.json({ ok: true })
})

// --- Video posts (links only — no media is hosted by this app) ---

app.get('/api/chefs/:userId/videos', async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.params.userId])
  if (!chefProfile) return res.status(404).json({ error: 'Chef profile not found' })
  res.json(await all('SELECT * FROM video_posts WHERE chef_id = ? ORDER BY created_at DESC', [chefProfile.id]))
})

app.post('/api/me/videos', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  const { videoUrl, caption } = req.body || {}
  if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' })
  const { id } = await run('INSERT INTO video_posts (chef_id, video_url, caption) VALUES (?, ?, ?)', [
    chefProfile.id,
    videoUrl,
    caption || null,
  ])
  res.status(201).json(await get('SELECT * FROM video_posts WHERE id = ?', [id]))
})

app.delete('/api/me/videos/:id', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  const video = await get('SELECT * FROM video_posts WHERE id = ?', [req.params.id])
  if (!video || video.chef_id !== chefProfile.id) return res.status(404).json({ error: 'Video not found' })
  await run('DELETE FROM video_posts WHERE id = ?', [req.params.id])
  res.json({ ok: true })
})

// --- Listings / search ---

export const ALLERGENS = ['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy']

const RATING_SUBQUERY = `(
  SELECT AVG(r.rating) FROM reviews r
  JOIN bookings b ON b.id = r.booking_id
  JOIN listings l2 ON l2.id = b.listing_id
  WHERE l2.chef_id = l.chef_id
)`

app.get('/api/listings', async (req, res) => {
  const { mode, tag, excludeAllergen, cuisine, category, minRating, sort } = req.query
  let sql = `SELECT l.*, u.name AS chef_name, u.id AS chef_user_id, cp.lat AS chef_lat, cp.lng AS chef_lng,
             ${RATING_SUBQUERY} AS chef_rating
             FROM listings l
             JOIN chef_profiles cp ON cp.id = l.chef_id
             JOIN users u ON u.id = cp.user_id WHERE 1=1`
  const params = []
  if (mode) {
    const qtyCol = mode === 'eat_in' ? 'eat_in_qty' : mode === 'delivery' ? 'delivery_qty' : 'take_out_qty'
    sql += ` AND (l.mode = ? OR l.${qtyCol} > 0)`
    params.push(mode)
  }
  if (tag) {
    sql += ' AND (l.tags LIKE ? OR l.keywords LIKE ? OR l.cuisine LIKE ?)'
    params.push(`%${tag}%`, `%${tag}%`, `%${tag}%`)
  }
  if (cuisine) {
    sql += ' AND l.cuisine LIKE ?'
    params.push(`%${cuisine}%`)
  }
  if (category) {
    sql += ' AND l.category LIKE ?'
    params.push(`%${category}%`)
  }
  const excluded = [].concat(excludeAllergen || []).filter(Boolean)
  for (const allergen of excluded) {
    sql += ' AND (l.allergens IS NULL OR l.allergens NOT LIKE ?)'
    params.push(`%${allergen}%`)
  }
  if (minRating) {
    sql += ` AND COALESCE(${RATING_SUBQUERY}, 0) >= ?`
    params.push(Number(minRating))
  }
  if (sort === 'rating') {
    sql += ' ORDER BY chef_rating IS NULL, chef_rating DESC'
  } else if (sort === 'price') {
    sql += ' ORDER BY l.rate_per_head_cents IS NULL, l.rate_per_head_cents ASC'
  } else {
    sql += ' ORDER BY l.created_at DESC'
  }
  res.json(await all(sql, params))
})

app.post('/api/listings', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  const {
    title,
    description,
    tags,
    mode,
    photoUrl,
    keywords,
    cuisine,
    category,
    servingTime,
    servingTimeFrom,
    servingTimeTo,
    continuedDates,
    capacity,
    ratePerHeadCents,
    continuingDays,
    allergens,
    portionSize,
    dietaryPreference,
    spiceLevel,
    dishPrepInfo,
    packagingPreference,
    eatInQty,
    takeOutQty,
    deliveryQty,
  } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title is required' })
  const allergenList = Array.isArray(allergens) ? allergens.filter((a) => ALLERGENS.includes(a)) : []
  const { id } = await run(
    `INSERT INTO listings (
       chef_id, title, description, tags, mode, photo_url,
       keywords, cuisine, category, serving_time, capacity, rate_per_head_cents, continuing_days, allergens,
       portion_size, dietary_preference, spice_level, dish_prep_info, packaging_preference,
       eat_in_qty, take_out_qty, delivery_qty, serving_time_from, serving_time_to, continued_dates
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chefProfile.id,
      title,
      description || null,
      tags || '',
      mode || 'eat_in',
      photoUrl || null,
      keywords || null,
      cuisine || null,
      category || null,
      servingTime || null,
      capacity || null,
      ratePerHeadCents || null,
      continuingDays || null,
      allergenList.join(','),
      portionSize || null,
      dietaryPreference || null,
      spiceLevel || null,
      dishPrepInfo || null,
      packagingPreference || null,
      eatInQty || 0,
      takeOutQty || 0,
      deliveryQty || 0,
      servingTimeFrom || null,
      servingTimeTo || null,
      continuedDates || null,
    ]
  )
  res.status(201).json(await get('SELECT * FROM listings WHERE id = ?', [id]))
})

app.get('/api/allergens', (req, res) => res.json(ALLERGENS))

// --- Bookings ---

app.post('/api/bookings', requireAuth, async (req, res) => {
  const { listingId, timeSlot, mode } = req.body || {}
  const listing = await get('SELECT * FROM listings WHERE id = ?', [listingId])
  if (!listing) return res.status(404).json({ error: 'Listing not found' })
  const { id } = await run(
    `INSERT INTO bookings (guest_id, listing_id, time_slot, mode) VALUES (?, ?, ?, ?)`,
    [req.user.id, listingId, timeSlot || null, mode || listing.mode]
  )
  res.status(201).json(await get('SELECT * FROM bookings WHERE id = ?', [id]))
})

app.get('/api/me/bookings', requireAuth, async (req, res) => {
  res.json(
    await all(
      `SELECT b.*, l.title, u.name AS chef_name,
              EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id = b.id) AS has_review
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN chef_profiles cp ON cp.id = l.chef_id
       JOIN users u ON u.id = cp.user_id
       WHERE b.guest_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    )
  )
})

// Bookings received on the current user's listings (chef side)
app.get('/api/me/chef-bookings', requireAuth, async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  if (!chefProfile) return res.status(403).json({ error: 'Chef profile required' })
  res.json(
    await all(
      `SELECT b.*, l.title, u.name AS guest_name FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u ON u.id = b.guest_id
       WHERE l.chef_id = ? ORDER BY b.created_at DESC`,
      [chefProfile.id]
    )
  )
})

app.patch('/api/bookings/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body || {}
  if (!['confirmed', 'declined', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const booking = await get(
    `SELECT b.*, l.chef_id FROM bookings b JOIN listings l ON l.id = b.listing_id WHERE b.id = ?`,
    [req.params.id]
  )
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.user.id])
  const isOwningChef = chefProfile && chefProfile.id === booking.chef_id
  const isOwningGuest = booking.guest_id === req.user.id
  if (!isOwningChef && !isOwningGuest) return res.status(403).json({ error: 'Not your booking' })
  if (status === 'cancelled' && !isOwningGuest) return res.status(403).json({ error: 'Only the guest can cancel' })
  if (['confirmed', 'declined', 'completed'].includes(status) && !isOwningChef) {
    return res.status(403).json({ error: 'Only the chef can do that' })
  }

  await run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id])
  res.json(await get('SELECT * FROM bookings WHERE id = ?', [req.params.id]))
})

// --- Reviews ---

app.post('/api/bookings/:id/review', requireAuth, async (req, res) => {
  const { rating, text } = req.body || {}
  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'rating must be an integer 1-5' })
  }
  const booking = await get('SELECT * FROM bookings WHERE id = ?', [req.params.id])
  if (!booking) return res.status(404).json({ error: 'Booking not found' })
  if (booking.guest_id !== req.user.id) return res.status(403).json({ error: 'Not your booking' })
  if (booking.status !== 'completed') {
    return res.status(400).json({ error: 'You can only review a completed booking' })
  }
  const existing = await get('SELECT id FROM reviews WHERE booking_id = ?', [booking.id])
  if (existing) return res.status(409).json({ error: 'You already reviewed this booking' })

  const { id } = await run('INSERT INTO reviews (booking_id, rating, text) VALUES (?, ?, ?)', [
    booking.id,
    r,
    text || null,
  ])
  res.status(201).json(await get('SELECT * FROM reviews WHERE id = ?', [id]))
})

app.get('/api/chefs/:userId/reviews', async (req, res) => {
  const chefProfile = await get('SELECT id FROM chef_profiles WHERE user_id = ?', [req.params.userId])
  if (!chefProfile) return res.status(404).json({ error: 'Chef profile not found' })

  const reviews = await all(
    `SELECT r.*, u.name AS guest_name FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     JOIN listings l ON l.id = b.listing_id
     JOIN users u ON u.id = b.guest_id
     WHERE l.chef_id = ? ORDER BY r.created_at DESC`,
    [chefProfile.id]
  )

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) counts[r.rating] = (counts[r.rating] || 0) + 1
  const total = reviews.length
  const average = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: counts[star],
    pct: total ? Math.round((counts[star] / total) * 100) : 0,
  }))

  res.json({ reviews, total, average, breakdown })
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`HomeyFood API listening on :${PORT}`)
})
