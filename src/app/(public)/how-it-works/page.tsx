import React from "react";
import Link from "next/link";
import { Brain, Search, MapPin, CheckSquare, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Brain className="h-8 w-8 text-sky-500" />,
      title: "1. Project Creation & AI Work Order",
      desc: "Clients input a basic project description, trade category, and budget. Our AI Work Order generator drafts a full scope of work, suggested deliverables, contractor skill requirements, and an evidence checklist.",
    },
    {
      icon: <Search className="h-8 w-8 text-sky-500" />,
      title: "2. Contractor Search & Assignment",
      desc: "Clients search our contractor directory, filtering by trade, skills, rating, and service locations. An assignment request is sent to the contractor. Once accepted, the project transitions to 'Contractor Assigned'.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-sky-500" />,
      title: "3. GPS Check-in & Progress Tracking",
      desc: "Before completing milestones, the contractor checks in directly from their browser at the job site. Coordinates and accuracy are logged in MongoDB. Contractors upload completion photos and documents for proof.",
    },
    {
      icon: <CheckSquare className="h-8 w-8 text-sky-500" />,
      title: "4. Milestone Verification & Sign-off",
      desc: "Clients inspect submitted photos, documents, and coordinates on the Mapbox interactive view. If everything aligns, the client approves the milestone. If work needs correction, they request revisions with feedback.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-sky-500" />,
      title: "5. Controlled Milestone Payout Release",
      desc: "Upon milestone approval, the client initiates the payment release. In this prototype, Stripe Connect test-mode payouts simulate the payment transfer. Dashboards update instantly to show funds are settled.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          How CivicBuild Connect Works
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          A transparent, step-by-step workflow connecting project procurement with field delivery.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-12">
        {steps.map((s, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
              {s.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{s.desc}</p>
              <div className="text-xs text-sky-600 font-semibold bg-sky-50 border border-sky-100 rounded-full px-3 py-1 inline-block">
                Status tracked: {idx === 0 ? "Draft" : idx === 1 ? "Assigned" : idx === 2 ? "In Progress" : idx === 3 ? "Awaiting Review" : "Completed"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-12 text-center mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1),transparent)]"></div>
        <h2 className="text-2xl lg:text-3xl font-bold mb-4 relative z-10">Experience the Full Journey Now</h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-8 relative z-10">
          Our prototype is fully seeded with demo data. Sign up as a Client to create a project, generate an AI work order, and assign a contractor, or sign in directly with our mock credentials.
        </p>
        <div className="flex justify-center gap-4 relative z-10">
          <Link href="/sign-up">
            <Button className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 py-5 rounded-lg flex items-center space-x-2">
              <span>Register Demo Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
