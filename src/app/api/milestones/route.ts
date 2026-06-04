import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Project from "@/models/Project";
import Milestone from "@/models/Milestone";
import MilestoneSubmission from "@/models/MilestoneSubmission";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";
import ContractorProfile from "@/models/ContractorProfile";
import { connectToDatabase } from "@/lib/mongodb";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await User.findOne({ clerkUserId: session.userId });
    if (!dbUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const body = await req.json();
    const { action, milestoneId } = body;

    if (!milestoneId || !action) {
      return NextResponse.json({ success: false, message: "Milestone ID and action are required" }, { status: 400 });
    }

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return NextResponse.json({ success: false, message: "Milestone not found" }, { status: 404 });

    const project = await Project.findById(milestone.projectId);
    if (!project) return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });

    // Identify roles
    const isClient = project.clientUserId.toString() === dbUser._id.toString() || dbUser.role === "ADMIN";
    
    // Find contractor user
    let isContractor = false;
    let contractorProfile = null;
    if (project.assignedContractorId) {
      contractorProfile = await ContractorProfile.findById(project.assignedContractorId);
      if (contractorProfile && contractorProfile.userId.toString() === dbUser._id.toString()) {
        isContractor = true;
      }
    }

    // ----------------------------------------------------
    // Action 1: START (Contractor starts work)
    // ----------------------------------------------------
    if (action === "start") {
      if (!isContractor) return NextResponse.json({ success: false, message: "Only assigned contractor can start work" }, { status: 403 });
      
      milestone.status = "IN_PROGRESS";
      await milestone.save();

      // Notify Client
      await Notification.create({
        recipientUserId: project.clientUserId,
        title: "Milestone Started",
        message: `Contractor started work on Milestone: "${milestone.title}" for project "${project.title}".`,
        type: "SUBMISSION",
        relatedProjectId: project._id,
      });

      await logAudit({
        actorUserId: dbUser._id,
        action: "MILESTONE_STARTED",
        entityType: "Milestone",
        entityId: milestone._id,
        metadata: { title: milestone.title },
      });

      return NextResponse.json({ success: true, milestone });
    }

    // ----------------------------------------------------
    // Action 2: FUND (Client funds milestone in Stripe Connect)
    // ----------------------------------------------------
    if (action === "fund") {
      if (!isClient) return NextResponse.json({ success: false, message: "Only project client owner can fund milestones" }, { status: 403 });

      // Simulate Stripe Payment Intent
      const stripePaymentId = "pi_mock_" + Math.random().toString(36).substring(2, 12);
      
      const payment = await Payment.create({
        projectId: project._id,
        milestoneId: milestone._id,
        clientUserId: project.clientUserId,
        contractorUserId: contractorProfile?.userId || dbUser._id, // fallbacks
        amount: milestone.amount,
        currency: milestone.currency,
        stripePaymentIntentId: stripePaymentId,
        status: "FUNDED_TEST_MODE",
        isTestMode: true,
        fundedAt: new Date(),
      });

      milestone.paymentStatus = "FUNDED_TEST_MODE";
      await milestone.save();

      // Notify Contractor
      if (contractorProfile?.userId) {
        await Notification.create({
          recipientUserId: contractorProfile.userId,
          title: "Milestone Funded (Test Mode)",
          message: `Milestone "${milestone.title}" has been funded ($${milestone.amount.toLocaleString()}) on the Stripe test network.`,
          type: "PAYMENT",
          relatedProjectId: project._id,
        });
      }

      await logAudit({
        actorUserId: dbUser._id,
        action: "PAYMENT_FUNDED",
        entityType: "Payment",
        entityId: payment._id,
        metadata: { milestoneTitle: milestone.title, amount: payment.amount, paymentIntent: stripePaymentId },
      });

      return NextResponse.json({ success: true, milestone, payment });
    }

    // ----------------------------------------------------
    // Action 3: SUBMIT (Contractor submits progress deliverables)
    // ----------------------------------------------------
    if (action === "submit") {
      if (!isContractor) return NextResponse.json({ success: false, message: "Only assigned contractor can submit evidence" }, { status: 403 });

      const { workSummary, completionPercentage, attachmentIds, locationCheckinId } = body;

      if (!workSummary || completionPercentage === undefined) {
        return NextResponse.json({ success: false, message: "Work summary and completion percentage are required" }, { status: 400 });
      }

      const submission = await MilestoneSubmission.create({
        projectId: project._id,
        milestoneId: milestone._id,
        contractorUserId: dbUser._id,
        workSummary,
        completionPercentage: Number(completionPercentage),
        attachmentIds: attachmentIds || [],
        locationCheckinId: locationCheckinId ? locationCheckinId : undefined,
        submittedAt: new Date(),
        reviewStatus: "SUBMITTED",
      });

      milestone.status = "SUBMITTED";
      await milestone.save();

      // Notify Client
      await Notification.create({
        recipientUserId: project.clientUserId,
        title: "Milestone Deliverables Submitted",
        message: `Milestone "${milestone.title}" has been submitted for review by "${dbUser.fullName}".`,
        type: "SUBMISSION",
        relatedProjectId: project._id,
      });

      await logAudit({
        actorUserId: dbUser._id,
        action: "MILESTONE_SUBMITTED",
        entityType: "MilestoneSubmission",
        entityId: submission._id,
        metadata: { milestoneTitle: milestone.title, completion: submission.completionPercentage },
      });

      return NextResponse.json({ success: true, milestone, submission });
    }

    // ----------------------------------------------------
    // Action 4: REVIEW (Client approves or requests revision)
    // ----------------------------------------------------
    if (action === "review") {
      if (!isClient) return NextResponse.json({ success: false, message: "Only client owner can review milestone" }, { status: 403 });

      const { reviewStatus, clientComments } = body; // APPROVED | REVISION_REQUESTED

      if (!reviewStatus || !["APPROVED", "REVISION_REQUESTED"].includes(reviewStatus)) {
        return NextResponse.json({ success: false, message: "Invalid review status" }, { status: 400 });
      }

      // Update submission record
      const submission = await MilestoneSubmission.findOne({ milestoneId: milestone._id }).sort({ submittedAt: -1 });
      if (submission) {
        submission.reviewStatus = reviewStatus;
        submission.clientComments = clientComments;
        submission.reviewedAt = new Date();
        await submission.save();
      }

      if (reviewStatus === "APPROVED") {
        milestone.status = "APPROVED";
        milestone.approvedAt = new Date();
        milestone.approvalNotes = clientComments;
        
        // If payment is funded, make it eligible for release
        if (milestone.paymentStatus === "FUNDED_TEST_MODE") {
          milestone.paymentStatus = "RELEASE_ELIGIBLE";
        }
        await milestone.save();

        // Update Project Status if all milestones approved
        const allMilestones = await Milestone.find({ projectId: project._id });
        const allApproved = allMilestones.every((m) => m.status === "APPROVED" || m.status === "PAYMENT_RELEASED");
        if (allApproved) {
          project.status = "COMPLETED";
          await project.save();
        } else {
          project.status = "IN_PROGRESS";
          await project.save();
        }

        // Notify Contractor
        if (contractorProfile?.userId) {
          await Notification.create({
            recipientUserId: contractorProfile.userId,
            title: "Milestone Approved!",
            message: `Milestone "${milestone.title}" has been approved by the client.`,
            type: "SUBMISSION",
            relatedProjectId: project._id,
          });
        }

        await logAudit({
          actorUserId: dbUser._id,
          action: "MILESTONE_APPROVED",
          entityType: "Milestone",
          entityId: milestone._id,
          metadata: { title: milestone.title },
        });

      } else {
        milestone.status = "REVISION_REQUESTED";
        milestone.approvalNotes = clientComments;
        await milestone.save();

        // Notify Contractor
        if (contractorProfile?.userId) {
          await Notification.create({
            recipientUserId: contractorProfile.userId,
            title: "Milestone Revision Requested",
            message: `Client requested corrections on milestone "${milestone.title}". Feedback: ${clientComments}`,
            type: "SUBMISSION",
            relatedProjectId: project._id,
          });
        }

        await logAudit({
          actorUserId: dbUser._id,
          action: "MILESTONE_REVISION_REQUESTED",
          entityType: "Milestone",
          entityId: milestone._id,
          metadata: { title: milestone.title, comments: clientComments },
        });
      }

      return NextResponse.json({ success: true, milestone });
    }

    // ----------------------------------------------------
    // Action 5: RELEASE (Client releases payment from escrow)
    // ----------------------------------------------------
    if (action === "release") {
      if (!isClient) return NextResponse.json({ success: false, message: "Only client owner can release payments" }, { status: 403 });

      // Find funded payment
      const payment = await Payment.findOne({ milestoneId: milestone._id, status: { $in: ["FUNDED_TEST_MODE", "RELEASE_ELIGIBLE"] } });
      if (!payment) {
        return NextResponse.json({ success: false, message: "No funded Stripe test payment found for this milestone" }, { status: 400 });
      }

      payment.status = "RELEASED_TEST_MODE";
      payment.releasedAt = new Date();
      await payment.save();

      milestone.paymentStatus = "RELEASED_TEST_MODE";
      milestone.status = "PAYMENT_RELEASED";
      await milestone.save();

      // Notify Contractor
      if (contractorProfile?.userId) {
        await Notification.create({
          recipientUserId: contractorProfile.userId,
          title: "Escrow Payment Released!",
          message: `Stripe test mode funds ($${payment.amount.toLocaleString()}) have been released for milestone "${milestone.title}".`,
          type: "PAYMENT",
          relatedProjectId: project._id,
        });
      }

      await logAudit({
        actorUserId: dbUser._id,
        action: "PAYMENT_RELEASED",
        entityType: "Payment",
        entityId: payment._id,
        metadata: { milestoneTitle: milestone.title, amount: payment.amount },
      });

      return NextResponse.json({ success: true, milestone, payment });
    }

    return NextResponse.json({ success: false, message: "Invalid milestone action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Milestone action handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
