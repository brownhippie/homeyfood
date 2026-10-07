import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, type Recipe, type VideoPost, type ReviewSummary } from '../api'

export default function ChefProfile() {
  const { userId } = useParams()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const id = Number(userId)
    api.chefRecipes(id).then(setRecipes).catch((err) => setError(err.message))
    api.chefVideos(id).then(setVideos).catch((err) => setError(err.message))
    api.chefReviews(id).then(setReviewSummary).catch((err) => setError(err.message))
  }, [userId])

  return (
    <div className="page">
      <h1>Chef's Profile</h1>
      {error && <p className="error">{error}</p>}

      <h2>Top Recipes</h2>
      {recipes.length === 0 && <p className="muted">No recipes posted yet.</p>}
      <div className="content-list">
        {recipes.map((r) => (
          <div className="content-row" key={r.id}>
            <div>
              <strong>{r.title}</strong>
              {r.description && <p className="muted">{r.description}</p>}
            </div>
          </div>
        ))}
      </div>

      <h2>Top Videos</h2>
      {videos.length === 0 && <p className="muted">No videos linked yet.</p>}
      <div className="content-list">
        {videos.map((v) => (
          <div className="content-row" key={v.id}>
            <a href={v.video_url} target="_blank" rel="noreferrer">
              {v.caption || v.video_url}
            </a>
          </div>
        ))}
      </div>

      <h2>Ratings &amp; Reviews</h2>
      {reviewSummary && reviewSummary.total > 0 ? (
        <>
          <p className="rating-summary">
            {'★'.repeat(Math.round(reviewSummary.average))}
            {'☆'.repeat(5 - Math.round(reviewSummary.average))}{' '}
            <strong>{reviewSummary.average.toFixed(1)}</strong> out of 5.0 stars ({reviewSummary.total})
          </p>
          <div className="rating-breakdown">
            {reviewSummary.breakdown.map((row) => (
              <div className="rating-breakdown-row" key={row.star}>
                <span>{row.star} star</span>
                <div className="rating-bar">
                  <div className="rating-bar-fill" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="muted">{row.pct}%</span>
              </div>
            ))}
          </div>
          <div className="content-list">
            {reviewSummary.reviews.map((r) => (
              <div className="content-row" key={r.id}>
                <div>
                  <strong>
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </strong>{' '}
                  <span className="muted">by {r.guest_name}</span>
                  {r.text && <p>{r.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">No reviews yet.</p>
      )}
    </div>
  )
}
