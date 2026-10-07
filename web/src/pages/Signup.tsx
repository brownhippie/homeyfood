import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'guest' | 'chef'>('guest')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signup(name, email, password, role)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="page narrow">
      <h1>Sign up</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <div className="role-pick">
          <label>
            <input
              type="radio"
              name="role"
              checked={role === 'guest'}
              onChange={() => setRole('guest')}
            />
            Join as Guest
          </label>
          <label>
            <input
              type="radio"
              name="role"
              checked={role === 'chef'}
              onChange={() => setRole('chef')}
            />
            Join as Chef
          </label>
        </div>
        <p className="hint">You can enable the other role later from your profile.</p>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Sign up
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
