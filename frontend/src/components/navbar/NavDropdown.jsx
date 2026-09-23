import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavDropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = items.some((item) => {
    return (
      location.pathname === item.href ||
      location.pathname.startsWith(`${item.href}/`)
    );
  });

  return (
    <div
      className="group relative flex h-full items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`flex items-center gap-1 font-medium transition-colors duration-300 ${
          isActive
            ? "font-bold text-[#CC6B27]"
            : "text-gray-700 hover:text-[#CC6B27]"
        }`}
      >
        {label}

        <svg
          className={`h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[100%] z-50 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
          {items.map((item, idx) => {
            const itemActive =
              location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={idx}
                to={item.href}
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  itemActive
                    ? "bg-[#CC6B27]/10 text-[#CC6B27]"
                    : "text-gray-700 hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}