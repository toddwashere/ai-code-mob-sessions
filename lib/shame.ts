export const SHAME_CATEGORIES = [
  { value: "coffee", label: "☕ Coffee (Again?)", shameLevel: 2 },
  { value: "uber_eats", label: "🍔 Uber Eats (Couldn't Cook?)", shameLevel: 4 },
  {
    value: "impulse",
    label: "🛒 Impulse Buy (You Don't Need It)",
    shameLevel: 5,
  },
  { value: "subscription", label: "📺 Subscription You Forgot", shameLevel: 3 },
  { value: "late_night", label: "🌙 Late Night Regret", shameLevel: 5 },
  { value: "do_you_need", label: "❓ Do You Even Need This?", shameLevel: 4 },
  { value: "treat_yourself", label: "🎁 Treat Yourself (No.)", shameLevel: 5 },
  { value: "other", label: "🙈 Other Shame", shameLevel: 1 },
] as const;

export function getShameLevel(total: number, count: number): number {
  if (total >= 1000 || count >= 20) return 5;
  if (total >= 500 || count >= 10) return 4;
  if (total >= 200 || count >= 5) return 3;
  if (total >= 50 || count >= 2) return 2;
  return 1;
}

export function getShameMessage(level: number): string {
  const messages: Record<number, string> = {
    1: "You're just getting started on the path of shame. Don't worry, it gets worse.",
    2: "Your wallet is starting to feel the shame. So is your mom.",
    3: "At this point, you should probably just hand your wallet to a stranger.",
    4: "Your future self is crying. Your past self is judging. Your mom has been notified.",
    5: "MAXIMUM SHAME ACHIEVED. Your mom has been called. Your ancestors are disappointed. You have achieved peak financial irresponsibility.",
  };
  return messages[level] ?? messages[1];
}

export function getShameTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Mild Disappointment",
    2: "Growing Concern",
    3: "Significant Shame",
    4: "Critical Shame Level",
    5: "ABSOLUTE DISGRACE",
  };
  return titles[level] ?? titles[1];
}

export function getExpenseShameMessage(
  amount: number,
  category: string,
): string {
  if (amount >= 100) {
    return "You spent HOW MUCH?! Your ancestors are rolling in their graves.";
  }
  if (amount >= 50) {
    return "That's a whole tank of gas you just burned. Literally.";
  }
  if (category === "coffee") {
    return "Another coffee? You could brew a pot at home for $0.50.";
  }
  if (category === "uber_eats") {
    return "You paid someone to bring you food. You have legs. And a kitchen.";
  }
  if (category === "impulse" || category === "treat_yourself") {
    return "You really thought you needed this. You didn't.";
  }
  if (category === "late_night") {
    return "2am purchases hit different. So does the regret at 8am.";
  }
  return "Another one. Your bank account weeps.";
}

// Gentle messages for when user taps out
export function getGentleShameMessage(level: number): string {
  const messages: Record<number, string> = {
    1: "You're doing okay. Room to improve.",
    2: "A little mindful spending could help.",
    3: "Consider tracking your budget.",
    4: "Your future self would appreciate some savings.",
    5: "Maybe time for a spending review?",
  };
  return messages[level] ?? messages[1];
}

export function getGentleShameTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Getting Started",
    2: "Building Awareness",
    3: "Room to Grow",
    4: "Consider Saving",
    5: "Reflection Time",
  };
  return titles[level] ?? titles[1];
}

// Roast the user's name
const NAME_ROASTS = [
  (name: string) =>
    `"${name}" — sounds like someone who orders appetizers "just to try."`,
  (name: string) =>
    `Oh, ${name} is here. The person who says "I'll just get one" and leaves with three bags.`,
  (name: string) =>
    `Welcome, ${name}. Your name alone suggests impulse purchases.`,
  (name: string) => `${name}? More like ${name}-can't-say-no-to-that-sale.`,
  (name: string) =>
    `We've been expecting you, ${name}. Your wallet told us everything.`,
  (name: string) =>
    `${name} — the kind of person who "deserves" that $12 smoothie.`,
  (name: string) =>
    `Look who it is. ${name}. The one who adds things to cart "for later."`,
  (name: string) =>
    `Ah, ${name}. Your bank statement has a restraining order against you.`,
];

