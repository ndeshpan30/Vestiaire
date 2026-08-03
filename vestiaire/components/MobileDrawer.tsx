import React from "react";

export function MobileDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-in drawer container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          absolute inset-y-0 left-0 w-72 bg-white shadow-2xl
          transition-transform duration-200 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {children}
      </div>
    </div>
  );
}
