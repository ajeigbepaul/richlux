"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import ListingItem from "./ListingItem";
import Container from "@/components/ui/Container";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function Listings() {
  const { data, isLoading } = useSWR("/api/listing?pageSize=6", fetcher);
  const items = data?.items || [];

  return (
    <div className="bg-ink-100 dark:bg-surface-950 py-16">
      <Container>
        <div className="w-full flex flex-col items-center justify-center text-center mb-10">
          <h2 className="text-h1 text-ink-900 dark:text-white">Featured Properties</h2>
          <span className="text-body text-ink-500 dark:text-slate-400 mt-2">
            Your comfort and safety
          </span>
        </div>

        {isLoading ? (
          <p className="text-center text-ink-500 dark:text-slate-400">Loading listings...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-ink-500 dark:text-slate-400">
            No listings published yet -- check back soon.
          </p>
        ) : (
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {items.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/listings"
            className="text-brand-500 dark:text-brand-400 font-semibold hover:text-brand-600 dark:hover:text-brand-300"
          >
            View all listings →
          </Link>
        </div>
      </Container>
    </div>
  );
}

export default Listings;
