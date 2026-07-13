import Listing from "@/model/Listing";
import { connectToDB } from "@/utils/database";
import { getCurrentSession, requireRole } from "@/utils/auth";
import { LISTING_CATEGORIES, LISTING_STATUSES } from "@/constants/listing";
import { NextResponse } from "next/server";

// Public listing index -- unauthenticated requests only ever see "available"
// listings. Managers/superadmins can pass any status; agents are scoped to
// their own listings regardless of status.
export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bed = searchParams.get("bed");
    const location = searchParams.get("location");
    const agentId = searchParams.get("agentId");
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(Number(searchParams.get("pageSize")) || 12, 50);

    const session = await getCurrentSession();
    const role = session?.user?.role;
    const isStaff = ["superadmin", "manager", "agent"].includes(role);

    const query = {};
    if (category && LISTING_CATEGORIES.includes(category)) {
      query.category = category;
    }
    if (status && LISTING_STATUSES.includes(status) && isStaff) {
      query.status = status;
    } else if (!isStaff) {
      query.status = "available";
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bed) query.bedrooms = Number(bed);
    if (location) query["location.city"] = new RegExp(location, "i");

    // Agents only ever see their own listings in the admin views; never trust
    // a client-supplied agentId for anyone else.
    if (role === "agent") {
      query.agent = session.user.id;
    } else if (agentId && isStaff) {
      query.agent = agentId;
    }

    const total = await Listing.countDocuments(query);
    const items = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("agent", "username email image");

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireRole(["superadmin", "manager", "agent"]);
    await connectToDB();
    const body = await req.json();

    const listing = await Listing.create({
      title: body.title,
      description: body.description,
      category: body.category,
      price: body.price,
      priceFrequency: body.priceFrequency,
      location: body.location,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      landSize: body.landSize,
      amenities: body.amenities,
      media: body.media,
      status: body.status,
      isFeatured: body.isFeatured,
      agent: session.user.id, // always server-derived, never trusted from body
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
