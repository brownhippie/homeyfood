import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">#1 on foodie tours</p>
        <h1>Savor Authentic Home-Cooked Meals</h1>
        <p className="lede">
          Discover culinary delights with HomeyFood, where every meal tells a story, right at home.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/search">
            Find Chefs
          </Link>
          {!user && (
            <Link className="btn btn-ghost" to="/signup">
              Sign up today
            </Link>
          )}
        </div>
      </section>

      <section className="pillars">
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
      </section>
    </div>
  )
}
