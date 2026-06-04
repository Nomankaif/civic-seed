import { NextResponse } from "next/server";
import { getAuthSession, setMockSession, clearMockSession, hashPassword } from "@/lib/auth";
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
      const { password } = body;
      const searchKey = String(userId).trim();
      
      // Find the user by clerkUserId or email
      const user = await User.findOne({
        $or: [
          { clerkUserId: searchKey },
          { email: searchKey },
          { email: searchKey.toLowerCase() }
        ]
      });
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: "User account not found. If this is a default account, make sure you ran the seed script." 
        }, { status: 404 });
      }

      // Check password if it is a custom login (not a mock button one-click bypass)
      // Buttons bypass if password is not provided and userId starts with "mock_"
      const isMockButtonBypass = !password && searchKey.startsWith("mock_");
      if (!isMockButtonBypass) {
        if (!password) {
          return NextResponse.json({ success: false, message: "Password is required for this account." }, { status: 400 });
        }
        if (!user.password) {
          // Fallback for seeded accounts without stored passwords
          const defaultHash = hashPassword("password123");
          if (hashPassword(password) !== defaultHash) {
            return NextResponse.json({ success: false, message: "Invalid email/ID or password." }, { status: 401 });
          }
        } else if (hashPassword(password) !== user.password) {
          return NextResponse.json({ success: false, message: "Invalid email/ID or password." }, { status: 401 });
        }
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
      const { email, fullName, role, password } = body;
      if (!email || !fullName || !role || !password) {
        return NextResponse.json({ success: false, message: "Missing required fields (including password)" }, { status: 400 });
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
        password: hashPassword(password),
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
