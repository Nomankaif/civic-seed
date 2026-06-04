import React from "react";
import { getAuthSession } from "@/lib/auth";
import ContactRequest from "@/models/ContactRequest";
import { connectToDatabase } from "@/lib/mongodb";
import { Mail, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const contacts = await ContactRequest.find({}).sort({ createdAt: -1 });

  // Server action to update status
  async function handleUpdateStatus(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const contactId = formData.get("contactId") as string;
      const nextStatus = formData.get("nextStatus") as string;
      if (!contactId || !nextStatus) return;

      const req = await ContactRequest.findById(contactId);
      if (req) {
        req.status = nextStatus as any;
        await req.save();
        revalidatePath("/dashboard/admin/contacts");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inquiry Inbox</h1>
        <p className="text-slate-500 text-xs">
          Manage support and sales inquiries sent from the public website contact form.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {contacts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Inbox is empty.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((c) => (
                <div key={c._id} className="border border-slate-150 p-4 rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">{c.fullName}</h4>
                      <p className="text-[10px] text-slate-400">
                        Email: {c.email} {c.phone && `| Phone: ${c.phone}`} {c.organization && `| Org: ${c.organization}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[8px] font-bold ${
                        c.status === "NEW"
                          ? "bg-red-50 text-red-800 border-red-200 border"
                          : c.status === "READ"
                          ? "bg-amber-50 text-amber-800 border-amber-200 border"
                          : "bg-emerald-50 text-emerald-800 border-emerald-250 border"
                      }`}>
                        {c.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 italic text-xs leading-relaxed border-l-2 border-slate-200 pl-3">
                    &ldquo;{c.message}&rdquo;
                  </p>

                  <div className="flex justify-end gap-3 pt-2">
                    {c.status === "NEW" && (
                      <form action={handleUpdateStatus}>
                        <input type="hidden" name="contactId" value={c._id.toString()} />
                        <input type="hidden" name="nextStatus" value="READ" />
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="text-[10px] font-bold border-slate-300 text-slate-700 h-8"
                        >
                          Mark as Read
                        </Button>
                      </form>
                    )}
                    {c.status !== "RESOLVED" && (
                      <form action={handleUpdateStatus}>
                        <input type="hidden" name="contactId" value={c._id.toString()} />
                        <input type="hidden" name="nextStatus" value="RESOLVED" />
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-8"
                        >
                          Mark Resolved
                        </Button>
                      </form>
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
