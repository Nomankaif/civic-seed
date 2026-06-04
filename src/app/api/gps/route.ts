import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import LocationCheckin from "@/models/LocationCheckin";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/mongodb";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const checkins = await LocationCheckin.find({})
      .sort({ timestamp: -1 })
      .populate("projectId")
      .populate("contractorUserId");

    return NextResponse.json({ success: true, checkins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session || session.role !== "CONTRACTOR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const body = await req.json();
    const { projectId, milestoneId, latitude, longitude, accuracy } = body;

    if (!projectId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, message: "Project ID and coordinates are required" }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

    // Create Check-in record
    const checkin = await LocationCheckin.create({
      projectId: project._id,
      milestoneId: milestoneId ? milestoneId : undefined,
      contractorUserId: dbUser._id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: accuracy ? Number(accuracy) : undefined,
      timestamp: new Date(),
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)], // [longitude, latitude]
      },
    });

    // Notify Client
    await Notification.create({
      recipientUserId: project.clientUserId,
      title: "Contractor Checked In on Site",
      message: `Contractor checked in at "${project.title}" at coordinates (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}).`,
      type: "GPS",
      relatedProjectId: project._id,
    });

    await logAudit({
      actorUserId: dbUser._id,
      action: "GPS_CHECKIN",
      entityType: "LocationCheckin",
      entityId: checkin._id,
      metadata: { projectId: project._id, coords: [latitude, longitude], accuracy },
    });

    return NextResponse.json({ success: true, checkin });
  } catch (error: any) {
    console.error("GPS Check-in error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
