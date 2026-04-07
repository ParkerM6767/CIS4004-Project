import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

// Sub Methods

function Skeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onChange(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
      <span className="text-sm text-zinc-500 px-3">Page {page} of {pages}</span>
      <button onClick={() => onChange(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-40">Next →</button>
    </div>
  );
}

function GameForm({ initial, onSubmit, onCancel }) {
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', author: '', coverImage: '',
    //genre: '', releaseYear: '', platforms: [],
    ...initial,
    genre: initial?.genre?._id || initial?.genre || '',
    platforms: (initial?.platforms || []).map(p => p._id || p),
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.get('/genres'), api.get('/platforms')]).then(([g, p]) => {
      setGenres(g.data.genres);
      setPlatforms(p.data.platforms);
    });
  }, []);

  const togglePlatform = (id) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter(p => p !== id)
        : [...f.platforms, id],
    }));
  };

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.releaseYear) delete payload.releaseYear;
      if (!payload.genre) payload.genre = null;
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
          <label className="label">Release Year</label>
          <input className="input" type="number" value={form.releaseYear} onChange={f('releaseYear')} placeholder="e.g. 2024" min="1970" max="2030" />
        </div>
        <div>
          <label className="label">Genre</label>
          <select className="input" value={form.genre} onChange={f('genre')}>
            <option value="">Select genre...</option>
            {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Cover Image URL</label>
          <input className="input" value={form.coverImage} onChange={f('coverImage')} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Platforms</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {platforms.map(p => (
              <button
                key={p._id}
                type="button"
                onClick={() => togglePlatform(p._id)}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-mono font-medium border transition-all',
                  form.platforms.includes(p._id)
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400',
                ].join(' ')}
              >
                {p.abbreviation || p.name}
              </button>
            ))}
          </div>
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
  const [modal, setModal] = useState(null);
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
        {modal && <GameForm initial={modal === 'add' ? undefined : modal} onSubmit={handleSubmit} onCancel={() => setModal(null)} />}
      </Modal>

      {loading ? <Skeleton /> : games.length === 0 ? (
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
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {game.author}{game.releaseYear ? ` · ${game.releaseYear}` : ''}
                  {game.genre?.name ? ` · ${game.genre.name}` : ''}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StarRating rating={game.currentRating} size="sm" />
                  <span className="text-xs text-zinc-400">{game.reviewCount} reviews</span>
                  {game.platforms?.slice(0, 3).map(p => (
                    <span key={p._id} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                      {p.abbreviation || p.name}
                    </span>
                  ))}
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
      <Pagination page={page} pages={Math.ceil(total / LIMIT)} onChange={setPage} />
    </div>
  );
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, description: '' });
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

  const openEdit = (review) => {
    setEditing(review);
    setEditForm({ rating: review.rating, description: review.description });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/reviews/${editing._id}`, editForm);
      setReviews(prev => prev.map(r => r._id === editing._id ? { ...r, ...res.data.review } : r));
      setEditing(null);
      toast({ message: 'Review updated!', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to update', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      setTotal(t => t - 1);
      toast({ message: 'Review deleted', type: 'success' });
    } catch {
      toast({ message: 'Failed to delete', type: 'error' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">REVIEWS</h2>
        <p className="text-sm text-zinc-500">{total} total</p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT REVIEW">
        {editing && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="label">Rating</label>
              <StarRating rating={editForm.rating} size="lg" interactive onChange={v => setEditForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="label">Review Text</label>
              <textarea className="input min-h-[100px] resize-none" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Update Review</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      {loading ? <Skeleton /> : reviews.length === 0 ? (
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
                    {review.platform && (
                      <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                        {review.platform.abbreviation || review.platform.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(review)} className="btn-secondary text-sm py-1 px-3">Edit</button>
                  <button onClick={() => handleDelete(review._id)} className="btn-danger text-sm py-1 px-3">Delete</button>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{review.description}</p>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={Math.ceil(total / LIMIT)} onChange={setPage} />
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', role: 'user', password: '' });
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

  const openEdit = (user) => {
    setEditing(user);
    setEditForm({ username: user.username, role: user.role, password: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: editForm.username, role: editForm.role };
      if (editForm.password) payload.password = editForm.password;
      const res = await api.put(`/users/${editing._id}`, payload);
      setUsers(prev => prev.map(u => u._id === editing._id ? res.data.user : u));
      setEditing(null);
      toast({ message: 'User updated!', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to update user', type: 'error' });
    }
  };

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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">USERS</h2>
        <p className="text-sm text-zinc-500">{total} total</p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="EDIT USER">
        {editing && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input className="input" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">New Password <span className="text-zinc-400 font-normal">(leave blank to keep current)</span></label>
              <input type="password" className="input" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Update User</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      {loading ? <Skeleton /> : users.length === 0 ? (
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
              <div className="text-xs text-zinc-400 hidden sm:block">{new Date(user.createdAt).toLocaleDateString()}</div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(user)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(user._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={Math.ceil(total / LIMIT)} onChange={setPage} />
    </div>
  );
}


/*

This code was generated in parts using AI

Model: Claude Sonnet 4.6
Date of Use: 04/05/2026
Prompt Description: Using the existing code structure, generate a tab to manage Genres using CRUD API routes, and other to manage Platforms.

Results: Methods similar to the code above that was able to implement all the CRUD features for both entities using modals for editing and creating new objects.

*/

function GenresTab() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | genre obj
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/genres');
      setGenres(res.data.genres);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', description: '' }); setModal('add'); };
  const openEdit = (g) => { setForm({ name: g.name, description: g.description || '' }); setModal(g); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        const res = await api.post('/genres', form);
        setGenres(prev => [...prev, res.data.genre].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ message: 'Genre created!', type: 'success' });
      } else {
        const res = await api.put(`/genres/${modal._id}`, form);
        setGenres(prev => prev.map(g => g._id === modal._id ? res.data.genre : g));
        toast({ message: 'Genre updated!', type: 'success' });
      }
      setModal(null);
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to save genre', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this genre? Games using it will have their genre cleared.')) return;
    try {
      await api.delete(`/genres/${id}`);
      setGenres(prev => prev.filter(g => g._id !== id));
      toast({ message: 'Genre deleted', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">GENRES</h2>
          <p className="text-sm text-zinc-500">{genres.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Genre</button>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'ADD GENRE' : 'EDIT GENRE'}>
        {modal && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. RPG, FPS, Strategy" autoFocus />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief description of this genre..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Create Genre' : 'Update Genre'}</button>
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      {loading ? <Skeleton rows={4} /> : genres.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500">No genres yet. Add one to get started.</div>
      ) : (
        <div className="space-y-3">
          {genres.map(genre => (
            <div key={genre._id} className="card p-4 flex items-center gap-4 animate-slide-up">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-display text-brand-700 dark:text-brand-300">
                  {genre.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{genre.name}</p>
                {genre.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{genre.description}</p>
                )}
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">slug: {genre.slug}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(genre)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(genre._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Platforms Tab

function PlatformsTab() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', manufacturer: '', releaseYear: '', abbreviation: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/platforms');
      setPlatforms(res.data.platforms);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', manufacturer: '', releaseYear: '', abbreviation: '' }); setModal('add'); };
  const openEdit = (p) => {
    setForm({ name: p.name, manufacturer: p.manufacturer || '', releaseYear: p.releaseYear || '', abbreviation: p.abbreviation || '' });
    setModal(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.releaseYear) delete payload.releaseYear;
      if (modal === 'add') {
        const res = await api.post('/platforms', payload);
        setPlatforms(prev => [...prev, res.data.platform].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ message: 'Platform created!', type: 'success' });
      } else {
        const res = await api.put(`/platforms/${modal._id}`, payload);
        setPlatforms(prev => prev.map(p => p._id === modal._id ? res.data.platform : p));
        toast({ message: 'Platform updated!', type: 'success' });
      }
      setModal(null);
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to save platform', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this platform? It will be removed from all games.')) return;
    try {
      await api.delete(`/platforms/${id}`);
      setPlatforms(prev => prev.filter(p => p._id !== id));
      toast({ message: 'Platform deleted', type: 'success' });
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
    }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display text-zinc-900 dark:text-zinc-100">PLATFORMS</h2>
          <p className="text-sm text-zinc-500">{platforms.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Platform</button>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'ADD PLATFORM' : 'EDIT PLATFORM'}>
        {modal && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={f('name')} required placeholder="e.g. PlayStation 5" autoFocus />
              </div>
              <div>
                <label className="label">Abbreviation</label>
                <input className="input" value={form.abbreviation} onChange={f('abbreviation')} placeholder="e.g. PS5" maxLength={10} />
              </div>
              <div>
                <label className="label">Release Year</label>
                <input className="input" type="number" value={form.releaseYear} onChange={f('releaseYear')} placeholder="e.g. 2020" min="1970" max="2100" />
              </div>
              <div className="col-span-2">
                <label className="label">Manufacturer</label>
                <input className="input" value={form.manufacturer} onChange={f('manufacturer')} placeholder="e.g. Sony, Microsoft, Nintendo" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Create Platform' : 'Update Platform'}</button>
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      {loading ? <Skeleton rows={4} /> : platforms.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500">No platforms yet. Add one to get started.</div>
      ) : (
        <div className="space-y-3">
          {platforms.map(platform => (
            <div key={platform._id} className="card p-4 flex items-center gap-4 animate-slide-up">
              <div className="w-14 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
                  {platform.abbreviation || platform.name.slice(0, 4)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{platform.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {[platform.manufacturer, platform.releaseYear].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(platform)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(platform._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page

const TABS = [
  { id: 'games',     label: 'Games',     icon: '🎮' },
  { id: 'reviews',   label: 'Reviews',   icon: '⭐' },
  { id: 'users',     label: 'Users',     icon: '👤' },
  { id: 'genres',    label: 'Genres',    icon: '🏷️' },
  { id: 'platforms', label: 'Platforms', icon: '🕹️' },
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
        <p className="text-zinc-500 dark:text-zinc-400">Manage games, reviews, users, genres, and platforms</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit flex-wrap">
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

      <div className="animate-fade-in" key={tab}>
        {tab === 'games'     && <GamesTab />}
        {tab === 'reviews'   && <ReviewsTab />}
        {tab === 'users'     && <UsersTab />}
        {tab === 'genres'    && <GenresTab />}
        {tab === 'platforms' && <PlatformsTab />}
      </div>
    </div>
  );
}
