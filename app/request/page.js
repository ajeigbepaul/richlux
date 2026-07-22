"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RequestWizardModal from "@/components/RequestWizardModal";
import Spinner from "@/components/ui/Spinner";

// Landing on /request directly (e.g. via the login/register callbackUrl
// round-trip) opens the same modal used from the homepage CTA -- closing it
// returns to the homepage rather than leaving a dead page behind.
//
// The modal is only mounted once the session has resolved: it pre-fills
// name/email from session via a lazy useState initializer (runs once, on
// mount, not on every render), which only works if the session is already
// available BEFORE mount. From the homepage that's naturally true (the modal
// mounts on a later click, well after the page's session fetch resolved);
// here the page and the modal would otherwise mount together, so gate on
// status first rather than mounting with an empty session forever.
export default function RequestPage() {
  const router = useRouter();
  const { status } = useSession();
  const [open, setOpen] = React.useState(true);

  return (
    <main className="w-full bg-white dark:bg-surface-900 min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        {status === "loading" ? (
          <Spinner className="text-brand-400 py-10" />
        ) : (
          <AnimatePresence>
            {open && (
              <RequestWizardModal
                onClose={() => {
                  setOpen(false);
                  router.push("/");
                }}
              />
            )}
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </main>
  );
}
