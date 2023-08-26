"use client";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function RequestModal({ visible, handleClose, CloseIcon }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [sex, setSex] = useState("");
  const [presentlocation, setPresentLocation] = useState("");
  const [intendinglocation, setIntendingLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [request, setRequest] = useState("");
  if (!visible) return null;

  

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
      const res = await fetch("api/userrequest", {
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
          request,
        }),
      });
      if (!res.ok) {
        throw new Error("Could not make request successfully");
      }
      toast.success("Request submitted");
      handleClose();
      
      // router.push("/")
    } catch (error) {
      console.log("something went wrong", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:w-3/5 w-full h-[75%] bg-gray-800 absolute  top-24 md:top-20 z-50 rounded-md p-2">
      <div className="md:flex md:space-x-2 w-full">
        <div className="flex flex-col bg-gray-900 w-full h-full text-white">
          <div className="flex justify-between items-center w-full md:p-2 p-2 bg-orange-400">
            <h2 className=" text-white font-medium">Personal Information</h2>
            <div
              className="w-8 h-8 bg-white rounded-full md:hidden flex items-center justify-center shadow-lg"
              onClick={handleClose}
            >
              <CloseIcon
                size={24}
                className="font-bold cursor-pointer"
                color="red"
              />
            </div>
          </div>
          <form
            className="flex flex-col  w-full p-4 space-y-3"
            onSubmit={() => {
              console.log("");
            }}
          >
            <Input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Fullname"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              value={phonenumber}
              max={11}
              onChange={(e) => setPhonenumber(e.target.value)}
              placeholder="Phone number"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              value={presentlocation}
              onChange={(e) => setPresentLocation(e.target.value)}
              placeholder="Present location"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              value={intendinglocation}
              onChange={(e) => setIntendingLocation(e.target.value)}
              placeholder="intending location"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="text"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              placeholder="Male or Female"
              className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
            />
            <Input
              type="number"
              max={11}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget E.g: 500000"
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
          <div className="md:p-4 p-2 w-full">
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="p-2 md:w-96 md:h-44 w-full"
              placeholder="Eg. I am looking for a mini-flat at Oluyole..."
            />
            {error && (
              <div className="bg-white text-red-500 text-sm">* {error}</div>
            )}
            <SubmitButton
              title="Place Request"
              className="w-full bg-orange-300 text-white text-base rounded-md cursor-pointer flex items-center justify-center px-2 py-2 mt-2 hover:bg-black hover:text-slate-100 transition duration-1000 ease-in-out"
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
// "use client";
// import Input from "@/components/Input";
// import SubmitButton from "@/components/SubmitButton";
// import React, { useState } from "react";

// function RequestModal({ visible, handleClose, CloseIcon }) {
//   const [isLoading, setIsLoading] = useState(false);
//   if (!visible) return null;

//   return (
//     <div className="md:w-3/5 w-full h-[75%] bg-gray-800 absolute  top-24 md:top-20 z-50 rounded-md p-2">
//       <div className="md:flex md:space-x-2 w-full">
//         <div className="flex flex-col bg-gray-900 w-full h-full text-white">
//           <div className="flex justify-between items-center w-full md:p-2 p-2 bg-orange-400">
//             <h2 className=" text-white font-medium">Personal Information</h2>
//             <div
//               className="w-8 h-8 bg-white rounded-full md:hidden flex items-center justify-center shadow-lg"
//               onClick={handleClose}
//             >
//               <CloseIcon
//                 size={24}
//                 className="font-bold cursor-pointer"
//                 color="red"
//               />
//             </div>
//           </div>
//           <form className="flex flex-col  w-full p-4 space-y-3">
//             <Input
//               type="text"
//               placeholder="Fullname"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//             <Input
//               type="email"
//               placeholder="Email"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//             <Input
//               type="text"
//               placeholder="Phone number"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//             <Input
//               type="text"
//               placeholder="Present location"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//             <Input
//               type="text"
//               placeholder="Sex"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//             <Input
//               type="text"
//               placeholder="Budget"
//               className="p-1 text-gray-700 placeholder:text-orange-400 placeholder:text-sm"
//             />
//           </form>
//         </div>
//         <div className="w-full bg-orange-400">
//           <div className="flex justify-between items-center w-full md:p-2 p-2">
//             <h2 className=" bg-orange-400 text-white font-bold">
//               Text Us Your Taste.
//             </h2>
//             <div
//               className="w-8 h-8 bg-white rounded-full hidden md:flex items-center justify-center shadow-lg"
//               onClick={handleClose}
//             >
//               <CloseIcon size={24} className="font-bold cursor-pointer" />
//             </div>
//           </div>
//           <form className="md:p-4 p-2 w-full">
//             <textarea
//               className="p-2 md:w-96 md:h-44 w-full"
//               placeholder="Eg. I am looking for a mini-flat at Oluyole..."
//             />
//             <SubmitButton
//               title="Place Request"
//               className="w-full bg-orange-300 text-white text-base rounded-md cursor-pointer flex items-center justify-center px-2 py-2 mt-2 hover:bg-black hover:text-slate-100 transition duration-1000 ease-in-out"
//               isLoading={isLoading}
//             />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RequestModal;
