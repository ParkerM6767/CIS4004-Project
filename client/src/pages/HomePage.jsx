import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import GameCard from '../components/GameCard';

export default function HomePage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const LIMIT = 24;

  // Load filter options once
  useEffect(() => {
    Promise.all([api.get('/genres'), api.get('/platforms')]).then(([g, p]) => {
      setGenres(g.data.genres);
      setPlatforms(p.data.platforms);
    });
  }, []);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (query) params.search = query;
      if (selectedGenre) params.genre = selectedGenre;
      if (selectedPlatform) params.platform = selectedPlatform;
      const res = await api.get('/games', { params });
      setGames(res.data.games);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, query, selectedGenre, selectedPlatform]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearAll = () => {
    setSearch('');
    setQuery('');
    setSelectedGenre('');
    setSelectedPlatform('');
    setPage(1);
  };

  const hasFilters = query || selectedGenre || selectedPlatform;
  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-6xl sm:text-8xl font-display text-zinc-900 dark:text-zinc-100 leading-none mb-2">
          META<span className="text-brand-600 dark:text-brand-500">GAME</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Discover a new game or leave a review of your favorite video game! Browse by genre, platform, or search for specific titles and developers.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xl">
          <input
            type="text"
            className="input"
            placeholder="Search games, developers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <select
            className="input w-auto min-w-[140px]"
            value={selectedGenre}
            onChange={handleFilterChange(setSelectedGenre)}
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          <select
            className="input w-auto min-w-[150px]"
            value={selectedPlatform}
            onChange={handleFilterChange(setSelectedPlatform)}
          >
            <option value="">All Platforms</option>
            {platforms.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={clearAll} className="btn-secondary whitespace-nowrap">
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {hasFilters
            ? `${total} result${total !== 1 ? 's' : ''} found`
            : `${total} game${total !== 1 ? 's' : ''} reviewed`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-display text-zinc-700 dark:text-zinc-300 mb-2">
            {hasFilters ? 'NO RESULTS FOUND' : 'VAULT IS EMPTY'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            {hasFilters ? 'Try adjusting your filters' : 'No games have been added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {games.map((game, i) => (
            <div key={game._id} style={{ animationDelay: `${i * 30}ms` }}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 px-4">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
