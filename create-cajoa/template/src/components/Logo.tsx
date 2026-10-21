export function Logo() {
  return (
    <svg
      class="logo"
      viewBox="0 0 64 64"
      width="32"
      height="32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cajoa-bolt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffd84d" />
          <stop offset="0.55" stop-color="#ff6ac1" />
          <stop offset="1" stop-color="#7c5cff" />
        </linearGradient>
      </defs>
      <path d="M38 4 14 35h15l-4 25 25-34H35z" fill="url(#cajoa-bolt)" />
    </svg>
  );
}
