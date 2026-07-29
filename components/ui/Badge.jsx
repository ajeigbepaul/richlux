import React from "react";

// Maps the Listing/UserRequest status enums (constants/listing.js) to a
// consistent color so admin tables and public listing cards agree visually.
const STATUS_STYLES = {
  available: "bg-success/10 text-success",
  open: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  contacted: "bg-warning/10 text-warning",
  sold: "bg-ink-500/10 text-ink-500 dark:text-slate-400",
  rented: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  closed: "bg-ink-500/10 text-ink-500 dark:text-slate-400",
  "off-market": "bg-danger/10 text-danger",
  // Offer statuses
  accepted: "bg-success/10 text-success",
  declined: "bg-danger/10 text-danger",
  withdrawn: "bg-ink-500/10 text-ink-500 dark:text-slate-400",
  // Listing/agent-application approval statuses
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

function Badge({ status, children, className = "" }) {
  const style = STATUS_STYLES[status] || "bg-ink-200 text-ink-700 dark:bg-surface-800 dark:text-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium capitalize ${style} ${className}`}
    >
      {children || status?.replace("-", " ")}
    </span>
  );
}

// Separate from STATUS_STYLES above -- isFeatured is a boolean flag on the
// Listing model, not a status enum, so it doesn't fit the status->style map.
// Styled with the gold accent since this is exactly the "rare accent" moment
// the brand's quiet-luxury direction reserves gold for.
function FeaturedBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300 ${className}`}
    >
      Featured
    </span>
  );
}

export default Badge;
export { FeaturedBadge };
