"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Navigation,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import ProjectMap from "@/components/maps/ProjectMap";

interface ContractorProjectDetailsProps {
  project: any;
  workOrder: any;
  milestones: any[];
  submissions: any[];
  checkins: any[];
  payments: any[];
  assignment: any;
  contractorUserId: string;
}

export default function ContractorProjectDetails({
  project,
  workOrder,
  milestones: initialMilestones,
  submissions: initialSubmissions,
  checkins: initialCheckins,
  payments: initialPayments,
  assignment: initialAssignment,
  contractorUserId,
}: ContractorProjectDetailsProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState(initialMilestones);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [checkins, setCheckins] = useState(initialCheckins);
  const [payments, setPayments] = useState(initialPayments);
  const [assignment, setAssignment] = useState(initialAssignment);

  // Selector state
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    initialMilestones[0]?._id || null
  );
  
  // Geolocation trigger state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsConfirmed, setGpsConfirmed] = useState(false);

  // Form Submission State
  const [workSummary, setWorkSummary] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const activeMilestone = milestones.find((m) => m._id === activeMilestoneId);
  const activeSubmission = submissions.find((s) => s.milestoneId === activeMilestoneId);
  const activePayment = payments.find((p) => p.milestoneId === activeMilestoneId);

  // Capture Geolocation coordinates
  const handleGPSCheckIn = () => {
    if (!navigator.geolocation) {
      toast.error("Browser Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/gps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: project._id,
              milestoneId: activeMilestoneId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setCheckins([data.checkin, ...checkins]);
            setGpsConfirmed(true);
            toast.success("GPS Check-in recorded successfully!");
          } else {
            toast.error(data.message || "Failed to record GPS Check-in.");
          }
        } catch (e) {
          console.error(e);
          toast.error("Error sending check-in coordinates.");
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        toast.error(`Location access denied or timed out: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Convert uploaded file to Base64 to save directly in Document schema
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImageUrl(reader.result as string);
      toast.success("Progress photo attached successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleAssignmentResponse = async (action: "ACCEPT" | "REJECT") => {
    setLoading(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment._id,
          action,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAssignment(data.assignment);
        toast.success(`You successfully ${action.toLowerCase()}ed the project!`);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update assignment status.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred responding to assignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMilestone = async () => {
    if (!activeMilestoneId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          milestoneId: activeMilestoneId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMilestones(
          milestones.map((m) => (m._id === activeMilestoneId ? data.milestone : m))
        );
        toast.success("Milestone work started!");
      } else {
        toast.error(data.message || "Action failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error updating milestone state.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMilestoneId) return;
    if (!workSummary) {
      toast.error("Please add a work completion summary.");
      return;
    }

    setLoading(true);
    try {
      // If image is uploaded as Base64, we will mock save its Document record
      let docIds = [];
      if (uploadedImageUrl) {
        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project._id,
            milestoneId: activeMilestoneId,
            fileUrl: uploadedImageUrl,
            originalFileName: "progress_photo.png",
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          docIds.push(uploadData.document._id);
        }
      }

      // Link latest check-in as check-in reference
      const latestCheckinId = checkins[0]?._id;

      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          milestoneId: activeMilestoneId,
          workSummary,
          completionPercentage,
          attachmentIds: docIds,
          locationCheckinId: latestCheckinId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMilestones(
          milestones.map((m) => (m._id === activeMilestoneId ? data.milestone : m))
        );
        setSubmissions([data.submission, ...submissions]);
        toast.success("Milestone deliverables submitted successfully!");
        setWorkSummary("");
        setUploadedImageUrl("");
        setGpsConfirmed(false);
        router.refresh();
      } else {
        toast.error(data.message || "Submission failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Invitation Banner (if pending) */}
      {assignment && assignment.status === "PENDING" && (
        <Card className="border-indigo-200 bg-indigo-50/50 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="font-extrabold text-sm uppercase tracking-wider">Project Assignment Request</span>
            </div>
            <p className="text-slate-800 text-xs font-bold">
              You have been requested by "{project.organizationId?.name || "Client"}" for immediate asphalt paving services.
            </p>
            {assignment.notes && (
              <p className="text-xs text-slate-500 bg-white border border-indigo-150 rounded-lg p-3 italic">
                Notes: &ldquo;{assignment.notes}&rdquo;
              </p>
            )}
          </div>
          <div className="flex space-x-3 shrink-0">
            <Button
              disabled={loading}
              onClick={() => handleAssignmentResponse("REJECT")}
              variant="outline"
              className="border-slate-300 text-slate-700 font-semibold"
            >
              Decline Job
            </Button>
            <Button
              disabled={loading}
              onClick={() => handleAssignmentResponse("ACCEPT")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 shadow-md"
            >
              {loading ? "Accepting..." : "Accept Assignment"}
            </Button>
          </div>
        </Card>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Contract</span>
            <Badge variant="outline" className="text-[9px] bg-slate-50 border-slate-200">
              {project.category}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{project.title}</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Client: {project.organizationId?.name || "Client Department"}
          </p>
        </div>
        <Badge className={`text-xs px-3 py-1 font-bold ${
          project.status === "CONTRACTOR_ASSIGNED"
            ? "bg-indigo-150 text-indigo-800"
            : project.status === "IN_PROGRESS"
            ? "bg-blue-150 text-blue-800"
            : project.status === "COMPLETED"
            ? "bg-emerald-150 text-emerald-800"
            : "bg-slate-100 text-slate-750"
        }`}>
          {project.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Map, Scope, Milestones */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Map display */}
          <ProjectMap
            projectLocation={project.location.coordinates}
            checkins={checkins}
            projectAddress={`${project.address.street || ""}, ${project.address.city}, ${project.address.state}`}
          />

          {/* Project Details Description */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">Project blueprint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-slate-500">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Location Site</span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {project.address.street ? `${project.address.street}, ` : ""}
                    {project.address.city}, {project.address.state}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Contract Target Budget</span>
                  <span className="font-extrabold text-slate-900 text-base mt-1 block">
                    ${project.estimatedBudget.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones Schedule */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Milestone Contract Schedule</CardTitle>
              <CardDescription className="text-[10px]">Select a milestone to view detailed checklists or upload proof.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m._id}
                  onClick={() => setActiveMilestoneId(m._id)}
                  className={`border p-4 rounded-xl flex items-center justify-between cursor-pointer transition duration-150 ${
                    activeMilestoneId === m._id
                      ? "bg-slate-50 border-slate-350 ring-1 ring-slate-350"
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
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: GPS check-in button, submit deliverables */}
        <div className="space-y-8">
          
          {/* Geolocation check-in card */}
          {assignment && assignment.status === "ACCEPTED" && activeMilestone && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-1.5 text-sky-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="font-bold text-[9px] uppercase tracking-wider">Site Check-In Trigger</span>
                </div>
                <CardTitle className="text-xs font-bold text-slate-900 mt-1">Check In at Job Site</CardTitle>
                <CardDescription className="text-[10px]">
                  Click below to capture your coordinates to attach as proof of on-site work.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-xs">
                
                {/* Checkin button */}
                <Button
                  onClick={handleGPSCheckIn}
                  disabled={gpsLoading}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs py-3.5 h-auto rounded-lg shadow-sm flex items-center justify-center space-x-2"
                >
                  {gpsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Requesting GPS access...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 rotate-45" />
                      <span>Submit GPS Check-In</span>
                    </>
                  )}
                </Button>

                {/* Coords readouts */}
                {checkins.length > 0 && (
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-1 text-[10px]">
                    <p className="font-bold text-slate-800">Latest recorded check-in:</p>
                    <p className="font-mono text-[9px] text-slate-500">
                      Latitude: {checkins[0].latitude.toFixed(6)}
                    </p>
                    <p className="font-mono text-[9px] text-slate-500">
                      Longitude: {checkins[0].longitude.toFixed(6)}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Accuracy: ±{checkins[0].accuracy?.toFixed(1) || "N/A"}m | {new Date(checkins[0].timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* Milestone Action Form */}
          {assignment && assignment.status === "ACCEPTED" && activeMilestone && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Deliverables Intake</span>
                <CardTitle className="text-xs font-bold text-slate-900 mt-1">{activeMilestone.title}</CardTitle>
                <CardDescription className="text-[10px]">Escrow: ${activeMilestone.amount.toLocaleString()} USD</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 text-xs space-y-4">
                
                {/* 1. If NOT STARTED, show Start button */}
                {activeMilestone.status === "NOT_STARTED" ? (
                  <div className="space-y-3">
                    <p className="text-slate-500 leading-normal text-[10px]">
                      Trigger the status transition to "In Progress" before submitting completion evidence.
                    </p>
                    <Button
                      onClick={handleStartMilestone}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 h-auto rounded-lg shadow-sm"
                    >
                      {loading ? "Updating..." : "Start Milestone Work"}
                    </Button>
                  </div>
                ) : activeMilestone.status === "IN_PROGRESS" || activeMilestone.status === "REVISION_REQUESTED" ? (
                  // 2. Submission form
                  <form onSubmit={handleSubmitEvidence} className="space-y-4">
                    
                    {/* warning if no checkins */}
                    {checkins.length === 0 && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[10px] flex gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                        <p>
                          <strong>GPS Check-in Required:</strong> Please check in on-site first using the button above to record your physical presence.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Work Summary Details *</label>
                      <Textarea
                        required
                        placeholder="Describe completed works, materials used, or inspections..."
                        rows={3.5}
                        value={workSummary}
                        onChange={(e) => setWorkSummary(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Percentage *</label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={completionPercentage}
                          onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">Progress Photo</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="photo-upload-input"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button
                            type="button"
                            onClick={() => document.getElementById("photo-upload-input")?.click()}
                            variant="outline"
                            className="w-full border-slate-350 hover:bg-slate-50 text-[10px] font-bold flex items-center space-x-1.5 h-10"
                          >
                            <UploadCloud className="h-4 w-4 text-slate-400" />
                            <span>{uploadedImageUrl ? "Attached" : "Choose File"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Image preview */}
                    {uploadedImageUrl && (
                      <div className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                        <img
                          src={uploadedImageUrl}
                          alt="Thumbnail preview"
                          className="h-20 w-auto rounded object-cover"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || checkins.length === 0}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 h-auto rounded-lg shadow-sm"
                    >
                      {loading ? "Submitting..." : "Submit Milestone Evidence"}
                    </Button>
                  </form>
                ) : activeMilestone.status === "SUBMITTED" ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-[10px] space-y-2 text-slate-700">
                    <p className="font-bold text-amber-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>Awaiting Client Review</span>
                    </p>
                    <p>Evidence submitted. Client will verify check-in coordinates and photos to approve settlement.</p>
                  </div>
                ) : (
                  // APPROVED or RELEASED
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-[10px] space-y-2 text-slate-700">
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" />
                      <span>Milestone Settled</span>
                    </p>
                    <p>Approval Sign-off complete. Stripe Connect test payout: {activeMilestone.paymentStatus.toUpperCase().replace(/_/g, " ")}</p>
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
