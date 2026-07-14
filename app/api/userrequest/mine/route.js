import UserRequest from "@/model/UserRequest";
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
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
