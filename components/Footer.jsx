import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPhone, FaEnvelope, FaInstagram } from "react-icons/fa";
import { LISTING_CATEGORIES, LISTING_CATEGORY_LABELS } from "@/constants/listing";
import Container from "@/components/ui/Container";

const SOCIAL_LINKS = [
  { icon: FaPhone, label: "Call us", href: "tel:+2349026482403" },
  { icon: FaEnvelope, label: "Email us", href: "mailto:Richluxng@gmail.com" },
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://instagram.com/ibadan_richlux_property",
  },
];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "All Listings" },
  { href: "/request", label: "Submit a Request" },
  { href: "/my-requests", label: "My Requests" },
  { href: "/logininterface", label: "Sign In" },
  { href: "/become-agent", label: "Become an Agent" },
];

function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-ink-900 dark:bg-surface-950 text-ink-100 dark:text-slate-300">
      <Container className="relative z-10">
        <div className="py-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 md:gap-16">
          <div>
            <Image
              src="/richluxlogowhite.png"
              alt="Richlux Property"
              width={3264}
              height={1836}
              className="h-10 w-auto object-contain"
            />
            <p className="mt-4 text-sm text-ink-300 dark:text-slate-400 max-w-sm">
              Richlux Property connects you with house sales, property
              management, shortlet, rentals, and land sales -- simple,
              secure, and rewarding.
            </p>

            <div className="mt-6 flex items-center flex-wrap gap-x-4 gap-y-3">
              <span className="text-caption text-ink-500 dark:text-slate-500">
                © {new Date().getFullYear()} Richlux
              </span>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={label}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-400 flex items-center justify-center transition-colors"
                  >
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {LISTING_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/listings?category=${category}`}
                    className="text-sm text-ink-300 dark:text-slate-400 hover:text-white transition-colors"
                  >
                    {LISTING_CATEGORY_LABELS[category]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink-300 dark:text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Decorative oversized wordmark, bleeding off the bottom edge, centered. */}
      <div
        className="pointer-events-none select-none absolute inset-x-0 bottom-0 overflow-hidden flex justify-center"
        aria-hidden="true"
      >
        <p className="whitespace-nowrap font-sans font-extrabold leading-none text-white/5 text-[20vw] md:text-[11rem] -mb-4 md:-mb-10">
          RICHLUX
        </p>
      </div>
    </footer>
  );
}

export default Footer;
