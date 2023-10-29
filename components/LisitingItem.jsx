import Image from "next/image";
import React from "react";
import { MdCalendarToday } from "react-icons/md";

function LisitingItem({ listingitem }) {
  const { id, image, description, title, posted, time, price, available } =
    listingitem;
  const trunc = (sentence, limit) => {
    const words = sentence.split(" ");
    if (words.length <= limit) {
      return sentence;
    }
    const trunc = words.slice(0, limit).join(" ");
    return trunc + "...";
  };
  return (
    <div className="w-full">
      <div className="rounded-3xl h-[400px] overflow-hidden bg-gray-800 shadow-2xl relative">
        {/* image */}
        <Image
          src={image}
          width={500}
          height={500}
          className="w-full object-cover h-[400px]"
        />
        <div className="w-full px-5 absolute left-0 bottom-0 bg-gray-900 opacity-70 py-5">
          <div>
            <h2 className="text-white">{title}</h2>
            <span className="text-white text-xs text-justify">
              {trunc(description, 15)}
            </span>
            <div className="flex items-center space-x-2 my-1">
              <div className="text-xs flex items-center">
                {/* <span className="text-orange-400">Posted date:</span> */}
                <MdCalendarToday className="text-orange-400" size={20} />
                <span className="text-gray-50 px-2">{`${posted} ${time}`}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-gray-50 text-sm">Price</h2>
              <h2 className="text-gray-300 font-bold">
                ₦ {price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}
              </h2>
            </div>
            <div>
              <button className="p-2 rounded-lg shadow-lg border-white hover:border-orange-400 richtrans border-2 text-white text-xs">
                view
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LisitingItem;
