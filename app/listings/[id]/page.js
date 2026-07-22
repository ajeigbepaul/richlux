import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import MediaGallery from "@/components/ui/MediaGallery";
import ListingItem from "@/components/ListingItem";
import ListingInquiryButton from "@/components/ListingInquiryButton";
import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";
import { getCurrentSession, toIdString } from "@/utils/auth";
import { LISTING_CATEGORY_LABELS } from "@/constants/listing";
import { notFound } from "next/navigation";

function formatNaira(price) {
  return `₦ ${Number(price || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
}

async function getListing(id) {
  await connectToDB();
  const listing = await Listing.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("agent", "username email image")
    .lean();
  return listing;
}

async function getRelated(category, excludeId) {
  await connectToDB();
  const related = await Listing.find({
    category,
    status: "available",
    approvalStatus: "approved",
    _id: { $ne: excludeId },
  })
    .limit(3)
    .lean();
  return related;
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params;
  let listing;
  try {
    listing = await getListing(id);
  } catch (error) {
    listing = null;
  }
  if (!listing) return notFound();

  // Unapproved listings are only visible to manager/superadmin oversight or
  // the agent who owns them -- everyone else gets the same not-found page a
  // deleted listing would show (mirrors the GET /api/listing/[id] gate).
  const session = await getCurrentSession();
  const role = session?.user?.role;
  const isOversight = role === "superadmin" || role === "manager";
  const isOwner = role === "agent" && toIdString(listing.agent) === toIdString(session?.user?.id);
  if (listing.approvalStatus !== "approved" && !isOversight && !isOwner) {
    return notFound();
  }

  const related = await getRelated(listing.category, listing._id);
  const serializedListing = JSON.parse(JSON.stringify(listing));
  const serializedRelated = JSON.parse(JSON.stringify(related));

  return (
    <main className="w-full bg-ink-100 dark:bg-surface-950 min-h-screen flex flex-col">
      <Header />
      <Container className="py-10 flex-1">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Listings", href: "/listings" },
            { label: serializedListing.title },
          ]}
        />
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <MediaGallery
              media={serializedListing.media}
              title={serializedListing.title}
            />

            <div className="mt-6">
              <span className="text-caption uppercase tracking-wide text-brand-500 dark:text-brand-400 font-semibold">
                {LISTING_CATEGORY_LABELS[serializedListing.category] ||
                  serializedListing.category}
              </span>
              <div className="flex items-center justify-between mt-1">
                <h1 className="text-h1 text-ink-900 dark:text-white">{serializedListing.title}</h1>
                <Badge status={serializedListing.status} />
              </div>
              {serializedListing.location?.city && (
                <p className="text-ink-500 dark:text-slate-400 mt-1">
                  {[
                    serializedListing.location.address,
                    serializedListing.location.city,
                    serializedListing.location.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <div className="flex flex-wrap gap-6 mt-4 text-ink-700 dark:text-slate-200">
                {typeof serializedListing.bedrooms === "number" && (
                  <span>{serializedListing.bedrooms} Bedrooms</span>
                )}
                {typeof serializedListing.bathrooms === "number" && (
                  <span>{serializedListing.bathrooms} Bathrooms</span>
                )}
                {serializedListing.landSize && (
                  <span>{serializedListing.landSize}</span>
                )}
              </div>

              <p className="mt-6 text-body text-ink-700 dark:text-slate-200 whitespace-pre-line">
                {serializedListing.description}
              </p>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-ink-200 dark:border-surface-700 p-6 sticky top-24">
              <span className="text-caption text-ink-500 dark:text-slate-400">Price</span>
              <h2 className="text-h1 text-ink-900 dark:text-white">
                {formatNaira(serializedListing.price)}
                {serializedListing.priceFrequency !== "one-time" && (
                  <span className="text-caption text-ink-500 dark:text-slate-400 font-normal">
                    {" "}
                    / {serializedListing.priceFrequency.replace("per-", "")}
                  </span>
                )}
              </h2>
              <div className="mt-4">
                <ListingInquiryButton
                  listingId={serializedListing._id}
                  category={serializedListing.category}
                />
              </div>
            </div>
          </div>
        </div>

        {serializedRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="text-h2 text-ink-900 dark:text-white mb-6">Related Listings</h2>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-6 isolate">
              {serializedRelated.map((item) => (
                <ListingItem key={item._id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </Container>
      <Footer />
    </main>
  );
}
