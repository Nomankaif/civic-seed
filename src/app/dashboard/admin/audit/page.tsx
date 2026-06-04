import React from "react";
import { getAuthSession } from "@/lib/auth";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const logs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .populate("actorUserId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Audit Trail</h1>
        <p className="text-slate-500 text-xs">
          Chronological record of sensitive actions, authorization approvals, and coordinate logs.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No operational events recorded.</p>
          ) : (
            <div className="relative border-l border-slate-200 pl-6 space-y-6 ml-3 text-xs">
              {logs.map((log: any) => (
                <div key={log._id} className="relative">
                  {/* Dot on line */}
                  <span className="absolute -left-[30px] top-1.5 h-3 w-3 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center"></span>
                  
                  <div className="space-y-1 bg-slate-50 border border-slate-100 p-4 rounded-xl max-w-2xl">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-950 uppercase text-[10px] tracking-wider">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-slate-600">
                      Actor: <span className="font-bold text-slate-800">{log.actorUserId?.fullName || "System/Webhook"}</span> ({log.actorUserId?.role || "SYSTEM"})
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Target Resource: <span className="font-mono">{log.entityType} ({log.entityId || "N/A"})</span>
                    </p>
                    
                    {log.metadata && (
                      <div className="mt-2 text-[10px] bg-white border border-slate-150 p-2 rounded font-mono text-slate-500 overflow-x-auto">
                        <span className="font-bold text-slate-700 block mb-1">Log Metadata:</span>
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
