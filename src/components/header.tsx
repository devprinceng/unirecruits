"use client";

import Link from "next/link";
import { University } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/context/auth-context";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <University className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">UniRecruits</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="/#latest-jobs"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Jobs
        </Link>
        <Link
          href="/#about"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          About
        </Link>
        {loading ? null : user ? (
          <UserNav />
        ) : (
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
