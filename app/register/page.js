"use client";
import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import AuthLayout from "@/components/ui/AuthLayout";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });
      if (response.ok) {
        toast.success("Registered!!!");
        router.push("/login");
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
    <AuthLayout title="Register">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter your Username"
          name="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Enter your email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Enter your password"
          name="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Register
        </Button>
      </form>

      <div className="w-full flex flex-col mt-4">
        <div className="text-ink-500 w-full text-sm text-center">
          Already have an account?{" "}
          <span
            className="mx-1 text-xs font-semibold text-brand-500 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;
