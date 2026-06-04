import React from "react";
import { getAuthSession } from "@/lib/auth";
import Testimonial from "@/models/Testimonial";
import { connectToDatabase } from "@/lib/mongodb";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") return null;

  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });

  // Server action to toggle approval
  async function handleToggleApprove(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const testimonialId = formData.get("testimonialId") as string;
      if (!testimonialId) return;

      const t = await Testimonial.findById(testimonialId);
      if (t) {
        t.isApproved = !t.isApproved;
        await t.save();
        revalidatePath("/dashboard/admin/testimonials");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Server action to delete
  async function handleDeleteTestimonial(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const testimonialId = formData.get("testimonialId") as string;
      if (!testimonialId) return;

      await Testimonial.findByIdAndDelete(testimonialId);
      revalidatePath("/dashboard/admin/testimonials");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Testimonials</h1>
        <p className="text-slate-500 text-xs">
          Review, approve, and delete client feedback visible on the public landing page.
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          {testimonials.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No testimonials available.</p>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div key={t._id} className="border border-slate-150 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-950 text-xs">{t.clientName}</h4>
                      <span className="text-[10px] text-slate-400">({t.organization || "No Org"})</span>
                      <Badge className={`text-[8px] font-bold ${t.isApproved ? "bg-emerald-50 text-emerald-800 border-emerald-250 border" : "bg-slate-50 text-slate-500 border-slate-200 border"}`}>
                        {t.isApproved ? "Visible" : "Draft/Hidden"}
                      </Badge>
                    </div>
                    <p className="text-slate-700 italic text-xs leading-normal">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex text-amber-500 text-[10px] font-semibold">
                      Rating: {t.rating} Stars
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 pt-2 sm:pt-0">
                    <form action={handleToggleApprove}>
                      <input type="hidden" name="testimonialId" value={t._id.toString()} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-bold border-slate-300 text-slate-700 h-8"
                      >
                        {t.isApproved ? "Unapprove" : "Approve Publication"}
                      </Button>
                    </form>

                    <form action={handleDeleteTestimonial}>
                      <input type="hidden" name="testimonialId" value={t._id.toString()} />
                      <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-500 border border-slate-200 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
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
