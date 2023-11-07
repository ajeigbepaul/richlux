"use client";
import Header from "@/components/Header";
import ListingTable from "@/components/ListingTable";
import React from "react";

function page() {
  return (
    <>
      <main className="w-full h-screen bg-gray-300">
        <div className="w-full bg-gray-900">
          <Header />
        </div>
        <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
          <div><h2>Request Listings</h2></div>
          <div className="w-full bg-white">
            <ListingTable/>
          </div>
        </div>
      </main>
    </>
  );
}

export default page;
