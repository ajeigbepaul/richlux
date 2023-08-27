// "use client";
// import React, { useState } from "react";
// import VaraComponent from "./Vara";
// import { BiHomeHeart, BiSupport, BiHomeCircle } from "react-icons/bi";
// import { MdOutlineSell, MdClose } from "react-icons/md";
// import RequestModal from "@/app/modal/request/page";
// import { useRouter } from "next/navigation";
// async function Richlux() {

//   // const { usersrequest } = await FetchUsersRequest();
//   const router = useRouter();
//   const [requestModal, setRequestModal] = useState(false);
  
//   const handleRequest = () => {
//     setRequestModal(!requestModal);
//   };
//   const handleClose = () => {
//     setRequestModal(!requestModal);
//   };
//   return (
//     <div className="w-screen h-[90vh] bg-gray-900 flex items-center justify-center relative">
//       <div className="items-center justify-center flex flex-col md:w-4/5 w-full">
//         <VaraComponent text="Richlux Properties" />
//         <div className="mt-5 flex flex-col items-center justify-between md:w-[50%] w-full md:px-0 px-4 ">
//           <div className="w-full flex items-center justify-center space-x-4 px-4 mb-7">
//             <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer ">
//               <div className="flex items-center justify-center space-x-2">
//                 <BiHomeCircle size={30} className="text-orange-300" />
//                 <h2>Buy</h2>
//               </div>
//               <span className="text-xs text-gray-400 hidden md:flex">
//                 We sell comfort
//               </span>
//             </div>
//             <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer ">
//               <div className="flex items-center justify-center space-x-2">
//                 <MdOutlineSell size={30} className="text-orange-300" />
//                 <h2>Rent</h2>
//               </div>
//               <span className="text-xs text-gray-400 hidden md:flex">
//                 Peace of mind
//               </span>
//             </div>
//             <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer">
//               <div className="flex items-center justify-center space-x-2">
//                 <BiSupport size={30} className="text-orange-300" />
//                 <h2>Contact</h2>
//               </div>
//               <span className="text-xs text-gray-400 hidden md:flex">
//                 For all enquiries
//               </span>
//             </div>
//           </div>
//           <div
//             className="flex w-full items-center justify-center text-white p-2  richshadow richtrans cursor-pointer"
//             onClick={handleRequest}
//           >
//             <div className="flex flex-col px-4">
//               <span className="text-orange-300 text-xl md:text-3xl font-bold ">
//                 Make Your Request
//               </span>
//               <span className="md:text-sm text-xs text-center">
//                 What kind of house are you looking for?
//               </span>
//             </div>
//             <BiHomeHeart size={40} className="text-red-400" />
//           </div>
//         </div>
//       </div>
//       <RequestModal
//         visible={requestModal}
//         handleClose={handleClose}
//         CloseIcon={MdClose}
//       />
//     </div>
//   );
// }

// export default Richlux;
"use client";

import React, { useState } from "react";
import {Rochester} from "next/font/google"
// import VaraComponent from "./Vara";
import { BiHomeHeart, BiSupport, BiHomeCircle } from "react-icons/bi";
import { MdOutlineSell, MdClose } from "react-icons/md";
import RequestModal from "@/app/modal/request/page";

const stylish = Rochester({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});
function Richlux() {
  const [requestModal, setRequestModal] = useState(false);
  const handleRequest = () => {
    setRequestModal(!requestModal);
  };
  const handleClose = () => {
    setRequestModal(!requestModal);
  };
  return (
    <div className="w-screen h-[90vh] bg-gray-900 flex items-center justify-center relative">
      <div className="items-center justify-center flex flex-col md:w-4/5 w-full">
        {/* <VaraComponent text="Richlux Properties" /> */}
        <div>
          <h2
            className={`${stylish.className} md:text-7xl text-4xl text-orange-300`}
          >
            Richlux Properties
          </h2>
        </div>
        <div className="mt-5 flex flex-col items-center justify-between md:w-[50%] w-full md:px-0 px-4 ">
          <div className="w-full flex items-center justify-center space-x-4 px-4 mb-7">
            <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer ">
              <div className="flex items-center justify-center space-x-2">
                <BiHomeCircle size={30} className="text-orange-300" />
                <h2>Buy</h2>
              </div>
              <span className="text-xs text-gray-400 hidden md:flex">
                We sell comfort
              </span>
            </div>
            <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer ">
              <div className="flex items-center justify-center space-x-2">
                <MdOutlineSell size={30} className="text-orange-300" />
                <h2>Rent</h2>
              </div>
              <span className="text-xs text-gray-400 hidden md:flex">
                Peace of mind
              </span>
            </div>
            <div className="flex flex-col items-center text-white p-3 rounded-lg richshadow richtrans cursor-pointer">
              <div className="flex items-center justify-center space-x-2">
                <BiSupport size={30} className="text-orange-300" />
                <h2>Contact</h2>
              </div>
              <span className="text-xs text-gray-400 hidden md:flex">
                For all enquiries
              </span>
            </div>
          </div>
          <div
            className="flex w-full items-center justify-center text-white p-2  richshadow richtrans cursor-pointer"
            onClick={handleRequest}
          >
            <div className="flex flex-col px-4">
              <span className="text-orange-300 text-xl md:text-3xl font-bold ">
                Make Your Request
              </span>
              <span className="md:text-sm text-xs text-center">
                What kind of house are you looking for?
              </span>
            </div>
            <BiHomeHeart size={40} className="text-red-400" />
          </div>
        </div>
      </div>
      {/* <RequestModal
        visible={requestModal}
        handleClose={handleClose}
        CloseIcon={MdClose}
      /> */}
    </div>
  );
}

export default Richlux;
