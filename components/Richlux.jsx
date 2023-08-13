import React from "react";
import VaraComponent from "./Vara";
import { BiHomeHeart, BiSupport } from "react-icons/bi";
import { MdOutlineSell } from "react-icons/md";
function Richlux() {
  return (
    <div className="w-screen h-[90vh] bg-gray-900 flex items-center justify-center relative">
      <div className="items-center justify-center flex flex-col w-4/5 ">
        <VaraComponent text="Richlux Properties" />
        <div className="mt-5 flex items-center justify-between w-3/5">
          <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer">
            <div className="flex items-center justify-center space-x-2">
              <BiHomeHeart size={30} className="text-orange-300" />
              <h2>Buy</h2>
            </div>
            <span className="text-sm text-gray-400">We sell comfort</span>
          </div>
          <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer">
            <div className="flex items-center justify-center space-x-2">
              <MdOutlineSell size={30} className="text-orange-300" />
              <h2>Rent</h2>
            </div>
            <span className="text-sm text-gray-400">Peace of mind</span>
          </div>
          <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer">
            <div className="flex items-center justify-center space-x-2">
              <BiSupport size={30} className="text-orange-300" />
              <h2>Contact</h2>
            </div>
            <span className="text-sm text-gray-400">For all enquiries</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Richlux;
