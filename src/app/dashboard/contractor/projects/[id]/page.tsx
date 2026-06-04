import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import WorkOrder from "@/models/WorkOrder";
import Milestone from "@/models/Milestone";
import MilestoneSubmission from "@/models/MilestoneSubmission";
import LocationCheckin from "@/models/LocationCheckin";
import ProjectAssignment from "@/models/ProjectAssignment";
import Payment from "@/models/Payment";
import ContractorProfile from "@/models/ContractorProfile";
import { connectToDatabase } from "@/lib/mongodb";
import ContractorProjectDetails from "@/components/projects/ContractorProjectDetails";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractorProjectDetailsPage({ params }: PageProps) {
  await connectToDatabase();
  const session = await getAuthSession();
  if (!session) return null;

  const { id } = await params;

  // Find Contractor User and Profile
  const dbUser = await User.findOne({ clerkUserId: session.userId });
  if (!dbUser || dbUser.role !== "CONTRACTOR") {
    return <p className="p-8 text-sm text-red-500">Access denied: Contractors only.</p>;
  }

  const profile = await ContractorProfile.findOne({ userId: dbUser._id });
  if (!profile) return <p className="p-8 text-sm">Contractor profile not found.</p>;

  // 1. Fetch Project
  const project = await Project.findById(id)
    .populate("clientUserId")
    .populate("organizationId");

  if (!project) {
    notFound();
  }

  // Verify assignment or invite exists
  const assignment = await ProjectAssignment.findOne({
    projectId: project._id,
    contractorUserId: dbUser._id,
  });

  if (!assignment && dbUser.role !== "ADMIN") {
    return <p className="p-8 text-sm text-red-500">Access denied: You are not assigned to this project.</p>;
  }

  // 2. Fetch WorkOrder
  const workOrder = await WorkOrder.findOne({ projectId: project._id });

  // 3. Fetch Milestones
  const milestones = await Milestone.find({ projectId: project._id }).sort({ order: 1 });

  // 4. Fetch Submissions
  const submissions = await MilestoneSubmission.find({
    projectId: project._id,
    contractorUserId: dbUser._id,
  }).sort({ submittedAt: -1 });

  // 5. Fetch GPS check-ins
  const checkins = await LocationCheckin.find({
    projectId: project._id,
    contractorUserId: dbUser._id,
  }).sort({ timestamp: -1 });

  // 6. Fetch Payments
  const payments = await Payment.find({
    projectId: project._id,
    contractorUserId: dbUser._id,
  });

  // Serialize Mongoose objects
  const serializedProject = JSON.parse(JSON.stringify(project));
  const serializedWorkOrder = workOrder ? JSON.parse(JSON.stringify(workOrder)) : null;
  const serializedMilestones = JSON.parse(JSON.stringify(milestones));
  const serializedSubmissions = JSON.parse(JSON.stringify(submissions));
  const serializedCheckins = JSON.parse(JSON.stringify(checkins));
  const serializedPayments = JSON.parse(JSON.stringify(payments));
  const serializedAssignment = assignment ? JSON.parse(JSON.stringify(assignment)) : null;

  return (
    <ContractorProjectDetails
      project={serializedProject}
      workOrder={serializedWorkOrder}
      milestones={serializedMilestones}
      submissions={serializedSubmissions}
      checkins={serializedCheckins}
      payments={serializedPayments}
      assignment={serializedAssignment}
      contractorUserId={dbUser._id.toString()}
    />
  );
}
