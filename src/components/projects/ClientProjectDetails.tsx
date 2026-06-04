"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Brain,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Search,
  UploadCloud,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import ProjectMap from "@/components/maps/ProjectMap";

interface ClientProjectDetailsProps {
  project: any;
  workOrder: any;
  milestones: any[];
  submissions: any[];
  checkins: any[];
  payments: any[];
  contractors: any[];
  clientId: string;
}

export default function ClientProjectDetails({
  project: initialProject,
  workOrder,
  milestones: initialMilestones,
  submissions: initialSubmissions,
  checkins,
  payments: initialPayments,
  contractors,
  clientId,
}: ClientProjectDetailsProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [payments, setPayments] = useState(initialPayments);

  // Selected state
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    initialMilestones[0]?._id || null
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<any | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Review states
  const [reviewComments, setReviewComments] = useState("");

  const activeMilestone = milestones.find((m) => m._id === activeMilestoneId);
  const activeSubmission = submissions.find((s) => s.milestoneId === activeMilestoneId);
  const activePayment = payments.find((p) => p.milestoneId === activeMilestoneId);

  // Filters for contractors
  const filteredContractors = contractors.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.businessName.toLowerCase().includes(query) ||
      c.tradeCategories.some((t: string) => t.toLowerCase().includes(query)) ||
      c.skills.some((s: string) => s.toLowerCase().includes(query))
    );
  });

  const handleAssignContractor = async () => {
    if (!selectedContractor) return;
    setLoading(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project._id,
          contractorProfileId: selectedContractor._id,
          notes: assignmentNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Invitation successfully sent to ${selectedContractor.businessName}!`);
        setAssignDialogOpen(false);
        // Refresh page data
        router.refresh();
      } else {
        toast.error(data.message || "Failed to send assignment invitation.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneAction = async (action: "fund" | "review" | "release", extraData = {}) => {
    if (!activeMilestoneId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          milestoneId: activeMilestoneId,
          ...extraData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state dynamically
        if (action === "fund") {
          setMilestones(
            milestones.map((m) => (m._id === activeMilestoneId ? data.milestone : m))
          );
          setPayments([...payments, data.payment]);
          toast.success("Milestone funded successfully on Stripe test network!");
        } else if (action === "review") {
          setMilestones(
            milestones.map((m) => (m._id === activeMilestoneId ? data.milestone : m))
          );
          // Refetch submissions to update reviewed status
          const subRes = await fetch(`/api/projects`); // generic refresh
          router.refresh();
          toast.success(
            extraData && (extraData as any).reviewStatus === "APPROVED"
              ? "Milestone approved!"
              : "Revision request submitted."
          );
          setReviewComments("");
        } else if (action === "release") {
          setMilestones(
            milestones.map((m) => (m._id === activeMilestoneId ? data.milestone : m))
          );
          setPayments(
            payments.map((p) => (p._id === data.payment._id ? data.payment : p))
          );
          toast.success("Stripe test mode payment released successfully!");
        }
      } else {
        toast.error(data.message || "Action failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during the milestone operation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Project Overview</span>
            <Badge variant="outline" className="text-[9px] capitalize bg-slate-50 border-slate-200">
              {project.category}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{project.title}</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs px-3 py-1 font-bold ${
            project.status === "DRAFT"
              ? "bg-slate-100 text-slate-700 border-slate-200"
              : project.status === "PUBLISHED"
              ? "bg-sky-100 text-sky-800 border-sky-200"
              : project.status === "CONTRACTOR_ASSIGNED"
              ? "bg-indigo-100 text-indigo-800 border-indigo-200"
              : project.status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : project.status === "AWAITING_REVIEW"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : project.status === "COMPLETED"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-slate-900 text-white"
          }`}>
            {project.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info, Milestones, Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Map Display */}
          <ProjectMap
            projectLocation={project.location.coordinates}
            checkins={checkins}
            projectAddress={`${project.address.street || ""}, ${project.address.city}, ${project.address.state}`}
          />

          {/* Project Details Description */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Project Blueprint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">{project.description}</p>
              
              {/* Address details */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-slate-500">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Job Site Address</span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {project.address.street ? `${project.address.street}, ` : ""}
                    {project.address.city}, {project.address.state} {project.address.postalCode || ""}, {project.address.country}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Start & Completion Targets</span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {new Date(project.startDate).toLocaleDateString()} &mdash; {new Date(project.targetCompletionDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Skills and budget */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-slate-500">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Estimated Total Budget</span>
                  <span className="font-extrabold text-slate-900 text-base mt-1 block">
                    ${project.estimatedBudget.toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Required Contractor Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {project.requiredSkills.map((s: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[9px] font-semibold bg-slate-50 border-slate-200 text-slate-700">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Work Order Scope Details */}
          {workOrder && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">AI Assisted Work Order</CardTitle>
                  <CardDescription className="text-[10px]">Granular deliverables generated via OpenAI.</CardDescription>
                </div>
                <Badge variant="outline" className="text-[9px] bg-sky-50 text-sky-700 border-sky-200 font-bold uppercase">
                  AI Checklist
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Detailed Scope of Work</h4>
                  <p className="text-slate-600 leading-relaxed">{workOrder.scopeOfWork}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <h4 className="font-bold text-slate-850 mb-2">Deliverables Checklist</h4>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {workOrder.deliverables.map((d: string, idx: number) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850 mb-2">Required Field Evidence</h4>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {workOrder.evidenceChecklist.map((e: string, idx: number) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestone Schedule List */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Milestone Escrow Schedule</CardTitle>
              <CardDescription className="text-[10px]"> Granular milestone budget and approval logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => setActiveMilestoneId(m._id)}
                    className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition duration-150 ${
                      activeMilestoneId === m._id
                        ? "bg-slate-50 border-slate-300 ring-1 ring-slate-350"
                        : "border-slate-150 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[400px]">
                        {m.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className={`text-[8px] font-bold ${
                          m.status === "NOT_STARTED"
                            ? "bg-slate-50 text-slate-500 border-slate-200"
                            : m.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : m.status === "SUBMITTED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : m.status === "APPROVED"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {m.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[9px] text-slate-400">|</span>
                        <span className="text-[9px] text-slate-500">
                          Payment: <strong className="capitalize">{m.paymentStatus.toLowerCase().replace(/_/g, " ")}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <span className="font-extrabold text-slate-900 block">${m.amount.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400 block mt-1">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No date"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Contractor Info & Active Milestone Actions panel */}
        <div className="space-y-8">
          
          {/* Contractor Info Card */}
          {project.assignedContractorId ? (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Assigned Contractor</span>
                <CardTitle className="text-sm font-bold text-slate-900 mt-1">
                  {project.assignedContractorId.businessName}
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Experience: {project.assignedContractorId.yearsOfExperience} Years | Rating: ★{project.assignedContractorId.rating.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {project.assignedContractorId.description}
                </p>
                <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-3">
                  {project.assignedContractorId.tradeCategories.map((t: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[9px] bg-slate-50 border-slate-200">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            // No contractor yet: show Assign Selector trigger
            <Card className="border-slate-250 bg-indigo-950 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1),transparent)]"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-bold">Find Contractor</CardTitle>
                <CardDescription className="text-[10px] text-indigo-300">
                  Select and assign a certified specialist for asphalt repair.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xs py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer">
                    <Search className="h-4 w-4" />
                    <span>Search Contractor Directory</span>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white text-slate-900 border border-slate-200">
                    <DialogHeader>
                      <DialogTitle className="text-base font-bold">Assign Contractor</DialogTitle>
                      <DialogDescription className="text-xs">
                        Browse active local specialists. Assign one to request project delivery.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4 text-xs">
                      {/* Search controls */}
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search trade categories or skills..."
                          className="pl-9 h-10 text-xs bg-slate-50 border-slate-300"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* Contractors list */}
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {filteredContractors.length === 0 ? (
                          <p className="text-center py-6 text-slate-400">No contractors found matching criteria.</p>
                        ) : (
                          filteredContractors.map((c) => (
                            <div
                              key={c._id}
                              onClick={() => setSelectedContractor(c)}
                              className={`border p-3 rounded-xl cursor-pointer transition duration-150 ${
                                selectedContractor?._id === c._id
                                  ? "bg-slate-50 border-sky-500"
                                  : "border-slate-150 hover:bg-slate-50/50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-slate-950 text-xs">{c.businessName}</h4>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{c.tradeCategories.join(", ")}</p>
                                </div>
                                <div className="text-right text-[10px] font-bold text-slate-800">
                                  ★{c.rating.toFixed(1)} | {c.yearsOfExperience} Yrs Exp
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-600 mt-2 line-clamp-2">{c.description}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* notes */}
                      {selectedContractor && (
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                          <label className="block font-bold text-slate-800">Invitation Notes (Required)</label>
                          <Textarea
                            placeholder="Add scope details or bid response terms..."
                            rows={3}
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setAssignDialogOpen(false)} className="text-xs">
                        Cancel
                      </Button>
                      <Button
                        disabled={loading || !selectedContractor || !assignmentNotes}
                        onClick={handleAssignContractor}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg"
                      >
                        {loading ? "Assigning..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Active Milestone Controls */}
          {activeMilestone && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Milestone Settings</span>
                <CardTitle className="text-xs font-bold text-slate-900 mt-1">
                  {activeMilestone.title}
                </CardTitle>
                <p className="text-[10px] text-slate-500 font-medium">Budget: ${activeMilestone.amount.toLocaleString()} USD</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-5 text-xs">
                
                {/* 1. Stripe Test-mode Escrow funding */}
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Stripe Escrow Demonstration</span>
                  </div>
                  
                  {activeMilestone.paymentStatus === "NOT_FUNDED" ? (
                    <div className="space-y-2">
                      <p className="text-slate-500 text-[10px] leading-normal">
                        Fund this milestone to commit the budget on Stripe test network before work starts.
                      </p>
                      <Button
                        onClick={() => handleMilestoneAction("fund")}
                        disabled={loading || !project.assignedContractorId}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 h-auto rounded-lg shadow-sm"
                      >
                        {loading ? "Simulating Payout..." : "Fund Milestone ($" + activeMilestone.amount.toLocaleString() + ")"}
                      </Button>
                      {!project.assignedContractorId && (
                        <p className="text-[9px] text-red-500 font-semibold mt-1">
                          * Contractor must be assigned before funding.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] space-y-1 text-slate-600">
                      <p className="font-semibold text-slate-800">
                        Stripe Escrow Status:{" "}
                        <span className="text-emerald-600 uppercase font-bold">
                          {activeMilestone.paymentStatus.replace(/_/g, " ")}
                        </span>
                      </p>
                      <p className="text-[9px]">Funded Hash: {activePayment?.stripePaymentIntentId || "pi_mock_xxx"}</p>
                    </div>
                  )}
                </div>

                {/* 2. Review Submissions & Evidence */}
                {activeMilestone.status === "SUBMITTED" && activeSubmission ? (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-1.5 text-amber-800">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="font-bold text-[10px] uppercase">Progress Submission Review</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed italic">
                        &ldquo;{activeSubmission.workSummary}&rdquo;
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span>Reported Progress:</span>
                        <span className="text-slate-800 font-extrabold">{activeSubmission.completionPercentage}%</span>
                      </div>
                      {/* Check-in stamp */}
                      {activeSubmission.locationCheckinId && (
                        <div className="flex items-center space-x-1.5 text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>GPS Site Stamp Attached</span>
                        </div>
                      )}
                      
                      {/* Form action review comments */}
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-[10px] font-bold text-slate-800">Inspection Comments</label>
                        <Textarea
                          placeholder="Describe adjustments needed or sign-off notes..."
                          rows={2.5}
                          className="bg-white text-xs"
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          onClick={() => handleMilestoneAction("review", { reviewStatus: "REVISION_REQUESTED", clientComments: reviewComments })}
                          disabled={loading || !reviewComments}
                          variant="outline"
                          className="border-slate-300 text-slate-700 text-[10px] font-bold h-8"
                        >
                          Request Revision
                        </Button>
                        <Button
                          onClick={() => handleMilestoneAction("review", { reviewStatus: "APPROVED", clientComments: reviewComments })}
                          disabled={loading}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-900 text-[10px] font-bold h-8"
                        >
                          Approve Milestone
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : activeMilestone.status === "REVISION_REQUESTED" ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] space-y-1.5">
                    <p className="font-bold text-amber-800 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Revision Requested</span>
                    </p>
                    <p className="text-slate-600 leading-normal">
                      Feedback: <span className="italic">"{activeMilestone.approvalNotes}"</span>
                    </p>
                  </div>
                ) : activeMilestone.status === "APPROVED" || activeMilestone.status === "PAYMENT_RELEASED" ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] space-y-1">
                    <p className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Milestone Signed Off</span>
                    </p>
                    {activeMilestone.approvalNotes && (
                      <p className="text-slate-600 italic">"{activeMilestone.approvalNotes}"</p>
                    )}
                  </div>
                ) : null}

                {/* 3. Escrow release payment trigger */}
                {activeMilestone.status === "APPROVED" && activeMilestone.paymentStatus === "RELEASE_ELIGIBLE" && (
                  <div className="space-y-2.5 border-t border-slate-100 pt-4">
                    <div className="flex items-center space-x-1 text-emerald-600 font-bold text-[10px] uppercase">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>Release Escrow Payout</span>
                    </div>
                    <p className="text-slate-500 text-[10px] leading-normal">
                      Milestone is approved. Release the Stripe test-mode escrow funds to the contractorconnected account.
                    </p>
                    <Button
                      onClick={() => handleMilestoneAction("release")}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 h-auto rounded-lg shadow-sm"
                    >
                      {loading ? "Processing..." : "Release Milestone Payout"}
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
