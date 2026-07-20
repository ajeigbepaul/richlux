"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";
import Spinner from "@/components/ui/Spinner";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const textareaClassName =
  "w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400";

function MessageField({ value, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
        Tell us about your experience (optional)
      </label>
      <textarea
        rows={3}
        className={textareaClassName}
        placeholder="e.g. years in real estate, areas you cover..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Already-registered plain "user" applying after the fact -- no need to
// re-enter credentials, just adds contact info to their existing account.
function ExistingUserForm({ onSubmitted }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/agent-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not submit application");
      toast.success("Application submitted -- we'll review it shortly.");
      onSubmitted();
    } catch (error) {
      toast.error(error.message || "Could not submit application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        type="tel"
        placeholder="Enter your phone number"
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <MessageField value={message} onChange={setMessage} />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Submit Application
      </Button>
    </form>
  );
}

function StatusMessage({ children }) {
  return (
    <p className="text-body text-ink-500 dark:text-slate-400 text-center">{children}</p>
  );
}

function BecomeAgentContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data, isLoading, mutate } = useSWR(
    status === "authenticated" ? "/api/agent-applications" : null,
    fetcher
  );

  // Brand-new visitors now go through the unified /register role picker
  // (Agent card preselected) instead of a separate form on this page -- this
  // page only serves an already-authenticated plain "user" applying after
  // the fact (ExistingUserForm below).
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/register?intent=agent");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && isLoading)) {
    return <Spinner className="text-brand-400 py-10" />;
  }

  const role = data?.role || session?.user?.role;
  const applicationStatus = data?.agentApplication?.status || "none";

  if (role && role !== "user") {
    return (
      <div className="space-y-4 text-center">
        <StatusMessage>You&apos;re already part of the Richlux team.</StatusMessage>
        <Link href="/admin" className="inline-block">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (applicationStatus === "pending") {
    return <StatusMessage>Your application is under review. We&apos;ll be in touch.</StatusMessage>;
  }

  return <ExistingUserForm onSubmitted={mutate} />;
}

export default function BecomeAgentPage() {
  return (
    <AuthLayout title="Become a Richlux Agent" backHref="/">
      <BecomeAgentContent />
    </AuthLayout>
  );
}
