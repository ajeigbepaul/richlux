import UserRequest from "@/model/UserRequest";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// Leads are internal business data -- same role gate as GET /api/userrequest.
export async function PATCH(req, { params }) {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (body.status && ["open", "contacted", "closed"].includes(body.status)) {
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
