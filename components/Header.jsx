"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
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
  FaHome,
  FaBuilding,
  FaUmbrellaBeach,
  FaKey,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { LISTING_CATEGORIES, LISTING_CATEGORY_LABELS } from "@/constants/listing";
import Container from "@/components/ui/Container";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useBodyScrollLock } from "@/utils/useBodyScrollLock";

const ADMIN_ROLES = ["superadmin", "manager", "agent"];

const CATEGORY_ICONS = {
  "house-sale": FaHome,
  "property-management": FaBuilding,
  shortlet: FaUmbrellaBeach,
  rental: FaKey,
  "land-sale": FaMapMarkedAlt,
};

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

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;
    function handleEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <>
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

          <div className="flex items-center lg:hidden">
            <button
              className="text-ink-700 dark:text-slate-200 p-1"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <FaBars size={22} />
            </button>
          </div>
          </div>
        </Container>
      </header>

      <AnimatePresence>
          {menuOpen && (
            <React.Fragment key="mobile-nav">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden fixed top-0 right-0 h-full w-[82%] max-w-xs bg-white dark:bg-surface-900 shadow-elevation-lg dark:shadow-none z-50 flex flex-col overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-surface-700">
                  <span className="font-serif font-semibold text-lg text-ink-900 dark:text-white">
                    Menu
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="text-ink-700 dark:text-slate-200 p-1"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="px-5 py-4 border-b border-ink-100 dark:border-surface-700">
                  {auth ? (
                    <div className="flex items-center gap-3">
                      <Image
                        src={auth.image || "/profilepic.jpg"}
                        alt={auth.name || "Profile"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900 dark:text-white text-sm truncate">
                          {auth.name || auth.email}
                        </p>
                        {isStaff && (
                          <p className="text-caption text-ink-500 dark:text-slate-400">{roleLabel}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/logininterface"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 text-sm font-medium bg-brand-700 hover:bg-brand-800 transition-colors duration-300 text-white rounded-md px-4 py-2.5"
                      >
                        <FaUser size={14} />
                        Sign In
                      </Link>
                      <Link
                        href="/register?intent=agent"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-400 border border-brand-400 rounded-md px-4 py-2.5"
                      >
                        <FaBriefcase size={14} />
                        Become an Agent
                      </Link>
                    </div>
                  )}
                </div>

                <nav className="flex flex-col px-2 py-3">
                  {LISTING_CATEGORIES.map((category) => {
                    const Icon = CATEGORY_ICONS[category];
                    return (
                      <Link
                        key={category}
                        href={`/listings?category=${category}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-800 transition-colors duration-300"
                      >
                        {Icon && (
                          <Icon size={16} className="text-brand-700 dark:text-brand-400 shrink-0" />
                        )}
                        {LISTING_CATEGORY_LABELS[category]}
                      </Link>
                    );
                  })}
                </nav>

                {auth && (
                  <nav className="flex flex-col px-2 py-3 border-t border-ink-100 dark:border-surface-700">
                    {isStaff && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-800 transition-colors duration-300"
                      >
                        <FaUserShield size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                        {roleLabel}
                      </Link>
                    )}
                    <Link
                      href="/my-requests"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-800 transition-colors duration-300"
                    >
                      <FaClipboardList size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                      My Requests
                    </Link>
                    {effectiveRole === "user" &&
                      (applicationStatus === "pending" ? (
                        <span className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-ink-400 dark:text-slate-500 cursor-not-allowed">
                          <FaHourglassHalf size={15} className="shrink-0" />
                          Reviewing request
                        </span>
                      ) : (
                        <Link
                          href="/become-agent"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-700 dark:text-slate-200 hover:bg-ink-50 dark:hover:bg-surface-800 transition-colors duration-300"
                        >
                          <FaBriefcase size={15} className="text-brand-700 dark:text-brand-400 shrink-0" />
                          Become an Agent
                        </Link>
                      ))}
                  </nav>
                )}

                <div className="mt-auto px-5 py-4 border-t border-ink-100 dark:border-surface-700 flex items-center justify-between">
                  <ThemeToggle className="text-ink-700 dark:text-slate-200 hover:bg-ink-100 dark:hover:bg-surface-800" />
                  {auth && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logOut();
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                    >
                      <FaSignOutAlt size={15} />
                      Logout
                    </button>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>
    </>
  );
}

export default Header;
