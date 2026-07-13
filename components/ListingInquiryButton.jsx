"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import RequestModal from "@/app/modal/request/page";

function ListingInquiryButton({ listingId }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Make an Inquiry
      </Button>
      <RequestModal
        visible={open}
        setRequestModal={setOpen}
        requestModal={open}
        listingId={listingId}
      />
    </>
  );
}

export default ListingInquiryButton;
