import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Product info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
              <span className="font-extrabold text-lg text-white tracking-tight">
                CivicBuild Connect
              </span>
            </div>
            <p className="text-sm max-w-sm">
              Manage projects. Verify field progress. Release payments with confidence. Built for government departments and private contractors.
            </p>
            <p className="text-xs text-amber-500 bg-amber-950/30 border border-amber-900/30 rounded-md p-3 max-w-sm">
              <strong>Notice:</strong> This is a milestone-based controlled payment release and GPS check-in demonstration in test mode only. Continuous background tracking and legally regulated escrow accounts are not included.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition duration-150">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition duration-150">
                  Security Details
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-white transition duration-150">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition duration-150">
                  Contact Sales & Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Access</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="hover:text-white transition duration-150">
                  Client & Contractor Log In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition duration-150">
                  Register Account
                </Link>
              </li>
              <li>
                <span className="text-slate-600 block text-xs">MFA / 2FA Enforced for Admins</span>
              </li>
              <li>
                <span className="text-slate-600 block text-xs">Stripe Test Mode Enabled</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} CivicBuild Connect. Built for demonstration and review purposes.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy (Demo)</span>
            <span className="hover:text-white cursor-pointer">Terms of Service (Demo)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
