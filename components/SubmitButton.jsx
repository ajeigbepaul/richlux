import React from "react";
import Button from "./ui/Button";

// Kept as a thin wrapper around ui/Button so existing call sites
// (login/register/modal forms) don't need to change.
function SubmitButton({ className, title, isLoading, onClick }) {
  return (
    <Button
      type="submit"
      className={className}
      isLoading={isLoading}
      onClick={onClick}
    >
      {title}
    </Button>
  );
}

export default SubmitButton;
