import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import ContractorProfile from "@/models/ContractorProfile";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import { connectToDatabase } from "@/lib/mongodb";
import { CheckSquare, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ContractorMilestonesPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CONTRACTOR") return <p className="p-8 text-sm">Access denied</p>;

  // Find Contractor Profile
  const profile = await ContractorProfile.findOne({ userId: dbUser._id });
  if (!profile) return <p className="p-8 text-sm">Contractor profile not found.</p>;

  // Find assigned projects
  const projects = await Project.find({ assignedContractorId: profile._id });
  const projectIds = projects.map((p) => p._id);

  // Find milestones
  const milestones = await Milestone.find({ projectId: { $in: projectIds } })
    .sort({ dueDate: 1 })
    .populate("projectId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Milestones Schedule</h1>
        <p className="text-slate-500 text-xs">
          Global view of milestone obligations, amounts, and completion schedules across all active jobs.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {milestones.length === 0 ? (
            <div className="text-center py-16">
              <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No milestones assigned</p>
              <p className="text-xs text-slate-400 mt-1">When clients assign you to projects with milestones, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                    <th className="py-3">Milestone Name</th>
                    <th className="py-3">Project Title</th>
                    <th className="py-3">Due Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {milestones.map((m: any) => (
                    <tr key={m._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-850 truncate max-w-[180px]">{m.title}</td>
                      <td className="py-4 text-slate-500 truncate max-w-[160px]">{m.projectId?.title}</td>
                      <td className="py-4 text-slate-450">
                        {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"}
                      </td>
                      <td className="py-4 font-semibold text-slate-800">${m.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <Badge className={`text-[9px] font-bold ${
                          m.status === "NOT_STARTED"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : m.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : m.status === "SUBMITTED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : m.status === "APPROVED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {m.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="text-[9px] capitalize border-slate-200">
                          {m.paymentStatus.toLowerCase().replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/contractor/projects/${m.projectId?._id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900 border border-slate-150">
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
    </div>
  );
}
