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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

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
