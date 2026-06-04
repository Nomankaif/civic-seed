import React from "react";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { connectToDatabase } from "@/lib/mongodb";
import { User as UserIcon, Building, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientProfilePage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CLIENT") return <p className="p-8 text-sm">Access denied</p>;

  // Find Organization
  const organization = await Organization.findOne({ ownerUserId: dbUser._id });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Profile & Settings</h1>
        <p className="text-slate-500 text-xs">
          Manage your personal metadata and linked organization profile credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: User details */}
        <Card className="border-slate-200 bg-white md:col-span-1">
          <CardHeader className="text-center pb-4">
            <div className="h-16 w-16 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white text-lg font-bold">
              {dbUser.fullName.charAt(0)}
            </div>
            <CardTitle className="text-sm font-bold text-slate-900 mt-3">{dbUser.fullName}</CardTitle>
            <p className="text-[10px] text-slate-400 truncate">{dbUser.email}</p>
            <Badge className="bg-sky-50 text-sky-700 border border-sky-200 mt-2 text-[9px] uppercase font-bold mx-auto">
              {dbUser.role} ACCESS
            </Badge>
          </CardHeader>
          <CardContent className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500 text-center">
            <p>Member since: {new Date(dbUser.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Right Column: Organization Details */}
        <Card className="border-slate-200 bg-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">Organization Information</CardTitle>
            <CardDescription className="text-[10px]">Your linked entity for publishing projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {organization ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Organization Name</span>
                    <span className="font-semibold text-slate-800">{organization.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Organization Type</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {organization.organizationType.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Department / Industry</span>
                    <span className="font-semibold text-slate-800">{organization.departmentOrIndustry || "Public Works"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">Phone Number</span>
                    <span className="font-semibold text-slate-800">{organization.phone || "512-555-0100"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block uppercase text-[8px] font-bold">Operating Address</span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {organization.address?.street ? `${organization.address.street}, ` : ""}
                    {organization.address?.city}, {organization.address?.state} {organization.address?.postalCode || ""}, {organization.address?.country}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No organization profile configured.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
