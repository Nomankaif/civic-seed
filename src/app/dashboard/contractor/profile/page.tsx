import React from "react";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import ContractorProfile from "@/models/ContractorProfile";
import { connectToDatabase } from "@/lib/mongodb";
import { User as UserIcon, Award, Briefcase, Star, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ContractorProfilePage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CONTRACTOR") return <p className="p-8 text-sm">Access denied</p>;

  // Find Contractor Profile
  const profile = await ContractorProfile.findOne({ userId: dbUser._id });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Contractor Profile</h1>
        <p className="text-slate-500 text-xs">
          Manage your trade categories, skills, and portfolio highlights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-slate-200 bg-white md:col-span-1">
          <CardHeader className="text-center pb-4">
            <div className="h-16 w-16 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white text-lg font-bold">
              {dbUser.fullName.charAt(0)}
            </div>
            <CardTitle className="text-sm font-bold text-slate-900 mt-3">{dbUser.fullName}</CardTitle>
            <p className="text-[10px] text-slate-400 truncate">{dbUser.email}</p>
            <Badge className="bg-indigo-50 text-indigo-750 border border-indigo-200 mt-2 text-[9px] uppercase font-bold mx-auto">
              CONTRACTOR
            </Badge>
          </CardHeader>
          <CardContent className="border-t border-slate-100 pt-4 text-xs space-y-3 text-slate-500">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Rating Score:</span>
              <span className="text-amber-500">★{profile?.rating.toFixed(1) || "5.0"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Jobs completed:</span>
              <span className="text-slate-800">{profile?.completedProjectsCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span>Verification:</span>
              <span className="text-indigo-600 uppercase text-[9px]">{profile?.verificationStatus.replace(/_/g, " ") || "UNVERIFIED"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border-slate-200 bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">Service Portfolio Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-xs text-slate-600">
            {profile ? (
              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 block uppercase text-[8px] font-bold">Business / Company Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-1 block">{profile.businessName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[8px] font-bold">Business Overview & Bio</span>
                  <p className="mt-1 leading-relaxed">{profile.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Trade Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.tradeCategories.map((t: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50 border-slate-200">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Skills Checklist</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.skills.map((s: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50 border-slate-200">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Operating Locations</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.serviceLocations.map((l: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50 border-slate-200">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Experience / Status</span>
                    <span className="font-semibold text-slate-800 mt-1.5 block">
                      {profile.yearsOfExperience} Years Exp | {profile.available ? "Accepting Jobs" : "Busy"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No contractor profile configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
