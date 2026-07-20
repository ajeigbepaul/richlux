"use client";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { useRef } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const email = useRef(null);
  const password = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // redirect: false keeps the browser on this page on failure, so a bad
      // password (or a transient DB hiccup) shows as a toast right here
      // instead of navigating away to NextAuth's raw /api/auth/error page.
      const result = await signIn("credentials", {
        email: email.current,
        password: password.current,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.push(result?.url || callbackUrl);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AuthLayout title="Login">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email"
          name="email"
          onChange={(e) => (email.current = e.target.value)}
        />
        <Input
          type="password"
          placeholder="Enter your password"
          name="password"
          onChange={(e) => (password.current = e.target.value)}
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Login
        </Button>
      </form>

      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-ink-300 dark:bg-surface-700" />
        <span className="px-3 text-caption text-ink-500 dark:text-slate-400">or</span>
        <div className="flex-1 h-px bg-ink-300 dark:bg-surface-700" />
      </div>

      <Button
        variant="secondary"
        className="w-full flex items-center justify-center space-x-2"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <FaGoogle size={16} />
        <span>Continue with Google</span>
      </Button>

      <div className="w-full flex flex-col mt-4 space-y-1">
        <div className="text-ink-500 dark:text-slate-400 w-full text-sm text-center">
          Forgot your password?{" "}
          <span className="mx-1 text-xs font-semibold text-brand-500 dark:text-brand-400 cursor-pointer">
            Recover password
          </span>
        </div>
        <div className="text-ink-500 dark:text-slate-400 w-full text-sm text-center">
          You have not registered?{" "}
          <span
            className="mx-1 text-xs font-semibold text-brand-500 dark:text-brand-400 cursor-pointer"
            onClick={() =>
              router.push(`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`)
            }
          >
            Register
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
