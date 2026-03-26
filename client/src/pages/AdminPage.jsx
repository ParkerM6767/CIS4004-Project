import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

// ─── GAMES TAB ───────────────────────────────────────────────────────────────

function GameForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', author: '', coverImage: '', genre: '', releaseYear: '',
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.releaseYear) delete payload.releaseYear;
      if (initial?._id) {
        const res = await api.put(`/games/${initial._id}`, payload);
        onSubmit(res.data.game, true);
      } else {
        const res = await api.post('/games', payload);
        onSubmit(res.data.game, false);
      }
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to save game', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={f('title')} required placeholder="Game title" />
        </div>
        <div>
          <label className="label">Developer / Publisher *</label>
          <input className="input" value={form.author} onChange={f('author')} required placeholder="Studio name" />
        </div>
        <div>
          <label className="label">Genre</label>
          <input className="input" value={form.genre} onChange={f('genre')} placeholder="e.g. RPG, FPS, Platformer" />
        </div>
        <div>
          <label className="label">Release Year</label>
          <input className="input" type="number" value={form.releaseYear} onChange={f('releaseYear')} placeholder="e.g. 2024" min="1970" max="2030" />
        </div>
        <div>
          <label className="label">Cover Image URL</label>
          <input className="input" value={form.coverImage} onChange={f('coverImage')} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description *</label>
          <textarea className="input min-h-[100px] resize-none" value={form.description} onChange={f('description')} required rows={4} placeholder="Game description..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial?._id ? 'Update Game' : 'Add Game'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function GamesTab() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | game object
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/games', { params: { page, limit: LIMIT } });
      setGames(res.data.games);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = (game, isEdit) => {
    if (isEdit) setGames(prev => prev.map(g => g._id === game._id ? game : g));
    else { setGames(prev => [game, ...prev]); setTotal(t => t + 1); }
    setModal(null);
    toast({ message: isEdit ? 'Game updated!' : 'Game added!', type: 'success' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this game and all its reviews?')) return;
    try {
      await api.delete(`/games/${id}`);
      setGames(prev => prev.filter(g => g._id !== id));
      setTotal(t => t - 1);
      toast({ message: 'Game deleted', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">GAMES</h2>
          <p className="text-sm text-zinc-500">{total} total</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">+ Add Game</button>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'ADD GAME' : 'EDIT GAME'} size="lg">
        {modal && (
          <GameForm
            initial={modal === 'add' ? undefined : modal}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-12 h-16 bg-zinc-200 dark:bg-zinc-800 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500">No games yet</div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <div key={game._id} className="card p-4 flex items-center gap-4 animate-slide-up">
              <img
                src={game.coverImage || 'https://placehold.co/48x68/1a1a2e/e94560?text=?'}
                alt={game.title}
                className="w-12 h-16 object-cover rounded flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/48x68/1a1a2e/e94560?text=?'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{game.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{game.author} {game.releaseYear ? `· ${game.releaseYear}` : ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={game.currentRating} size="sm" />
                  <span className="text-xs text-zinc-400">{game.reviewCount} reviews</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setModal(game)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(game._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500 px-3">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── REVIEWS TAB ─────────────────────────────────────────────────────────────

function ReviewEditForm({ review, onSubmit, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [description, setDescription] = useState(review.description);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/reviews/${review._id}`, { rating, description });
      onSubmit(res.data.review);
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to update', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="label">Rating</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <div>
        <label className="label">Review Text</label>
        <textarea className="input min-h-[100px] resize-none" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update Review'}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/all', { params: { page, limit: LIMIT } });
      setReviews(res.data.reviews);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      setTotal(t => t - 1);
      toast({ message: 'Review deleted', type: 'success' });
    } catch (err) {
      toast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleEditSubmit = (updated) => {
    setReviews(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
    setEditing(null);
    toast({ message: 'Review updated!', type: 'success' });
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">REVIEWS</h2>
        <p className="text-sm text-zinc-500">{total} total</p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT REVIEW">
        {editing && <ReviewEditForm review={editing} onSubmit={handleEditSubmit} onCancel={() => setEditing(null)} />}
      </Modal>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse space-y-2">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500">No reviews yet</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review._id} className="card p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{review.author?.username}</span>
                    <span className="text-xs text-zinc-400">→</span>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">{review.game?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditing(review)} className="btn-secondary text-sm py-1 px-3">Edit</button>
                  <button onClick={() => handleDelete(review._id)} className="btn-danger text-sm py-1 px-3">Delete</button>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{review.description}</p>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500 px-3">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────

function UserEditForm({ user, onSubmit, onCancel }) {
  const [form, setForm] = useState({ username: user.username, role: user.role, password: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { username: form.username, role: form.role };
      if (form.password) payload.password = form.password;
      const res = await api.put(`/users/${user._id}`, payload);
      onSubmit(res.data.user);
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to update user', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="label">Username</label>
        <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Role</label>
        <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="label">New Password <span className="text-zinc-400 font-normal">(leave blank to keep current)</span></label>
        <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••" />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Update User'}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page, limit: LIMIT } });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(t => t - 1);
      toast({ message: 'User deleted', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Cannot delete this user', type: 'error' });
    }
  };

  const handleEditSubmit = (updated) => {
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
    setEditing(null);
    toast({ message: 'User updated!', type: 'success' });
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">USERS</h2>
        <p className="text-sm text-zinc-500">{total} total</p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT USER">
        {editing && <UserEditForm user={editing} onSubmit={handleEditSubmit} onCancel={() => setEditing(null)} />}
      </Modal>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/6" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500">No users found</div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="card p-4 flex items-center gap-4 animate-slide-up">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-display text-brand-700 dark:text-brand-300">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {user.role === 'admin' ? <span className="badge-admin">ADMIN</span> : <span className="badge-user">USER</span>}
                  <span className="text-xs text-zinc-400 font-mono">{user.uuid?.slice(0, 8)}...</span>
                </div>
              </div>
              <div className="text-xs text-zinc-400 hidden sm:block">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(user)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(user._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500 px-3">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'users', label: 'Users', icon: '👤' },
];

export default function AdminPage() {
  const [tab, setTab] = useState('games');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-6xl font-display text-zinc-900 dark:text-zinc-100">ADMIN</h1>
          <span className="badge-admin text-sm px-3 py-1">PANEL</span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">Manage games, reviews, and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
            ].join(' ')}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'games' && <GamesTab />}
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}
