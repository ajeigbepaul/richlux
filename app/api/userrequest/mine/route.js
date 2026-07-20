import UserRequest from "@/model/UserRequest";
import Offer from "@/model/Offer";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// Powers the "My Requests" list page -- any authenticated role, scoped
// server-side to the caller's own requests.
export async function GET() {
  try {
    const session = await requireRole([]);
    await connectToDB();
    const items = await UserRequest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate("acceptedOffer");

    // One aggregate for offer counts across every request on this page,
    // rather than a query per card -- the requester always sees every offer
    // (no sealed-bid restriction, see offerVisibilityFilter), so a plain
    // count is accurate for this list view.
    const counts = await Offer.aggregate([
      { $match: { request: { $in: items.map((item) => item._id) } } },
      { $group: { _id: "$request", count: { $sum: 1 } } },
    ]);
    const countByRequest = new Map(counts.map(({ _id, count }) => [String(_id), count]));

    const withOfferCounts = items.map((item) => ({
      ...item.toObject(),
      offersCount: countByRequest.get(String(item._id)) || 0,
    }));

    return NextResponse.json(withOfferCounts);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
