import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, description, category } = body;

  if (!amount || !description || !category) {
    return NextResponse.json(
      { error: "Amount, description, and category are required" },
      { status: 400 },
    );
  }

  try {
  const expense = await prisma.expense.create({
    data: {
      amount: parseFloat(amount),
      description,
      category,
    },
  });

  return NextResponse.json({
    ...expense,
    amount: Number(expense.amount),
  });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}
