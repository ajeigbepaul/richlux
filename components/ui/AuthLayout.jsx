import React from "react";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Unifies the three previously-inconsistent auth surfaces (login, register,
// logininterface) into one split-screen shell: brand image on desktop,
// content on a light card -- matching the public-site brand, not the old
// dark gray-800/slate-900 auth pages.
function AuthLayout({ title, children }) {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-ink-100 dark:bg-surface-950 relative">
      <ThemeToggle className="absolute top-4 right-4 z-10 text-ink-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-surface-800" />
      <div className="md:w-1/2 w-full h-48 md:h-screen hidden md:flex items-center justify-center bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-blob opacity-60" />
        <Image
          src="/richardlogo2.jpg"
          alt="Richlux Property"
          width={700}
          height={900}
          className="relative w-3/4 h-3/4 object-cover rounded-2xl shadow-card"
        />
      </div>
      <div className="md:w-1/2 w-full min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
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
