import UserRequest from "@/model/UserRequest";
import { connectToDB } from "@/utils/database";
import { NextResponse } from "next/server";

// GET ALL REQUEST.
export const GET = async () => {
    await connectToDB()
    const usersrequest = await UserRequest.find()
    return NextResponse.json(usersrequest)
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
    });
    return NextResponse.json({ message: "Request Created" }, { status: 201 });
  } catch (error) {
    console.log("Something went wrong", error);
  }
}


