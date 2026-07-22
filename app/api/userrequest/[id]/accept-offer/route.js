import mongoose from "mongoose";
import UserRequest from "@/model/UserRequest";
import Offer from "@/model/Offer";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// Requester-only action -- deliberately NOT using canManageRequest's staff
// oversight bypass, since accepting an offer is the requester's decision
// alone in this version (staff never accept on a requester's behalf).
export async function POST(req, { params }) {
  try {
    const session = await requireRole([]);
    await connectToDB();
    const { id } = await params;
    const { offerId } = await req.json();

    const userRequest = await UserRequest.findById(id);
    if (!userRequest) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    if (String(userRequest.userId) !== String(session.user.id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (userRequest.status !== "open") {
      return NextResponse.json(
        { message: "This request is already closed" },
        { status: 400 }
      );
    }

    const chosenOffer = await Offer.findOne({ _id: offerId, request: id });
    if (!chosenOffer || chosenOffer.status !== "pending") {
      return NextResponse.json({ message: "Offer not available" }, { status: 400 });
    }

    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        chosenOffer.status = "accepted";
        await chosenOffer.save({ session: dbSession });

        await Offer.updateMany(
          { request: id, _id: { $ne: offerId }, status: "pending" },
          { $set: { status: "declined" } },
          { session: dbSession }
        );

        userRequest.status = "closed";
        userRequest.acceptedOffer = offerId;
        await userRequest.save({ session: dbSession });
      });
    } finally {
      await dbSession.endSession();
    }

    return NextResponse.json({
      message: "Offer accepted",
      requestId: id,
      acceptedOffer: offerId,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
