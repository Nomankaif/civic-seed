import React from "react";
import ContactRequest from "@/models/ContactRequest";
import { connectToDatabase } from "@/lib/mongodb";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { revalidatePath } from "next/cache";

export default function ContactPage() {
  
  // Server action to handle form submission
  async function handleSubmitContact(formData: FormData) {
    "use server";
    try {
      await connectToDatabase();
      const fullName = formData.get("fullName") as string;
      const email = formData.get("email") as string;
      const organization = formData.get("organization") as string;
      const phone = formData.get("phone") as string;
      const message = formData.get("message") as string;

      if (!fullName || !email || !message) {
        throw new Error("Required fields are missing.");
      }

      await ContactRequest.create({
        fullName,
        email,
        organization,
        phone,
        message,
        status: "NEW",
      });

      // Simple redirect/refresh path
      revalidatePath("/contact");
    } catch (e) {
      console.error("Submit contact request error:", e);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Interested in trial access, local setups, or custom integration features? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact info list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-6">
            <h3 className="font-extrabold text-lg">CivicBuild Connect</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Designed for public procurement offices, municipal engineers, and contractors.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-sky-400" />
                <span>support@civicbuildconnect.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-sky-400" />
                <span>+1 (512) 555-0155</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-sky-400" />
                <span>Downtown Austin, Texas</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <div className="flex items-center space-x-2 text-amber-500">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Demo Environment Only</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                This contact form saves records directly to the project's local MongoDB database for mock admin review.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Send an Inquiry</h3>

          <form action={handleSubmitContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full text-sm bg-slate-50 border border-slate-350 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@organization.gov"
                  className="w-full text-sm bg-slate-50 border border-slate-350 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="organization"
                  placeholder="e.g. City Public Works Department"
                  className="w-full text-sm bg-slate-50 border border-slate-350 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. 512-555-0100"
                  className="w-full text-sm bg-slate-50 border border-slate-350 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="How can our integrations team help you?"
                className="w-full text-sm bg-slate-50 border border-slate-350 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none focus:bg-white"
              ></textarea>
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg text-sm">
              Submit Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
