import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Mode = 'eat_in' | 'delivery' | 'take_out'

export default function Home() {
  const navigate = useNavigate()
  const [craving, setCraving] = useState('')
  const [mode, setMode] = useState<Mode>('eat_in')

  function lookUp(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ mode })
    if (craving) params.set('q', craving)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div>
      <section className="hero-banner">
        <div className="hero-banner-inner">
          <h1>What are you craving today?!</h1>
          <form className="search-bar" onSubmit={lookUp}>
            <input
              className="search-bar-input"
              placeholder="Search dishes, cuisines, chefs…"
              value={craving}
              onChange={(e) => setCraving(e.target.value)}
            />
            <input className="search-bar-input search-bar-input-narrow" placeholder="Location" />
            <button className="btn btn-lookup" type="submit">
              Look Up!
            </button>
          </form>
          <div className="mode-toggle">
            {(['eat_in', 'delivery', 'take_out'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={`mode-pill ${mode === m ? 'mode-pill-active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'eat_in' ? 'Eat in' : m === 'delivery' ? 'Delivery' : 'Take Out'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page video-section">
        <div className="section-head">
          <h2>Popular Videos</h2>
          <a className="see-more" href="/search">
            See more
          </a>
        </div>
        <div className="video-row">
          {['#e8622c', '#2c7be8', '#8b4fe8', '#2ca882', '#e84f8b', '#e8a62c'].map((c, i) => (
            <div className="video-thumb" key={i} style={{ background: `linear-gradient(145deg, ${c}, #1a1a1a)` }}>
              <span className="play-icon">▶</span>
            </div>
          ))}
        </div>
      </section>

      <section className="page pillars-section">
        <div className="pillars">
          <div className="pillar">
            <h3>Community Connections</h3>
            <p>Personalized dining recommendations and meeting people over food.</p>
          </div>
          <div className="pillar">
            <h3>Local Flavor Discovery</h3>
            <p>Geolocation-based discovery of nearby home chefs and meals.</p>
          </div>
          <div className="pillar">
            <h3>Flavor Fusion</h3>
            <p>Connect with like-minded locals and build culinary friendships.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
