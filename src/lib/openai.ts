import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface WorkOrderOutput {
  scopeOfWork: string;
  deliverables: string[];
  requiredSkills: string[];
  evidenceChecklist: string[];
  suggestedMilestones: Array<{
    name: string;
    description: string;
    suggestedPercentage: number;
    requiredEvidence: string[];
  }>;
  notes: string[];
}

export async function generateAIWorkOrder(params: {
  title: string;
  category: string;
  description: string;
  city: string;
  state: string;
  budget: number;
  dueDate?: string;
}): Promise<WorkOrderOutput> {
  const { title, category, description, city, state, budget } = params;

  if (openai) {
    try {
      const prompt = `
        You are a senior civil engineer. Generate a structured project work order in JSON format.
        
        PROJECT DETAILS:
        - Title: ${title}
        - Category: ${category}
        - Description: ${description}
        - Location: ${city}, ${state}
        - Total Budget: USD ${budget}
        
        OUTPUT FORMAT (JSON):
        Return ONLY a JSON object matching this TypeScript structure:
        {
          "scopeOfWork": "detailed description of work scope",
          "deliverables": ["list", "of", "deliverables"],
          "requiredSkills": ["list", "of", "skills"],
          "evidenceChecklist": ["list", "of", "evidence", "checklists"],
          "suggestedMilestones": [
            {
              "name": "Milestone name",
              "description": "Milestone details",
              "suggestedPercentage": 20, // percentage of total budget e.g. 10, 50, 30 (summing to 100)
              "requiredEvidence": ["evidence 1", "evidence 2"]
            }
          ],
          "notes": ["safety or compliance notes"]
        }
        
        Do not return any markdown wraps (like \`\`\`json). Just the raw JSON string.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const text = response.choices[0]?.message?.content || "";
      return JSON.parse(text) as WorkOrderOutput;
    } catch (error) {
      console.warn("OpenAI generation failed, falling back to mock generator:", error);
    }
  }

  // Fallback mock generator
  return getMockWorkOrder(category, title, description, budget);
}

function getMockWorkOrder(category: string, title: string, description: string, budget: number): WorkOrderOutput {
  // Build a custom template based on the category
  const lowerCat = category.toLowerCase();
  
  if (lowerCat.includes("asphalt") || lowerCat.includes("paving") || lowerCat.includes("road")) {
    return {
      scopeOfWork: `Asphalt resurfacing and site preparation for "${title}". This includes marking out defective sections, excavation of failed base materials, laying down prime sealer, and applying hot-mix asphalt layers.`,
      deliverables: [
        "Excavated defective pavement up to 2 inches depth",
        "Tack coat adhesive sealer applied uniformly",
        "Hot mix asphalt laid and compacted using high-tonnage rollers",
        "Pavement lining and safety striping applied according to specification"
      ],
      requiredSkills: [
        "Asphalt paving machine operation",
        "Excavation and grading",
        "Pavement sealcoating",
        "Compaction testing"
      ],
      evidenceChecklist: [
        "GPS check-in at site coordinates",
        "Before-and-after excavation photos",
        "Hot-mix laydown progress photos",
        "Final compacted surface photos showing lining"
      ],
      suggestedMilestones: [
        {
          name: "Site Inspection & Excavation",
          description: "Establish site safety barriers, verify site coordinates, and complete defective asphalt excavation.",
          suggestedPercentage: 10,
          requiredEvidence: ["GPS check-in", "Initial site photos"]
        },
        {
          name: "Surface Laydown & Sealcoating",
          description: "Application of hot-mix asphalt, compacting, and sealing the base layer.",
          suggestedPercentage: 60,
          requiredEvidence: ["Progress photos", "Work notes"]
        },
        {
          name: "Final Marking & Handover",
          description: "Apply pavement line paint, clean up layout area, and execute final compaction review.",
          suggestedPercentage: 30,
          requiredEvidence: ["Final photos", "Completion report"]
        }
      ],
      notes: [
        "Enforce active traffic controls during paving.",
        "Perform laydown only when surface temperature exceeds 50°F.",
        "Ensure compliance with regional asphalt compaction standards."
      ]
    };
  }

  // General fallback template
  return {
    scopeOfWork: `Project scope of work details for "${title}". Standard procurement specifications matching "${description}". Works must adhere to municipal codes.`,
    deliverables: [
      "Mobilization and site safety sign-offs",
      "Core installation works completed",
      "Debris removal and site cleanup",
      "Final layout inspection check"
    ],
    requiredSkills: [
      "General contracting",
      "Safety monitoring",
      "Quality assurance review"
    ],
    evidenceChecklist: [
      "GPS site check-in",
      "Initial setup photos",
      "Deliverable photos",
      "Inspection signed report"
    ],
    suggestedMilestones: [
      {
        name: "Phase 1 - Preparation",
        description: "Mobilization, site safety barriers set up, and base inspection.",
        suggestedPercentage: 20,
        requiredEvidence: ["GPS check-in", "Initial site photos"]
      },
      {
        name: "Phase 2 - Execution",
        description: "Core physical installation/repairs according to project blueprint.",
        suggestedPercentage: 50,
        requiredEvidence: ["Progress photos", "Work notes"]
      },
      {
        name: "Phase 3 - Sign-off",
        description: "Final walkthrough inspection and debris clearance.",
        suggestedPercentage: 30,
        requiredEvidence: ["Final photos", "Completion report"]
      }
    ],
    notes: [
      "Ensure contractors possess trade specific licensing.",
      "Dispose of construction waste at authorized locations only.",
      "Safety goggles and steel-toe footwear required on-site."
    ]
  };
}
