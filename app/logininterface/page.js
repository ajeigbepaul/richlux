"use client";

import { FaGoogle } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/ui/AuthLayout";
import Button from "@/components/ui/Button";

function LoginInterface() {
  const router = useRouter();

  return (
    <AuthLayout title="Sign in to Richlux">
      <div className="flex flex-col space-y-3">
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => signIn(undefined, { callbackUrl: "/" })}
        >
          <FiMail size={16} />
          <span>Login with email</span>
        </Button>
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <FaGoogle size={16} />
          <span>Login with Google</span>
        </Button>
      </div>

      <div className="text-ink-500 dark:text-slate-400 w-full text-sm text-center mt-4">
        Don&apos;t have an account?{" "}
        <span
          className="mx-1 text-xs font-semibold text-brand-500 dark:text-brand-400 cursor-pointer"
          onClick={() => router.push("/register")}
        >
          Sign Up
        </span>
      </div>
    </AuthLayout>
  );
}

export default LoginInterface;
