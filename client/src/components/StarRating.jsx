export default function StarRating({ rating = 0, max = 5, size = 'md', interactive = false, onChange }) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl', xl: 'text-4xl' };

  const stars = Array.from({ length: max }, (_, i) => {
    const filled = i + 1 <= Math.round(rating);
    const half = !filled && i + 0.5 < rating && rating < i + 1;
    return { filled, half, index: i };
  });

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {stars.map(({ filled, index }) => (
        <button
          key={index}
          type={interactive ? 'button' : undefined}
          onClick={interactive && onChange ? () => onChange(index + 1) : undefined}
          className={[
            'leading-none transition-transform',
            interactive ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default',
            filled ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600',
          ].join(' ')}
          aria-label={interactive ? `Rate ${index + 1} star${index !== 0 ? 's' : ''}` : undefined}
        >
          ★
        </button>
      ))}
    </div>
  );
}
