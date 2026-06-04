import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import ContractorProfile from "@/models/ContractorProfile";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import { connectToDatabase } from "@/lib/mongodb";
import { Briefcase, ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ContractorProjectsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CONTRACTOR") return <p className="p-8 text-sm">Contractor session invalid</p>;

  const profile = await ContractorProfile.findOne({ userId: dbUser._id });
  if (!profile) return <p className="p-8 text-sm">Contractor profile not found.</p>;

  // Fetch Assigned Projects (Matching contractor profile ID)
  const projects = await Project.find({ assignedContractorId: profile._id }).sort({ updatedAt: -1 });
  const projectIds = projects.map((p) => p._id);

  // Fetch Milestones
  const milestones = await Milestone.find({ projectId: { $in: projectIds } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Assigned Projects</h1>
        <p className="text-slate-500 text-xs">
          Manage milestones, check in on-site, and upload evidence logs for your assigned contracts.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No projects assigned</p>
              <p className="text-xs text-slate-400 mt-1">When organization clients assign you to projects, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => {
                const projectMilestones = milestones.filter((m) => m.projectId.toString() === p._id.toString());
                const completed = projectMilestones.filter((m) => m.status === "PAYMENT_RELEASED" || m.status === "APPROVED").length;
                const progressPercent = projectMilestones.length > 0 ? Math.round((completed / projectMilestones.length) * 100) : 0;
                
                return (
                  <div key={p._id} className="border border-slate-150 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{p.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{p.address.street ? `${p.address.street}, ` : ""}{p.address.city}, {p.address.state}</p>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="text-xs text-slate-400">Milestones progress:</span>
                        <span className="text-xs font-bold text-slate-600">{completed} / {projectMilestones.length}</span>
                        <div className="w-24 bg-slate-100 rounded-full h-2 shrink-0">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-800">${p.estimatedBudget.toLocaleString()}</p>
                        <Badge className={`text-[10px] font-bold uppercase mt-1 ${
                          p.status === "CONTRACTOR_ASSIGNED"
                            ? "bg-indigo-150 text-indigo-800"
                            : p.status === "IN_PROGRESS"
                            ? "bg-blue-150 text-blue-800"
                            : p.status === "AWAITING_REVIEW"
                            ? "bg-amber-150 text-amber-800"
                            : p.status === "COMPLETED"
                            ? "bg-emerald-150 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {p.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <Link href={`/dashboard/contractor/projects/${p._id}`}>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-slate-900 border border-slate-200">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
