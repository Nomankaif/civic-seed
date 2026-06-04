import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import User from "../models/User";
import { hashPassword } from "../lib/auth";
import Organization from "../models/Organization";
import ContractorProfile from "../models/ContractorProfile";
import Project from "../models/Project";
import Milestone from "../models/Milestone";
import Testimonial from "../models/Testimonial";
import AuditLog from "../models/AuditLog";
import Notification from "../models/Notification";
import ContactRequest from "../models/ContactRequest";
import Payment from "../models/Payment";
import MilestoneSubmission from "../models/MilestoneSubmission";
import LocationCheckin from "../models/LocationCheckin";
import DocumentModel from "../models/Document";
import Dispute from "../models/Dispute";
import ProjectAssignment from "../models/ProjectAssignment";

export async function seedDatabase() {
  console.log("Starting database seeding...");
  await connectToDatabase();

  // Clear existing collections
  await User.deleteMany({});
  await Organization.deleteMany({});
  await ContractorProfile.deleteMany({});
  await Project.deleteMany({});
  await Milestone.deleteMany({});
  await Testimonial.deleteMany({});
  await AuditLog.deleteMany({});
  await Notification.deleteMany({});
  await ContactRequest.deleteMany({});
  await Payment.deleteMany({});
  await MilestoneSubmission.deleteMany({});
  await LocationCheckin.deleteMany({});
  await DocumentModel.deleteMany({});
  await Dispute.deleteMany({});
  await ProjectAssignment.deleteMany({});

  console.log("All collections cleared.");

  // 1. Seed Users
  const clientUser = await User.create({
    clerkUserId: "mock_client",
    email: "client@civicbuild.com",
    fullName: "City Infrastructure Department",
    role: "CLIENT",
    password: hashPassword("password123"),
    profileImageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150",
    onboardingCompleted: true,
  });

  const contractorUser = await User.create({
    clerkUserId: "mock_contractor",
    email: "contractor@civicbuild.com",
    fullName: "Lone Star Surface Repairs",
    role: "CONTRACTOR",
    password: hashPassword("password123"),
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    onboardingCompleted: true,
  });

  const adminUser = await User.create({
    clerkUserId: "mock_admin",
    email: "admin@civicbuild.com",
    fullName: "Platform Administrator",
    role: "ADMIN",
    password: hashPassword("password123"),
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    onboardingCompleted: true,
  });

  console.log("Users seeded successfully.");

  // 2. Seed Organization for Client
  const organization = await Organization.create({
    ownerUserId: clientUser._id,
    name: "City Infrastructure Department",
    organizationType: "GOVERNMENT",
    departmentOrIndustry: "Public Works",
    phone: "512-555-0199",
    address: {
      street: "123 Congress Ave",
      city: "Austin",
      state: "Texas",
      postalCode: "78701",
      country: "United States",
    },
    logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150",
  });

  // 3. Seed Contractor Profile
  const contractorProfile = await ContractorProfile.create({
    userId: contractorUser._id,
    businessName: "Lone Star Surface Repairs",
    description: "Lone Star Surface Repairs is Austin's premium asphalt and concrete maintenance provider, specializing in municipal and commercial rehabilitation works.",
    tradeCategories: ["Asphalt Repair", "Concrete Paving"],
    skills: ["Parking lot repair", "Surface resurfacing", "Road patching"],
    serviceLocations: ["Austin, Texas", "Round Rock, Texas"],
    yearsOfExperience: 8,
    completedProjectsCount: 14,
    rating: 4.7,
    available: true,
    verificationStatus: "DEMO_VERIFIED",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  });

  console.log("Profiles seeded successfully.");

  // 4. Seed Project
  const project = await Project.create({
    clientUserId: clientUser._id,
    organizationId: organization._id,
    assignedContractorId: contractorProfile._id,
    title: "Municipal Office Parking Lot Repair",
    category: "Asphalt Repair",
    description: "Resurfacing and road patching at the main municipal office parking lot. The project requires high durability asphalt repair due to public bus transit routes.",
    priority: "HIGH",
    address: {
      street: "505 Barton Springs Rd",
      city: "Austin",
      state: "Texas",
      postalCode: "78704",
      country: "United States",
    },
    location: {
      type: "Point",
      coordinates: [-97.7495, 30.2582], // [longitude, latitude]
    },
    estimatedBudget: 25000,
    currency: "USD",
    requiredSkills: ["Parking lot repair", "Surface resurfacing", "Road patching"],
    startDate: new Date(),
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "IN_PROGRESS",
    attachments: [],
  });

  // Create Assignment
  await ProjectAssignment.create({
    projectId: project._id,
    clientUserId: clientUser._id,
    contractorUserId: contractorUser._id,
    status: "ACCEPTED",
    assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    respondedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    notes: "Assigned for immediate pavement repairs.",
  });

  console.log("Project and Assignment seeded.");

  // 5. Seed Milestones
  const milestone1 = await Milestone.create({
    projectId: project._id,
    title: "Site Inspection",
    description: "Conduct initial site inspection, capture GPS check-in at Barton Springs, and take initial site photos.",
    order: 1,
    amount: 2500,
    currency: "USD",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    requiredEvidence: ["GPS check-in", "Initial site photos"],
    status: "NOT_STARTED",
    paymentStatus: "NOT_FUNDED",
  });

  const milestone2 = await Milestone.create({
    projectId: project._id,
    title: "Surface Repair Work",
    description: "Asphalt excavation, sub-grade preparation, and application of premium-grade surface sealant.",
    order: 2,
    amount: 15000,
    currency: "USD",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    requiredEvidence: ["Progress photos", "Work notes"],
    status: "NOT_STARTED",
    paymentStatus: "NOT_FUNDED",
  });

  const milestone3 = await Milestone.create({
    projectId: project._id,
    title: "Completion and Inspection",
    description: "Final layout painting, speed bump installation, and comprehensive site clean-up. Submit final completion report.",
    order: 3,
    amount: 7500,
    currency: "USD",
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    requiredEvidence: ["Final photos", "Completion report"],
    status: "NOT_STARTED",
    paymentStatus: "NOT_FUNDED",
  });

  console.log("Milestones seeded.");

  // 6. Seed Testimonials
  await Testimonial.create({
    clientName: "David Vance",
    organization: "Austin Public Works Department",
    quote: "CivicBuild Connect revolutionized how we track asphalt repairs. The GPS check-ins verify that work is actually completed on-site before we release public funds.",
    rating: 5,
    isApproved: true,
  });

  await Testimonial.create({
    clientName: "Elena Rostova",
    organization: "Lone Star Contractors Alliance",
    quote: "As a contractor, the milestone-based payment release gives us the cash-flow visibility we need to run municipal paving projects with confidence.",
    rating: 5,
    isApproved: true,
  });

  // 7. Seed Contact Request
  await ContactRequest.create({
    fullName: "Sarah Jenkins",
    email: "sjenkins@houstontx.gov",
    organization: "City of Houston Public Works",
    phone: "713-555-0123",
    message: "We are interested in licensing CivicBuild Connect for our regional contractors database. Do you support custom GIS shapefile uploads?",
    status: "NEW",
  });

  // 8. Seed Audit Logs
  await AuditLog.create({
    actorUserId: clientUser._id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: clientUser._id,
    metadata: { role: "CLIENT", email: clientUser.email },
  });

  await AuditLog.create({
    actorUserId: contractorUser._id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: contractorUser._id,
    metadata: { role: "CONTRACTOR", email: contractorUser.email },
  });

  await AuditLog.create({
    actorUserId: clientUser._id,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: project._id,
    metadata: { title: project.title, budget: project.estimatedBudget },
  });

  await AuditLog.create({
    actorUserId: clientUser._id,
    action: "CONTRACTOR_ASSIGNED",
    entityType: "Project",
    entityId: project._id,
    metadata: { contractorUserId: contractorUser._id, businessName: contractorProfile.businessName },
  });

  console.log("Audit logs and contact request seeded.");
  console.log("Database seeding completed successfully!");
}

// Allow execution direct from command-line if needed
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Command line seed finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Command line seed failed:", err);
      process.exit(1);
    });
}
