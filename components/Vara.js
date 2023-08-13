"use client"
import React, { useEffect } from "react";
import Vara from "vara"; // Import the Vara library properly

function VaraComponent({ text }) {
  useEffect(() => {
    const vara = new Vara(
      "#vara-container",
      "https://raw.githubusercontent.com/akzhy/Vara/master/fonts/Satisfy/SatisfySL.json",
      [
        {
          text: text,
          fontSize: 32,
          strokeWidth: 0.7,
          width:600,
          color:'orange'
          
        },
      ]
    );

    // Clean up the vara instance when the component unmounts
    return () => vara.destroy();
  }, [text]); // Add `text` as a dependency

  return <div id="vara-container" className="z-[20]"></div>;
}

export default VaraComponent;
