import { User } from "@/model/User";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// The session/JWT never carries agentApplication (utils/authOptions.js only
// copies id/role onto the token) -- the /become-agent page calls this to read
// its own fresh status straight from Mongo instead.
export async function GET() {
  try {
    const session = await requireRole([]);
    await connectToDB();
    const user = await User.findById(session.user.id).select("role agentApplication");
    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ role: user.role, agentApplication: user.agentApplication });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

// Lets an already-registered plain "user" apply to become an agent without
// re-entering credentials (the /api/register lane covers brand-new signups).
// Still only ever records an application -- role promotion stays a
// superadmin-only action via PATCH /api/users/[id].
export async function POST(req) {
  try {
    const session = await requireRole([]);
    await connectToDB();

    if (session.user.role !== "user") {
      return NextResponse.json(
        { message: "Only a regular user account can apply to become an agent" },
        { status: 400 }
      );
    }

    const existing = await User.findById(session.user.id).select("agentApplication");
    if (existing?.agentApplication?.status === "pending") {
      return NextResponse.json(
        { message: "You already have an application under review" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        phone: body.phone,
        agentApplication: {
          status: "pending",
          message: body.message,
          appliedAt: new Date(),
        },
      },
      { new: true }
    ).select("role agentApplication");

    return NextResponse.json({ role: user.role, agentApplication: user.agentApplication });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
