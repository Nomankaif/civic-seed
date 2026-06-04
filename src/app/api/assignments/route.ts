import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import ContractorProfile from "@/models/ContractorProfile";
import ProjectAssignment from "@/models/ProjectAssignment";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/mongodb";
import { logAudit } from "@/lib/audit";

// GET assignments for active user
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    let assignments = [];
    if (dbUser.role === "CLIENT") {
      assignments = await ProjectAssignment.find({ clientUserId: dbUser._id })
        .populate("projectId")
        .populate("contractorUserId");
    } else if (dbUser.role === "CONTRACTOR") {
      assignments = await ProjectAssignment.find({ contractorUserId: dbUser._id, status: "PENDING" })
        .populate("projectId")
        .populate("clientUserId");
    }

    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Client assigns contractor
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session || session.role !== "CLIENT") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { projectId, contractorProfileId, notes } = await req.json();

    if (!projectId || !contractorProfileId) {
      return NextResponse.json({ success: false, message: "Project ID and Contractor Profile ID are required" }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

    const profile = await ContractorProfile.findById(contractorProfileId);
    if (!profile) return NextResponse.json({ success: false, message: "Contractor profile not found" }, { status: 404 });

    // Check if contractor profile has linked user
    const contractorUser = await User.findById(profile.userId);
    if (!contractorUser) return NextResponse.json({ success: false, message: "Contractor user account not found" }, { status: 404 });

    // Verify project has no accepted assignment
    const activeAssign = await ProjectAssignment.findOne({ projectId: project._id, status: "ACCEPTED" });
    if (activeAssign) {
      return NextResponse.json({ success: false, message: "Project already has an active contractor" }, { status: 400 });
    }

    // Create assignment request
    const assignment = await ProjectAssignment.create({
      projectId: project._id,
      clientUserId: dbUser._id,
      contractorUserId: contractorUser._id,
      status: "PENDING",
      notes,
    });

    // Notify Contractor
    await Notification.create({
      recipientUserId: contractorUser._id,
      title: "New Project Assignment Request",
      message: `You have been requested for "${project.title}" by "${dbUser.fullName}". Review details and accept.`,
      type: "ASSIGNMENT",
      relatedProjectId: project._id,
    });

    await logAudit({
      actorUserId: dbUser._id,
      action: "CONTRACTOR_INVITED",
      entityType: "ProjectAssignment",
      entityId: assignment._id,
      metadata: { projectId: project._id, contractorName: profile.businessName },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("Assignment invite error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Contractor responds (accept/reject)
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session || session.role !== "CONTRACTOR") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const { assignmentId, action } = await req.json(); // action: "ACCEPT" | "REJECT"

    if (!assignmentId || !action) {
      return NextResponse.json({ success: false, message: "Assignment ID and action are required" }, { status: 400 });
    }

    const assignment = await ProjectAssignment.findById(assignmentId);
    if (!assignment) return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });

    if (assignment.contractorUserId.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 401 });
    }

    const project = await Project.findById(assignment.projectId);
    if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

    const contractorProfile = await ContractorProfile.findOne({ userId: dbUser._id });

    if (action === "ACCEPT") {
      assignment.status = "ACCEPTED";
      assignment.respondedAt = new Date();
      await assignment.save();

      // Update project status & assign contractor
      project.status = "CONTRACTOR_ASSIGNED";
      project.assignedContractorId = contractorProfile?._id;
      await project.save();

      // Notify Client
      await Notification.create({
        recipientUserId: assignment.clientUserId,
        title: "Assignment Accepted",
        message: `Contractor "${contractorProfile?.businessName || dbUser.fullName}" accepted your assignment request for "${project.title}".`,
        type: "ASSIGNMENT",
        relatedProjectId: project._id,
      });

      // Audit log
      await logAudit({
        actorUserId: dbUser._id,
        action: "ASSIGNMENT_ACCEPTED",
        entityType: "Project",
        entityId: project._id,
        metadata: { businessName: contractorProfile?.businessName },
      });

      return NextResponse.json({ success: true, assignment, project });
    }

    if (action === "REJECT") {
      assignment.status = "REJECTED";
      assignment.respondedAt = new Date();
      await assignment.save();

      // Notify Client
      await Notification.create({
        recipientUserId: assignment.clientUserId,
        title: "Assignment Declined",
        message: `Contractor "${contractorProfile?.businessName || dbUser.fullName}" declined your assignment request for "${project.title}".`,
        type: "ASSIGNMENT",
        relatedProjectId: project._id,
      });

      await logAudit({
        actorUserId: dbUser._id,
        action: "ASSIGNMENT_DECLINED",
        entityType: "ProjectAssignment",
        entityId: assignment._id,
        metadata: { projectId: project._id },
      });

      return NextResponse.json({ success: true, assignment });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Assignment response error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
