"use client";

import React, { useState } from "react";
import { BiHomeHeart, BiSupport, BiHomeCircle } from "react-icons/bi";
import RequestModal from "@/app/modal/request/page";
import Container from "@/components/ui/Container";

const QUICK_LINKS = [
  { icon: BiHomeCircle, label: "Buy", caption: "We sell comfort" },
  { icon: BiHomeHeart, label: "Rent", caption: "Peace of mind" },
  { icon: BiSupport, label: "Contact", caption: "For all enquiries" },
];

function Richlux() {
  const [requestModal, setRequestModal] = useState(false);
  const handleRequest = () => setRequestModal(!requestModal);

  return (
    <div className="w-full bg-white dark:bg-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-blob opacity-70 pointer-events-none" />
      <Container>
        <div className="relative py-20 flex flex-col items-center text-center">
          <h1 className="font-display text-display-md md:text-display-lg text-ink-900 dark:text-white">
            Richlux Properties
          </h1>
          <p className="mt-4 max-w-2xl text-body text-ink-500 dark:text-slate-400">
            Are you currently building or selling a new home? Let our real
            estate agency handle it.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {QUICK_LINKS.map(({ icon: Icon, label, caption }) => (
              <div
                key={label}
                className="flex flex-col items-center bg-white dark:bg-surface-800 shadow-card p-4 rounded-xl richtrans cursor-pointer w-32"
              >
                <Icon size={28} className="text-brand-400" />
                <h2 className="mt-1 font-semibold text-ink-900 dark:text-white">{label}</h2>
                <span className="text-caption text-ink-500 dark:text-slate-400 text-center">
                  {caption}
                </span>
              </div>
            ))}
          </div>

          <div
            onClick={handleRequest}
            className="mt-10 flex items-center bg-brand-400 hover:bg-brand-500 transition-colors text-white px-6 py-4 rounded-xl shadow-card cursor-pointer"
          >
            <div className="flex flex-col text-left px-2">
              <span className="text-xl md:text-2xl font-bold">
                Make Your Request
              </span>
              <span className="text-caption md:text-sm">
                What kind of house are you looking for?
              </span>
            </div>
            <BiHomeHeart size={36} className="ml-4" />
          </div>
        </div>
      </Container>
      <RequestModal
        visible={requestModal}
        setRequestModal={setRequestModal}
        requestModal={requestModal}
      />
    </div>
  );
}

export default Richlux;
