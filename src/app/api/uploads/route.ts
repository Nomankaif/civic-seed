import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import DocumentModel from "@/models/Document";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { projectId, milestoneId, fileUrl, originalFileName } = await req.json();

    if (!fileUrl || !originalFileName) {
      return NextResponse.json({ success: false, message: "File URL and original file name are required" }, { status: 400 });
    }

    // Save uploaded file metadata in MongoDB
    // In demo mode, fileUrl is the Base64/DataURL string.
    const document = await DocumentModel.create({
      uploadedByUserId: dbUser._id,
      projectId: projectId ? projectId : undefined,
      milestoneId: milestoneId ? milestoneId : undefined,
      fileUrl,
      cloudinaryPublicId: "mock_cloudinary_" + Math.random().toString(36).substring(2, 9),
      resourceType: "image",
      originalFileName,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error("Uploader API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
