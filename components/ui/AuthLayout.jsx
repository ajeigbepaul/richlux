import React from "react";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Unifies the three previously-inconsistent auth surfaces (login, register,
// logininterface) into one split-screen shell: brand image on desktop,
// content on a light card -- matching the public-site brand, not the old
// dark gray-800/slate-900 auth pages.
function AuthLayout({ title, backHref, backLabel = "Back to home", children }) {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-ink-100 dark:bg-surface-950 relative">
      <ThemeToggle className="absolute top-4 right-4 z-10 text-ink-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-surface-800" />
      <div className="md:w-1/2 w-full h-48 md:h-screen hidden md:flex items-center justify-center bg-white dark:bg-surface-900 p-12">
        {/* Same theme-driven logo swap as Header.jsx -- no gradient/brand
            color block, just the logo on a plain surface that matches the
            rest of the app's light/dark treatment. */}
        <Image
          src="/richlux.png"
          alt="Richlux Property"
          width={871}
          height={369}
          className="w-full h-auto object-contain dark:hidden"
          priority
        />
        <Image
          src="/richluxlogowhite.png"
          alt="Richlux Property"
          width={3264}
          height={1836}
          className="w-full h-auto object-contain hidden dark:block"
          priority
        />
      </div>
      <div className="md:w-1/2 w-full min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {backHref && (
            <Link
              href={backHref}
              className="inline-block mb-4 text-caption font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
            >
              ← {backLabel}
            </Link>
          )}
          {title && (
            <h1 className="font-semibold text-h1 text-ink-900 dark:text-white text-center mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
