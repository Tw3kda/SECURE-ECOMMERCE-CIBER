import React from "react";

export default function Container({ children }) {
  return (
    <div className="max-w-6xl mx-auto p-8 text-center bg-black shadow-lg rounded-3xl border border-gray-100">
      {children}
    </div>
  );
}
