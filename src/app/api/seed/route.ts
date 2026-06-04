import { NextResponse } from "next/server";
import { seedDatabase } from "@/scripts/seed";

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with demo Client, Contractor, Admin, Project, Milestones, and Testimonials.",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database.",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
