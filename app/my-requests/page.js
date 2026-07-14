"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

function RequestCard({ request }) {
  return (
    <Link href={`/my-requests/${request._id}`} className="block w-full">
      <Card hoverLift className="overflow-hidden h-full flex flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-caption uppercase tracking-wide text-brand-500 dark:text-brand-400 font-semibold">
            {LISTING_CATEGORY_LABELS[request.category] || request.category}
          </span>
          <Badge status={request.status} />
        </div>

        <h2 className="text-ink-900 dark:text-white font-semibold mt-2">
          {formatNaira(request.budgetMin)} – {formatNaira(request.budgetMax)}
        </h2>

        <div className="flex flex-wrap gap-3 mt-2 text-caption text-ink-700 dark:text-slate-200">
          {typeof request.bedrooms === "number" && <span>{request.bedrooms} bed</span>}
          {typeof request.bathrooms === "number" && <span>{request.bathrooms} bath</span>}
        </div>

        {request.preferredLocations?.length > 0 && (
          <p className="text-caption text-ink-500 dark:text-slate-400 mt-2 flex-1">
            {request.preferredLocations.join(", ")}
          </p>
        )}

        {request.acceptedOffer && (
          <p className="text-caption font-medium text-success mt-3">
            Offer accepted
          </p>
        )}

        <span className="text-caption font-medium text-brand-500 dark:text-brand-400 mt-3">
          View details →
        </span>
      </Card>
    </Link>
  );
}

function MyRequestsContent() {
  const { data, isLoading } = useSWR("/api/userrequest/mine", fetcher);
  const requests = Array.isArray(data) ? data : [];

  return (
    <Container className="py-10 flex-1">
      <h1 className="text-h1 text-ink-900 dark:text-white">My Requests</h1>
      <p className="text-body text-ink-500 dark:text-slate-400 mt-1">
        Track offers from agents on the housing requests you&apos;ve submitted.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-ink-500 dark:text-slate-400">Loading your requests...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-500 dark:text-slate-400">
              You haven&apos;t submitted any requests yet.
            </p>
            <Link href="/request" className="inline-block mt-4">
              <Button>Submit your first request →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

export default function MyRequestsPage() {
  const { status } = useSession();

  return (
    <main className="w-full bg-white dark:bg-surface-900 min-h-screen flex flex-col">
      <Header />
      {status === "unauthenticated" ? (
        <Container className="py-10 flex-1">
          <div className="text-center py-16">
            <h1 className="text-h1 text-ink-900 dark:text-white">My Requests</h1>
            <p className="text-body text-ink-500 dark:text-slate-400 mt-2">
              Please sign in to view the requests you&apos;ve submitted.
            </p>
            <Link href="/login" className="inline-block mt-4">
              <Button>Sign in</Button>
            </Link>
          </div>
        </Container>
      ) : (
        <MyRequestsContent />
      )}
      <Footer />
    </main>
  );
}
