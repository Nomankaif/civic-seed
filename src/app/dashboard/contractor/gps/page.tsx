import React from "react";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import LocationCheckin from "@/models/LocationCheckin";
import { connectToDatabase } from "@/lib/mongodb";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ContractorGPSPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CONTRACTOR") return <p className="p-8 text-sm">Access denied</p>;

  // Find checkins
  const checkins = await LocationCheckin.find({ contractorUserId: dbUser._id })
    .sort({ timestamp: -1 })
    .populate("projectId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your GPS Check-In History</h1>
        <p className="text-slate-500 text-xs">
          Chronological record of coordinates submitted as field progress verification.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {checkins.length === 0 ? (
            <div className="text-center py-16">
              <Compass className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No check-in logs recorded</p>
              <p className="text-xs text-slate-400 mt-1">Check-in at job sites on your assigned project details page to populate coordinates.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                    <th className="py-3">Job Location (Project)</th>
                    <th className="py-3">Latitude</th>
                    <th className="py-3">Longitude</th>
                    <th className="py-3">Browser Accuracy</th>
                    <th className="py-3">Recorded Time</th>
                    <th className="py-3 text-right">Project details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {checkins.map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-800 truncate max-w-[200px]">{c.projectId?.title}</td>
                      <td className="py-4 font-mono text-[11px] text-slate-600">{c.latitude.toFixed(6)}</td>
                      <td className="py-4 font-mono text-[11px] text-slate-600">{c.longitude.toFixed(6)}</td>
                      <td className="py-4 text-slate-500">{c.accuracy ? `±${c.accuracy.toFixed(1)} meters` : "N/A"}</td>
                      <td className="py-4 text-slate-400">
                        {new Date(c.timestamp).toLocaleDateString()} at {new Date(c.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/contractor/projects/${c.projectId?._id}`}>
                          <Button size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-500 border border-slate-150 py-1.5 h-8">
                            Open Details
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
