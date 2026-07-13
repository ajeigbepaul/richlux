"use client";

import { FaGoogle } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/ui/AuthLayout";
import Button from "@/components/ui/Button";

function LoginInterface() {
  return (
    <AuthLayout title="Sign in to Richlux">
      <div className="flex flex-col space-y-3">
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center space-x-2"
          onClick={() => signIn()}
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
    </AuthLayout>
  );
}

export default LoginInterface;
