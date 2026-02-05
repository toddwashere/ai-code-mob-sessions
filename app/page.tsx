import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(251,207,232,0.2),transparent)] dark:bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(139,92,246,0.08),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.02))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.3))]" />
      <div className="noise-bg fixed inset-0 -z-10" />
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
        Expense Shamer
      </h1>
      <p className="text-muted-foreground text-[15px] mb-10 max-w-sm text-center leading-relaxed">
        Face your financial shame. Your mom will hear about this.
      </p>
      <Button asChild size="lg" className="rounded-xl h-12 px-8 font-medium">
        <Link href="/expenses">Enter the shame zone</Link>
      </Button>
    </main>
  );
}
