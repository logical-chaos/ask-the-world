import React from 'react';

export default function BluLogo({
  size = 34,
  showWordmark = true,
  wordmarkSize = 24,
  gap = 0,
  className = '',
  animated = false,
}) {
  const height = Math.round((size * 34) / 40);
  const resolvedGap = gap ? `${gap}px` : (size >= 40 ? '12px' : '9px');

  return (
    <span
      className={`blu-logo ${className} ${animated ? 'is-animated' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: resolvedGap,
        userSelect: 'none',
        verticalAlign: 'middle',
        color: 'var(--purple, #7354b8)',
      }}
    >
      <svg
        width={size}
        height={height}
        viewBox="0 0 40 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="blu-butterfly-svg"
        aria-label="blu butterfly"
        role="img"
      >
        {/* Left Upper Wing - Translucent Lavender */}
        <path
          d="M 19 15 C 13 7, 4 6.5, 3 14.5 C 2 20.5, 10 23.5, 19 18.5 Z"
          fill="#c4b5fd"
          fillOpacity="0.82"
          className="blu-wing blu-wing-lavender-left"
        />
        {/* Left Lower Wing - Translucent Sky Blue */}
        <path
          d="M 19 17.5 C 11.5 16.5, 6 23.5, 8 28.5 C 10 32.5, 17 30.5, 19 20.5 Z"
          fill="#93c5fd"
          fillOpacity="0.82"
          className="blu-wing blu-wing-blue-left"
        />

        {/* Right Upper Wing - Translucent Lavender */}
        <path
          d="M 21 15 C 27 7, 36 6.5, 37 14.5 C 38 20.5, 30 23.5, 21 18.5 Z"
          fill="#c4b5fd"
          fillOpacity="0.82"
          className="blu-wing blu-wing-lavender-right"
        />
        {/* Right Lower Wing - Translucent Sky Blue */}
        <path
          d="M 21 17.5 C 28.5 16.5, 34 23.5, 32 28.5 C 30 32.5, 23 30.5, 21 20.5 Z"
          fill="#93c5fd"
          fillOpacity="0.82"
          className="blu-wing blu-wing-blue-right"
        />

        {/* Slender Minimalist Butterfly Body */}
        <path
          d="M 20 13.5 C 19.3 13.5, 18.8 14, 18.8 14.7 L 19.2 24 C 19.2 24.6, 19.5 25, 20 25 C 20.5 25, 20.8 24.6, 20.8 24 L 21.2 14.7 C 21.2 14, 20.7 13.5, 20 13.5 Z"
          fill="currentColor"
          className="blu-butterfly-body"
        />

        {/* Delicate Minimalist Antennae */}
        <path
          d="M 19.5 13.5 C 18.2 10.5, 15 8.5, 13.5 9.5 M 20.5 13.5 C 21.8 10.5, 25 8.5, 26.5 9.5"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          className="blu-butterfly-antennae"
        />
        <circle cx="13.5" cy="9.5" r="1.1" fill="currentColor" />
        <circle cx="26.5" cy="9.5" r="1.1" fill="currentColor" />
      </svg>

      {showWordmark && (
        <span
          className="blu-wordmark"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: `${wordmarkSize}px`,
            letterSpacing: '-0.04em',
            color: 'currentColor',
            lineHeight: 1,
            display: 'inline-block',
          }}
        >
          blu
        </span>
      )}
    </span>
  );
}
