import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import LocationCheckin from "@/models/LocationCheckin";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plus,
  MapPin,
  FileCheck,
  ChevronRight,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser) return <p className="text-sm">User not found</p>;

  // 1. Fetch Client Projects
  const projects = await Project.find({ clientUserId: dbUser._id }).sort({ updatedAt: -1 });

  // 2. Calculate Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) =>
    ["CONTRACTOR_ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW"].includes(p.status)
  ).length;
  const awaitingReviewProjects = projects.filter((p) => p.status === "AWAITING_REVIEW").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED" || p.status === "CLOSED").length;

  // 3. Fetch Awaiting Milestones (Status: SUBMITTED)
  const projectIds = projects.map((p) => p._id);
  const pendingMilestones = await Milestone.find({
    projectId: { $in: projectIds },
    status: "SUBMITTED",
  }).populate("projectId");

  // 4. Calculate Pending Payouts (Milestones where status is approved but not released, or payment is pending)
  const pendingPaymentsAmount = projects.reduce((acc, proj) => {
    // we can sum the milestone amounts funded but not yet released or in process
    return acc;
  }, 0);
  
  const fundedMilestones = await Milestone.find({
    projectId: { $in: projectIds },
    paymentStatus: "FUNDED_TEST_MODE",
  });
  const totalFundedAmount = fundedMilestones.reduce((sum, m) => sum + m.amount, 0);

  // 5. Fetch Recent GPS Check-ins
  const gpsCheckins = await LocationCheckin.find({
    projectId: { $in: projectIds },
  })
    .sort({ timestamp: -1 })
    .limit(4)
    .populate("projectId")
    .populate("contractorUserId");

  // 6. Fetch Activity Timeline (Audit Logs)
  const auditLogs = await AuditLog.find({
    $or: [
      { actorUserId: dbUser._id },
      { entityId: { $in: projectIds } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(6);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Management</h1>
          <p className="text-slate-500 text-xs">
            Manage your city infrastructure assets, verify progress logs, and release demo escrow funds.
          </p>
        </div>
        <Link href="/dashboard/client/projects/create">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2 py-5 shadow-md shadow-slate-900/10">
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{totalProjects}</div>
            <p className="text-[10px] text-slate-400 mt-1">Simulated database entries</p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{activeProjects}</div>
            <p className="text-[10px] text-slate-400 mt-1">In progress & review state</p>
          </CardContent>
        </Card>

        {/* Awaiting Approvals */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestones Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{pendingMilestones.length}</div>
            <p className="text-[10px] text-slate-400 mt-1">Awaiting client authorization</p>
          </CardContent>
        </Card>

        {/* Funded payments */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Funded (Test Mode)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">
              ${totalFundedAmount.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Escrow held on test network</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Projects & Milestones */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Projects Table Card */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Recent Projects</CardTitle>
                <CardDescription className="text-[10px]">Your latest managed projects.</CardDescription>
              </div>
              <Link href="/dashboard/client/projects">
                <Button variant="ghost" size="sm" className="text-xs text-sky-600 hover:text-sky-500">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-500">No projects found</p>
                  <p className="text-[10px] text-slate-400 mt-1">Get started by creating your first infrastructure project request.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                        <th className="py-3">Project Title</th>
                        <th className="py-3">Category</th>
                        <th className="py-3">Priority</th>
                        <th className="py-3">Budget</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.slice(0, 5).map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 font-bold text-slate-800 truncate max-w-[160px]">{p.title}</td>
                          <td className="py-3.5 text-slate-500">{p.category}</td>
                          <td className="py-3.5">
                            <Badge variant="outline" className={`text-[9px] font-semibold ${
                              p.priority === "URGENT"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : p.priority === "HIGH"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : p.priority === "MEDIUM"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}>
                              {p.priority}
                            </Badge>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-800">${p.estimatedBudget.toLocaleString()}</td>
                          <td className="py-3.5">
                            <Badge className={`text-[9px] font-bold ${
                              p.status === "DRAFT"
                                ? "bg-slate-100 text-slate-700"
                                : p.status === "PUBLISHED"
                                ? "bg-sky-100 text-sky-800"
                                : p.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : p.status === "AWAITING_REVIEW"
                                ? "bg-amber-100 text-amber-800"
                                : p.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-900 text-white"
                            }`}>
                              {p.status.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right">
                            <Link href={`/dashboard/client/projects/${p._id}`}>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-slate-900">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestone Approvals Card */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Awaiting Milestone Approval</CardTitle>
              <CardDescription className="text-[10px]">Milestones submitted by contractors requiring inspection.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No submissions to review</p>
                  <p className="text-[10px] text-slate-400 mt-1">Contractor updates will appear here when ready.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMilestones.map((m: any) => (
                    <div key={m._id} className="flex items-center justify-between border border-slate-100 p-4 rounded-xl hover:bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-bold text-slate-950">{m.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Project: <span className="font-semibold">{m.projectId?.title}</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">${m.amount.toLocaleString()}</p>
                        <Link href={`/dashboard/client/projects/${m.projectId?._id}`}>
                          <Button size="sm" className="mt-2 bg-sky-500 hover:bg-sky-400 text-slate-900 text-xs font-bold py-1 h-7 rounded-lg">
                            Review Evidence
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: GPS Check-ins & Activity Timeline */}
        <div className="space-y-8">
          
          {/* Recent GPS Check-ins */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Recent GPS Check-Ins</CardTitle>
              <CardDescription className="text-[10px]">Verified contractor locations at job site.</CardDescription>
            </CardHeader>
            <CardContent>
              {gpsCheckins.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No location logs recorded</p>
              ) : (
                <div className="space-y-4">
                  {gpsCheckins.map((c: any) => (
                    <div key={c._id} className="flex gap-3">
                      <div className="h-7 w-7 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center text-sky-600 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {c.contractorUserId?.fullName || "Contractor"} checked in
                        </p>
                        <p className="text-[9px] text-slate-500 truncate mt-0.5">Project: {c.projectId?.title}</p>
                        <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1">
                          <span>Coords: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</span>
                          <span>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Activity Timeline</CardTitle>
              <CardDescription className="text-[10px]">Audit trail of recent platform actions.</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No platform activity recorded</p>
              ) : (
                <div className="relative border-l border-slate-100 pl-4 space-y-4 text-xs ml-2">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="relative">
                      {/* Circle dot on line */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 bg-slate-200 border-2 border-white rounded-full"></span>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Entity: {log.entityType}</p>
                        <p className="text-slate-400 text-[8px] mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