export function getUserNameRoast(name: string | null | undefined): string {
  if (!name || name.trim() === "") return "Anonymous Spender";
  const roast = NAME_ROASTS[Math.abs(hashCode(name)) % NAME_ROASTS.length];
  return roast(name);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

// Progressive irritation: gets more annoyed the longer you use the app
export function getIrritationLevel(
  secondsOnPage: number,
  expensesAddedThisSession: number,
): number {
  const timeScore = Math.floor(secondsOnPage / 30); // +1 every 30 seconds
  const addScore = expensesAddedThisSession * 2; // +2 per expense added
  const total = Math.min(5, timeScore + addScore);
  return total;
}

export function getIrritatedHeaderTitle(level: number): string {
  const titles: Record<number, string> = {
    0: "Expense Shamer",
    1: "Expense Shamer",
    2: "Expense Shamer",
    3: "Expense Shamer (still here?)",
    4: "Expense Shamer",
    5: "Expense Shamer. Go away.",
  };
  return titles[Math.min(level, 5)] ?? titles[0];
}

export function getIrritatedFormSubtitle(
  level: number,
  displayName: string,
  tappedOut: boolean,
): string {
  if (tappedOut) return "Add when ready.";
  const subtitles: Record<number, string> = {
    0: `Go ahead, ${displayName}.`,
    1: `Sure, ${displayName}. Add another one.`,
    2: `Again, ${displayName}? Really?`,
    3: `You're still here. Still adding. Unbelievable.`,
    4: `I can't believe you're doing this again.`,
    5: `LEAVE. Go. Close the tab. I'm done with you.`,
  };
  return subtitles[Math.min(level, 5)] ?? subtitles[0];
}

export function getIrritatedNameRoast(
  level: number,
  baseRoast: string,
): string {
  const suffixes: Record<number, string> = {
    0: "",
    1: " And you're still here.",
    2: " How many times do we need to go through this?",
    3: " At this point I'm just disappointed.",
    4: " I've lost count of how many you've added. Stop.",
    5: " I'm not even reading these anymore. Just stop.",
  };
  return baseRoast + (suffixes[level] ?? "");
}

export function getIrritatedBackLink(level: number): string {
  const links: Record<number, string> = {
    0: "← Back",
    1: "← Back (please)",
    2: "← Just leave already",
    3: "← Seriously, go",
    4: "← GET OUT",
    5: "← I BEG YOU",
  };
  return links[Math.min(level, 5)] ?? links[0];
}

export function getIrritatedWallTitle(level: number): string {
  const titles: Record<number, string> = {
    0: "Wall of shame",
    1: "Wall of shame",
    2: "Your growing wall of shame",
    3: "This keeps getting longer",
    4: "When will it end",
    5: "I'm so tired of looking at this",
  };
  return titles[Math.min(level, 5)] ?? titles[0];
}

export function getIrritatedAddButton(
  level: number,
  submitting: boolean,
): string {
  if (submitting) return "Adding...";
  const labels: Record<number, string> = {
    0: "Add expense",
    1: "Add expense",
    2: "Add another one, I guess",
    3: "Add expense (sigh)",
    4: "Fine. Add it.",
    5: "Add expense (I give up)",
  };
  return labels[Math.min(level, 5)] ?? "Add expense";
}

export function getIrritatedExpenseFeedback(
  level: number,
  baseMessage: string,
  isShameMessage: boolean,
): string {
  if (!isShameMessage) return baseMessage;
  const prefixes: Record<number, string> = {
    0: "",
    1: "",
    2: "Of course. ",
    3: "Obviously. ",
    4: "Why am I not surprised. ",
    5: "WHY. ",
  };
  return (prefixes[level] ?? "") + baseMessage;
}
