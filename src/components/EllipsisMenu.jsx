import { useState, useRef, useEffect } from "react";

export const EllipsisMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // close when click outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="relative"
      ref={menuRef}
            // open on hover
      // onMouseLeave={() => setOpen(false)}       // close when hover out
    >
      {/* Ellipsis Button */}
      <div
        className="flex items-center justify-center bg-[#298E9E] rounded-full w-[34px] h-[34px] cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}   // also toggle on click
      >
        <i className="fa-solid fa-ellipsis-vertical text-[#FFFFFF]"></i>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[40px] bg-white shadow-lg rounded-lg py-2 z-50 border max-w-[130px]">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px]"
            onClick={() => {
              setOpen(false);
              onEdit && onEdit();
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[14px] text-red-600"
            onClick={() => {
              setOpen(false);
              onDelete && onDelete();
            }}
          >
            Delete
          </button>


          
        </div>
      )}
    </div>
  );
};
