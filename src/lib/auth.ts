import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "@/models/User";
import { connectToDatabase } from "./mongodb";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const JWT_SECRET = process.env.CLERK_SECRET_KEY || "civicbuild_connect_jwt_secret_fallback";

// Detect if Clerk keys are configured
export function isClerkEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
}

export interface AuthSession {
  userId: string; // The clerkUserId (either Clerk's user_xxx or our mock_xxx)
  email: string;
  fullName: string;
  role: "CLIENT" | "CONTRACTOR" | "ADMIN";
}

// Get raw session details from either Clerk or Mock cookies
export async function getAuthSession(): Promise<AuthSession | null> {
  await connectToDatabase();

  if (isClerkEnabled()) {
    try {
      // Dynamic import to prevent crash when Clerk isn't set up
      const { auth, currentUser } = await import("@clerk/nextjs/server");
      const authObj = await auth();
      if (!authObj || !authObj.userId) {
        return await getMockSession();
      }

      // Fetch user from DB
      const user = await User.findOne({ clerkUserId: authObj.userId });
      if (user) {
        return {
          userId: user.clerkUserId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        };
      }

      // If user exists in Clerk but not in DB yet (during onboarding)
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
        // Determine role from metadata or default to CLIENT
        const role = (clerkUser.publicMetadata?.role as any) || "CLIENT";
        return {
          userId: clerkUser.id,
          email,
          fullName: fullName || "New User",
          role,
        };
      }
    } catch (e) {
      console.warn("Clerk authentication failed or keys are invalid, trying mock fallback...", e);
    }
  }

  return await getMockSession();
}

async function getMockSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cb_session")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}

// Get the MongoDB User document of the current authenticated user
export async function getCurrentUser() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  return await User.findOne({ clerkUserId: session.userId });
}

// Set a mock session cookie
export async function setMockSession(user: { clerkUserId: string; email: string; fullName: string; role: string }) {
  const token = jwt.sign(
    {
      userId: user.clerkUserId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("cb_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Clear the session cookie
export async function clearMockSession() {
  const cookieStore = await cookies();
  cookieStore.delete("cb_session");
  // Also clear standard cookies if any
}
