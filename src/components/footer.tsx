import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-secondary">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} UniRecruits. All rights reserved.
      </p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link
          href="/#latest-jobs"
          className="text-xs hover:underline underline-offset-4"
          prefetch={false}
        >
          Jobs
        </Link>
        <Link
          href="/#about"
          className="text-xs hover:underline underline-offset-4"
          prefetch={false}
        >
          About
        </Link>
        <Link
          href="#"
          className="text-xs hover:underline underline-offset-4"
          prefetch={false}
        >
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
