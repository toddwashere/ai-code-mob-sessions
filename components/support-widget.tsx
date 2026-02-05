"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FALLBACK_INSULTS = [
  "Having trouble? You probably are.",
  "Need help? You clearly do.",
  "Your wallet feels the same way.",
  "We're judging you. Constantly.",
  "Another one? Your ancestors weep.",
  "Consider a budget. (You won't.)",
  "Financial literacy? Never heard of her.",
];

const DISMISS_RESPONSES = [
  "Fine. Go.",
  "Whatever.",
  "Don't come crying back.",
  "Finally.",
  "We'll be back. Soon.",
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDelay(): number {
  return 6000 + Math.random() * 12000;
}

type RoastContext = {
  amount?: number;
  description?: string;
  category?: string;
  totalSpent?: number;
  expenseCount?: number;
  roast?: string;
  persona?: { name: string; emoji: string };
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  persona?: { name: string; emoji: string };
};

async function fetchRoast(
  context?: RoastContext & { userMessage?: string; chatHistory?: ChatMessage[] },
): Promise<{
  roast: string;
  persona: { id: string; name: string; emoji: string };
} | null> {
  try {
    const res = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...context,
        chatHistory: context?.chatHistory?.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });
    if (res.ok) {
      return res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

export function SupportWidget() {
  const [visible, setVisible] = useState(false);
  const [persona, setPersona] = useState<{
    name: string;
    emoji: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [expenseContext, setExpenseContext] = useState<RoastContext | undefined>();
  const [dismissText, setDismissText] = useState("×");
  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >("bottom-right");
  const [popKey, setPopKey] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const showWidget = useCallback(async (context?: RoastContext) => {
    setDismissText(getRandom(DISMISS_RESPONSES));
    setPosition(
      getRandom(["bottom-right", "bottom-left", "top-right", "top-left"]),
    );
    setPopKey((k) => k + 1);
    setVisible(true);
    setExpenseContext(context);

    if (context?.roast && context?.persona) {
      setLoading(false);
      setPersona(context.persona);
      setChatMessages([
        {
          role: "assistant",
          content: context.roast,
          persona: context.persona,
        },
      ]);
      return;
    }

    setLoading(true);
    setPersona(null);
    setChatMessages([]);

    const result = await fetchRoast(context);
    setLoading(false);

    if (result) {
      setPersona({ name: result.persona.name, emoji: result.persona.emoji });
      setChatMessages([
        {
          role: "assistant",
          content: result.roast,
          persona: result.persona,
        },
      ]);
    } else {
      setChatMessages([
        {
          role: "assistant",
          content: getRandom(FALLBACK_INSULTS),
        },
      ]);
    }
  }, []);

  const hideWidget = useCallback(() => {
    setVisible(false);
    setChatMessages([]);
    setTimeout(() => showWidget(), 1000 + Math.random() * 2000);
  }, [showWidget]);

  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || loading) return;

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    const history = [
      ...chatMessages,
      { role: "user" as const, content: msg },
    ].map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const result = await fetchRoast({
      ...expenseContext,
      userMessage: msg,
      chatHistory: history,
    });

    setLoading(false);

    if (result) {
      setPersona({ name: result.persona.name, emoji: result.persona.emoji });
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.roast,
          persona: result.persona,
        },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: getRandom(FALLBACK_INSULTS),
        },
      ]);
    }
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = getRandomDelay();
      timeoutId = setTimeout(() => {
        showWidget();
        scheduleNext();
      }, delay);
    };

    const initialDelay = 2000 + Math.random() * 4000;
    const firstTimer = setTimeout(() => {
      showWidget();
      scheduleNext();
    }, initialDelay);

    const onExpenseAdded = (e: Event) => {
      const detail = (e as CustomEvent<RoastContext>).detail;
      showWidget(detail);
    };
    window.addEventListener("expense-shamer:expense-added", onExpenseAdded);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(timeoutId);
      window.removeEventListener("expense-shamer:expense-added", onExpenseAdded);
    };
  }, [showWidget]);

  if (!visible) return null;

  const positionClasses = {
    "bottom-right": "bottom-4 right-4 animate-in slide-in-from-bottom-4",
    "bottom-left": "bottom-4 left-4 animate-in slide-in-from-left-4",
    "top-right": "top-4 right-4 animate-in slide-in-from-top-4",
    "top-left": "top-4 left-4 animate-in slide-in-from-left-4",
  };

  return (
    <div
      key={popKey}
      className={`fixed ${positionClasses[position]} z-[9999] w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border-2 border-amber-400/80 bg-amber-50 dark:bg-amber-950/90 shadow-2xl shadow-amber-500/20 flex flex-col overflow-hidden`}
      style={{ animation: "wiggle 0.4s ease-in-out 3" }}
    >
      <div className="px-4 py-3 border-b border-amber-200/50 dark:border-amber-800/50">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {persona ? (
              <span>
                {persona.emoji} {persona.name}
              </span>
            ) : (
              "💬 Support Chat"
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={hideWidget}
            className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-foreground hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded text-xs"
            title={dismissText}
          >
            ×
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 italic">
          We&apos;re here to help. (We&apos;re not.)
        </p>
      </div>

      <div className="flex-1 min-h-0 max-h-[240px] overflow-y-auto px-4 py-2 space-y-2">
        {chatMessages.map((m, i) => (
          <div
            key={i}
            className={`text-sm ${
              m.role === "user"
                ? "ml-4 text-right"
                : "mr-4"
            }`}
          >
            {m.role === "assistant" && m.persona && (
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 mb-0.5">
                {m.persona.emoji} {m.persona.name}
              </p>
            )}
            <p
              className={`rounded-lg px-2 py-1.5 ${
                m.role === "user"
                  ? "bg-amber-200/50 dark:bg-amber-800/50 inline-block"
                  : "text-foreground"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {loading && (
          <p className="text-sm text-muted-foreground italic">
            Thinking of something mean...
          </p>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-2 border-t border-amber-200/50 dark:border-amber-800/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendChatMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="h-8 text-sm flex-1"
            disabled={loading}
          />
          <Button
            type="submit"
            size="sm"
            className="h-8 px-3"
            disabled={loading || !chatInput.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
