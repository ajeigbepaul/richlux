"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

// Segment-level error boundary -- Next.js renders this instead of crashing
// out to its own bare default error screen whenever a render/data error
// escapes a page. Gives people a way back (retry or go home) instead of a
// dead end.
export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-surface-900 px-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-h1 text-ink-900 dark:text-white">Something went wrong</h1>
        <p className="text-body text-ink-500 dark:text-slate-400">
          That&apos;s on us, not you. You can try again, or head back to the homepage.
        </p>
        {error?.digest && (
          <p className="text-caption text-ink-500 dark:text-slate-500">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Go to homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
