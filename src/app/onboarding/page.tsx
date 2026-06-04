import React from "react";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import OnboardingForm from "@/components/auth/OnboardingForm";

export default async function OnboardingPage() {
  await connectToDatabase();
  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Double check if onboarding is already completed in MongoDB
  const user = await User.findOne({ clerkUserId: session.userId });
  if (user && user.onboardingCompleted) {
    if (user.role === "CLIENT") {
      redirect("/dashboard/client");
    } else if (user.role === "CONTRACTOR") {
      redirect("/dashboard/contractor");
    } else if (user.role === "ADMIN") {
      redirect("/dashboard/admin");
    } else {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CivicBuild Connect</h1>
          <p className="text-sm text-slate-500 mt-2">Just a few more details to set up your profile.</p>
        </div>
        <OnboardingForm session={session} />
      </div>
    </div>
  );
}
