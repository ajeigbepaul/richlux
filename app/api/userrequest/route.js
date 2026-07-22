import UserRequest from "@/model/UserRequest";
import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { LISTING_CATEGORIES } from "@/constants/listing";
import { USER_REQUEST_STATUSES } from "@/constants/request";
import { NextResponse } from "next/server";

// GET ALL REQUESTS. Staff-only (agents now need visibility to respond with offers).
export const GET = async (req) => {
  try {
    const session = await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const hasListing = searchParams.get("hasListing");

    const query = {};
    if (status && USER_REQUEST_STATUSES.includes(status)) query.status = status;
    if (category && LISTING_CATEGORIES.includes(category)) query.category = category;
    // Splits the general marketplace list (/admin/requests) from direct,
    // single-listing inquiries (/admin/enquiries) -- querying `null` also
    // matches documents where listingId was never set at all, not just an
    // explicit null, so this covers both without a separate $exists check.
    if (hasListing === "true") query.listingId = { $ne: null };
    else if (hasListing === "false") query.listingId = null;

    // Agents only ever see rental requests -- the multi-agent offer
    // marketplace is a rental-hunting feature specifically; the other
    // categories (land sale, property management, house sale, shortlet)
    // are handled directly by oversight staff (manager/superadmin), never
    // trust a client-supplied category to override this.
    if (session.user.role === "agent") {
      query.category = "rental";
    }

    const items = await UserRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "username email image")
      .populate("listingId", "title");

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
};

// Login required to submit a request -- ties every request to a real account.
//
// Both lanes that hit this endpoint (the full marketplace form at
// app/request, and a listing's "Make an Inquiry" via
// components/ListingInquiryButton.jsx) go through the same
// RequestWizardModal now, so they always send the same field shape --
// category only needs the listingId fallback below for the inquiry lane,
// which locks/prefills category from the listing but still sends it.
export async function POST(req) {
  try {
    const session = await requireRole([]);
    await connectToDB();
    const body = await req.json();

    let category = body.category;
    if (!category && body.listingId) {
      const listing = await Listing.findById(body.listingId).select("category");
      category = listing?.category;
    }
    if (!LISTING_CATEGORIES.includes(category)) {
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }

    const sex = ["male", "female"].includes(String(body.sex).toLowerCase())
      ? String(body.sex).toLowerCase()
      : undefined;
    // Unselected optional <select>s submit "" (not absent), and Mongoose's
    // enum validator rejects "" just like any other value that isn't one of
    // the allowed strings -- an empty string is a value, not a missing one.
    // Normalize every optional enum field the same way before create().
    const orUndefined = (value) => (value === "" ? undefined : value);

    const userRequest = await UserRequest.create({
      userId: session.user.id, // server-derived, never trusted from body
      fullname: body.fullname,
      email: body.email,
      phonenumber: body.phonenumber,
      preferredContactMethod: orUndefined(body.preferredContactMethod),
      preferredContactTime: orUndefined(body.preferredContactTime),
      sex,
      category,
      type: body.type,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      furnishing: orUndefined(body.furnishing),
      parkingRequired: typeof body.parkingRequired === "boolean" ? body.parkingRequired : undefined,
      amenities: body.amenities,
      householdSize: body.householdSize,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      priceFrequency: orUndefined(body.priceFrequency),
      moveInTimeframe: orUndefined(body.moveInTimeframe),
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      numberOfGuests: body.numberOfGuests,
      leaseDurationPreference: orUndefined(body.leaseDurationPreference),
      occupancyStatus: orUndefined(body.occupancyStatus),
      managementServiceType: orUndefined(body.managementServiceType),
      landSize: body.landSize,
      titleDocumentType: orUndefined(body.titleDocumentType),
      landPurpose: orUndefined(body.landPurpose),
      presentlocation: body.presentlocation,
      preferredLocations: body.preferredLocations,
      request: body.request,
      listingId: body.listingId || undefined,
    });

    return NextResponse.json(userRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
