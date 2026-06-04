import React from "react";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { Users, Mail, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const users = await User.find({}).sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Directory</h1>
        <p className="text-slate-500 text-xs">
          Manage all client organizations, contractors, and administrators.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                  <th className="py-3">Clerk User ID</th>
                  <th className="py-3">Full Name</th>
                  <th className="py-3">Email Address</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Onboarded</th>
                  <th className="py-3 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-mono text-[10px] text-slate-500">{u.clerkUserId}</td>
                    <td className="py-4 font-bold text-slate-800">{u.fullName}</td>
                    <td className="py-4 text-slate-500">{u.email}</td>
                    <td className="py-4">
                      <Badge className={`text-[9px] font-bold ${
                        u.role === "CLIENT"
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : u.role === "CONTRACTOR"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline" className={`text-[9px] font-semibold ${
                        u.onboardingCompleted
                          ? "bg-emerald-50/50 text-emerald-700 border-emerald-250"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {u.onboardingCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
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
