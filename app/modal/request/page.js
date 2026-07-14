"use client";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import SelectInput from "@/components/Select";

function RequestModal({ visible, setRequestModal, requestModal, listingId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [sex, setSex] = useState("");
  const [presentlocation, setPresentLocation] = useState("");
  const [intendinglocation, setIntendingLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("");
  const [bed, setBed] = useState("");
  const [request, setRequest] = useState("");
  if (!visible) return null;

  const handleCloseClick = () => {
    setRequestModal(!requestModal);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (
      !fullname ||
      !email ||
      !phonenumber ||
      !sex ||
      !presentlocation ||
      !intendinglocation ||
      !budget ||
      !type ||
      !bed ||
      !request
    ) {
      setError("All fields must be entered.");
      setTimeout(() => {
        setError("");
      }, 3000);

      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/userrequest", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          email,
          phonenumber,
          sex,
          presentlocation,
          intendinglocation,
          budget,
          type,
          bed,
          request,
          listingId,
        }),
      });
      if (!res.ok) {
        throw new Error("Could not make request successfully");
      }
      toast.success("Request submitted");
      handleCloseClick();
    } catch (error) {
      toast.error("Something went wrong, please try again");
    } finally {
      setIsLoading(false);
    }
  };
  const optionsData = [
    { id: 1, name: "1 bed", value: "1 bed" },
    { id: 2, name: "2 bed", value: "2 bed" },
    { id: 3, name: "3 bed", value: "3 bed" },
    { id: 4, name: "4 bed", value: "4 bed" },
  ];
  const typeData = [
    { id: 1, name: "Flat", value: "Flat" },
    { id: 2, name: "Mini Flat", value: "Mini-flat" },
    { id: 3, name: "Bungalow", value: "Bungalow" },
    { id: 4, name: "Duplex", value: "Duplex" },
  ];
  return (
    <div className="md:w-3/5 w-full h-[85%] bg-white dark:bg-surface-900 shadow-2xl absolute top-24 md:top-20 z-40 rounded-md p-2 left-1/2 -translate-x-1/2">
      <div className="md:flex md:space-x-2 w-full h-full">
        <div className="flex flex-col bg-ink-100 dark:bg-surface-950 w-full h-full">
          <div className="flex justify-between items-center w-full p-2 bg-brand-400">
            <h2 className="text-white font-medium">Personal Information</h2>
            <div
              className="w-8 h-8 bg-white rounded-full md:hidden flex items-center justify-center shadow-lg cursor-pointer"
              onClick={handleCloseClick}
            >
              <FaTimes size={20} className="text-danger" />
            </div>
          </div>
          <form
            className="flex flex-col w-full p-4 space-y-3"
            onSubmit={handleRequest}
          >
            <Input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Fullname"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="text"
              value={phonenumber}
              max={11}
              onChange={(e) => setPhonenumber(e.target.value)}
              placeholder="Phone number"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="text"
              value={presentlocation}
              onChange={(e) => setPresentLocation(e.target.value)}
              placeholder="Present location"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="text"
              value={intendinglocation}
              onChange={(e) => setIntendingLocation(e.target.value)}
              placeholder="Preferred location"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <SelectInput
              value={type}
              placeholder="Type of apartment"
              options={typeData}
              onChange={(e) => setType(e.target.value)}
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <SelectInput
              value={bed}
              placeholder="Choose bed"
              options={optionsData}
              onChange={(e) => setBed(e.target.value)}
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="text"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              placeholder="Male or Female"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Input
              type="number"
              max={11}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget E.g: 500000"
              className="p-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-700 dark:text-slate-200 placeholder:text-ink-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </form>
        </div>
        <div className="w-full bg-brand-50 dark:bg-brand-900/30">
          <div className="flex justify-between items-center w-full p-2">
            <h2 className="text-ink-900 dark:text-white font-bold">Text Us Your Taste.</h2>
            <div
              className="w-8 h-8 bg-white rounded-full hidden md:flex items-center justify-center shadow-lg cursor-pointer"
              onClick={handleCloseClick}
            >
              <FaTimes size={20} className="text-danger" />
            </div>
          </div>
          <div className="p-4 w-full">
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="p-2 md:w-96 md:h-44 w-full rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Eg. I am looking for a mini-flat at Oluyole..."
            />
            {error && <div className="text-danger text-sm">* {error}</div>}
            <SubmitButton
              title="Place Request"
              className="w-full bg-brand-400 text-white text-base rounded-md cursor-pointer flex items-center justify-center px-2 py-2 mt-2 hover:bg-brand-500 transition duration-300 ease-in-out"
              isLoading={isLoading}
              onClick={handleRequest}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default RequestModal;
