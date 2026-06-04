import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";
import { DollarSign, ShieldAlert, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const payments = await Payment.find({})
    .sort({ createdAt: -1 })
    .populate("projectId")
    .populate("clientUserId")
    .populate("contractorUserId");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Payments Ledger</h1>
          <p className="text-slate-500 text-xs">
            Monitor and audit all milestone escrow transaction entries logged in test mode.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-amber-500 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-xl font-bold">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>PROTOTYPE TEST MODE ONLY</span>
        </div>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No transactions logged on the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                    <th className="py-3">Stripe intent</th>
                    <th className="py-3">Project</th>
                    <th className="py-3">Client</th>
                    <th className="py-3">Contractor</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Funded At</th>
                    <th className="py-3">Released At</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-mono text-[10px] text-slate-650">{p.stripePaymentIntentId || "pi_mock_xxx"}</td>
                      <td className="py-4 text-slate-500 truncate max-w-[150px]">{p.projectId?.title}</td>
                      <td className="py-4 text-slate-500">{p.clientUserId?.fullName || "Client"}</td>
                      <td className="py-4 text-slate-500">{p.contractorUserId?.fullName || "Contractor"}</td>
                      <td className="py-4 font-extrabold text-slate-800">${p.amount.toLocaleString()}</td>
                      <td className="py-4 text-slate-400">
                        {p.fundedAt ? new Date(p.fundedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 text-slate-450">
                        {p.releasedAt ? new Date(p.releasedAt).toLocaleDateString() : "Pending release"}
                      </td>
                      <td className="py-4">
                        <Badge className={`text-[9px] font-bold uppercase ${
                          p.status === "RELEASED_TEST_MODE"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "FUNDED_TEST_MODE"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {p.status.replace(/_/g, " ")}
                        </Badge>
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
