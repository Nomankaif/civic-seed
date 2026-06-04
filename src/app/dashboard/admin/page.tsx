import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import Payment from "@/models/Payment";
import LocationCheckin from "@/models/LocationCheckin";
import ContactRequest from "@/models/ContactRequest";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "@/lib/mongodb";
import {
  Users,
  Briefcase,
  DollarSign,
  MapPin,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const session = await getAuthSession();

  if (!session || session.role !== "ADMIN") return null;

  // 1. Fetch User Counts
  const totalUsers = await User.countDocuments({});
  const clientCount = await User.countDocuments({ role: "CLIENT" });
  const contractorCount = await User.countDocuments({ role: "CONTRACTOR" });

  // 2. Fetch Projects
  const totalProjects = await Project.countDocuments({});
  const activeProjects = await Project.countDocuments({
    status: { $in: ["CONTRACTOR_ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW"] },
  });

  // 3. Fetch Milestones
  const pendingApprovals = await Milestone.countDocuments({ status: "SUBMITTED" });

  // 4. Fetch Payments sums
  const payments = await Payment.find({});
  const fundedPaymentsSum = payments
    .filter((p) => p.status === "FUNDED_TEST_MODE" || p.status === "RELEASE_ELIGIBLE")
    .reduce((sum, p) => sum + p.amount, 0);
  const releasedPaymentsSum = payments
    .filter((p) => p.status === "RELEASED_TEST_MODE")
    .reduce((sum, p) => sum + p.amount, 0);

  // 5. Fetch Recent GPS
  const recentGPS = await LocationCheckin.find({})
    .sort({ timestamp: -1 })
    .limit(5)
    .populate("projectId")
    .populate("contractorUserId");

  // 6. Fetch Open Contacts
  const openContacts = await ContactRequest.find({ status: "NEW" })
    .sort({ createdAt: -1 })
    .limit(4);

  // 7. Fetch Recent Audits
  const audits = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .populate("actorUserId");

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Operations Center</h1>
        <p className="text-slate-500 text-xs">
          Global platform dashboard for verifying project states, testing stripe transactions, review GPS trails, and audit logs.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{totalUsers}</div>
            <p className="text-[10px] text-slate-500 mt-1">
              {clientCount} Clients | {contractorCount} Contractors
            </p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{totalProjects}</div>
            <p className="text-[10px] text-slate-400 mt-1">{activeProjects} actively in progress</p>
          </CardContent>
        </Card>

        {/* Milestone approvals */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestones Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{pendingApprovals}</div>
            <p className="text-[10px] text-slate-400 mt-1">Milestones awaiting client review</p>
          </CardContent>
        </Card>

        {/* Payments Released */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">${releasedPaymentsSum.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 mt-1">${fundedPaymentsSum.toLocaleString()} funded in escrow</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: GPS activity & Contacts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* GPS activity */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Recent GPS Activity Logs</CardTitle>
                <CardDescription className="text-[10px]">Real-time site check-ins submitted by contractors.</CardDescription>
              </div>
              <Link href="/dashboard/admin/gps">
                <Button variant="ghost" size="sm" className="text-xs text-sky-600">
                  View Map
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentGPS.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No contractor coordinates recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                        <th className="py-2">Contractor</th>
                        <th className="py-2">Project</th>
                        <th className="py-2">Coordinates</th>
                        <th className="py-2">Accuracy</th>
                        <th className="py-2 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentGPS.map((gps: any) => (
                        <tr key={gps._id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-bold text-slate-800">{gps.contractorUserId?.fullName || "Contractor"}</td>
                          <td className="py-3 text-slate-500 truncate max-w-[140px]">{gps.projectId?.title}</td>
                          <td className="py-3 text-slate-700 font-mono text-[10px]">{gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}</td>
                          <td className="py-3 text-slate-500">{gps.accuracy ? `±${gps.accuracy}m` : "N/A"}</td>
                          <td className="py-3 text-right text-slate-400">
                            {new Date(gps.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Requests */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Open Contact Inquiries</CardTitle>
                <CardDescription className="text-[10px]">Sales and support forms submitted on marketing page.</CardDescription>
              </div>
              <Link href="/dashboard/admin/contacts">
                <Button variant="ghost" size="sm" className="text-xs text-sky-600">
                  Manage Requests
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {openContacts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No pending inquiries
                </div>
              ) : (
                <div className="space-y-4">
                  {openContacts.map((c) => (
                    <div key={c._id} className="border border-slate-100 p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{c.fullName}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{c.email} | {c.organization || "No Org"}</p>
                        </div>
                        <Badge className="text-[8px] bg-sky-50 text-sky-700 border border-sky-200">
                          NEW
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-3 border-l-2 border-slate-200 pl-3 italic">
                        &ldquo;{c.message}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Audit logs */}
        <div className="space-y-8">
          
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Platform Audit Logs</CardTitle>
              <CardDescription className="text-[10px]">Real-time operational audit timeline.</CardDescription>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No platform activity logged</p>
              ) : (
                <div className="relative border-l border-slate-100 pl-4 space-y-4 text-xs ml-2">
                  {audits.map((log: any) => (
                    <div key={log._id} className="relative">
                      {/* Circle dot on line */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 bg-slate-200 border-2 border-white rounded-full"></span>
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-slate-500 text-[10px] leading-tight mt-0.5">
                          Actor: {log.actorUserId?.fullName || "System"}
                        </p>
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
