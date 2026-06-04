import React from "react";
import Testimonial from "@/models/Testimonial";
import { connectToDatabase } from "@/lib/mongodb";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function TestimonialsPage() {
  let testimonials = [];
  try {
    await connectToDatabase();
    testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Failed to load testimonials:", error);
  }

  // Fallbacks if seeding is missing
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      clientName: "David Vance",
      organization: "Austin Public Works Department",
      quote: "CivicBuild Connect revolutionized how we track asphalt repairs. The GPS check-ins verify that work is actually completed on-site before we release public funds.",
      rating: 5,
    },
    {
      clientName: "Elena Rostova",
      organization: "Lone Star Contractors Alliance",
      quote: "As a contractor, the milestone-based payment release gives us the cash-flow visibility we need to run paving projects with confidence.",
      rating: 5,
    },
    {
      clientName: "Marcus Thorne",
      organization: "Texas Roadways Corp",
      quote: "The AI work order generator is worth it alone. It outlines exact skills and safety checklists in seconds, cutting our onboarding overhead by half.",
      rating: 5,
    }
  ];

  // Server action to add a testimonial
  async function handleAddTestimonial(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const clientName = formData.get("clientName") as string;
      const organization = formData.get("organization") as string;
      const quote = formData.get("quote") as string;
      const rating = Number(formData.get("rating") || 5);

      if (!clientName || !quote) {
        throw new Error("Name and testimonial text are required.");
      }

      await Testimonial.create({
        clientName,
        organization,
        quote,
        rating,
        isApproved: false, // requires admin approval
      });

      revalidatePath("/testimonials");
    } catch (e) {
      console.error("Add testimonial error:", e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          What Our Users Are Saying
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Real feedback from government client organizations and independent paving professionals.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {displayTestimonials.map((t, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
            <p className="text-slate-700 italic text-sm leading-relaxed mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{t.clientName}</h5>
                <p className="text-slate-500 text-xs">{t.organization || "Independent Contractor"}</p>
              </div>
              <div className="flex text-amber-500">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <span key={i}>&#9733;</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit testimonial form */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Share Your Feedback</h3>
        <p className="text-slate-500 text-xs mb-6">
          Submit your review. Admin approval is required before testimonials are listed publicly on the platform.
        </p>

        <form action={handleAddTestimonial} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="clientName"
                required
                placeholder="e.g. John Doe"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Title</label>
              <input
                type="text"
                name="organization"
                placeholder="e.g. City Public Works"
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
            <select
              name="rating"
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
            >
              <option value="5">5 Stars (Excellent)</option>
              <option value="4">4 Stars (Good)</option>
              <option value="3">3 Stars (Average)</option>
              <option value="2">2 Stars (Poor)</option>
              <option value="1">1 Star (Very Poor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Quote</label>
            <textarea
              name="quote"
              required
              rows={4}
              placeholder="Tell us about your experience..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
            ></textarea>
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg">
            Submit Testimonial
          </Button>
        </form>
      </div>
    </div>
  );
}
