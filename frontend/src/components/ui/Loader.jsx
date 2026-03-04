/**
 * Loader — three bouncing dots, no visible text.
 *
 * Props:
 *   size  : "sm" | "md" | "lg"  (default "md")
 *   className : extra Tailwind classes (e.g. text color, margin)
 *
 * Uses `bg-current` so dots automatically inherit the parent's text color,
 * making the component work on both light and dark backgrounds without any
 * extra configuration.
 */
export default function Loader({ size = 'md', className = '' }) {
  const dot =
    {
      sm: 'w-1.5 h-1.5',
      md: 'w-2.5 h-2.5',
      lg: 'w-4 h-4',
    }[size] ?? 'w-2.5 h-2.5';

  const gap =
    {
      sm: 'gap-1',
      md: 'gap-1.5',
      lg: 'gap-2',
    }[size] ?? 'gap-1.5';

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-flex items-center justify-center ${gap} ${className}`}
    >
      <span
        className={`${dot} rounded-full bg-current animate-bounce [animation-delay:-0.3s]`}
      />
      <span
        className={`${dot} rounded-full bg-current animate-bounce [animation-delay:-0.15s]`}
      />
      <span className={`${dot} rounded-full bg-current animate-bounce`} />
      {/* Screen-reader only label — not visible */}
      <span className="sr-only">Loading</span>
    </span>
  );
}
