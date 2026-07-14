import Offer from "@/model/Offer";
import { connectToDB } from "@/utils/database";
import { requireRole, canManageOffer } from "@/utils/auth";
import { NextResponse } from "next/server";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "priceFrequency",
  "location",
  "bedrooms",
  "bathrooms",
  "media",
  "listing",
];

// Owner (agent/manager who created it) edits any field or withdraws while
// still pending. Staff acting on someone else's offer may only force-decline
// a pending offer (moderation lane) -- request/agent are never client-editable.
export async function PATCH(req, { params }) {
  try {
    const session = await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const { id } = await params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (!canManageOffer(session, offer)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const role = session.user.role;
    const isOwner = String(offer.agent) === String(session.user.id);
    const isOversight = (role === "superadmin" || role === "manager") && !isOwner;

    if (isOversight) {
      if (body.status !== "declined" || offer.status !== "pending") {
        return NextResponse.json(
          { message: "Staff may only decline a pending offer" },
          { status: 400 }
        );
      }
      offer.status = "declined";
      await offer.save();
      return NextResponse.json(offer);
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { message: "This offer is no longer editable" },
        { status: 400 }
      );
    }
    for (const field of EDITABLE_FIELDS) {
      if (field in body) offer[field] = body[field];
    }
    if (body.status === "withdrawn") offer.status = "withdrawn";
    await offer.save();
    return NextResponse.json(offer);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
