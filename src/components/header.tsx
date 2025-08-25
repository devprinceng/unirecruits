"use client";

import Link from "next/link";
import { University, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/context/auth-context";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-auto" prefetch={false}>
        <University className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">UniRecruits</span>
      </Link>
      
      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
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

      {/* Mobile Nav */}
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
             <nav className="grid gap-6 text-lg font-medium mt-10">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold" prefetch={false} onClick={closeSheet}>
                    <University className="h-6 w-6 text-primary" />
                    <span>UniRecruits</span>
                </Link>
                <Link
                href="/#latest-jobs"
                className="hover:text-primary"
                prefetch={false}
                 onClick={closeSheet}
                >
                Jobs
                </Link>
                <Link
                href="/#about"
                className="text-muted-foreground hover:text-primary"
                prefetch={false}
                 onClick={closeSheet}
                >
                About
                </Link>
                 {loading ? null : user ? (
                  <div className="mt-4">
                     <UserNav />
                  </div>
                ) : (
                  <Button asChild className="mt-4" onClick={closeSheet}>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
