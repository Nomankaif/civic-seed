import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAuthSession } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
