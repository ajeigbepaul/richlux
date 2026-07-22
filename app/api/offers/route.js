import Offer from "@/model/Offer";
import UserRequest from "@/model/UserRequest";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// Agents/managers submit an offer in response to an open, marketplace-eligible
// request (no listingId -- that lane is a direct inquiry, not open for offers).
export async function POST(req) {
  try {
    const session = await requireRole(["agent", "manager"]);
    await connectToDB();
    const body = await req.json();

    const userRequest = await UserRequest.findById(body.requestId);
    if (!userRequest) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }
    // Agents only ever see/respond to rental requests -- mirrors the same
    // restriction on GET /api/userrequest and /api/userrequest/[id].
    if (session.user.role === "agent" && userRequest.category !== "rental") {
      return NextResponse.json(
        { message: "Agents can only respond to rental requests" },
        { status: 403 }
      );
    }
    if (userRequest.listingId) {
      return NextResponse.json(
        { message: "This is a direct inquiry, not open for offers" },
        { status: 400 }
      );
    }
    if (userRequest.status !== "open") {
      return NextResponse.json(
        { message: "This request is no longer accepting offers" },
        { status: 400 }
      );
    }

    try {
      const offer = await Offer.create({
        request: body.requestId,
        agent: session.user.id, // server-derived, never trusted from body
        listing: body.listingId || undefined,
        title: body.title,
        description: body.description,
        price: body.price,
        priceFrequency: body.priceFrequency,
        location: body.location,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        media: body.media,
      });
      return NextResponse.json(offer, { status: 201 });
    } catch (err) {
      if (err.code === 11000) {
        return NextResponse.json(
          {
            message:
              "You already submitted an offer on this request. Edit your existing offer instead.",
          },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
