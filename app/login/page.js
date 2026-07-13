"use client";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useRef } from "react";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

function Login() {
  const router = useRouter();
  const email = useRef(null);
  const password = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("credentials", {
        email: email.current,
        password: password.current,
        redirect: true,
        callbackUrl: "/",
      });
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
        <div className="flex-1 h-px bg-ink-300" />
        <span className="px-3 text-caption text-ink-500">or</span>
        <div className="flex-1 h-px bg-ink-300" />
      </div>

      <Button
        variant="secondary"
        className="w-full flex items-center justify-center space-x-2"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <FaGoogle size={16} />
        <span>Continue with Google</span>
      </Button>

      <div className="w-full flex flex-col mt-4 space-y-1">
        <div className="text-ink-500 w-full text-sm text-center">
          Forgot your password?{" "}
          <span className="mx-1 text-xs font-semibold text-brand-500 cursor-pointer">
            Recover password
          </span>
        </div>
        <div className="text-ink-500 w-full text-sm text-center">
          You have not registered?{" "}
          <span
            className="mx-1 text-xs font-semibold text-brand-500 cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
