"use client";

import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import OfferForm from "@/components/admin/OfferForm";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";
import { useBodyScrollLock } from "@/utils/useBodyScrollLock";

function formatNaira(amount) {
  return `₦ ${Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

// Compact reminder of what the agent is responding to, kept visible above
// the form so they don't have to close the modal to re-check requirements.
function RequestSummary({ request }) {
  if (!request) return null;
  return (
    <div className="bg-ink-100 dark:bg-surface-800 rounded-xl p-4 mb-6 space-y-2">
      <p className="text-xs uppercase tracking-wide text-ink-500 dark:text-surface-400 font-semibold">
        Responding to
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-700 dark:text-slate-200">
        <span>{LISTING_CATEGORY_LABELS[request.category] || request.category}</span>
        {typeof request.bedrooms === "number" && <span>{request.bedrooms} bed</span>}
        {typeof request.bathrooms === "number" && <span>{request.bathrooms} bath</span>}
        <span>
          {formatNaira(request.budgetMin)} – {formatNaira(request.budgetMax)}
          {request.priceFrequency && request.priceFrequency !== "one-time"
            ? ` / ${request.priceFrequency.replace("per-", "")}`
            : ""}
        </span>
        {request.preferredLocations?.length > 0 && (
          <span>{request.preferredLocations.join(", ")}</span>
        )}
      </div>
      {request.request && (
        <p className="text-sm text-ink-500 dark:text-surface-400 italic">
          &quot;{request.request}&quot;
        </p>
      )}
    </div>
  );
}

// Modal shell mirrors components/RequestWizardModal.jsx's overlay/panel
// styling for visual consistency, but as a single scrollable form (no
// step-by-step wizard) -- the offer form isn't long enough to warrant one.
function OfferFormModal({ request, existingOffer, onClose, onSuccess }) {
  useBodyScrollLock();

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-900/60 dark:bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-card w-full max-w-2xl max-h-[calc(100dvh-6rem)] sm:max-h-[90dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-ink-100 dark:bg-surface-800 flex items-center justify-center text-ink-700 dark:text-slate-200 hover:bg-ink-200 dark:hover:bg-surface-700"
        >
          <FaTimes size={14} />
        </button>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6">
          <h1 className="text-h2 text-ink-900 dark:text-white pr-10 mb-4">
            {existingOffer ? "Edit Your Offer" : "Respond to this Request"}
          </h1>
          <RequestSummary request={request} />
          <OfferForm
            requestId={request?._id}
            request={request}
            existingOffer={existingOffer}
            onSuccess={onSuccess}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default OfferFormModal;
