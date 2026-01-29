import { auth } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">CoolProject</h1>
      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{session.user?.email}</span>
          </p>
          {session.user?.name && (
            <p className="text-muted-foreground">
              Welcome, {session.user.name}!
            </p>
          )}
          <LogoutButton />
        </div>
      ) : (
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
