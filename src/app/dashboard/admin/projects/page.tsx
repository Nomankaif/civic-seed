import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import Project from "@/models/Project";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { Briefcase, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const projects = await Project.find({})
    .sort({ createdAt: -1 })
    .populate("clientUserId")
    .populate({
      path: "assignedContractorId",
      populate: { path: "userId" },
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Projects</h1>
        <p className="text-slate-500 text-xs">
          Inspect all physical infrastructure project requests, contractor assignments, and operational states.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                  <th className="py-3">Project Title</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Assigned Contractor</th>
                  <th className="py-3">Budget</th>
                  <th className="py-3">Priority</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">View details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-slate-800 truncate max-w-[180px]">{p.title}</td>
                    <td className="py-4 text-slate-500 truncate max-w-[140px]">{p.clientUserId?.fullName || "Unlinked Client"}</td>
                    <td className="py-4 text-slate-500 truncate max-w-[150px]">
                      {p.assignedContractorId?.businessName || (
                        <span className="text-slate-400 italic">No contractor assigned</span>
                      )}
                    </td>
                    <td className="py-4 font-extrabold text-slate-800">${p.estimatedBudget.toLocaleString()}</td>
                    <td className="py-4">
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
                    <td className="py-4">
                      <Badge className={`text-[9px] font-bold uppercase ${
                        p.status === "DRAFT"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : p.status === "PUBLISHED"
                          ? "bg-sky-100 text-sky-800 border-sky-200"
                          : p.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : p.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-900 text-white"
                      }`}>
                        {p.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      {/* Navigate as Admin: we can direct them to client detail view or admin view */}
                      <Link href={`/dashboard/client/projects/${p._id}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
