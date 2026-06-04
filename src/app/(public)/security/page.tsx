import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  const principles = [
    {
      icon: <Lock className="h-6 w-6 text-sky-500" />,
      title: "Secure Account Access (MFA/2FA)",
      desc: "Authentication is managed by Clerk, supporting multi-factor authentication (MFA/2FA) setup. Passwords are encrypted, and standard email verification is enforced.",
    },
    {
      icon: <Eye className="h-6 w-6 text-sky-500" />,
      title: "Consent-Driven GPS Tracking & Privacy",
      desc: "This prototype contains NO hidden background tracking. Geolocation coordinates are captured using the browser API only when the contractor actively triggers a check-in. The user is prompted for location permission every time.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-sky-500" />,
      title: "Role-Based Access Control (RBAC)",
      desc: "Authorization rules are enforced server-side. Clients can only inspect and manage their own projects; contractors can only submit check-ins and review payouts for projects assigned to them. Platform settings are limited strictly to verified administrators.",
    },
    {
      icon: <FileText className="h-6 w-6 text-sky-500" />,
      title: "Secure Signed Uploads",
      desc: "All progress photos, documents, and profile logos are uploaded via Cloudinary using secure signed upload endpoints, storing authenticated, secure references in our MongoDB database.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-sky-500" />,
      title: "Test-Mode Payment Compliance",
      desc: "All transactions are fully simulated or bound to Stripe Connect in test mode. No real bank accounts, KYC details, or credit cards are collected, ensuring safety during testing. All payment screens carry test mode notices.",
    },
    {
      icon: <Activity className="h-6 w-6 text-sky-500" />,
      title: "Platform Activity Auditing",
      desc: "Critical operations—such as registering accounts, creating projects, check-ins, milestone status modifications, and payment releases—are written to a persistent audit log in MongoDB, viewable by administrators.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 text-sky-600 mb-3 font-semibold text-sm uppercase tracking-wider">
          <ShieldCheck className="h-5 w-5" />
          <span>Trust & Privacy</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Security and Operational Integrity
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          How CivicBuild Connect ensures data safety, privacy consent, and accountability.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {principles.map((p, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center mb-4">
              {p.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Notice Box */}
      <div className="bg-amber-950/20 border border-amber-900/30 text-amber-900 rounded-2xl p-6 mt-12 flex items-start gap-4">
        <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <h4 className="font-bold mb-1">Escrow & Funds Disclosure</h4>
          <p className="leading-relaxed">
            This platform is an operational prototype built for demonstration. It does not provide legally regulated escrow services. All payment pipelines are processed on Stripe's mock test network. No real currency is loaded or exchanged.
          </p>
        </div>
      </div>
    </div>
  );
}
