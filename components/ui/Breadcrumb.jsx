import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

// Shared trail for every content page. `items` is an ordered array of
// `{ label, href? }` -- an item without `href` (conventionally the last one)
// renders as plain text for the current page; every other item is a link.
function Breadcrumb({ items, className = "" }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-ink-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <FaChevronRight size={9} className="text-ink-300 dark:text-surface-600 shrink-0" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`truncate ${
                    isLast ? "text-ink-700 dark:text-slate-200 font-medium" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
