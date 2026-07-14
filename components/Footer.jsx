import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPhone, FaEnvelope, FaInstagram } from "react-icons/fa";
import { LISTING_CATEGORIES, LISTING_CATEGORY_LABELS } from "@/constants/listing";
import Container from "@/components/ui/Container";

function Footer() {
  return (
    <footer className="w-full bg-ink-900 dark:bg-surface-950 text-ink-100 dark:text-slate-300 mt-16">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              src="/richluxlogo.jpg"
              alt="Richlux Property"
              width={140}
              height={48}
              className="h-10 w-auto object-contain bg-white rounded-md p-1"
            />
            <p className="mt-4 text-sm text-ink-300 dark:text-slate-400">
              Your No 1 realtor -- house sales, property management, shortlet,
              rentals, and land sales.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300 mb-3">
              Services
            </h3>
            <ul className="space-y-2">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300 mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-ink-300 dark:text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-sm text-ink-300 dark:text-slate-400 hover:text-white transition-colors">
                  All Listings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300 mb-3">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-ink-300 dark:text-slate-400">
                <FaPhone size={14} />
                <a href="tel:+2349026482403" className="hover:text-white transition-colors">
                  +234 902 648 2403
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-ink-300 dark:text-slate-400">
                <FaEnvelope size={14} />
                <a href="mailto:Richluxng@gmail.com" className="hover:text-white transition-colors">
                  Richluxng@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-ink-300 dark:text-slate-400">
                <FaInstagram size={14} />
                <a
                  href="https://instagram.com/ibadan_richlux_property"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ibadan_richlux_property
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-700 dark:border-surface-700 py-6 text-center text-caption text-ink-500 dark:text-slate-500">
          © {new Date().getFullYear()} Richlux Properties. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
