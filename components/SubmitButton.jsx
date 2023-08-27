
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

function SubmitButton({ className, title, isLoading,onClick }) {
  const override = {
    display: "block",
    margin: "0 auto",
  };
  return (
    <button className={className} type="submit" onClick={onClick}>
      {isLoading ? (
        <ClipLoader
          color=""
          loading={isLoading}
          cssOverride={override}
          size={25}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        title
      )}
    </button>
  );
}

export default SubmitButton;
