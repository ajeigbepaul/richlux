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
    await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query = {};
    if (status && USER_REQUEST_STATUSES.includes(status)) query.status = status;
    if (category && LISTING_CATEGORIES.includes(category)) query.category = category;

    const items = await UserRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "username email image");

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
// Two lanes hit this same endpoint: the full marketplace form (app/request)
// sends the new field names directly; the older listing-specific quick
// inquiry (app/modal/request/page.js) was deliberately left unchanged and
// still sends its original simple fields (bed/budget/intendinglocation, no
// category -- the linked listing already implies one). Normalize/fall back
// so neither the requester's typed data nor the request itself gets silently
// dropped or rejected.
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

    const bedrooms =
      body.bedrooms ??
      (body.bed ? parseInt(body.bed, 10) || undefined : undefined);
    const budgetMax =
      body.budgetMax ?? (body.budget ? Number(body.budget) : undefined);
    const preferredLocations =
      body.preferredLocations ??
      (body.intendinglocation ? [body.intendinglocation] : undefined);
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
      bedrooms,
      bathrooms: body.bathrooms,
      furnishing: orUndefined(body.furnishing),
      parkingSpaces: body.parkingSpaces,
      amenities: body.amenities,
      householdSize: body.householdSize,
      budgetMin: body.budgetMin,
      budgetMax,
      priceFrequency: orUndefined(body.priceFrequency),
      moveInTimeframe: orUndefined(body.moveInTimeframe),
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      numberOfGuests: body.numberOfGuests,
      leaseDurationPreference: body.leaseDurationPreference,
      presentlocation: body.presentlocation,
      preferredLocations,
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
