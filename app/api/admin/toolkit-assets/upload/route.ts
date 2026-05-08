import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData  = await req.formData();
  const file      = formData.get("file") as File | null;
  const toolkitId = formData.get("toolkitId") as string | null;
  if (!file || !toolkitId)
    return NextResponse.json({ error: "Missing file or toolkitId" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");

  const result = await new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: isImage ? "image" : "raw",
        folder:        "toolkit-downloads",
        use_filename:  true,
        unique_filename: true,
        // No flags — ensures file is publicly accessible
      },
      (err, res) => err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)
    ).end(buffer);
  });

  return NextResponse.json({ fileUrl: result.secure_url, fileName: file.name, fileSize: result.bytes });
}
