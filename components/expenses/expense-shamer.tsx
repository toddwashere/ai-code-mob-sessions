"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  getShameLevel,
  getExpenseShameMessage,
  getUserNameRoast,
  getIrritationLevel,
  getIrritatedNameRoast,
  getIrritatedBackLink,
  getIrritatedWallTitle,
  getIrritatedAddButton,
  getIrritatedExpenseFeedback,
  getIrritatedHeaderTitle,
} from "@/lib/shame";
import {
  EMPTY_SHAME_GIF,
  WALL_OF_SHAME_GIF,
  CATEGORY_SHAME_GIFS,
} from "@/lib/shame-gifs";
import { parseReceiptText } from "@/lib/receipt-parser";
import { playSadTrombone } from "@/lib/sounds";

type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  createdAt: string;
};

const SHAME_BUBBLES = [
  "you suck",
  "Stop Spending",
  "Your wallet is crying",
  "Seriously?",
  "Again?",
  "No.",
];

function getShameBubbles(shameLevel: number): string[] {
  const count = Math.min(3, Math.max(1, shameLevel));
  const shuffled = [...SHAME_BUBBLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function isOnBirthday(expenseDate: string, birthday: string | null): boolean {
  if (!birthday) return false;
  const mmdd = expenseDate.slice(0, 10).slice(5); // "MM-DD" from "YYYY-MM-DD"
  return mmdd === birthday;
}

export function ExpenseShamer() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState("coffee");
  const [submitting, setSubmitting] = useState(false);
  const [lastShameMessage, setLastShameMessage] = useState<string | null>(null);
  const [tappedOut] = useState(false);
  const [displayName, setDisplayName] = useState("Guest");
  const [birthday, setBirthday] = useState<string | null>(null);
  const [secondsOnPage, setSecondsOnPage] = useState(0);
  const [expensesAddedThisSession, setExpensesAddedThisSession] = useState(0);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("expense-shamer-name");
    if (saved) setDisplayName(saved);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("expense-shamer-birthday");
    if (saved) setBirthday(saved);
  }, []);

  const saveBirthday = (value: string | null) => {
    setBirthday(value);
    if (value) localStorage.setItem("expense-shamer-birthday", value);
    else localStorage.removeItem("expense-shamer-birthday");
  };

  const expensesForShame = birthday
    ? expenses.filter((e) => !isOnBirthday(e.createdAt, birthday))
    : expenses;

  useEffect(() => {
    const interval = setInterval(() => setSecondsOnPage((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const irritationLevel = getIrritationLevel(
    secondsOnPage,
    expensesAddedThisSession,
  );
  const baseNameRoast = getUserNameRoast(displayName);
  const nameRoast = getIrritatedNameRoast(irritationLevel, baseNameRoast);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    if (res.ok) {
      const data = await res.json();
      setExpenses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const total = expensesForShame.reduce((sum, e) => sum + e.amount, 0);
  const shameLevel = getShameLevel(total, expensesForShame.length);
  const shameBubbles = getShameBubbles(shameLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setSubmitting(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        description,
        category,
        date: date || undefined,
      }),
    });

    if (res.ok) {
      const newExpense = await res.json();
      playSadTrombone();
      setExpenses((prev) => [newExpense, ...prev]);
      setExpensesAddedThisSession((n) => n + 1);
      const totalAfter = total + newExpense.amount;
      const context = {
        amount: newExpense.amount,
        description: newExpense.description,
        category: newExpense.category,
        totalSpent: totalAfter,
        expenseCount: expenses.length + 1,
      };

      const roastRes = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      let roastDetail: { roast?: string; persona?: { name: string; emoji: string } } = {};
      if (roastRes.ok) {
        const data = await roastRes.json();
        roastDetail = { roast: data.roast, persona: data.persona };
        const displayMsg = tappedOut
          ? "Added. No judgment. (Okay, a little judgment.)"
          : `${data.persona?.emoji ?? ""} ${data.persona?.name ?? "Someone"}: ${data.roast}`;
        setLastShameMessage(
          getIrritatedExpenseFeedback(irritationLevel, displayMsg, !tappedOut),
        );
      } else {
        const baseMsg = tappedOut
          ? "Added. No judgment. (Okay, a little judgment.)"
          : getExpenseShameMessage(newExpense.amount, newExpense.category);
        setLastShameMessage(
          getIrritatedExpenseFeedback(irritationLevel, baseMsg, !tappedOut),
        );
      }
      setTimeout(() => setLastShameMessage(null), 5000);

      window.dispatchEvent(
        new CustomEvent("expense-shamer:expense-added", {
          detail: { ...context, ...roastDetail },
        }),
      );

      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setCategory("coffee");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const runOcrOnImage = async (blob: Blob) => {
    setScanningReceipt(true);
    setScanError(null);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(blob, "eng");
      const parsed = parseReceiptText(result.data.text);

      if (parsed.amount != null) setAmount(parsed.amount.toFixed(2));
      if (parsed.date) setDate(parsed.date);
      if (parsed.description) setDescription(parsed.description);

      if (parsed.amount ?? parsed.date ?? parsed.description) {
        window.dispatchEvent(new CustomEvent("expense-shamer:expense-added"));
      }
    } catch {
      setScanError("Even our OCR gave up on your receipt.");
      setLastShameMessage("Even our OCR gave up on your receipt.");
      setTimeout(() => setLastShameMessage(null), 5000);
    } finally {
      setScanningReceipt(false);
    }
  };

  const openCameraModal = async () => {
    if (scanningReceipt) return;
    setShowCameraModal(true);
    setScanError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setScanError("Camera access denied. We're judging your privacy choices.");
      setShowCameraModal(false);
    }
  };

  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.readyState !== 4) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    closeCameraModal();

    canvas.toBlob(
      (blob) => {
        if (blob) runOcrOnImage(blob);
      },
      "image/jpeg",
      0.9,
    );
  };

  // Build trend data for graph (last 7 days) - excludes birthday
  const trendData = (() => {
    const days = 7;
    const now = new Date();
    const result: { date: string; total: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayTotal = expensesForShame
        .filter((e) => e.createdAt.startsWith(dateStr))
        .reduce((s, e) => s + e.amount, 0);
      result.push({ date: dateStr, total: dayTotal });
    }
    return result;
  })();

  const maxTrend = Math.max(1, ...trendData.map((d) => d.total));

  return (
    <div className="noise-bg min-h-screen relative">
      {/* Camera modal for receipt scan */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background">
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="p-4 flex gap-2 border-t bg-card">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeCameraModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={handleCapture}
            >
              Snap receipt
            </Button>
          </div>
        </div>
      )}

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(251,207,232,0.2),transparent)] dark:bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(139,92,246,0.08),transparent)]" />

      <div className="relative container max-w-xl mx-auto px-4 py-6">
        <header className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {getIrritatedBackLink(irritationLevel)}
            </Link>
            <span className="text-[13px] font-medium text-muted-foreground">
              {getIrritatedHeaderTitle(irritationLevel)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="birthday"
              className="text-[11px] text-muted-foreground whitespace-nowrap"
            >
              Ignore expenses on birthday:
            </Label>
            <Input
              id="birthday"
              type="date"
              value={birthday ? `2000-${birthday}` : ""}
              onChange={(e) => {
                const v = e.target.value;
                saveBirthday(v ? v.slice(5) : null);
              }}
              className="h-8 w-[140px] text-[12px]"
            />
          </div>
        </header>

        {/* 1. Graph / Display area - wavy line + paperclip */}
        <div className="rounded-xl border-2 border-border bg-card p-4 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 h-12 flex items-end gap-0.5">
              {trendData.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 bg-destructive/30 dark:bg-destructive/40 rounded-t min-h-[4px] transition-all"
                  style={{
                    height: `${Math.max(8, (d.total / maxTrend) * 40)}px`,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={openCameraModal}
              disabled={scanningReceipt}
              className="inline-block w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="It looks like you're trying to add an expense. Would you like help spending more money? Scan a receipt."
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Paperclip body */}
                <path
                  d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Clippy eyes */}
                <circle cx="9" cy="10" r="1.2" fill="currentColor" />
                <circle cx="15" cy="10" r="1.2" fill="currentColor" />
                {/* Clippy smile */}
                <path
                  d="M9 14c1.2.8 2.8.8 4 0"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 2. Expense inputs - name, date, cost */}
        <div className="rounded-xl border-2 border-border bg-card p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Expense name
              </Label>
              <Input
                id="description"
                placeholder="What did you waste money on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-10 border-2 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">
                  date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 h-10 border-2 rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-sm font-medium">
                  cost
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 h-10 border-2 rounded-lg"
                />
              </div>
            </div>
            <input type="hidden" name="category" value={category} />
            {lastShameMessage && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
                {lastShameMessage}
              </div>
            )}
            {scanError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
                {scanError}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 rounded-lg font-medium"
                disabled={scanningReceipt}
                onClick={openCameraModal}
              >
                {scanningReceipt ? "Scanning..." : "Scan receipt"}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="flex-1 h-10 rounded-lg font-medium"
                disabled={submitting || !amount || !description}
              >
                {getIrritatedAddButton(irritationLevel, submitting)}
              </Button>
            </div>
          </form>
        </div>

        {/* 3. Shame! section - bold title + insult bubbles */}
        <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-4 mb-4">
          <h2 className="text-2xl font-black mb-3">
            Shame<span className="text-destructive">!</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {shameBubbles.map((bubble) => (
              <span
                key={bubble}
                className="inline-block px-4 py-2 rounded-full bg-destructive/20 dark:bg-destructive/30 text-destructive font-semibold text-sm border border-destructive/40"
              >
                {bubble}
              </span>
            ))}
          </div>
          {!tappedOut && (
            <p className="text-xs text-muted-foreground italic mt-2">
              {nameRoast}
            </p>
          )}
        </div>

        {/* 4. Financial forecasting - opportunity cost in 2016 Bitcoin */}
        <div className="rounded-xl border-2 border-border bg-card p-4">
          <h3 className="text-sm font-bold mb-3">Financial forecasting</h3>
          <div className="space-y-2">
            {(() => {
              const BTC_2016 = 600; // ~$600 avg 2016
              const BTC_NOW = 60000; // approximate current
              const btcCouldHaveBought = total / BTC_2016;
              const valueToday = btcCouldHaveBought * BTC_NOW;
              const opportunityCost = valueToday - total;
              const fmt = (n: number) =>
                n.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              return [
                {
                  label: "BTC you could've bought (2016)",
                  display: `${btcCouldHaveBought.toFixed(4)} BTC`,
                },
                {
                  label: "Value today (if you'd bought)",
                  display: `$${fmt(valueToday)}`,
                },
                {
                  label: "Opportunity cost (you chose this instead)",
                  display: `$${fmt(opportunityCost)}`,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-destructive font-bold">↓</span>
                  <span className="text-muted-foreground flex-1">
                    {item.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {item.display}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Wall of shame - expense list */}
        <div className="rounded-xl border-2 border-border bg-card p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={WALL_OF_SHAME_GIF}
              alt=""
              className="h-7 w-7 rounded-lg object-cover shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {getIrritatedWallTitle(irritationLevel)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {expenses.length} items
                {birthday &&
                  expenses.some((e) => isOnBirthday(e.createdAt, birthday)) &&
                  ` (${expenses.filter((e) => isOnBirthday(e.createdAt, birthday)).length} on birthday ignored)`}
              </p>
            </div>
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Loading...
            </p>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <img
                src={EMPTY_SHAME_GIF}
                alt=""
                className="mx-auto h-12 w-12 rounded-xl object-cover"
              />
              <p className="text-sm text-muted-foreground">
                No expenses yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-1 max-h-[240px] overflow-y-auto">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors group"
                >
                  <img
                    src={
                      CATEGORY_SHAME_GIFS[expense.category] ??
                      CATEGORY_SHAME_GIFS.other
                    }
                    alt=""
                    className="h-6 w-6 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {expense.description}
                      {birthday &&
                        isOnBirthday(expense.createdAt, birthday) && (
                          <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                            (birthday—ignored)
                          </span>
                        )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={() => handleDelete(expense.id)}
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
