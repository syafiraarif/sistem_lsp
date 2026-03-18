import { useState } from "react";
import { Link } from "react-router-dom";

export default function NavDropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-gray-700 font-medium hover:text-orange-500 transition-colors duration-300">
        {label}
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50">
          {items.map((item, idx) => (
            <Link
              key={idx}
              to={item.href}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}