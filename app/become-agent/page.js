"use client";

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";

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

// New-visitor lane: creates the account itself, records a pending
// application. Role stays "user" until a superadmin approves it on
// /admin/users -- self-registration never grants elevated roles directly.
function NewApplicantForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          phone,
          message,
          applyAsAgent: true,
        }),
      });
      if (response.ok) {
        toast.success("Application submitted -- we'll review it shortly.");
        router.push("/login");
      } else {
        toast.error("Could not submit application, please try again");
      }
    } catch (error) {
      toast.error("Could not submit application, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Enter your Username"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="email"
        placeholder="Enter your email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Enter your password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
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
  const { data: session, status } = useSession();
  const { data, isLoading, mutate } = useSWR(
    status === "authenticated" ? "/api/agent-applications" : null,
    fetcher
  );

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return <StatusMessage>Loading...</StatusMessage>;
  }

  if (status !== "authenticated") {
    return (
      <>
        <NewApplicantForm />
        <p className="text-ink-500 dark:text-slate-400 w-full text-sm text-center mt-4">
          Already applied?{" "}
          <Link
            href="/login"
            className="mx-1 text-xs font-semibold text-brand-500 dark:text-brand-400"
          >
            Sign in
          </Link>
        </p>
      </>
    );
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
    <AuthLayout title="Become a Richlux Agent">
      <BecomeAgentContent />
    </AuthLayout>
  );
}
