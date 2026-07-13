"use client";

import React, { Suspense, useState } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import ListingItem from "@/components/ListingItem";
import {
  LISTING_CATEGORIES,
  LISTING_CATEGORY_LABELS,
} from "@/constants/listing";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function ListingsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const [page, setPage] = useState(1);

  const query = new URLSearchParams();
  if (activeCategory) query.set("category", activeCategory);
  query.set("page", String(page));
  query.set("pageSize", "12");

  const { data, isLoading } = useSWR(`/api/listing?${query.toString()}`, fetcher);
  const items = data?.items || [];

  const setCategory = (category) => {
    setPage(1);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    router.push(`/listings${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <main className="w-full">
      <Header />
      <Container className="py-10">
        <h1 className="text-h1 text-ink-900">All Listings</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-brand-400 text-white"
                : "bg-white text-ink-700 border border-ink-300"
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
                  : "bg-white text-ink-700 border border-ink-300"
              }`}
            >
              {LISTING_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <p className="text-ink-500">Loading listings...</p>
          ) : items.length === 0 ? (
            <p className="text-ink-500">No listings match this category yet.</p>
          ) : (
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
              {items.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        {data?.pages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm font-medium text-brand-500 disabled:text-ink-300"
            >
              ← Previous
            </button>
            <span className="text-sm text-ink-500">
              Page {data.page} of {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm font-medium text-brand-500 disabled:text-ink-300"
            >
              Next →
            </button>
          </div>
        )}
      </Container>
      <Footer />
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsBrowser />
    </Suspense>
  );
}
