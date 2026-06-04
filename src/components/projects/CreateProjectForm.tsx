"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Brain,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MilestoneItem {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  requiredEvidence: string[];
}

export default function CreateProjectForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form State
  const [basic, setBasic] = useState({
    title: "",
    category: "Asphalt Repair",
    description: "",
    priority: "MEDIUM",
  });

  const [location, setLocation] = useState({
    street: "",
    city: "Austin",
    state: "Texas",
    postalCode: "78701",
    country: "United States",
    lat: 30.2672,
    lng: -97.7431,
  });

  const [timeline, setTimeline] = useState({
    startDate: new Date().toISOString().split("T")[0],
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 65 * 1000).toISOString().split("T")[0],
  });

  const [budget, setBudget] = useState({
    estimatedBudget: 25000,
    requiredSkills: "Asphalt Laydown, Road Patching, Core Excavation",
  });

  // AI Generated Work Order & Milestones State
  const [workOrder, setWorkOrder] = useState({
    scopeOfWork: "",
    deliverables: [] as string[],
    evidenceChecklist: [] as string[],
    notes: [] as string[],
    generatedByAI: false,
  });

  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  // Helpers
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        description: "Specify work details...",
        amount: 5000,
        dueDate: timeline.targetCompletionDate,
        requiredEvidence: ["Progress photos"],
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneItem, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleGenerateAIWorkOrder = async () => {
    if (!basic.title || !basic.description) {
      toast.error("Please enter a title and description first to guide the AI.");
      return;
    }

    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: basic.title,
          category: basic.category,
          description: basic.description,
          city: location.city,
          state: location.state,
          budget: budget.estimatedBudget,
          dueDate: timeline.targetCompletionDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const wo = data.workOrder;
        setWorkOrder({
          scopeOfWork: wo.scopeOfWork,
          deliverables: wo.deliverables,
          evidenceChecklist: wo.evidenceChecklist,
          notes: wo.notes,
          generatedByAI: true,
        });

        // Convert suggested milestones
        const generatedMilestones: MilestoneItem[] = wo.suggestedMilestones.map((m: any) => {
          // Calculate amount based on suggested percentage
          const amount = Math.round((m.suggestedPercentage / 100) * budget.estimatedBudget);
          return {
            title: m.name,
            description: m.description,
            amount,
            dueDate: timeline.targetCompletionDate,
            requiredEvidence: m.requiredEvidence || [],
          };
        });

        setMilestones(generatedMilestones);
        toast.success("AI Work Order and Milestones generated successfully!");
      } else {
        toast.error(data.message || "AI Generation failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during AI Work Order generation.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmitProject = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    setLoading(true);
    try {
      const skillsArr = budget.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);

      // Validate milestone total matches budget
      const milestoneTotal = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
      if (publishStatus === "PUBLISHED" && milestones.length > 0 && milestoneTotal !== budget.estimatedBudget) {
        toast.error(`Milestone total ($${milestoneTotal.toLocaleString()}) must match the estimated budget ($${budget.estimatedBudget.toLocaleString()}). Adjust milestone amounts before publishing.`);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: basic.title,
          category: basic.category,
          description: basic.description,
          priority: basic.priority,
          address: location,
          location: { lat: location.lat, lng: location.lng },
          estimatedBudget: budget.estimatedBudget,
          requiredSkills: skillsArr,
          startDate: timeline.startDate,
          targetCompletionDate: timeline.targetCompletionDate,
          status: publishStatus,
          workOrderData: workOrder.scopeOfWork ? workOrder : undefined,
          milestonesData: milestones,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Project successfully created and saved as ${publishStatus.toLowerCase()}!`);
        router.push("/dashboard/client/projects");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to create project.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Steps indicator */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs md:text-sm font-semibold">
        {[
          { num: 1, name: "Details", icon: <Briefcase className="h-4 w-4" /> },
          { num: 2, name: "Location", icon: <MapPin className="h-4 w-4" /> },
          { num: 3, name: "Budget", icon: <DollarSign className="h-4 w-4" /> },
          { num: 4, name: "Work Order", icon: <Brain className="h-4 w-4" /> },
          { num: 5, name: "Review", icon: <FileCheck className="h-4 w-4" /> },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center space-x-1.5 ${
              step === s.num
                ? "text-sky-600 font-extrabold"
                : step > s.num
                ? "text-slate-500"
                : "text-slate-300"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs border ${
                step === s.num
                  ? "bg-sky-50 border-sky-400 text-sky-600"
                  : step > s.num
                  ? "bg-slate-50 border-slate-300 text-slate-500"
                  : "border-slate-200 text-slate-300"
              }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.name}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Details */}
      {step === 1 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Step 1: Project Details</CardTitle>
            <CardDescription className="text-[11px]">Specify the name, category, and core scope of your project request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
              <Input
                placeholder="e.g. Municipal Office Parking Lot Repair"
                value={basic.title}
                onChange={(e) => setBasic({ ...basic, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Category *</label>
                <select
                  value={basic.category}
                  onChange={(e) => setBasic({ ...basic, category: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Asphalt Repair">Asphalt Repair</option>
                  <option value="Concrete Paving">Concrete Paving</option>
                  <option value="Landscaping & Grading">Landscaping & Grading</option>
                  <option value="Electrical & Utility Works">Electrical & Utility Works</option>
                  <option value="General Maintenance">General Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
                <select
                  value={basic.priority}
                  onChange={(e) => setBasic({ ...basic, priority: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:border-sky-500 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">General Description *</label>
              <Textarea
                placeholder="Provide a general description of the issue or project goals..."
                rows={5}
                value={basic.description}
                onChange={(e) => setBasic({ ...basic, description: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => {
                if (!basic.title || !basic.description) {
                  toast.error("Please fill in the project title and description.");
                  return;
                }
                setStep(2);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Location and Timeline */}
      {step === 2 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Step 2: Location & Schedule</CardTitle>
            <CardDescription className="text-[11px]">Define the job site coordinates and schedule parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <Input
                  placeholder="e.g. 505 Barton Springs Rd"
                  value={location.street}
                  onChange={(e) => setLocation({ ...location, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <Input
                    required
                    placeholder="e.g. Austin"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <Input
                    required
                    placeholder="e.g. Texas"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ZIP / Postal Code</label>
                  <Input
                    placeholder="e.g. 78704"
                    value={location.postalCode}
                    onChange={(e) => setLocation({ ...location, postalCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <Input
                    required
                    placeholder="e.g. United States"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude Coordinate</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude Coordinate</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={location.lng}
                    onChange={(e) => setLocation({ ...location, lng: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Mock Map / GPS selector illustration */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center space-y-2 relative h-40 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.05),transparent)]"></div>
              <MapPin className="h-8 w-8 text-sky-500 relative z-10 animate-bounce" />
              <p className="text-xs font-bold text-slate-800 relative z-10">Job Site Coordinates Set</p>
              <p className="text-[10px] text-slate-400 max-w-xs relative z-10">
                Map Selector Falls back to coordinates pre-fill ({location.lat}, {location.lng}) in prototype mode.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-750 mb-1">Estimated Start Date</label>
                <Input
                  type="date"
                  value={timeline.startDate}
                  onChange={(e) => setTimeline({ ...timeline, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-750 mb-1">Target Completion Date</label>
                <Input
                  type="date"
                  value={timeline.targetCompletionDate}
                  onChange={(e) => setTimeline({ ...timeline, targetCompletionDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => {
                if (!location.city || !location.state || !location.country) {
                  toast.error("Please complete the required location fields.");
                  return;
                }
                setStep(3);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Budget and Skills */}
      {step === 3 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Step 3: Budget & Skill Tags</CardTitle>
            <CardDescription className="text-[11px]">Define project allocations and required contractor skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget (USD) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min="0"
                  className="pl-8"
                  placeholder="e.g. 25000"
                  value={budget.estimatedBudget}
                  onChange={(e) => setBudget({ ...budget, estimatedBudget: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Contractor Skills</label>
              <Input
                placeholder="e.g. Asphalt Laydown, Road Patching, Compaction testing (comma separated)"
                value={budget.requiredSkills}
                onChange={(e) => setBudget({ ...budget, requiredSkills: e.target.value })}
              />
              <p className="text-[9px] text-slate-400 mt-1">
                Separate skills using commas. These will map with contractor profiles during search.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => {
                if (budget.estimatedBudget <= 0) {
                  toast.error("Please enter a valid budget amount.");
                  return;
                }
                setStep(4);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: AI Work Order and Milestones */}
      {step === 4 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Step 4: AI Assisted Work Order & Milestones</CardTitle>
              <CardDescription className="text-[11px]">Generate your detailed scope checklist and break down your budget.</CardDescription>
            </div>
            <Button
              onClick={handleGenerateAIWorkOrder}
              disabled={aiGenerating}
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xs flex items-center space-x-2 h-9 rounded-lg"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Generate AI Work Order</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Scope of Work */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scope of Work {workOrder.generatedByAI && <Badge variant="outline" className="ml-2 text-[9px] bg-sky-50 text-sky-700 border-sky-200">AI Generated</Badge>}
              </label>
              <Textarea
                placeholder="Scope details (will auto-populate on AI generation)..."
                rows={4}
                value={workOrder.scopeOfWork}
                onChange={(e) => setWorkOrder({ ...workOrder, scopeOfWork: e.target.value })}
              />
            </div>

            {/* suggested milestones listing */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Suggested Project Milestones</h4>
                <Button onClick={handleAddMilestone} size="sm" variant="outline" className="text-xs flex items-center space-x-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Milestone</span>
                </Button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400">No milestones defined yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Click "Generate AI Work Order" or "Add Milestone" to populate.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Input
                            placeholder="Milestone Name"
                            value={m.title}
                            onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                            className="bg-white text-xs font-bold h-8"
                          />
                        </div>
                        <div className="w-28 relative">
                          <DollarSign className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={m.amount}
                            onChange={(e) => handleMilestoneChange(idx, "amount", Number(e.target.value))}
                            className="bg-white text-xs font-semibold pl-6 h-8"
                          />
                        </div>
                        <Button
                          onClick={() => handleRemoveMilestone(idx)}
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-500 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <Textarea
                          placeholder="Milestone Description"
                          value={m.description}
                          onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                          rows={2}
                          className="bg-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Due Date</label>
                          <Input
                            type="date"
                            value={m.dueDate}
                            onChange={(e) => handleMilestoneChange(idx, "dueDate", e.target.value)}
                            className="bg-white text-xs h-8"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Required Evidence (Comma Separated)</label>
                          <Input
                            placeholder="GPS check-in, Site photos"
                            value={m.requiredEvidence.join(", ")}
                            onChange={(e) => handleMilestoneChange(idx, "requiredEvidence", e.target.value.split(",").map((s: string) => s.trim()))}
                            className="bg-white text-xs h-8"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Budget sum verification warning */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Total Milestone sum:{" "}
                      <span className="font-bold text-slate-800">
                        ${milestones.reduce((s, m) => s + Number(m.amount), 0).toLocaleString()}
                      </span>{" "}
                      / ${budget.estimatedBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => {
                if (!workOrder.scopeOfWork) {
                  toast.error("Please add a scope of work details.");
                  return;
                }
                setStep(5);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center space-x-2"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5: Review and Submit */}
      {step === 5 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Step 5: Review & Publish</CardTitle>
            <CardDescription className="text-[11px]">Confirm all details before submitting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Details Summary grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              <div>
                <p className="text-slate-400">Project Title</p>
                <p className="font-bold text-slate-900">{basic.title}</p>
              </div>
              <div>
                <p className="text-slate-400">Trade Category / Priority</p>
                <p className="font-bold text-slate-900 capitalize">
                  {basic.category} / {basic.priority.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Estimated Budget</p>
                <p className="font-bold text-slate-900">${budget.estimatedBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Location</p>
                <p className="font-bold text-slate-900 truncate">
                  {location.street ? `${location.street}, ` : ""}{location.city}, {location.state}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Start Date</p>
                <p className="font-bold text-slate-900">{timeline.startDate}</p>
              </div>
              <div>
                <p className="text-slate-400">Target End Date</p>
                <p className="font-bold text-slate-900">{timeline.targetCompletionDate}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Escrow Milestone Schedule Summary</h4>
              <div className="border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white text-xs">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50/50">
                    <div>
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-[10px] text-slate-500">{m.description.substring(0, 70)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">${m.amount.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400">Due: {m.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)} className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => handleSubmitProject("DRAFT")}
                className="border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Save as Draft
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleSubmitProject("PUBLISHED")}
                className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 shadow-md shadow-sky-500/10"
              >
                {loading ? "Publishing..." : "Publish Project"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
