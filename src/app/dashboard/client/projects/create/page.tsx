import React from "react";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { requireRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function CreateProjectPage() {
  // Protect route
  await requireRole(["CLIENT"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Project</h1>
        <p className="text-slate-500 text-xs">
          Draft specifications, map work locations, generate AI scopes, and define milestone budgets.
        </p>
      </div>
      <CreateProjectForm />
    </div>
  );
}
