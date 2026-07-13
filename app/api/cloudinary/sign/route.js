import cloudinary from "@/utils/cloudinary";
import { requireRole } from "@/utils/auth";
import { NextResponse } from "next/server";

// Signs upload params so the browser can upload directly to Cloudinary
// (bypassing our own server for large image/video files, avoiding request
// body-size and function-timeout limits). Role-gated because a signed upload
// is how we enforce "only staff can upload", unlike an unsigned preset.
export async function POST(req) {
  try {
    await requireRole(["superadmin", "manager", "agent"]);
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "richlux/listings";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
