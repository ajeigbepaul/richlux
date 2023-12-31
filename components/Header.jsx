"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiHomeHeart } from "react-icons/bi";
import useSWR from "swr";

function Header() {
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const router = useRouter();
  const { data: session } = useSession();
  const logOut = () => {
    signOut();
  };

  const auth = session?.user;
  const { data, error, isLoading } = useSWR("/api/userrequest", fetcher);
  return (
    <header className="text-white z-50 bg-gray-900 p-4 md:max-w-5xl flex flex-col md:flex-row items-center justify-center md:justify-between mx-auto mt-0 shadow-xl rounded-lg">
      <div className="mb-3 md:mb-0 cursor-pointer" onClick={()=>router.push("/")}>
        <h2>RICHL-U-X</h2>
      </div>
      <div className="flex items-center justify-center space-x-2 w-fit">
        <div className="flex items-center justify-center md:w-full">
          {auth ? (
            <>
              <div className="flex items-center justify-center space-x-2 w-fit">
                <span className="text-xs text-gray-200">
                  {auth?.email.substring(0, auth.email.indexOf("@"))}...
                  {auth?.email.slice(-3)}
                </span>

                {auth.image ? (
                  <Image
                    src={auth?.image}
                    alt="profilepics"
                    width={20}
                    height={20}
                    className="w-8 h-8 rounded-full object-cover "
                  />
                ) : (
                  <Image
                    src={"/profilepic.jpg"}
                    alt="profilepics"
                    width={20}
                    height={20}
                    className="w-8 h-8 rounded-full object-cover "
                  />
                )}

                <span
                  className="bg-orange-500 text-white rounded-md py-1 px-2 mx-2 cursor-pointer text-sm"
                  onClick={logOut}
                >
                  Logout
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-2">
                <Link href="/logininterface">
                  <span className="cursor-pointer w-1/4">Sign-In</span>
                </Link>

                <Image
                  src="/profilepic.jpg"
                  alt="profilepics"
                  width={20}
                  height={20}
                  className="w-8 h-8 rounded-full object-cover "
                />
                <FaUser size={24} />
              </div>
            </>
          )}
        </div>
        <div
          className="relative space-x-2 cursor-pointer"
          onClick={() => router.push("/userrequest")}
        >
          <BiHomeHeart size={30} className="text-red-400" />

          <div className="absolute top-0 -right-[18px] px-2 font-semibold w-6 h-6 rounded-full flex items-center justify-center border border-red-400">
            {" "}
            {data?.length}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
