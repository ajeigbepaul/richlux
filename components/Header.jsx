"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaBars,
  FaTimes,
  FaUserShield,
  FaClipboardList,
  FaSignOutAlt,
  FaBriefcase,
} from "react-icons/fa";
import { LISTING_CATEGORIES, LISTING_CATEGORY_LABELS } from "@/constants/listing";
import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/ui/ThemeToggle";

const ADMIN_ROLES = ["superadmin", "manager", "agent"];

const ROLE_LABELS = {
  superadmin: "Super Admin",
  manager: "Manager",
  agent: "Agent",
  user: "User",
};

function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const auth = session?.user;
  const isStaff = ADMIN_ROLES.includes(auth?.role);
  const roleLabel = ROLE_LABELS[auth?.role] || auth?.role;

  const logOut = () => signOut();

  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <header className="w-full bg-white/90 dark:bg-surface-900/90 backdrop-blur sticky top-0 z-50 shadow-sm">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/richlux.png"
              alt="Richlux Property"
              width={871}
              height={369}
              className="h-10 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/richluxlogowhite.png"
              alt="Richlux Property"
              width={3264}
              height={1836}
              className="h-10 w-auto object-contain hidden dark:block"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {LISTING_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/listings?category=${category}`}
                className="text-ink-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 text-sm font-medium transition-colors"
              >
                {LISTING_CATEGORY_LABELS[category]}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle className="text-ink-700 dark:text-slate-200 hover:bg-ink-100 dark:hover:bg-surface-800" />
            {auth ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((open) => !open)}
                  className="block rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                >
                  <Image
                    src={auth.image || "/profilepic.jpg"}
                    alt={auth.name || "Profile"}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white dark:bg-surface-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1.5 z-50">
                    {isStaff ? (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors"
                      >
                        <FaUserShield size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                        <span>{roleLabel}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200">
                        <FaUserShield size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                        <span>{roleLabel}</span>
                      </div>
                    )}
                    <Link
                      href="/my-requests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <FaClipboardList size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                      <span>My Requests</span>
                    </Link>
                    {auth.role === "user" && (
                      <Link
                        href="/become-agent"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors"
                      >
                        <FaBriefcase size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                        <span>Become an Agent</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <FaSignOutAlt size={15} className="shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/become-agent"
                  className="flex items-center space-x-2 text-sm font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
                >
                  <FaBriefcase size={16} />
                  <span>Become an Agent</span>
                </Link>
                <Link
                  href="/logininterface"
                  className="flex items-center space-x-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400"
                >
                  <FaUser size={16} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle className="text-ink-700 dark:text-slate-200 hover:bg-ink-100 dark:hover:bg-surface-800" />
            <button
              className="text-ink-700 dark:text-slate-200"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 flex flex-col space-y-3">
            {LISTING_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/listings?category=${category}`}
                className="text-ink-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {LISTING_CATEGORY_LABELS[category]}
              </Link>
            ))}
            {auth ? (
              <>
                {isStaff ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 pt-2 border-t border-ink-100 dark:border-surface-700 text-sm font-medium text-ink-700 dark:text-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserShield size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                    <span>{roleLabel}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 pt-2 border-t border-ink-100 dark:border-surface-700 text-sm font-medium text-ink-700 dark:text-slate-200">
                    <FaUserShield size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                    <span>{roleLabel}</span>
                  </div>
                )}
                <Link
                  href="/my-requests"
                  className="flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaClipboardList size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                  <span>My Requests</span>
                </Link>
                {auth.role === "user" && (
                  <Link
                    href="/become-agent"
                    className="flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaBriefcase size={15} className="text-brand-500 dark:text-brand-400 shrink-0" />
                    <span>Become an Agent</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logOut();
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-white bg-brand-400 rounded-md px-3 py-1.5 w-fit"
                >
                  <FaSignOutAlt size={15} className="shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/become-agent"
                  className="flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-brand-400"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaBriefcase size={15} className="shrink-0" />
                  <span>Become an Agent</span>
                </Link>
                <Link
                  href="/logininterface"
                  className="text-sm font-medium text-ink-700 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}

export default Header;
