"use client";

import React, { Suspense, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import ListingItem from "@/components/ListingItem";
import CardGridSkeleton from "@/components/ui/CardGridSkeleton";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/ui/Button";
import {
  LISTING_CATEGORIES,
  LISTING_CATEGORY_LABELS,
  LISTING_SORT_OPTIONS,
  LISTING_SORT_LABELS,
} from "@/constants/listing";
import { AVAILABLE_STATES } from "@/constants/location";
import { getLgasForState } from "@/utils/nigeriaLocations";
import { formatNumberWithCommas, unformatNumber } from "@/utils/formatNumber";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const bedroomBathroomOptions = [
  { value: "", name: "Any" },
  { value: "1", name: "1" },
  { value: "2", name: "2" },
  { value: "3", name: "3" },
  { value: "4", name: "4" },
  { value: "5", name: "5+" },
];

const stateOptions = [
  { value: "", name: "Any" },
  ...AVAILABLE_STATES.map((value) => ({ value, name: value })),
];

const sortOptions = LISTING_SORT_OPTIONS.map((value) => ({
  value,
  name: LISTING_SORT_LABELS[value] || value,
}));

const emptyDraft = {
  minPrice: "",
  maxPrice: "",
  bed: "",
  bathrooms: "",
  state: "",
  lga: "",
  sort: "newest",
};

// Reads current filters straight from the URL (same source-of-truth pattern
// already used for `category`) so a filtered view stays shareable/bookmarkable.
function draftFromSearchParams(searchParams) {
  return {
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bed: searchParams.get("bed") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    state: searchParams.get("state") || "",
    lga: searchParams.get("location") || "",
    sort: searchParams.get("sort") || "newest",
  };
}

function FilterPanel({ searchParams, onApply, onClear }) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState(() => draftFromSearchParams(searchParams));
  const lgaOptions = [
    { value: "", name: "Any" },
    ...getLgasForState(draft.state).map((value) => ({ value, name: value })),
  ];

  const update = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const activeFilterCount = Object.entries(draft).filter(
    ([key, value]) => value && !(key === "sort" && value === "newest")
  ).length;

  const handleApply = () => {
    onApply(draft);
  };

  const handleClear = () => {
    setDraft(emptyDraft);
    onClear();
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="inline-flex"
        >
          <FaChevronDown size={11} />
        </motion.span>
        {open ? "Hide filters" : "Show filters"}
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-brand-500 text-white text-[11px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-white dark:bg-surface-800 rounded-2xl shadow-card p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <Input
                    label="Min price (NGN)"
                    type="text"
                    name="minPrice"
                    value={draft.minPrice}
                    onChange={(e) => update("minPrice", formatNumberWithCommas(e.target.value))}
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <Input
                    label="Max price (NGN)"
                    type="text"
                    name="maxPrice"
                    value={draft.maxPrice}
                    onChange={(e) => update("maxPrice", formatNumberWithCommas(e.target.value))}
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <Select
                    label="Bedrooms"
                    name="bed"
                    value={draft.bed}
                    onChange={(e) => update("bed", e.target.value)}
                    options={bedroomBathroomOptions}
                    placeholder="Bedrooms"
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <Select
                    label="Bathrooms"
                    name="bathrooms"
                    value={draft.bathrooms}
                    onChange={(e) => update("bathrooms", e.target.value)}
                    options={bedroomBathroomOptions}
                    placeholder="Bathrooms"
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <Select
                    label="State"
                    name="state"
                    value={draft.state}
                    onChange={(e) => {
                      update("state", e.target.value);
                      update("lga", "");
                    }}
                    options={stateOptions}
                    placeholder="State"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Select
                    label="LGA"
                    name="lga"
                    value={draft.lga}
                    onChange={(e) => update("lga", e.target.value)}
                    options={lgaOptions}
                    placeholder={draft.state ? "LGA" : "Select a state first"}
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Select
                    label="Sort by"
                    name="sort"
                    value={draft.sort}
                    onChange={(e) => update("sort", e.target.value)}
                    options={sortOptions}
                    placeholder="Sort by"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" size="sm" onClick={handleApply}>
                  Apply filters
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={handleClear}>
                  Clear filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// The full browse-and-filter experience -- shared by the dedicated /listings
// page and the homepage (so a visitor never has to click through to a
// separate page just to filter listings). `basePath` is where category/filter
// changes push their updated URL ("/listings" standalone, "/" when embedded
// on the homepage) so the filters actually update in place instead of
// navigating away from wherever this is rendered.
function ListingsBrowserContent({ title, basePath, pageSize }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const [page, setPage] = useState(1);

  const query = new URLSearchParams();
  if (activeCategory) query.set("category", activeCategory);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bed = searchParams.get("bed");
  const bathrooms = searchParams.get("bathrooms");
  const state = searchParams.get("state");
  const location = searchParams.get("location");
  const sort = searchParams.get("sort");
  if (minPrice) query.set("minPrice", minPrice);
  if (maxPrice) query.set("maxPrice", maxPrice);
  if (bed) query.set("bed", bed);
  if (bathrooms) query.set("bathrooms", bathrooms);
  if (state) query.set("state", state);
  if (location) query.set("location", location);
  if (sort) query.set("sort", sort);
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  // Explicit status/approvalStatus so a logged-in staff visitor browsing the
  // public storefront never sees unapproved/off-market listings just because
  // they're staff.
  query.set("status", "available");
  query.set("approvalStatus", "approved");

  const { data, isLoading } = useSWR(`/api/listing?${query.toString()}`, fetcher);
  const items = data?.items || [];

  const setCategory = (category) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    // scroll: false -- this is embedded partway down the homepage too; the
    // default scroll-to-top-on-navigate would otherwise yank the page back up
    // past the hero every time a filter changes.
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  const applyFilters = (draft) => {
    setPage(1);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (draft.minPrice) params.set("minPrice", unformatNumber(draft.minPrice));
    if (draft.maxPrice) params.set("maxPrice", unformatNumber(draft.maxPrice));
    if (draft.bed) params.set("bed", draft.bed);
    if (draft.bathrooms) params.set("bathrooms", draft.bathrooms);
    if (draft.state) params.set("state", draft.state);
    if (draft.lga) params.set("location", draft.lga);
    if (draft.sort && draft.sort !== "newest") params.set("sort", draft.sort);
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  const clearFilters = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    router.push(`${basePath}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  return (
    <>
      <h1 className="text-h1 text-ink-900 dark:text-white">{title}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-brand-400 text-white"
              : "bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 border border-ink-300 dark:border-surface-700"
          }`}
        >
          All
        </button>
        {LISTING_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-brand-400 text-white"
                : "bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 border border-ink-300 dark:border-surface-700"
            }`}
          >
            {LISTING_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <FilterPanel searchParams={searchParams} onApply={applyFilters} onClear={clearFilters} />

      {/* isolate: contains the animated cards inside their own stacking
          context, capped below anything outside it (e.g. a modal). Without
          it, a card's own actively-animating transform can get promoted to
          a compositing layer that some mobile browsers paint out of order,
          letting it render above a higher z-index fixed overlay regardless
          of the actual z-index numbers. */}
      <div className="mt-8 isolate">
        {isLoading ? (
          <CardGridSkeleton
            count={pageSize}
            gridClassName="xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
          />
        ) : items.length === 0 ? (
          <p className="text-ink-500 dark:text-slate-400">No listings match these filters yet.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={query.toString()}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6"
            >
              {items.map((listing) => (
                <motion.div
                  key={listing._id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="h-full"
                >
                  <ListingItem listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {data?.pages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm font-medium text-brand-500 dark:text-brand-400 disabled:text-ink-300 dark:disabled:text-surface-700"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-500 dark:text-slate-400">
            Page {data.page} of {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm font-medium text-brand-500 dark:text-brand-400 disabled:text-ink-300 dark:disabled:text-surface-700"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

function ListingsBrowser({ title = "All Listings", basePath = "/listings", pageSize = 12 }) {
  return (
    <Suspense fallback={null}>
      <ListingsBrowserContent title={title} basePath={basePath} pageSize={pageSize} />
    </Suspense>
  );
}

export default ListingsBrowser;
