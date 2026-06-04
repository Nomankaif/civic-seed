import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Brain,
  Search,
  MapPin,
  CheckSquare,
  Lock,
  Layers,
  Users,
  Compass,
  DollarSign,
  TrendingUp,
  FileCheck,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Testimonial from "@/models/Testimonial";
import { connectToDatabase } from "@/lib/mongodb";

export default async function LandingPage() {
  let testimonials = [];
  try {
    await connectToDatabase();
    testimonials = await Testimonial.find({ isApproved: true }).limit(3);
  } catch (error) {
    console.error("Failed to load testimonials for landing page:", error);
  }

  // Fallback testimonials if database is empty/not configured
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
      quote: "As a contractor, the milestone-based payment release gives us the cash-flow visibility we need to run municipal paving projects with confidence.",
      rating: 5,
    }
  ];

  return (
    <div className="w-full flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Soft grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-sky-950/80 border border-sky-800/60 rounded-full px-3 py-1 text-xs text-sky-400 font-semibold mb-6">
            <ShieldCheck className="h-4 w-4" />
            <span>Prototype Payment Flow — Test Mode Only</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Manage Contractor Projects with{" "}
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Verified Field Progress
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            CivicBuild Connect coordinates government and private clients with field contractors. Generate AI work orders, verify site check-ins via GPS, and release milestone payments securely.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/sign-up?role=CLIENT">
              <Button size="lg" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-8 py-6 rounded-lg text-base shadow-lg shadow-sky-500/20 flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>Create a Project</span>
              </Button>
            </Link>
            <Link href="/sign-up?role=CONTRACTOR">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-white px-8 py-6 rounded-lg text-base flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Join as Contractor</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role-based Benefits Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered for Every Stakeholder
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A synchronized dashboard matching organizational accountability with contractor transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Client Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
              <div className="h-12 w-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-6">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Government & Private Clients</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Verify that field-work actually occurs before budget release. Define granular milestone budgets, inspect GPS-linked photos and deliverables, and easily generate full work orders using AI.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                  <span>AI Work Order Generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-sky-500 rounded-full"></span>
                  <span>GPS Site Verification Maps</span>
                </li>
              </ul>
            </div>

            {/* Contractor Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Professional Contractors</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Demonstrate progress directly from the field. Check-in on-site to record GPS presence, upload photo evidence of milestones, and receive instant controlled funding directly into a mock payment account.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                  <span>Simple Mobile Geolocation Check-In</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                  <span>Guaranteed Funded Milestones</span>
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Platform Administrators</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Keep operations clean. Monitor platform metrics, audit site check-in logs, evaluate user account verifications, manage testimonials, review disputes, and inspect full payment transactions.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                  <span>Comprehensive Audit Timeline</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                  <span>Global Project disputes Console</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Core Platform Capabilities
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Equipped with tools built to streamline complex physical infrastructure and repair tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <Brain className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI Work Order Templates</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Describe a project in natural language and receive an instant, structured checklist of deliverables, required skills, evidence items, and recommended budget breakdown.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <Search className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Contractor Discovery</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Filter local contractors based on verified reviews, trade categories (such as Asphalt Repair), availability status, operating regions, and experience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <MapPin className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">GPS Site Check-Ins</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Contractors check in using their browser’s location services. The system records coordinate accuracy and displays physical coordinates directly on Mapbox maps.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <CheckSquare className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Milestone Tracking</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track status across sequential stages (Not Started, In Progress, Submitted, Revision Requested, Approved, Released) with explicit evidence requirements.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <DollarSign className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Controlled Payments</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Funds are escrow-committed in test mode prior to project kickoff. Once client reviews and approves progress evidence, payments are released instantly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <Lock className="h-10 w-10 text-sky-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Secure Access with 2FA</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Keep accounts secure with Clerk authentication, featuring multi-factor authentication (MFA/2FA) setup and role-based guards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              The CivicBuild Workflow
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Five clear steps from initial request to verified milestone settlement.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 hidden lg:block z-0"></div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="h-12 w-12 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 font-extrabold text-lg mx-auto mb-4">
                  1
                </div>
                <h5 className="font-bold text-base text-white mb-2">Create Project</h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Client drafts basic details and estimates budget. Use AI to generate a detailed work order and milestones.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="h-12 w-12 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 font-extrabold text-lg mx-auto mb-4">
                  2
                </div>
                <h5 className="font-bold text-base text-white mb-2">Assign Contractor</h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Client selects a qualified contractor. The contractor reviews details and accepts the assignment request.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="h-12 w-12 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 font-extrabold text-lg mx-auto mb-4">
                  3
                </div>
                <h5 className="font-bold text-base text-white mb-2">Track & Check In</h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Contractor performs work and submits GPS check-in to confirm coordinates. Upload photo evidence of deliverables.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="h-12 w-12 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 font-extrabold text-lg mx-auto mb-4">
                  4
                </div>
                <h5 className="font-bold text-base text-white mb-2">Review Evidence</h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Client reviews progress reports, verifying photos and coordinates, and approves the milestone submission.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center">
                <div className="h-12 w-12 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 font-extrabold text-lg mx-auto mb-4">
                  5
                </div>
                <h5 className="font-bold text-base text-white mb-2">Release Funds</h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Escrow payment releases from client to contractor in Stripe test mode, closing out the milestone loop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security/Trust Banner */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-sky-600 mb-3">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-bold text-sm uppercase tracking-wider">Security & Consent Built-In</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                Designed for Transparency and Contractor Consent
              </h3>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                We believe in ethical field tracking. CivicBuild Connect records GPS coordinates <strong>only</strong> when a contractor actively clicks the site check-in button. No continuous background tracking is implemented. Accounts are secured by Clerk's email verification and optional Multi-Factor Authentication.
              </p>
            </div>
            <Link href="/security">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 px-8 rounded-xl flex items-center space-x-2 shrink-0">
                <span>View Security Page</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Trusted by Leading Authorities
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              See how infrastructure departments and commercial pavers utilize CivicBuild Connect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {displayTestimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex flex-col justify-between">
                <p className="text-slate-700 italic text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-4">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{t.clientName}</h5>
                    <p className="text-slate-500 text-xs">{t.organization}</p>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i}>&#9733;</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/testimonials" className="text-sky-600 hover:text-sky-500 font-semibold text-sm flex items-center justify-center space-x-1">
              <span>View all testimonials</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="bg-slate-900 text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.1),transparent)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Coordinate Your Next Project?
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Contact our integrations team to discuss customized field triggers, custom GIS mapping integration, or Stripe Connect test workflows.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-8 py-6 rounded-lg shadow-lg">
                Contact Sales Support
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white px-8 py-6 rounded-lg">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple building icon placeholder
function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M9 6h.01" />
      <path d="M15 6h.01" />
    </svg>
  );
}
