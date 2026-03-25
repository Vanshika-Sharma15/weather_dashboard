import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed z-50 h-full w-64 bg-gray-800 p-4 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition`}
      >
        <h1 className="text-xl mb-6">Weather</h1>
      </div>
    </>
  );
}