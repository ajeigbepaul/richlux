"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { LISTING_CATEGORIES, LISTING_CATEGORY_LABELS } from "@/constants/listing";
import Container from "@/components/ui/Container";

const ADMIN_ROLES = ["superadmin", "manager", "agent"];

function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = session?.user;
  const isStaff = ADMIN_ROLES.includes(auth?.role);

  const logOut = () => signOut();

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-50 shadow-sm">
      <Container>
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/richluxlogo.jpg"
              alt="Richlux Property"
              width={140}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {LISTING_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/listings?category=${category}`}
                className="text-ink-700 hover:text-brand-500 text-sm font-medium transition-colors"
              >
                {LISTING_CATEGORY_LABELS[category]}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {isStaff && (
              <Link
                href="/admin"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Admin
              </Link>
            )}
            {auth ? (
              <div className="flex items-center space-x-2">
                <Image
                  src={auth.image || "/profilepic.jpg"}
                  alt={auth.name || "Profile"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <button
                  onClick={logOut}
                  className="text-sm font-medium text-white bg-brand-400 hover:bg-brand-500 rounded-md px-3 py-1.5 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/logininterface"
                className="flex items-center space-x-2 text-sm font-medium text-ink-700 hover:text-brand-500"
              >
                <FaUser size={16} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          <button
            className="lg:hidden text-ink-700"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 flex flex-col space-y-3">
            {LISTING_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/listings?category=${category}`}
                className="text-ink-700 hover:text-brand-500 text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {LISTING_CATEGORY_LABELS[category]}
              </Link>
            ))}
            {isStaff && (
              <Link
                href="/admin"
                className="text-sm font-medium text-brand-600"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {auth ? (
              <button
                onClick={logOut}
                className="text-sm font-medium text-white bg-brand-400 rounded-md px-3 py-1.5 w-fit"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/logininterface"
                className="text-sm font-medium text-ink-700"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}

export default Header;
