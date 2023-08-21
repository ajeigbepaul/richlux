"use client"
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import React, { useState } from "react";

function RequestModal({ visible, handleClose, CloseIcon }) {
  if (!visible) return null;
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="md:w-3/5 w-full h-[75%] bg-gray-800 absolute  top-24 md:top-20 z-50 rounded-md p-2">
      <div className="md:flex md:space-x-2 w-full">
        <div className="flex flex-col bg-gray-900 w-full h-full text-white">
          <div className="flex justify-between items-center w-full md:p-2 p-2 bg-orange-400">
            <h2 className=" text-white font-medium">
              Personal Information
            </h2>
            <div
              className="w-8 h-8 bg-white rounded-full md:hidden flex items-center justify-center shadow-lg"
              onClick={handleClose}
            >
              <CloseIcon size={24} className="font-bold cursor-pointer" color="red" />
            </div>
          </div>
          <form className="flex flex-col  w-full p-4 space-y-3">
            <Input
              type="text"
              placeholder="Fullname"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="email"
              placeholder="Email"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              placeholder="Phone number"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              placeholder="Present location"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              placeholder="Sex"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              placeholder="Budget"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
          </form>
        </div>
        <div className="w-full bg-orange-400">
          <div className="flex justify-between items-center w-full md:p-2 p-2">
            <h2 className=" bg-orange-400 text-white font-bold">
              Text Us Your Taste.
            </h2>
            <div
              className="w-8 h-8 bg-white rounded-full hidden md:flex items-center justify-center shadow-lg"
              onClick={handleClose}
            >
              <CloseIcon size={24} className="font-bold cursor-pointer" />
            </div>
          </div>
          <form className="md:p-4 p-2 w-full">
            <textarea
              // rows={7}
              // cols={40}
              className="p-2 md:w-96 md:h-44 w-full"
              placeholder="Eg. I am looking for a mini-flat at Oluyole..."
            />
            <SubmitButton
              title="Place Request"
              className="w-full bg-orange-300 text-white text-base rounded-md cursor-pointer flex items-center justify-center px-2 py-2 mt-2 hover:bg-black hover:text-slate-100 transition duration-1000 ease-in-out"
              isLoading={isLoading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestModal;
