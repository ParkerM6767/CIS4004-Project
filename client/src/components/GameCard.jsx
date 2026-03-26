import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const PLACEHOLDER = 'https://placehold.co/400x560/1a1a2e/e94560?text=NO+COVER&font=bebas-neue';

export default function GameCard({ game }) {
  return (
    <Link
      to={`/games/${game._id}`}
      className="group block card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 animate-slide-up"
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        <img
          src={game.coverImage || PLACEHOLDER}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-mono px-2 py-1 rounded-lg flex items-center gap-1">
          <span className="text-amber-400">★</span>
          <span>{game.currentRating > 0 ? game.currentRating.toFixed(1) : '—'}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-display text-lg leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{game.author}</p>
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
