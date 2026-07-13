import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";
import { requireRole, canManageListing } from "@/utils/auth";
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
    for (const field of editable) {
      if (field in body) listing[field] = body[field];
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
