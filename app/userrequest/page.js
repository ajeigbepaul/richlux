"use client";
import Header from "@/components/Header";
import ListingTable from "@/components/ListingTable";
import React from "react";
import useSWR from "swr";
import ClipLoader from "react-spinners/ClipLoader";
function page() {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const { data, error, isLoading } = useSWR("/api/userrequest", fetcher);
  const override = {
    display: "block",
    margin: "0 auto",
  };
  return (
    <>
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <ClipLoader
            color=""
            loading={isLoading}
            cssOverride={override}
            size={25}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <main className="w-full h-full bg-gray-300 ">
          <div className="w-full bg-gray-900">
            <Header />
          </div>
          <div className="w-full h-full max-w-5xl mx-auto p-4 space-y-4">
            <div>
              <h2>Request Listings</h2>
            </div>
            <div className="w-full bg-white h-screen">
              <ListingTable data={data} />
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default page;
