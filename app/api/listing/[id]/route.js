import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";
import { getCurrentSession, requireRole, canManageListing, toIdString } from "@/utils/auth";
import cloudinary from "@/utils/cloudinary";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { id } = await params;
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("agent", "username email image");
    if (!listing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Unapproved listings are only visible to manager/superadmin oversight or
    // the agent who owns them -- everyone else gets the same "Not found" a
    // deleted listing would return, never a 403 that reveals it exists.
    const session = await getCurrentSession();
    const role = session?.user?.role;
    const isOversight = role === "superadmin" || role === "manager";
    const isOwner = role === "agent" && toIdString(listing.agent) === toIdString(session?.user?.id);
    if (listing.approvalStatus !== "approved" && !isOversight && !isOwner) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const { id } = await params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (!canManageListing(session, listing)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const isOversight = session.user.role === "superadmin" || session.user.role === "manager";

    if ("approvalStatus" in body) {
      if (!isOversight) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      listing.approvalStatus = body.approvalStatus;
    }

    const editable = [
      "title",
      "description",
      "category",
      "price",
      "priceFrequency",
      "location",
      "bedrooms",
      "bathrooms",
      "landSize",
      "amenities",
      "media",
      "status",
      "isFeatured",
    ];
    let ownerEditedContent = false;
    for (const field of editable) {
      if (field in body) {
        listing[field] = body[field];
        ownerEditedContent = true;
      }
    }
    // An agent editing their own already-approved listing sends it back for
    // re-review -- guarantees a manager/superadmin always sees the final
    // content before it's public again. Staff edits never trigger this.
    if (!isOversight && ownerEditedContent && listing.approvalStatus === "approved") {
      listing.approvalStatus = "pending";
    }
    // agent ownership is never client-editable, even by whoever owns the listing
    await listing.save();

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const { id } = await params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (!canManageListing(session, listing)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Promise.all(
      (listing.media || []).map((item) =>
        cloudinary.uploader
          .destroy(item.publicId, {
            resource_type: item.type === "video" ? "video" : "image",
          })
          .catch((error) =>
            console.error(`Failed to delete Cloudinary asset ${item.publicId}`, error)
          )
      )
    );

    await listing.deleteOne();

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
