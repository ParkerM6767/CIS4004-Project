import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const PLACEHOLDER = 'https://placehold.co/400x560/1a1a2e/e94560?text=NO+COVER&font=bebas-neue';

export default function GameCard({ game }) {
  return (
    <Link
      to={`/games/${game._id}`}
      className="group block card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 animate-slide-up"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img
          src={game.coverImage || PLACEHOLDER}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1">
          <span className="text-amber-400">★</span>
          <span>{game.currentRating > 0 ? game.currentRating.toFixed(1) : '—'}</span>
        </div>
        {/* Genre badge */}
        {game.genre?.name && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-mono px-2 py-0.5 rounded">
            {game.genre.name}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-display text-lg leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors line-clamp-2">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{game.author}</p>

        {/* Platform abbreviations */}
        {game.platforms?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {game.platforms.slice(0, 4).map(p => (
              <span key={p._id} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                {p.abbreviation || p.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <StarRating rating={game.currentRating} size="sm" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {game.reviewCount} {game.reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
    </Link>
  );
}
