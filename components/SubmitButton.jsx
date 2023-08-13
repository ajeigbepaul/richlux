import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

function SubmitButton({ className, title, isLoading }) {
  const override = {
    display: "block",
    margin: "0 auto",
  };
  return (
    <button className={className} type="submit">
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
