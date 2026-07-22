import Skeleton from "./Skeleton";

// Mirrors DataTable's shape (header + a few rows of even-width cells on
// desktop, stacked cards on mobile) so admin list pages don't flash a bare
// "Loading..." line, or nothing at all on small screens, before the real
// table mounts.
function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <>
      <div className="hidden sm:block bg-white dark:bg-surface-800 rounded-lg overflow-hidden richshadow">
        <div className="flex gap-4 px-4 py-3 border-b border-ink-200 dark:border-surface-700">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-4 border-b border-ink-100 dark:border-surface-700 last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>

      <div className="sm:hidden space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface-800 rounded-lg p-4 space-y-2 richshadow">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </>
  );
}

export default TableSkeleton;
