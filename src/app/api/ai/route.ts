import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateAIWorkOrder } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, description, city, state, budget, dueDate } = body;

    if (!title || !category || !description || !city || !state || !budget) {
      return NextResponse.json(
        { success: false, message: "Missing required fields for work order generation" },
        { status: 400 }
      );
    }

    const workOrder = await generateAIWorkOrder({
      title,
      category,
      description,
      city,
      state,
      budget: Number(budget),
      dueDate,
    });

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error("AI Generation endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
