import React from "react";
import { getAuthSession } from "@/lib/auth";
import ContractorProfile from "@/models/ContractorProfile";
import { connectToDatabase } from "@/lib/mongodb";
import { Users, ShieldCheck, ShieldAlert, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminContractorsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const contractors = await ContractorProfile.find({}).populate("userId");

  // Server action to toggle verification badge
  async function handleToggleVerify(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const profileId = formData.get("profileId") as string;
      if (!profileId) return;

      const profile = await ContractorProfile.findById(profileId);
      if (profile) {
        profile.verificationStatus =
          profile.verificationStatus === "DEMO_VERIFIED" ? "UNVERIFIED" : "DEMO_VERIFIED";
        await profile.save();
        revalidatePath("/dashboard/admin/contractors");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contractor Accounts</h1>
        <p className="text-slate-500 text-xs">
          Verify field contractor business profiles and manage demo verification status.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] font-bold tracking-wider pb-2">
                  <th className="py-3">Business Name</th>
                  <th className="py-3">Trade Categories</th>
                  <th className="py-3">Skills</th>
                  <th className="py-3">Rating</th>
                  <th className="py-3">Availability</th>
                  <th className="py-3">Verification</th>
                  <th className="py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractors.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-slate-800">
                      {c.businessName}
                      <span className="text-[10px] text-slate-400 font-normal block">
                        Owner: {c.userId?.fullName || "Unlinked User"}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">{c.tradeCategories.join(", ")}</td>
                    <td className="py-4 text-slate-500 max-w-[150px] truncate">{c.skills.join(", ")}</td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {c.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 font-semibold">
                      <span className={c.available ? "text-emerald-600" : "text-slate-400"}>
                        {c.available ? "Accepting Jobs" : "Busy"}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge className={`text-[9px] font-bold ${
                        c.verificationStatus === "DEMO_VERIFIED"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {c.verificationStatus.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <form action={handleToggleVerify}>
                        <input type="hidden" name="profileId" value={c._id.toString()} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="text-[10px] font-bold border-slate-300 text-slate-700 h-8"
                        >
                          {c.verificationStatus === "DEMO_VERIFIED" ? "Revoke Status" : "Verify Contractor"}
                        </Button>
                      </form>
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
