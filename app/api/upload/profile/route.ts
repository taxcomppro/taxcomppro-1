import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handles profile-specific uploads: avatar, cover, and media gallery photos
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files    = formData.getAll("files") as File[];
  const type     = (formData.get("type") as string) ?? "media"; // "avatar" | "cover" | "media"

  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Max 10 images" }, { status: 400 });

  const folderMap: Record<string, string> = {
    avatar: "taxcompro/avatars",
    cover:  "taxcompro/covers",
    media:  "taxcompro/profile-media",
  };
  const folder = folderMap[type] ?? "taxcompro/profile-media";

  const transformMap: Record<string, object[]> = {
    avatar: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto:good" }],
    cover:  [{ width: 1400, height: 400, crop: "fill", quality: "auto:good" }],
    media:  [{ width: 1200, crop: "limit", quality: "auto:good" }],
  };
  const transformation = transformMap[type] ?? transformMap.media;

  const urls: string[] = [];
  for (const file of files) {
    const buf    = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buf.toString("base64")}`;
    const result  = await cloudinary.uploader.upload(dataUri, { folder, resource_type: "image", transformation });
    urls.push(result.secure_url);
  }

  return NextResponse.json({ urls });
}
