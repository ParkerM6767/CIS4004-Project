import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';

const PLACEHOLDER = 'https://placehold.co/400x560/1a1a2e/e94560?text=NO+COVER&font=bebas-neue';

function ReviewCard({ review, currentUser, onDelete, onEdit }) {
  const isOwner = currentUser?._id === review.author?._id;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{review.author?.username}</span>
          {review.author?.role === 'admin' && <span className="badge-admin">ADMIN</span>}
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-amber-500 font-mono font-medium">{review.rating}/5</span>
          {review.platform && (
            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
              {review.platform.abbreviation || review.platform.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
          {(isOwner || isAdmin) && (
            <>
              <button onClick={() => onEdit(review)} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Edit</button>
              <button onClick={() => onDelete(review._id)} className="text-xs text-red-500 hover:text-red-600 transition-colors">Delete</button>
            </>
          )}
        </div>
      </div>
      <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{review.description}</p>
    </div>
  );
}

function ReviewForm({ gameId, gamePlatforms, existing, onSubmit, onCancel }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [description, setDescription] = useState(existing?.description || '');
  const [platformId, setPlatformId] = useState(existing?.platform?._id || '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast({ message: 'Please select a star rating', type: 'error' });
    if (description.trim().length < 10) return toast({ message: 'Review must be at least 10 characters', type: 'error' });
    setLoading(true);
    try {
      const payload = { gameId, rating, description };
      if (platformId) payload.platformId = platformId;
      if (existing) {
        const res = await api.put(`/reviews/${existing._id}`, { rating, description, platform: platformId || null });
        onSubmit(res.data.review, true);
      } else {
        const res = await api.post('/reviews', { gameId, rating, description, platform: platformId || null });
        onSubmit(res.data.review, false);
      }
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to submit review', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-display text-lg text-zinc-900 dark:text-zinc-100">
        {existing ? 'EDIT REVIEW' : 'WRITE A REVIEW'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Your Rating</label>
          <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        </div>
        {gamePlatforms?.length > 0 && (
          <div>
            <label className="label">Platform <span className="text-zinc-400 font-normal">(optional)</span></label>
            <select className="input" value={platformId} onChange={e => setPlatformId(e.target.value)}>
              <option value="">Select platform...</option>
              {gamePlatforms.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <label className="label">Review</label>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Share your thoughts about this game..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : existing ? 'Update Review' : 'Post Review'}
        </button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default function GamePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasReviewed = user && reviews.some(r => r.author?._id === user._id);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [gameRes, reviewRes] = await Promise.all([
          api.get(`/games/${id}`),
          api.get('/reviews', { params: { gameId: id, page, limit: 10 } }),
        ]);
        setGame(gameRes.data.game);
        setReviews(reviewRes.data.reviews);
        setTotalPages(reviewRes.data.pages);
      } catch {
        toast({ message: 'Failed to load game', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, page]);

  const handleReviewSubmit = (review, isEdit) => {
    if (isEdit) {
      setReviews(prev => prev.map(r => r._id === review._id ? review : r));
      setEditingReview(null);
      toast({ message: 'Review updated!', type: 'success' });
    } else {
      setReviews(prev => [review, ...prev]);
      toast({ message: 'Review posted!', type: 'success' });
    }
    api.get(`/games/${id}`).then(res => setGame(res.data.game));
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      api.get(`/games/${id}`).then(res => setGame(res.data.game));
      toast({ message: 'Review deleted', type: 'success' });
    } catch {
      toast({ message: 'Failed to delete review', type: 'error' });
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="flex gap-8">
          <div className="w-48 aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!game) return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-center">
      <h2 className="text-3xl font-display text-zinc-700 dark:text-zinc-300">GAME NOT FOUND</h2>
      <Link to="/" className="btn-primary mt-4 inline-block">← Back to Games</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 mb-8 transition-colors">
        ← Back to Games
      </Link>

      {/* Game header */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        <div className="w-full sm:w-48 flex-shrink-0">
          <img
            src={game.coverImage || PLACEHOLDER}
            alt={game.title}
            className="w-full sm:w-48 aspect-[2/3] object-cover rounded-xl shadow-lg"
            onError={e => { e.target.src = PLACEHOLDER; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl font-display text-zinc-900 dark:text-zinc-100 leading-none mb-1">
            {game.title}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">{game.author}</p>

          {/* Genre + Year */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {game.genre?.name && (
              <span className="text-xs font-mono bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                {game.genre.name}
              </span>
            )}
            {game.releaseYear && (
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{game.releaseYear}</span>
            )}
          </div>

          {/* Platforms */}
          {game.platforms?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {game.platforms.map(p => (
                <span key={p._id} className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                  {p.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={game.currentRating} size="lg" />
            <span className="text-2xl font-display text-zinc-700 dark:text-zinc-300">
              {game.currentRating > 0 ? game.currentRating.toFixed(1) : '—'}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              ({game.reviewCount} {game.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{game.description}</p>
        </div>
      </div>

      {/* Review form */}
      <div className="mb-8">
        <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100 mb-4">REVIEWS</h2>
        {!user ? (
          <div className="card p-5 text-center text-zinc-500 dark:text-zinc-400">
            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">Sign in</Link> to write a review
          </div>
        ) : !hasReviewed && !editingReview ? (
          <ReviewForm gameId={id} gamePlatforms={game.platforms} onSubmit={handleReviewSubmit} />
        ) : null}
      </div>

      {editingReview && (
        <div className="mb-8">
          <ReviewForm
            gameId={id}
            gamePlatforms={game.platforms}
            existing={editingReview}
            onSubmit={handleReviewSubmit}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">
            No reviews yet. Be the first!
          </div>
        ) : (
          reviews.map((review, i) => (
            <div key={review._id} style={{ animationDelay: `${i * 40}ms` }}>
              <ReviewCard review={review} currentUser={user} onDelete={handleDelete} onEdit={setEditingReview} />
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500 px-3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
