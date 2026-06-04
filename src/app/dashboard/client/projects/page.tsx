import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import { connectToDatabase } from "@/lib/mongodb";
import { Briefcase, Plus, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientProjectsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser) return <p className="text-sm">User not found</p>;

  const projects = await Project.find({ clientUserId: dbUser._id }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Projects</h1>
          <p className="text-slate-500 text-xs">
            Review status across all active and historical infrastructure project requests.
          </p>
        </div>
        <Link href="/dashboard/client/projects/create">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2 py-5 rounded-xl shadow-md">
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No projects found</p>
              <p className="text-xs text-slate-400 mt-1">Create a project to start collaborating with contractors.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                    <th className="py-3">Title</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Priority</th>
                    <th className="py-3">Start Date</th>
                    <th className="py-3">Budget</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-800 truncate max-w-[200px]">{p.title}</td>
                      <td className="py-4 text-slate-500">{p.category}</td>
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
                      <td className="py-4 text-slate-500">
                        {new Date(p.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-semibold text-slate-850">${p.estimatedBudget.toLocaleString()}</td>
                      <td className="py-4">
                        <Badge className={`text-[9px] font-bold ${
                          p.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700"
                            : p.status === "PUBLISHED"
                            ? "bg-sky-100 text-sky-800"
                            : p.status === "CONTRACTOR_ASSIGNED"
                            ? "bg-indigo-100 text-indigo-800"
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
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/client/projects/${p._id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
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
