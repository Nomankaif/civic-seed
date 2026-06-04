import React from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import DashboardSidebarClient from "@/components/layout/DashboardSidebarClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase();
  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Verify onboarding status
  const user = await User.findOne({ clerkUserId: session.userId });
  if (user && !user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* 
        Pass user and session info to a client component sidebar 
        that handles mobile state, clicks, active tabs, and logout.
      */}
      <DashboardSidebarClient session={session}>
        {children}
      </DashboardSidebarClient>
    </div>
  );
}
