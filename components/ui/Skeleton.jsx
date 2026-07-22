// Generic pulsing placeholder block -- compose via className for size/shape
// (e.g. "h-4 w-32", "aspect-square rounded-lg"). Pages build their own
// skeleton layout out of these to mirror their real content's shape.
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-ink-200 dark:bg-surface-700 rounded ${className}`} />;
}

export default Skeleton;
