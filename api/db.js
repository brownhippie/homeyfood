import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.DB_PATH || path.join(__dirname, 'homeyfood.db')

const sqlite = sqlite3.verbose()
export const db = new sqlite.Database(dbPath)

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

async function addColumnIfMissing(table, column, definition) {
  const columns = await all(`PRAGMA table_info(${table})`)
  if (columns.some((c) => c.name === column)) return
  await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
}

export async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_guest INTEGER NOT NULL DEFAULT 1,
    is_chef INTEGER NOT NULL DEFAULT 0,
    active_role TEXT NOT NULL DEFAULT 'guest',
    avatar_url TEXT,
    government_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
  await addColumnIfMissing('users', 'government_id', 'TEXT')

  await run(`CREATE TABLE IF NOT EXISTS chef_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    bio TEXT,
    cover_photo_url TEXT,
    lat REAL,
    lng REAL,
    eat_in INTEGER NOT NULL DEFAULT 0,
    delivery INTEGER NOT NULL DEFAULT 0,
    take_out INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  await run(`CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chef_id INTEGER NOT NULL REFERENCES chef_profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER,
    tags TEXT,
    mode TEXT NOT NULL DEFAULT 'eat_in',
    photo_url TEXT,
    keywords TEXT,
    cuisine TEXT,
    category TEXT,
    serving_time TEXT,
    capacity INTEGER,
    rate_per_head_cents INTEGER,
    continuing_days INTEGER,
    allergens TEXT,
    portion_size TEXT,
    dietary_preference TEXT,
    spice_level TEXT,
    dish_prep_info TEXT,
    packaging_preference TEXT,
    eat_in_qty INTEGER NOT NULL DEFAULT 0,
    take_out_qty INTEGER NOT NULL DEFAULT 0,
    delivery_qty INTEGER NOT NULL DEFAULT 0,
    serving_time_from TEXT,
    serving_time_to TEXT,
    continued_dates TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
  for (const [col, def] of [
    ['keywords', 'TEXT'],
    ['cuisine', 'TEXT'],
    ['category', 'TEXT'],
    ['serving_time', 'TEXT'],
    ['serving_time_from', 'TEXT'],
    ['serving_time_to', 'TEXT'],
    ['continued_dates', 'TEXT'],
    ['capacity', 'INTEGER'],
    ['rate_per_head_cents', 'INTEGER'],
    ['continuing_days', 'INTEGER'],
    ['allergens', 'TEXT'],
    ['portion_size', 'TEXT'],
    ['dietary_preference', 'TEXT'],
    ['spice_level', 'TEXT'],
    ['dish_prep_info', 'TEXT'],
    ['packaging_preference', 'TEXT'],
    ['eat_in_qty', 'INTEGER NOT NULL DEFAULT 0'],
    ['take_out_qty', 'INTEGER NOT NULL DEFAULT 0'],
    ['delivery_qty', 'INTEGER NOT NULL DEFAULT 0'],
  ]) {
    await addColumnIfMissing('listings', col, def)
  }

  await run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL REFERENCES users(id),
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    time_slot TEXT,
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  await run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    rating INTEGER NOT NULL,
    text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  await run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chef_id INTEGER NOT NULL REFERENCES chef_profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  await run(`CREATE TABLE IF NOT EXISTS video_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chef_id INTEGER NOT NULL REFERENCES chef_profiles(id),
    video_url TEXT NOT NULL,
    caption TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
}
