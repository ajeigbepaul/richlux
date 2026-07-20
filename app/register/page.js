"use client";

import React, { Suspense, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaHome, FaBriefcase } from "react-icons/fa";

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

function RoleCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full p-4 rounded-xl border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-brand-400 dark:hover:border-brand-400 richtrans"
    >
      <Icon size={20} className="text-brand-500 dark:text-brand-400 mb-2" />
      <p className="font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="text-caption text-ink-500 dark:text-slate-400 mt-1">{description}</p>
    </button>
  );
}

function LoginPrompt({ callbackUrl }) {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col mt-4">
      <div className="text-ink-500 dark:text-slate-400 w-full text-sm text-center">
        Already have an account?{" "}
        <span
          className="mx-1 text-xs font-semibold text-brand-500 dark:text-brand-400 cursor-pointer"
          onClick={() =>
            router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
          }
        >
          Login
        </span>
      </div>
    </div>
  );
}

// Plain sign-up -- creates an ordinary "user" account. Same lane as the
// pre-merge register/page.js, just renamed/relocated.
function HomeSeekerForm({ callbackUrl }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        // Sign in as the account just created instead of leaving the user on
        // whatever session (if any) was already active in this browser --
        // otherwise a stale prior login can look like "registering gave me
        // the wrong role" when it's really just an old session lingering.
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          toast.success("Registered! Please sign in.");
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
          return;
        }
        toast.success("Welcome to Richlux!");
        router.push(callbackUrl);
      } else {
        toast.error("Could not register, please try again");
      }
    } catch (error) {
      toast.error("Could not register, please try again");
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
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Register
      </Button>
    </form>
  );
}

// New-visitor agent application lane -- creates the account itself and
// records a pending application in one step (moved here from
// app/become-agent/page.js, which now only serves already-authenticated
// users applying after the fact). Role stays "user" until a superadmin
// approves it on /admin/users -- self-registration never grants elevated
// roles directly.
function AgentApplicantForm({ callbackUrl }) {
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
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          toast.success("Application submitted -- please sign in.");
          router.push("/login");
          return;
        }
        toast.success("Application submitted -- we'll review it shortly.");
        router.push(callbackUrl);
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

function Register() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  // ?intent=agent lets a CTA (Header/Footer "Become an Agent" links) deep-link
  // straight past the role picker into the agent lane.
  const [intent, setIntent] = useState(() =>
    searchParams.get("intent") === "agent" ? "agent" : null
  );

  if (!intent) {
    return (
      <AuthLayout title="Join Richlux">
        <p className="text-sm text-ink-500 dark:text-slate-400 text-center mb-4">
          What are you here for?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RoleCard
            icon={FaHome}
            title="Looking for a home"
            description="Submit requests, browse listings, and hear back from agents."
            onClick={() => setIntent("home")}
          />
          <RoleCard
            icon={FaBriefcase}
            title="Become an Agent"
            description="Respond to housing requests and list properties for sale or rent."
            onClick={() => setIntent("agent")}
          />
        </div>
        <LoginPrompt callbackUrl={callbackUrl} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={intent === "agent" ? "Become a Richlux Agent" : "Register"}>
      <button
        type="button"
        onClick={() => setIntent(null)}
        className="inline-block mb-4 text-caption font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
      >
        ← Choose a different option
      </button>
      {intent === "agent" ? (
        <AgentApplicantForm callbackUrl={callbackUrl} />
      ) : (
        <HomeSeekerForm callbackUrl={callbackUrl} />
      )}
      <LoginPrompt callbackUrl={callbackUrl} />
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  );
}
