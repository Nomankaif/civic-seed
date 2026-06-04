import React from "react";
import { getAuthSession } from "@/lib/auth";
import LocationCheckin from "@/models/LocationCheckin";
import { connectToDatabase } from "@/lib/mongodb";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProjectMap from "@/components/maps/ProjectMap";

export const dynamic = "force-dynamic";

export default async function AdminGPSPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const checkins = await LocationCheckin.find({})
    .sort({ timestamp: -1 })
    .populate("projectId")
    .populate("contractorUserId");

  // Format checkins for map display (defaulting to the first project coordinate for map center)
  const mapCheckins = checkins.map((c) => ({
    latitude: c.latitude,
    longitude: c.longitude,
    accuracy: c.accuracy,
    timestamp: c.timestamp,
  }));

  const defaultCenter: [number, number] = checkins[0]
    ? [checkins[0].longitude, checkins[0].latitude]
    : [-97.7431, 30.2672]; // Austin center

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global GPS Activity Logs</h1>
        <p className="text-slate-500 text-xs">
          Monitor contractor site presence logs and accuracy telemetry across the entire platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map column */}
        <div className="lg:col-span-1">
          <ProjectMap
            projectLocation={defaultCenter}
            checkins={mapCheckins}
            projectAddress="Austin, Texas region"
          />
        </div>

        {/* Ledger column */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Check-in Ledger</CardTitle>
              <CardDescription className="text-[10px]">Tabular audit trail of coordinates reported.</CardDescription>
            </CardHeader>
            <CardContent>
              {checkins.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No check-in logs found</p>
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
                      {checkins.map((gps: any) => (
                        <tr key={gps._id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 font-bold text-slate-800">{gps.contractorUserId?.fullName || "Contractor"}</td>
                          <td className="py-3.5 text-slate-500 truncate max-w-[140px]">{gps.projectId?.title}</td>
                          <td className="py-3.5 text-slate-700 font-mono text-[10px]">{gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}</td>
                          <td className="py-3.5 text-slate-500">{gps.accuracy ? `±${gps.accuracy}m` : "N/A"}</td>
                          <td className="py-3.5 text-right text-slate-400">
                            {new Date(gps.timestamp).toLocaleDateString()} at {new Date(gps.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      </div>
    </div>
  );
}
