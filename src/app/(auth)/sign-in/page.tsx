"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const [isClerk, setIsClerk] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Detect if Clerk keys are present
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      setIsClerk(true);
    }
  }, []);

  const handleMockLogin = async (userId: string, roleName: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ action: "login", userId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Welcome back! Logged in as ${roleName}`);
        
        // Wait a small moment to let cookie set, then route
        setTimeout(() => {
          if (data.user.role === "CLIENT") {
            router.push("/dashboard/client");
          } else if (data.user.role === "CONTRACTOR") {
            router.push("/dashboard/contractor");
          } else if (data.user.role === "ADMIN") {
            router.push("/dashboard/admin");
          }
          router.refresh();
        }, 300);
      } else {
        toast.error(data.message || "Failed to log in.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during mock login.");
    } finally {
      setLoading(false);
    }
  };

  if (isClerk) {
    return (
      <div className="flex justify-center">
        {/* Force paths to match Clerk routes */}
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    );
  }

  // Fallback credentials selector for easy demo
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Select a Demo Profile</h2>
        <p className="text-xs text-slate-400 mt-1">
          Select a role below to log in instantly.
        </p>
      </div>

      <div className="space-y-3">
        {/* Client option */}
        <Button
          onClick={() => handleMockLogin("mock_client", "Client (Government)")}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-sky-950/40 border border-sky-900/50 hover:bg-sky-900/30 text-white rounded-xl text-left h-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-sky-950 border border-sky-800 rounded-lg flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
              CL
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">City Infrastructure Dept.</p>
              <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">Client (Government)</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
        </Button>

        {/* Contractor option */}
        <Button
          onClick={() => handleMockLogin("mock_contractor", "Contractor")}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-indigo-950/40 border border-indigo-900/50 hover:bg-indigo-900/30 text-white rounded-xl text-left h-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-950 border border-indigo-800 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              CO
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Lone Star Surface Repairs</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Contractor</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
        </Button>

        {/* Admin option */}
        <Button
          onClick={() => handleMockLogin("mock_admin", "Platform Admin")}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/30 text-white rounded-xl text-left h-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-emerald-950 border border-emerald-800 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Platform Administrator</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Admin (Audit & Operations)</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
        </Button>
      </div>

      <div className="border-t border-slate-900 my-6 pt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-[10px] text-amber-500 bg-amber-950/30 border border-amber-900/40 rounded-lg p-3">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Demo Local Session active. No Clerk API keys configured.</span>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Need to create a new user profile?{" "}
          <Link href="/sign-up" className="text-sky-400 hover:text-sky-300 font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
