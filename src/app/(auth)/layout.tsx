import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.1),transparent)] z-0"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <ShieldCheck className="h-10 w-10 text-sky-400" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            CivicBuild
          </span>
          <span className="text-xs uppercase bg-sky-950 border border-sky-800 text-sky-300 font-semibold px-2 py-0.5 rounded-full">
            Connect
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-950 border border-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
