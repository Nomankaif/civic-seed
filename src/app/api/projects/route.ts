import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Organization from "@/models/Organization";
import Project from "@/models/Project";
import WorkOrder from "@/models/WorkOrder";
import Milestone from "@/models/Milestone";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/mongodb";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    let projects = [];
    if (dbUser.role === "CLIENT") {
      projects = await Project.find({ clientUserId: dbUser._id }).sort({ createdAt: -1 });
    } else if (dbUser.role === "ADMIN") {
      projects = await Project.find({}).sort({ createdAt: -1 });
    } else {
      // Contractor: Fetch projects assigned to them
      const { default: ContractorProfile } = await import("@/models/ContractorProfile");
      const profile = await ContractorProfile.findOne({ userId: dbUser._id });
      if (profile) {
        projects = await Project.find({ assignedContractorId: profile._id }).sort({ createdAt: -1 });
      }
    }

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session || session.role !== "CLIENT") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Get Organization
    const organization = await Organization.findOne({ ownerUserId: dbUser._id });

    const body = await req.json();
    const {
      title,
      category,
      description,
      priority,
      address,
      location,
      estimatedBudget,
      requiredSkills,
      startDate,
      targetCompletionDate,
      status, // "DRAFT" | "PUBLISHED"
      workOrderData,
      milestonesData,
    } = body;

    if (!title || !category || !description || !estimatedBudget || !address?.city || !address?.state || !address?.country) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 1. Create Project
    const project = await Project.create({
      clientUserId: dbUser._id,
      organizationId: organization?._id,
      title,
      category,
      description,
      priority: priority || "MEDIUM",
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      location: {
        type: "Point",
        coordinates: [Number(location?.lng || 0), Number(location?.lat || 0)], // GeoJSON format: [longitude, latitude]
      },
      estimatedBudget: Number(estimatedBudget),
      currency: "USD",
      requiredSkills: requiredSkills || [],
      startDate: new Date(startDate || Date.now()),
      targetCompletionDate: new Date(targetCompletionDate || Date.now()),
      status: status || "DRAFT",
      attachments: [],
    });

    // 2. Create WorkOrder if provided
    let workOrder = null;
    if (workOrderData) {
      workOrder = await WorkOrder.create({
        projectId: project._id,
        generatedByAI: !!workOrderData.generatedByAI,
        inputPrompt: workOrderData.inputPrompt,
        scopeOfWork: workOrderData.scopeOfWork || description,
        deliverables: workOrderData.deliverables || [],
        requiredSkills: workOrderData.requiredSkills || requiredSkills || [],
        evidenceChecklist: workOrderData.evidenceChecklist || [],
        suggestedMilestones: workOrderData.suggestedMilestones || [],
        notes: workOrderData.notes || [],
        approvedByClient: true, // Approved when submitted
      });
    }

    // 3. Create Milestones
    const createdMilestones = [];
    if (milestonesData && Array.isArray(milestonesData)) {
      for (let i = 0; i < milestonesData.length; i++) {
        const m = milestonesData[i];
        const milestone = await Milestone.create({
          projectId: project._id,
          title: m.title || m.name,
          description: m.description,
          order: i + 1,
          amount: Number(m.amount),
          currency: "USD",
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          requiredEvidence: m.requiredEvidence || [],
          status: "NOT_STARTED",
          paymentStatus: "NOT_FUNDED",
        });
        createdMilestones.push(milestone);
      }
    }

    // Log Audit Action
    await logAudit({
      actorUserId: dbUser._id,
      action: "PROJECT_CREATED",
      entityType: "Project",
      entityId: project._id,
      metadata: { title: project.title, budget: project.estimatedBudget, status: project.status },
    });

    // Notify Client
    await Notification.create({
      recipientUserId: dbUser._id,
      title: "Project Created",
      message: `Your project "${project.title}" has been successfully created as a ${project.status.toLowerCase()}.`,
      type: "SYSTEM",
      relatedProjectId: project._id,
    });

    return NextResponse.json({
      success: true,
      project,
      workOrder,
      milestones: createdMilestones,
    });
  } catch (error: any) {
    console.error("Project creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
