"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
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
  FaHourglassHalf,
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

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const auth = session?.user;

  // The session/JWT's role is frozen for the life of the token (see
  // utils/authOptions.js) -- it won't reflect a superadmin approving this
  // user's agent application until they log out/in again. Reading the same
  // live endpoint app/become-agent/page.js already uses keeps the "Become an
  // Agent" menu item (and its Admin-link replacement) in sync immediately.
  const { data: agentAppData } = useSWR(
    auth ? "/api/agent-applications" : null,
    fetcher
  );
  const effectiveRole = agentAppData?.role || auth?.role;
  const applicationStatus = agentAppData?.agentApplication?.status || "none";
  const isStaff = ADMIN_ROLES.includes(effectiveRole);
  const roleLabel = ROLE_LABELS[effectiveRole] || effectiveRole;

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
                className="text-ink-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 text-sm font-semibold tracking-tight transition-colors duration-300"
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
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-surface-800 shadow-elevation-md dark:shadow-none ring-1 ring-ink-900/5 dark:ring-0 py-1.5 z-50">
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors duration-300"
                      >
                        <FaUserShield size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                        <span>{roleLabel}</span>
                      </Link>
                    )}
                    <Link
                      href="/my-requests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors duration-300"
                    >
                      <FaClipboardList size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                      <span>My Requests</span>
                    </Link>
                    {effectiveRole === "user" &&
                      (applicationStatus === "pending" ? (
                        <span
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-400 dark:text-slate-500 cursor-not-allowed"
                          title="A superadmin is reviewing your application"
                        >
                          <FaHourglassHalf size={15} className="shrink-0" />
                          <span>Reviewing request</span>
                        </span>
                      ) : (
                        <Link
                          href="/become-agent"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors duration-300"
                        >
                          <FaBriefcase size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                          <span>Become an Agent</span>
                        </Link>
                      ))}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-ink-50 dark:hover:bg-surface-700 transition-colors duration-300"
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
                  href="/register?intent=agent"
                  className="flex items-center space-x-2 text-sm font-medium text-brand-700 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300"
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
                className="text-ink-700 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-400 text-sm font-semibold tracking-tight"
                onClick={() => setMenuOpen(false)}
              >
                {LISTING_CATEGORY_LABELS[category]}
              </Link>
            ))}
            {auth ? (
              <>
                {isStaff && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 pt-2 border-t border-ink-100 dark:border-surface-700 text-sm font-medium text-ink-700 dark:text-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserShield size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                    <span>{roleLabel}</span>
                  </Link>
                )}
                <Link
                  href="/my-requests"
                  className={`flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-slate-200 ${
                    isStaff ? "" : "pt-2 border-t border-ink-100 dark:border-surface-700"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaClipboardList size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                  <span>My Requests</span>
                </Link>
                {effectiveRole === "user" &&
                  (applicationStatus === "pending" ? (
                    <span className="flex items-center gap-3 text-sm font-medium text-ink-400 dark:text-slate-500 cursor-not-allowed">
                      <FaHourglassHalf size={15} className="shrink-0" />
                      <span>Reviewing request</span>
                    </span>
                  ) : (
                    <Link
                      href="/become-agent"
                      className="flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-slate-200"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaBriefcase size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                      <span>Become an Agent</span>
                    </Link>
                  ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logOut();
                  }}
                  className="flex items-center gap-3 text-sm font-medium text-white bg-brand-700 rounded-md px-3 py-1.5 w-fit"
                >
                  <FaSignOutAlt size={15} className="shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register?intent=agent"
                  className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-400"
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
