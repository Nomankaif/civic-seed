import { getAuthSession } from "./auth";
import { redirect } from "next/navigation";

export async function requireRole(allowedRoles: Array<"CLIENT" | "CONTRACTOR" | "ADMIN">) {
  const session = await getAuthSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  if (!allowedRoles.includes(session.role)) {
    // Redirect to their default dashboard
    if (session.role === "CLIENT") {
      redirect("/dashboard/client");
    } else if (session.role === "CONTRACTOR") {
      redirect("/dashboard/contractor");
    } else if (session.role === "ADMIN") {
      redirect("/dashboard/admin");
    } else {
      redirect("/");
    }
  }
  
  return session;
}

export async function getDashboardRedirectUrl(): Promise<string> {
  const session = await getAuthSession();
  if (!session) return "/sign-in";
  
  if (session.role === "CLIENT") return "/dashboard/client";
  if (session.role === "CONTRACTOR") return "/dashboard/contractor";
  if (session.role === "ADMIN") return "/dashboard/admin";
  return "/";
}
