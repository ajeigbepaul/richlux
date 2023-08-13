import React from "react";
import { FaUser } from "react-icons/fa";
function Header() {
  return (
    <header className="text-white z-40 bg-gray-900 p-4 max-w-5xl flex items-center justify-between mx-auto mt-0 shadow-xl rounded-lg">
      <div>
        <h2>RICHL-U-X</h2>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div>
          <h2>Login/SignUp</h2>
        </div>
        <FaUser />
      </div>
    </header>
  );
}

export default Header;
