import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FAKE_EXPENSES = [
  // Coffee shame
  {
    amount: 6.75,
    description: "Venti oat milk latte with extra shot",
    category: "coffee",
  },
  {
    amount: 4.5,
    description: "Cold brew that I could have made at home",
    category: "coffee",
  },
  {
    amount: 8.25,
    description: "Three coffees in one day. Three.",
    category: "coffee",
  },
  {
    amount: 5.99,
    description: "Matcha latte 'for the antioxidants'",
    category: "coffee",
  },
  {
    amount: 7.5,
    description: "Airport coffee (I knew better)",
    category: "coffee",
  },
  // Uber Eats shame
  {
    amount: 34.99,
    description: "Burger and fries delivered (restaurant 0.3 miles away)",
    category: "uber_eats",
  },
  {
    amount: 28.5,
    description: "Sushi that arrived warm",
    category: "uber_eats",
  },
  {
    amount: 45.0,
    description: "Brunch delivery + tip + fees (could have cooked eggs)",
    category: "uber_eats",
  },
  {
    amount: 22.0,
    description: "Pizza at 11pm because 'I had a long day'",
    category: "uber_eats",
  },
  // Impulse buys
  {
    amount: 89.99,
    description: "As seen on TikTok gadget",
    category: "impulse",
  },
  {
    amount: 129.0,
    description: "Noise-canceling headphones (I have three pairs)",
    category: "impulse",
  },
  {
    amount: 45.0,
    description: "Candle that smells like 'a cozy cabin'",
    category: "impulse",
  },
  {
    amount: 199.0,
    description: "Bought because it was 20% off (saved nothing)",
    category: "impulse",
  },
  {
    amount: 34.99,
    description: "Random Amazon purchase at 2am",
    category: "impulse",
  },
  // Subscriptions
  {
    amount: 15.99,
    description: "Streaming service I forgot I had",
    category: "subscription",
  },
  {
    amount: 9.99,
    description: "App subscription from 2019",
    category: "subscription",
  },
  {
    amount: 29.99,
    description: "Gym membership (last went in March)",
    category: "subscription",
  },
  {
    amount: 12.99,
    description: "Meal kit I never cooked",
    category: "subscription",
  },
  // Late night regrets
  {
    amount: 67.0,
    description: "2:47am online shopping",
    category: "late_night",
  },
  {
    amount: 89.99,
    description: "Infomercial product purchased at 1am",
    category: "late_night",
  },
  {
    amount: 156.0,
    description: "Concert tickets (I was drunk)",
    category: "late_night",
  },
  // Treat yourself (no)
  {
    amount: 75.0,
    description: "'I deserve this' massage gun",
    category: "treat_yourself",
  },
  {
    amount: 42.0,
    description: "Skincare I'll use twice",
    category: "treat_yourself",
  },
  {
    amount: 118.0,
    description: "'Self-care' purchase",
    category: "treat_yourself",
  },
  // Do you even need this
  {
    amount: 55.0,
    description: "Another phone charger",
    category: "do_you_need",
  },
  {
    amount: 29.99,
    description: "Organizer to organize my organizers",
    category: "do_you_need",
  },
  {
    amount: 19.99,
    description: "USB-C adapter (I have 7)",
    category: "do_you_need",
  },
  // Other
  { amount: 12.5, description: "Convenience store markup", category: "other" },
  {
    amount: 8.99,
    description: "App purchase I'll never use",
    category: "other",
  },
];

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(
    12 + Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 60),
    0,
    0,
  );
  return d;
}

async function main() {
  // Clear existing expenses
  await prisma.expense.deleteMany({});

  // Create fake expenses with varied dates
  for (let i = 0; i < FAKE_EXPENSES.length; i++) {
    const expense = FAKE_EXPENSES[i];
    const createdAt = daysAgo(Math.floor(Math.random() * 21) + 1); // 1-21 days ago
    await prisma.expense.create({
      data: {
        ...expense,
        createdAt,
      },
    });
  }

  console.log(`Seeded ${FAKE_EXPENSES.length} shameful expenses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
