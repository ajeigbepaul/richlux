import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

const STATIC_ROUTES = ["", "/listings", "/request", "/become-agent", "/register", "/login"];

export default async function sitemap() {
  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  // Only publicly-visible listings belong in the sitemap -- mirrors the same
  // status/approvalStatus gate the public storefront itself queries by.
  let listingEntries = [];
  try {
    await connectToDB();
    const listings = await Listing.find({ status: "available", approvalStatus: "approved" })
      .select("_id updatedAt")
      .lean();
    listingEntries = listings.map((listing) => ({
      url: `${siteUrl}/listings/${listing._id}`,
      lastModified: listing.updatedAt,
    }));
  } catch (error) {
    console.error("sitemap: failed to load listings", error);
  }

  return [...staticEntries, ...listingEntries];
}
