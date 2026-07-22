"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import RequestWizardModal from "@/components/RequestWizardModal";

// Reuses the same polished wizard as the homepage/"/request" CTA (tagged
// with listingId/category instead of a blank slate) rather than the old
// bespoke quick-inquiry modal, which had drifted out of sync with the
// current UserRequest schema and never got the wizard's styling passes.
function ListingInquiryButton({ listingId, category }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Make an Inquiry
      </Button>
      <AnimatePresence>
        {open && (
          <RequestWizardModal
            onClose={() => setOpen(false)}
            listingId={listingId}
            initialCategory={category}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ListingInquiryButton;
