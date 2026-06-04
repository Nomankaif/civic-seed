"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

function SignUpForm() {
  const [isClerk, setIsClerk] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Prefill role from search query if any
  const queryRole = searchParams.get("role") || "CLIENT";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: queryRole,
    password: "",
  });

  // Update form if query params change
  useEffect(() => {
    if (queryRole === "CLIENT" || queryRole === "CONTRACTOR") {
      setFormData((prev) => ({ ...prev, role: queryRole }));
    }
  }, [queryRole]);

  // Detect if Clerk keys are present
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      setIsClerk(true);
    }
  }, []);

  const handleMockSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.role || !formData.password) {
      toast.error("Please fill in all required fields (including password).");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({
          action: "signup",
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account created successfully!");
        
        // Wait a small moment to let cookie set, then route to onboarding
        setTimeout(() => {
          router.push("/onboarding");
          router.refresh();
        }, 300);
      } else {
        toast.error(data.message || "Failed to create account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  if (isClerk) {
    return (
      <div className="flex justify-center">
        {/* Force paths to match Clerk routes */}
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Create Demo Account</h2>
        <p className="text-xs text-slate-400 mt-1">
          Register a simulated client or contractor account.
        </p>
      </div>

      <form onSubmit={handleMockSignup} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            disabled={loading}
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full text-sm bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            disabled={loading}
            placeholder="name@organization.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full text-sm bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <input
            type="password"
            required
            disabled={loading}
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full text-sm bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">I am registering as a:</label>
          <select
            disabled={loading}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full text-sm bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
          >
            <option value="CLIENT">Client (Government / Private Customer)</option>
            <option value="CONTRACTOR">Contractor (Field Worker)</option>
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3 rounded-lg text-sm">
          {loading ? "Registering..." : "Create Demo Account"}
        </Button>
      </form>

      <div className="border-t border-slate-900 my-6 pt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-[10px] text-amber-500 bg-amber-950/30 border border-amber-900/40 rounded-lg p-3">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Demo Local Session active. No Clerk keys configured.</span>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-sky-400 hover:text-sky-300 font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-slate-400 py-12">Loading registration portal...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
