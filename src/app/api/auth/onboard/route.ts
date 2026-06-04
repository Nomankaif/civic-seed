import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import User from "@/models/User";
import Organization from "@/models/Organization";
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

    const user = await User.findOne({ clerkUserId: session.userId });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    if (user.role === "CLIENT") {
      const { name, organizationType, departmentOrIndustry, phone, address, logoUrl } = body;
      
      if (!name || !organizationType) {
        return NextResponse.json({ success: false, message: "Organization name and type are required" }, { status: 400 });
      }

      // Check if Org already exists
      let org = await Organization.findOne({ ownerUserId: user._id });
      if (org) {
        org.name = name;
        org.organizationType = organizationType;
        org.departmentOrIndustry = departmentOrIndustry;
        org.phone = phone;
        org.address = address;
        org.logoUrl = logoUrl;
        await org.save();
      } else {
        org = await Organization.create({
          ownerUserId: user._id,
          name,
          organizationType,
          departmentOrIndustry,
          phone,
          address,
          logoUrl,
        });
      }

      user.onboardingCompleted = true;
      await user.save();

      await logAudit({
        actorUserId: user._id,
        action: "CLIENT_ONBOARDED",
        entityType: "Organization",
        entityId: org._id,
        metadata: { orgName: org.name, orgType: org.organizationType },
      });

      return NextResponse.json({ success: true, user, organization: org });
    } 
    
    if (user.role === "CONTRACTOR") {
      const {
        businessName,
        description,
        tradeCategories,
        skills,
        serviceLocations,
        yearsOfExperience,
        profileImageUrl,
      } = body;

      if (!businessName || !description || !yearsOfExperience) {
        return NextResponse.json({ success: false, message: "Business name, description, and years of experience are required" }, { status: 400 });
      }

      let profile = await ContractorProfile.findOne({ userId: user._id });
      if (profile) {
        profile.businessName = businessName;
        profile.description = description;
        profile.tradeCategories = tradeCategories || [];
        profile.skills = skills || [];
        profile.serviceLocations = serviceLocations || [];
        profile.yearsOfExperience = Number(yearsOfExperience);
        profile.profileImageUrl = profileImageUrl || user.profileImageUrl;
        await profile.save();
      } else {
        profile = await ContractorProfile.create({
          userId: user._id,
          businessName,
          description,
          tradeCategories: tradeCategories || [],
          skills: skills || [],
          serviceLocations: serviceLocations || [],
          yearsOfExperience: Number(yearsOfExperience),
          completedProjectsCount: 0,
          rating: 5.0,
          available: true,
          verificationStatus: "UNVERIFIED",
          profileImageUrl: profileImageUrl || user.profileImageUrl,
        });
      }

      user.onboardingCompleted = true;
      if (profileImageUrl) {
        user.profileImageUrl = profileImageUrl;
      }
      await user.save();

      await logAudit({
        actorUserId: user._id,
        action: "CONTRACTOR_ONBOARDED",
        entityType: "ContractorProfile",
        entityId: profile._id,
        metadata: { businessName: profile.businessName },
      });

      return NextResponse.json({ success: true, user, contractorProfile: profile });
    }

    // Admins don't need organization or contractor profiles, just flag onboarding as completed
    if (user.role === "ADMIN") {
      user.onboardingCompleted = true;
      await user.save();
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, message: "Invalid user role" }, { status: 400 });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
