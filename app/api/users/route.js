import { User } from "@/model/User";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireRole(["superadmin"]);
    await connectToDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
