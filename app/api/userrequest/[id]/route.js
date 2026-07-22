import UserRequest from "@/model/UserRequest";
import Offer from "@/model/Offer";
import { connectToDB } from "@/utils/database";
import { requireRole, canManageRequest, offerVisibilityFilter } from "@/utils/auth";
import { USER_REQUEST_STATUSES } from "@/constants/request";
import { NextResponse } from "next/server";

const STAFF_ROLES = ["superadmin", "manager", "agent"];

// The one detail endpoint -- serves both the admin/staff view and the
// requester's own view. Offers are embedded and scoped through
// offerVisibilityFilter (sealed-bid for agents; everything for the
// requester/manager/superadmin), plus a sealedOffersCount so the UI can show
// "N other offers are sealed" without seeing their content.
export async function GET(req, { params }) {
  try {
    const session = await requireRole([]); // any authenticated user; ownership/staff checked below
    await connectToDB();
    const { id } = await params;

    const userRequest = await UserRequest.findById(id).populate(
      "userId",
      "username email image"
    );
    if (!userRequest) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Agents only count as "staff" here for rental requests -- every other
    // category is oversight-only (manager/superadmin); an agent falls back
    // to the same ownership check a plain requester would (they can still
    // see a non-rental request that happens to be their own).
    const isAgentRestricted =
      session.user.role === "agent" && userRequest.category !== "rental";
    const isStaff = STAFF_ROLES.includes(session.user.role) && !isAgentRestricted;
    if (!isStaff && !canManageRequest(session, userRequest)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const visibilityFilter = offerVisibilityFilter(session, userRequest);
    const [visibleOffers, totalOffers] = await Promise.all([
      Offer.find({ request: id, ...visibilityFilter })
        .sort({ createdAt: -1 })
        .populate("agent", "username email image phone"),
      Offer.countDocuments({ request: id }),
    ]);

    return NextResponse.json({
      ...userRequest.toObject(),
      offers: visibleOffers,
      sealedOffersCount: totalOffers - visibleOffers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

// Status lifecycle only -- manager/superadmin.
export async function PATCH(req, { params }) {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (body.status && USER_REQUEST_STATUSES.includes(body.status)) {
      update.status = body.status;
    }

    const lead = await UserRequest.findByIdAndUpdate(id, update, { new: true });
    if (!lead) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
