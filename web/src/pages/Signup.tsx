import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [governmentId, setGovernmentId] = useState('')
  const [role, setRole] = useState<'guest' | 'chef'>('guest')
  const [aptSuite, setAptSuite] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [cityAddress, setCityAddress] = useState('')
  const [stateSubdivision, setStateSubdivision] = useState('')
  const [zipCodeAddress, setZipCodeAddress] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      await signup(name, email, password, role, confirmPassword, role === 'chef' ? governmentId : undefined, {
        aptSuite,
        streetAddress,
        cityAddress,
        stateSubdivision,
        zipCodeAddress,
        country,
      })
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
        <label>
          Reconfirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
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
        {role === 'chef' && (
          <label>
            Government ID
            <input
              value={governmentId}
              onChange={(e) => setGovernmentId(e.target.value)}
              placeholder="For identity verification as a home chef"
              required
            />
            <span className="hint">Used to verify chef identity. Never shown publicly.</span>
          </label>
        )}
        <p className="hint">You can enable the other role later from your profile.</p>

        <p className="hint">Address (optional)</p>
        <label>
          Street address
          <input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
        </label>
        <label>
          Apt / Suite
          <input value={aptSuite} onChange={(e) => setAptSuite(e.target.value)} />
        </label>
        <label>
          City
          <input value={cityAddress} onChange={(e) => setCityAddress(e.target.value)} />
        </label>
        <div className="qty-row">
          <label>
            State / Subdivision
            <input value={stateSubdivision} onChange={(e) => setStateSubdivision(e.target.value)} />
          </label>
          <label>
            Zip code
            <input value={zipCodeAddress} onChange={(e) => setZipCodeAddress(e.target.value)} />
          </label>
        </div>
        <label>
          Country
          <input value={country} onChange={(e) => setCountry(e.target.value)} />
        </label>

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
