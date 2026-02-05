import { NextResponse } from "next/server";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { getRandomPersona, getPersonaById } from "@/lib/personas";

export const dynamic = "force-dynamic";

const MODEL = "zai-glm-4.7";

type RoastRequest = {
  personaId?: string;
  amount?: number;
  description?: string;
  category?: string;
  totalSpent?: number;
  expenseCount?: number;
  context?: string;
  userMessage?: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
};

export async function POST(request: Request) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CEREBRAS_API_KEY not configured" },
      { status: 503 },
    );
  }

  let body: RoastRequest = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const {
    personaId,
    amount,
    description,
    category,
    totalSpent,
    expenseCount,
    context,
    userMessage: rawUserMessage,
    chatHistory,
  } = body;

  const persona = personaId
    ? getPersonaById(personaId)
    : getRandomPersona();

  if (!persona) {
    return NextResponse.json(
      { error: "Invalid persona" },
      { status: 400 },
    );
  }

  const contextParts: string[] = [];
  if (amount != null) contextParts.push(`They just spent $${amount.toFixed(2)}`);
  if (description) contextParts.push(`on "${description}"`);
  if (category) contextParts.push(`(category: ${category})`);
  if (totalSpent != null)
    contextParts.push(`Their total spending so far: $${totalSpent.toFixed(2)}`);
  if (expenseCount != null)
    contextParts.push(`They've logged ${expenseCount} expenses.`);
  if (context) contextParts.push(context);

  let userMessage: string;
  if (rawUserMessage) {
    const expenseContext =
      contextParts.length > 0
        ? `[Context: ${contextParts.join(". ")}] `
        : "";
    userMessage = `${expenseContext}The user says: "${rawUserMessage}" — roast or respond in character.`;
  } else {
    userMessage =
      contextParts.length > 0
        ? `Roast them for this expense: ${contextParts.join(". ")}`
        : "Roast them for their terrible spending habits. They're using an expense tracking app that shames them.";
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: persona.systemPrompt },
    ...(chatHistory ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const client = new Cerebras({
      apiKey,
      warmTCPConnection: false,
    });

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 150,
      temperature: 0.9,
    });

    const choices = completion.choices as Array<{ message?: { content?: string } }> | undefined;
    const roast =
      choices?.[0]?.message?.content?.trim() ||
      "Your spending speaks for itself. (We're speechless.)";

    return NextResponse.json({
      roast,
      persona: {
        id: persona.id,
        name: persona.name,
        emoji: persona.emoji,
      },
    });
  } catch (err) {
    console.error("Cerebras roast error:", err);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 },
    );
  }
}
