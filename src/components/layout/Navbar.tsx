"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowRight, ShieldCheck, Activity, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSession } from "@/lib/auth";

interface NavbarProps {
  session: AuthSession | null;
}

export default function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ action: "signout" }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-sky-400" />
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                CivicBuild
              </span>
              <span className="text-xs uppercase bg-sky-950 border border-sky-800 text-sky-300 font-semibold px-2 py-0.5 rounded-full">
                Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/how-it-works" className="text-slate-300 hover:text-white transition duration-150 text-sm font-medium">
              How It Works
            </Link>
            <Link href="/security" className="text-slate-300 hover:text-white transition duration-150 text-sm font-medium">
              Security
            </Link>
            <Link href="/testimonials" className="text-slate-300 hover:text-white transition duration-150 text-sm font-medium">
              Testimonials
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-white transition duration-150 text-sm font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href={session.role === "CLIENT" ? "/dashboard/client" : session.role === "CONTRACTOR" ? "/dashboard/contractor" : "/dashboard/admin"}>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">{session.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{session.role.toLowerCase()}</p>
                  </div>
                  <Button onClick={handleSignOut} size="icon" variant="ghost" className="text-slate-400 hover:text-red-400 hover:bg-slate-800">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold shadow-md shadow-sky-500/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">
            How It Works
          </Link>
          <Link href="/security" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">
            Security
          </Link>
          <Link href="/testimonials" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">
            Testimonials
          </Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">
            Contact
          </Link>
          <div className="border-t border-slate-850 my-2 pt-2">
            {session ? (
              <div className="px-3 py-2 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">{session.fullName}</p>
                  <p className="text-xs text-slate-400 capitalize">{session.role.toLowerCase()}</p>
                </div>
                <div className="flex space-x-2">
                  <Link href={session.role === "CLIENT" ? "/dashboard/client" : session.role === "CONTRACTOR" ? "/dashboard/contractor" : "/dashboard/admin"} onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center space-x-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Button onClick={() => { setIsOpen(false); handleSignOut(); }} className="bg-red-950 text-red-400 hover:bg-red-900 border border-red-900/50">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-3 pt-2 space-y-2">
                <Link href="/sign-in" onClick={() => setIsOpen(false)} className="block w-full text-center">
                  <Button variant="outline" className="w-full border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsOpen(false)} className="block w-full text-center">
                  <Button className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold shadow-md shadow-sky-500/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
