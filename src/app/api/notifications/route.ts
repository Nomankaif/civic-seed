import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const notifications = await Notification.find({ recipientUserId: dbUser._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Mark notifications as read
export async function PUT() {
  try {
    await connectToDatabase();
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await Notification.updateMany(
      { recipientUserId: dbUser._id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error: any) {
    console.error("Notifications PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
