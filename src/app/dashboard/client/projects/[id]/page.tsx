import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import WorkOrder from "@/models/WorkOrder";
import Milestone from "@/models/Milestone";
import MilestoneSubmission from "@/models/MilestoneSubmission";
import LocationCheckin from "@/models/LocationCheckin";
import ContractorProfile from "@/models/ContractorProfile";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";
import ClientProjectDetails from "@/components/projects/ClientProjectDetails";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientProjectDetailsPage({ params }: PageProps) {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const { id } = await params;

  // 1. Fetch Project
  const project = await Project.findById(id)
    .populate({
      path: "assignedContractorId",
      populate: { path: "userId" },
    });

  if (!project) {
    notFound();
  }

  // Verify ownership
  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || (dbUser.role !== "ADMIN" && project.clientUserId.toString() !== dbUser._id.toString())) {
    return <p className="p-8 text-sm text-red-500">Access denied: You do not own this project.</p>;
  }

  // 2. Fetch WorkOrder
  const workOrder = await WorkOrder.findOne({ projectId: project._id });

  // 3. Fetch Milestones
  const milestones = await Milestone.find({ projectId: project._id }).sort({ order: 1 });

  // 4. Fetch Milestone Submissions
  const submissions = await MilestoneSubmission.find({ projectId: project._id })
    .sort({ submittedAt: -1 })
    .populate("attachmentIds");

  // 5. Fetch GPS check-ins
  const checkins = await LocationCheckin.find({ projectId: project._id }).sort({ timestamp: -1 });

  // 6. Fetch Stripe test payments
  const payments = await Payment.find({ projectId: project._id });

  // 7. Fetch all contractors (for assignment selection list)
  const contractors = await ContractorProfile.find({ available: true }).populate("userId");

  // Parse mongoose objects safely to plain objects for JSON serialization
  const serializedProject = JSON.parse(JSON.stringify(project));
  const serializedWorkOrder = workOrder ? JSON.parse(JSON.stringify(workOrder)) : null;
  const serializedMilestones = JSON.parse(JSON.stringify(milestones));
  const serializedSubmissions = JSON.parse(JSON.stringify(submissions));
  const serializedCheckins = JSON.parse(JSON.stringify(checkins));
  const serializedPayments = JSON.parse(JSON.stringify(payments));
  const serializedContractors = JSON.parse(JSON.stringify(contractors));

  return (
    <ClientProjectDetails
      project={serializedProject}
      workOrder={serializedWorkOrder}
      milestones={serializedMilestones}
      submissions={serializedSubmissions}
      checkins={serializedCheckins}
      payments={serializedPayments}
      contractors={serializedContractors}
      clientId={dbUser._id.toString()}
    />
  );
}
