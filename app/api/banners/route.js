import Banner from "@/model/Banner";
import { connectToDB } from "@/utils/database";
import { getCurrentSession, requireRole } from "@/utils/auth";
import cloudinary from "@/utils/cloudinary";
import { NextResponse } from "next/server";

// Public by default (the homepage Hero carousel needs these with no
// session) -- ?all=true additionally requires manager/superadmin and returns
// inactive banners too, for the admin management list.
export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const wantsAll = searchParams.get("all") === "true";

    let query = { isActive: true };
    if (wantsAll) {
      const session = await getCurrentSession();
      const role = session?.user?.role;
      if (role !== "superadmin" && role !== "manager") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      query = {};
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}

// Site-wide homepage content, not agent-specific -- oversight-only, same
// gating as Users/Agent Applications.
export async function POST(req) {
  try {
    await requireRole(["superadmin", "manager"]);
    await connectToDB();
    const body = await req.json();

    if (!["image", "video"].includes(body.type) || !body.publicId || !body.secureUrl) {
      return NextResponse.json({ message: "Invalid banner media" }, { status: 400 });
    }

    // The homepage plays exactly one video (a plain player below the image
    // carousel, not another slide in it) -- uploading a new one replaces
    // whatever's there instead of adding to a list, so there's never more
    // than one to pick from.
    if (body.type === "video") {
      const existingVideos = await Banner.find({ type: "video" });
      await Promise.all(
        existingVideos.map((existing) =>
          cloudinary.uploader
            .destroy(existing.publicId, { resource_type: "video" })
            .catch((error) =>
              console.error(`Failed to delete Cloudinary asset ${existing.publicId}`, error)
            )
        )
      );
      await Banner.deleteMany({ type: "video" });

      const banner = await Banner.create({
        type: "video",
        publicId: body.publicId,
        secureUrl: body.secureUrl,
        width: body.width,
        height: body.height,
        duration: body.duration,
        title: body.title,
        order: 0,
      });
      return NextResponse.json(banner, { status: 201 });
    }

    // Images: unbounded (at least 10 should be comfortable), appended to the
    // end of the image display order -- scoped to type: "image" so the
    // now-irrelevant video order never factors in.
    const last = await Banner.findOne({ type: "image" }).sort({ order: -1 }).select("order");
    const order = typeof last?.order === "number" ? last.order + 1 : 0;

    const banner = await Banner.create({
      type: "image",
      publicId: body.publicId,
      secureUrl: body.secureUrl,
      width: body.width,
      height: body.height,
      title: body.title,
      order,
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status || 500 }
    );
  }
}
