import Skeleton from "./Skeleton";

// Mirrors ListingItem/RequestCard's shape (optional image block + a few
// text lines) so the loading state doesn't visually jump when real cards
// swap in. `gridClassName` should match the real grid's column classes
// exactly; set `showImage={false}` for text-only cards (e.g. RequestCard).
function CardGridSkeleton({ count = 6, gridClassName = "", showImage = true }) {
  return (
    <div className={`grid gap-6 ${gridClassName}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-surface-800 shadow-card">
          {showImage && <Skeleton className="w-full aspect-[4/3] rounded-none" />}
          <div className="p-4 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardGridSkeleton;
