import { useState } from 'react';

/**
 * RatingStars Component
 * Supports both read-only display and interactive star selection.
 */
export default function RatingStars({
    rating = 0,
    maxStars = 5,
    size = 'md',
    interactive = false,
    onChange = null,
    showScore = false,
    count = null,
    className = '',
}) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        xs: 'text-xs gap-0.5',
        sm: 'text-sm gap-1',
        md: 'text-base gap-1',
        lg: 'text-xl gap-1.5',
        xl: 'text-2xl gap-2',
    };

    const starSizeClasses = {
        xs: 'h-3.5 w-3.5',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
    };

    const ratingDescriptions = {
        1: '1 - Poor',
        2: '2 - Fair',
        3: '3 - Good',
        4: '4 - Very Good',
        5: '5 - Excellent / Outstanding',
    };

    const currentRating = interactive && hoverRating > 0 ? hoverRating : Number(rating) || 0;

    return (
        <div className={`inline-flex items-center ${sizeClasses[size] || sizeClasses.md} ${className}`}>
            <div className="flex items-center">
                {Array.from({ length: maxStars }, (_, index) => {
                    const starValue = index + 1;
                    const isFilled = currentRating >= starValue;
                    const isHalf = !isFilled && currentRating >= starValue - 0.5;

                    if (interactive) {
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onChange && onChange(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="group p-0.5 transition-transform duration-150 hover:scale-125 focus:outline-none"
                                title={ratingDescriptions[starValue]}
                            >
                                <svg
                                    className={`${starSizeClasses[size] || starSizeClasses.md} transition-colors ${
                                        isFilled
                                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                            : 'fill-slate-200 text-slate-200 group-hover:fill-amber-200 group-hover:text-amber-200'
                                    }`}
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        );
                    }

                    return (
                        <span key={index} className="inline-block">
                            {isFilled ? (
                                <svg
                                    className={`${starSizeClasses[size] || starSizeClasses.md} fill-amber-400 text-amber-400`}
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ) : isHalf ? (
                                <div className="relative">
                                    <svg
                                        className={`${starSizeClasses[size] || starSizeClasses.md} fill-slate-200 text-slate-200`}
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <div className="absolute inset-0 overflow-hidden w-1/2">
                                        <svg
                                            className={`${starSizeClasses[size] || starSizeClasses.md} fill-amber-400 text-amber-400`}
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <svg
                                    className={`${starSizeClasses[size] || starSizeClasses.md} fill-slate-200 text-slate-200`}
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            )}
                        </span>
                    );
                })}
            </div>

            {showScore && (
                <span className="font-extrabold text-slate-900 ml-1.5">
                    {Number(rating).toFixed(1)}
                </span>
            )}

            {count !== null && (
                <span className="text-xs font-semibold text-slate-500 ml-1">
                    ({count})
                </span>
            )}

            {interactive && (
                <span className="ml-2 text-xs font-bold text-amber-600">
                    {ratingDescriptions[currentRating] || 'Select Rating'}
                </span>
            )}
        </div>
    );
}
