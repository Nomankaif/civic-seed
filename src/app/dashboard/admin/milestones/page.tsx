import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import Milestone from "@/models/Milestone";
import Project from "@/models/Project";
import { connectToDatabase } from "@/lib/mongodb";
import { CheckSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminMilestonesPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const milestones = await Milestone.find({})
    .sort({ updatedAt: -1 })
    .populate("projectId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Milestone Submissions</h1>
        <p className="text-slate-500 text-xs">
          Inspect milestone budgets, contractor deliverables evidence, and approval statuses across the platform.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                  <th className="py-3">Milestone Name</th>
                  <th className="py-3">Project Title</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Due Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Stripe Escrow</th>
                  <th className="py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((m: any) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-slate-800 truncate max-w-[180px]">{m.title}</td>
                    <td className="py-4 text-slate-500 truncate max-w-[180px]">{m.projectId?.title}</td>
                    <td className="py-4 font-extrabold text-slate-800">${m.amount.toLocaleString()}</td>
                    <td className="py-4 text-slate-400">
                      {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"}
                    </td>
                    <td className="py-4">
                      <Badge className={`text-[9px] font-bold uppercase ${
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
                      <Badge variant="outline" className="text-[9px] uppercase border-slate-200">
                        {m.paymentStatus.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/dashboard/client/projects/${m.projectId?._id}`}>
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
