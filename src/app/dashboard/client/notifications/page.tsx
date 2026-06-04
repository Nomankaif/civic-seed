import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/mongodb";
import { Bell, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ClientNotificationsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CLIENT") return <p className="p-8 text-sm">Access denied</p>;

  // Find notifications
  const notifications = await Notification.find({ recipientUserId: dbUser._id })
    .sort({ createdAt: -1 })
    .populate("relatedProjectId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Notifications</h1>
        <p className="text-slate-500 text-xs">
          Chronological record of project activity alerts and field check-ins.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">Notifications about milestones, check-ins, and payments will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`border p-4 rounded-xl flex items-center justify-between gap-4 ${
                    n.isRead ? "bg-slate-50/50 border-slate-100" : "bg-sky-50/10 border-sky-100 ring-1 ring-sky-100/30"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{n.title}</h4>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {n.relatedProjectId && (
                    <Link href={`/dashboard/client/projects/${n.relatedProjectId._id}`}>
                      <Button size="sm" variant="outline" className="text-xs shrink-0 flex items-center space-x-1 border-slate-250">
                        <span>View Project</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
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
