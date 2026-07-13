import { User, ROLES } from "@/model/User";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const session = await requireRole(["superadmin"]);
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    if (body.role && !ROLES.includes(body.role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Prevent a superadmin from demoting themselves if they're the last one.
    if (body.role && body.role !== "superadmin" && id === session.user.id) {
      const superadminCount = await User.countDocuments({ role: "superadmin" });
      if (superadminCount <= 1) {
        return NextResponse.json(
          { message: "Cannot demote the last remaining superadmin" },
          { status: 400 }
        );
      }
    }

    const update = {};
    if (body.role) update.role = body.role;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password"
    );
    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
