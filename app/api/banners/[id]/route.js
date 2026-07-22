import Banner from "@/model/Banner";
import { connectToDB } from "@/utils/database";
import { requireRole } from "@/utils/auth";
import cloudinary from "@/utils/cloudinary";
import { NextResponse } from "next/server";

// order/isActive/title only -- media itself is immutable once uploaded,
// replace the banner (delete + re-add) instead of patching the asset.
export async function PATCH(req, { params }) {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (typeof body.order === "number") update.order = body.order;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if (typeof body.title === "string") update.title = body.title;

    const banner = await Banner.findByIdAndUpdate(id, update, { new: true });
    if (!banner) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const { id } = await params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await cloudinary.uploader
      .destroy(banner.publicId, { resource_type: banner.type === "video" ? "video" : "image" })
      .catch((error) =>
        console.error(`Failed to delete Cloudinary asset ${banner.publicId}`, error)
      );

    await banner.deleteOne();

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
