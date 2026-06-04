import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import ContractorProfile from "@/models/ContractorProfile";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  MapPin,
  ClipboardList,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ContractorDashboardPage() {
  await connectToDatabase();
  const session = await getAuthSession();

  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser) return <p className="text-sm">User not found</p>;

  // Find Contractor Profile
  const profile = await ContractorProfile.findOne({ userId: dbUser._id });
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Contractor profile not found.</p>
        <Link href="/onboarding" className="text-sky-600 font-bold underline mt-2 inline-block">
          Complete Onboarding
        </Link>
      </div>
    );
  }

  // 1. Fetch Assigned Projects (Matching contractor profile ID)
  const projects = await Project.find({ assignedContractorId: profile._id }).sort({ updatedAt: -1 });
  const projectIds = projects.map((p) => p._id);

  // 2. Fetch Milestones
  const milestones = await Milestone.find({ projectId: { $in: projectIds } });

  // Calculate Stats
  const activeProjectsCount = projects.filter((p) =>
    ["CONTRACTOR_ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW"].includes(p.status)
  ).length;

  const upcomingMilestones = milestones
    .filter((m) => ["NOT_STARTED", "IN_PROGRESS"].includes(m.status))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const pendingApprovalsCount = milestones.filter((m) => m.status === "SUBMITTED").length;
  const revisionRequestedCount = milestones.filter((m) => m.status === "REVISION_REQUESTED").length;

  // Payments
  const payments = await Payment.find({ contractorUserId: dbUser._id });
  const releasedPaymentsSum = payments
    .filter((p) => p.status === "RELEASED_TEST_MODE")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPaymentsSum = payments
    .filter((p) => p.status === "FUNDED_TEST_MODE")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contractor Console</h1>
          <p className="text-slate-500 text-xs">
            Review your assignments, check in at job sites, submit milestone deliverables, and inspect payouts.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
          <CheckCircle className="h-5 w-5 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-indigo-900 block leading-tight">Verification Status</span>
            <span className="text-[10px] text-indigo-700 capitalize font-bold leading-none">
              {profile.verificationStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{activeProjectsCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Contracts signed & active</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{pendingApprovalsCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">
              Awaiting client approval {revisionRequestedCount > 0 && `(${revisionRequestedCount} revision needed)`}
            </p>
          </CardContent>
        </Card>

        {/* Pending Payment */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Funded Escrow</CardTitle>
            <DollarSign className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">${pendingPaymentsSum.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 mt-1">Escrowed test-mode funds</p>
          </CardContent>
        </Card>

        {/* Released Payouts */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Released Sum</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">${releasedPaymentsSum.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 mt-1">Stripe test-mode settled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Assigned projects list */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Your Assigned Projects</CardTitle>
                <CardDescription className="text-[10px]">Projects assigned to you by organizations.</CardDescription>
              </div>
              <Link href="/dashboard/contractor/projects">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-500">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-500">No projects assigned</p>
                  <p className="text-[10px] text-slate-400 mt-1">When clients assign you to projects, they will show up here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => {
                    const projectMilestones = milestones.filter((m) => m.projectId.toString() === p._id.toString());
                    const completed = projectMilestones.filter((m) => m.status === "PAYMENT_RELEASED" || m.status === "APPROVED").length;
                    const progressPercent = projectMilestones.length > 0 ? Math.round((completed / projectMilestones.length) * 100) : 0;
                    
                    return (
                      <div key={p._id} className="border border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{p.address.city}, {p.address.state}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-[9px] text-slate-400">Milestones:</span>
                            <span className="text-[9px] font-bold text-slate-600">{completed} / {projectMilestones.length}</span>
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 shrink-0">
                              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">${p.estimatedBudget.toLocaleString()}</p>
                            <Badge className={`text-[9px] font-bold uppercase ${
                              p.status === "CONTRACTOR_ASSIGNED"
                                ? "bg-indigo-100 text-indigo-800"
                                : p.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : p.status === "AWAITING_REVIEW"
                                ? "bg-amber-100 text-amber-800"
                                : p.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {p.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <Link href={`/dashboard/contractor/projects/${p._id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <ChevronRight className="h-4 w-4" />
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

        {/* Right 1 Col: Upcoming Milestones & site list */}
        <div className="space-y-8">
          
          {/* Upcoming milestones */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Upcoming Milestones</CardTitle>
              <CardDescription className="text-[10px]">Pending deliverables sorted by due date.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMilestones.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No upcoming milestones</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMilestones.slice(0, 4).map((m: any) => (
                    <div key={m._id} className="border-l-2 border-indigo-500 pl-3">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{m.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Budget: ${m.amount.toLocaleString()}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"}</span>
                        </span>
                        <Badge variant="outline" className="text-[8px] bg-slate-50 border-slate-200">
                          {m.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick GPS Notice */}
          <Card className="border-slate-200 bg-slate-950 text-white">
            <CardContent className="pt-6 space-y-3">
              <MapPin className="h-8 w-8 text-sky-400" />
              <h4 className="text-xs font-bold">GPS Site Check-In</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Before uploading proof, ensure you submit an intentional GPS check-in on the active project detail page. Background continuous tracking is disabled to protect your privacy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
