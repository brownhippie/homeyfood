import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Search from './pages/Search'
import ChefDashboard from './pages/ChefDashboard'
import Bookings from './pages/Bookings'
import ChefProfile from './pages/ChefProfile'
import NotFound from './pages/NotFound'

function Nav() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <nav className="nav">
      <Link className="brand-badge" to="/" onClick={() => setOpen(false)}>
        Homey Food
      </Link>
      <button
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        <Link to="/search">Find Chefs</Link>
        <Link to="/chef">Chef dashboard</Link>
        {user && <Link to="/bookings">My Bookings</Link>}
        {user ? (
          <>
            <span className="muted">Hi, {user.name}</span>
            <button className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chef" element={<ChefDashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/chefs/:userId" element={<ChefProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
