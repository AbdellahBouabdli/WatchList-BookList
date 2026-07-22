import { useState } from 'react'

interface StarRatingProps {
  rating: number | null
  onChange: (rating: number | null) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ rating, onChange, disabled = false, size = 'md' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const displayRating = hoverRating ?? rating

  const stars = [1, 2, 3, 4, 5]

  const sizeClasses = {
    sm: 'star-sm',
    md: 'star-md',
    lg: 'star-lg',
  }

  return (
    <div className={`star-rating ${sizeClasses[size]}`} role="radiogroup" aria-label="Rating">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          className={`star ${(displayRating ?? 0) >= star ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onChange(rating === star ? null : star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
          disabled={disabled}
          aria-pressed={rating === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {rating === null && !disabled && (
        <button
          type="button"
          className="star clear-rating"
          onClick={() => onChange(null)}
          aria-label="Clear rating"
        >
          ☆
        </button>
      )}
    </div>
  )
}