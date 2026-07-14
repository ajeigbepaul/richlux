import UserRequest from "@/model/UserRequest";
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
export async function POST(req) {
  try {
    const session = await requireRole([]);
    await connectToDB();
    const body = await req.json();

    if (!LISTING_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    }

    const userRequest = await UserRequest.create({
      userId: session.user.id, // server-derived, never trusted from body
      fullname: body.fullname,
      email: body.email,
      phonenumber: body.phonenumber,
      preferredContactMethod: body.preferredContactMethod,
      preferredContactTime: body.preferredContactTime,
      sex: body.sex,
      category: body.category,
      type: body.type,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      furnishing: body.furnishing,
      parkingSpaces: body.parkingSpaces,
      amenities: body.amenities,
      householdSize: body.householdSize,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      priceFrequency: body.priceFrequency,
      moveInTimeframe: body.moveInTimeframe,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      numberOfGuests: body.numberOfGuests,
      leaseDurationPreference: body.leaseDurationPreference,
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
