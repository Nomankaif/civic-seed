import { NextResponse } from "next/server";
import { getAuthSession, setMockSession, clearMockSession } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getAuthSession();
    return NextResponse.json({ authenticated: !!session, session });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

// Handler for mock login
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, userId } = body;

    if (action === "signout") {
      await clearMockSession();
      return NextResponse.json({ success: true });
    }

    if (action === "login") {
      // Find the user
      const user = await User.findOne({ clerkUserId: userId });
      if (!user) {
        return NextResponse.json({ success: false, message: "Seeded user not found. Did you run the seed script?" }, { status: 404 });
      }

      await setMockSession({
        clerkUserId: user.clerkUserId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });

      return NextResponse.json({ success: true, user });
    }

    // Direct mock signup
    if (action === "signup") {
      const { email, fullName, role } = body;
      if (!email || !fullName || !role) {
        return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
      }

      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 400 });
      }

      const randomId = "mock_" + Math.random().toString(36).substring(2, 9);
      const newUser = await User.create({
        clerkUserId: randomId,
        email,
        fullName,
        role,
        onboardingCompleted: false, // will require onboarding
      });

      await setMockSession({
        clerkUserId: newUser.clerkUserId,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      });

      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth session handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
