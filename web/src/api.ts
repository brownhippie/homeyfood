const TOKEN_KEY = 'homeyfood_token'
const API_BASE = import.meta.env.VITE_API_URL || ''

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export interface User {
  id: number
  name: string
  email: string
  isGuest: boolean
  isChef: boolean
  activeRole: 'guest' | 'chef'
  avatarUrl: string | null
}

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed'

export interface Booking {
  id: number
  guest_id: number
  listing_id: number
  time_slot: string | null
  mode: string
  status: BookingStatus
  created_at: string
  title?: string
  chef_name?: string
  guest_name?: string
  has_review?: boolean
}

export interface Review {
  id: number
  booking_id: number
  rating: number
  text: string | null
  created_at: string
  guest_name?: string
}

export interface ReviewSummary {
  reviews: Review[]
  total: number
  average: number
  breakdown: { star: number; count: number; pct: number }[]
}

export interface Recipe {
  id: number
  chef_id: number
  title: string
  description: string | null
  media_url: string | null
  created_at: string
}

export interface VideoPost {
  id: number
  chef_id: number
  video_url: string
  caption: string | null
  created_at: string
}

export const api = {
  signup: (body: {
    name: string
    email: string
    password: string
    confirmPassword?: string
    role?: 'guest' | 'chef'
    governmentId?: string
  }) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }) as Promise<{ token: string; user: User }>,
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }) as Promise<{ token: string; user: User }>,
  me: () => request('/me') as Promise<User>,
  setRole: (body: { enableChef?: boolean; enableGuest?: boolean; activeRole?: 'guest' | 'chef' }) =>
    request('/me/role', { method: 'POST', body: JSON.stringify(body) }) as Promise<User>,
  updateChefProfile: (body: {
    bio?: string
    coverPhotoUrl?: string
    lat?: number
    lng?: number
    eatIn?: boolean
    delivery?: boolean
    takeOut?: boolean
  }) => request('/me/chef-profile', { method: 'PUT', body: JSON.stringify(body) }),
  listings: (params?: {
    mode?: string
    tag?: string
    excludeAllergen?: string[]
    cuisine?: string
    category?: string
    minRating?: number
    sort?: 'newest' | 'rating' | 'price'
  }) => {
    const qs = new URLSearchParams()
    if (params?.mode) qs.set('mode', params.mode)
    if (params?.tag) qs.set('tag', params.tag)
    if (params?.cuisine) qs.set('cuisine', params.cuisine)
    if (params?.category) qs.set('category', params.category)
    if (params?.minRating) qs.set('minRating', String(params.minRating))
    if (params?.sort) qs.set('sort', params.sort)
    for (const a of params?.excludeAllergen || []) qs.append('excludeAllergen', a)
    const str = qs.toString()
    return request(`/listings${str ? `?${str}` : ''}`) as Promise<any[]>
  },
  createListing: (body: Record<string, unknown>) =>
    request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  allergens: () => request('/allergens') as Promise<string[]>,
  book: (body: { listingId: number; timeSlot?: string; mode?: string }) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(body) }) as Promise<Booking>,
  myBookings: () => request('/me/bookings') as Promise<Booking[]>,
  chefBookings: () => request('/me/chef-bookings') as Promise<Booking[]>,
  updateBookingStatus: (id: number, status: BookingStatus) =>
    request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }) as Promise<Booking>,
  chefRecipes: (userId: number) => request(`/chefs/${userId}/recipes`) as Promise<Recipe[]>,
  addRecipe: (body: { title: string; description?: string; mediaUrl?: string }) =>
    request('/me/recipes', { method: 'POST', body: JSON.stringify(body) }) as Promise<Recipe>,
  deleteRecipe: (id: number) => request(`/me/recipes/${id}`, { method: 'DELETE' }),
  chefVideos: (userId: number) => request(`/chefs/${userId}/videos`) as Promise<VideoPost[]>,
  addVideo: (body: { videoUrl: string; caption?: string }) =>
    request('/me/videos', { method: 'POST', body: JSON.stringify(body) }) as Promise<VideoPost>,
  deleteVideo: (id: number) => request(`/me/videos/${id}`, { method: 'DELETE' }),
  addReview: (bookingId: number, body: { rating: number; text?: string }) =>
    request(`/bookings/${bookingId}/review`, { method: 'POST', body: JSON.stringify(body) }) as Promise<Review>,
  chefReviews: (userId: number) => request(`/chefs/${userId}/reviews`) as Promise<ReviewSummary>,
}
