import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = type === "error" ? "bg-red-500" : "bg-green-500";
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${colors} text-white px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold text-lg leading-none">×</button>
    </div>
  );
}
