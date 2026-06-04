import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";
import { DollarSign, ShieldAlert, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientPaymentsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CLIENT") return <p className="p-8 text-sm">Access denied</p>;

  // Find all projects of this client
  const projects = await Project.find({ clientUserId: dbUser._id });
  const projectIds = projects.map((p) => p._id);

  // Find payments
  const payments = await Payment.find({ projectId: { $in: projectIds } })
    .sort({ createdAt: -1 })
    .populate("projectId")
    .populate("contractorUserId");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments & Escrow Log</h1>
          <p className="text-slate-500 text-xs">
            Review test-mode funding states, release transaction hashes, and histories.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-amber-500 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-xl font-bold">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>PROTOTYPE TEST MODE ONLY</span>
        </div>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No payment records found</p>
              <p className="text-xs text-slate-400 mt-1">Milestones must be funded or released to show transactions here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                    <th className="py-3">Stripe Reference</th>
                    <th className="py-3">Project</th>
                    <th className="py-3">Contractor</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Funded At</th>
                    <th className="py-3">Released At</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Project View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-mono text-[10px] text-slate-600">{p.stripePaymentIntentId || "pi_mock_xxx"}</td>
                      <td className="py-4 text-slate-500 truncate max-w-[150px]">{p.projectId?.title}</td>
                      <td className="py-4 text-slate-500">{p.contractorUserId?.fullName || "Contractor"}</td>
                      <td className="py-4 font-extrabold text-slate-850">${p.amount.toLocaleString()}</td>
                      <td className="py-4 text-slate-400">
                        {p.fundedAt ? new Date(p.fundedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 text-slate-400">
                        {p.releasedAt ? new Date(p.releasedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4">
                        <Badge className={`text-[9px] font-bold ${
                          p.status === "RELEASED_TEST_MODE"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "FUNDED_TEST_MODE"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {p.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/client/projects/${p.projectId?._id}`}>
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
