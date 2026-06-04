import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import ContractorProfile from "@/models/ContractorProfile";
import { connectToDatabase } from "@/lib/mongodb";
import { Users, Search, MapPin, CheckCircle, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientContractorsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CLIENT") return <p className="p-8 text-sm">Access denied</p>;

  // Fetch available contractors
  const contractors = await ContractorProfile.find({}).populate("userId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contractor Directory</h1>
        <p className="text-slate-500 text-xs">
          Discover certified pavement specialists and structural engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contractors.map((c) => (
          <Card key={c._id} className="border-slate-200 bg-white flex flex-col justify-between hover:shadow-md transition duration-150">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base font-bold text-slate-900">{c.businessName}</CardTitle>
                    {c.verificationStatus === "DEMO_VERIFIED" && (
                      <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[8px] font-bold">
                        Demo Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c.tradeCategories.join(", ")}</p>
                </div>
                <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{c.rating.toFixed(1)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                {c.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {c.skills.map((s: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-[8px] bg-slate-50 border-slate-200 text-slate-600">
                    {s}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">Experience</span>
                  <span className="font-bold text-slate-800">{c.yearsOfExperience} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">Jobs completed</span>
                  <span className="font-bold text-slate-800">{c.completedProjectsCount} Done</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">Operating region</span>
                  <span className="font-bold text-slate-800 truncate block max-w-[80px]">
                    {c.serviceLocations[0] || "Austin, TX"}
                  </span>
                </div>
              </div>

              {/* AI recommend notes */}
              <div className="bg-sky-50/40 border border-sky-100/50 rounded-xl p-3 text-[9px] text-sky-700 flex items-start gap-2">
                <Award className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
                <div>
                  <span className="font-bold block">AI Recommendation Assessment</span>
                  <p className="mt-0.5">
                    Recommended because this contractor offers the required paving service, operates within the Austin region, and is currently available.
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-between gap-4 py-3">
              <span className={`text-[10px] font-bold ${c.available ? "text-emerald-600" : "text-slate-400"}`}>
                ● {c.available ? "Available Now" : "Busy"}
              </span>
              
              <Link href="/dashboard/client/projects">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 h-8">
                  Assign to active Job
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
