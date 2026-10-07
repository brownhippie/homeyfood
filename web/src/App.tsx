import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Search from './pages/Search'
import ChefDashboard from './pages/ChefDashboard'
import Bookings from './pages/Bookings'
import ChefProfile from './pages/ChefProfile'

function Nav() {
  const { user, logout } = useAuth()
  return (
    <nav className="nav">
      <Link className="brand" to="/">
        HomeyFood
      </Link>
      <div className="nav-links">
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
      </Routes>
    </AuthProvider>
  )
}
