import UserRequest from "@/model/UserRequest";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// GET ALL REQUEST. Leads are internal business data -- manager/superadmin only.
export const GET = async () => {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const usersrequest = await UserRequest.find();
    return NextResponse.json(usersrequest);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
};

export async function POST(req) {
  try {
    const {
      fullname,
      email,
      phonenumber,
      request,
      presentlocation,
      intendinglocation,
      sex,
      type,
      bed,
      budget,
      listingId,
    } = await req.json();
    await connectToDB();
    await UserRequest.create({
      fullname,
      email,
      phonenumber,
      request,
      presentlocation,
      intendinglocation,
      sex,
      type,
      bed,
      budget,
      listingId: listingId || undefined,
    });
    return NextResponse.json({ message: "Request Created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}


