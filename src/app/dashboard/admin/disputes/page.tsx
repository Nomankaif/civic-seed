import React from "react";
import { getAuthSession } from "@/lib/auth";
import Dispute from "@/models/Dispute";
import Project from "@/models/Project";
import { connectToDatabase } from "@/lib/mongodb";
import { AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const disputes = await Dispute.find({})
    .sort({ createdAt: -1 })
    .populate("projectId")
    .populate("raisedByUserId");

  // Server action to resolve dispute
  async function handleResolveDispute(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const disputeId = formData.get("disputeId") as string;
      const adminNotes = formData.get("adminNotes") as string;
      if (!disputeId) return;

      const dispute = await Dispute.findById(disputeId);
      if (dispute) {
        dispute.status = "RESOLVED_DEMO";
        dispute.adminNotes = adminNotes || "Resolved after platform coordinator review.";
        await dispute.save();
        revalidatePath("/dashboard/admin/disputes");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Disputes Management</h1>
        <p className="text-slate-500 text-xs">
          Inspect contractor work disagreement submissions and record demo resolution assessments.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {disputes.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-650">All quiet</p>
              <p className="text-xs text-slate-400 mt-1">No active disputes flagged by clients or contractors.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map((d: any) => (
                <div key={d._id} className="border border-slate-150 p-5 rounded-2xl bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Project: {d.projectId?.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Raised by: {d.raisedByUserId?.fullName || "Platform User"} on {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`text-[10px] font-bold uppercase ${
                      d.status === "OPEN"
                        ? "bg-red-100 text-red-800"
                        : d.status === "UNDER_REVIEW"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {d.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  
                  <div className="mt-4 border-l-2 border-slate-200 pl-4 italic text-xs text-slate-600">
                    Reason: &ldquo;{d.reason}&rdquo;
                  </div>

                  {d.status !== "RESOLVED_DEMO" ? (
                    <form action={handleResolveDispute} className="mt-4 pt-4 border-t border-slate-200/60 flex items-end gap-4">
                      <input type="hidden" name="disputeId" value={d._id.toString()} />
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Resolution notes</label>
                        <input
                          type="text"
                          name="adminNotes"
                          required
                          placeholder="e.g. Escrow released after progress photo inspection."
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg shrink-0"
                      >
                        Resolve Dispute
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">Admin Resolution notes:</p>
                      <p className="italic">"{d.adminNotes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
