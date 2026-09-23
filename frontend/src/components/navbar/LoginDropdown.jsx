import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const roles = [
    {
      label: "Asesor",
      role: "asesor",
    },
    {
      label: "Peserta (Asesi)",
      role: "asesi",
    },
    {
      label: "Administrator",
      role: "admin",
    },
    {
      label: "Komite Teknis",
      role: "asesor",
    },
    {
      label: "TUK",
      role: "tuk",
    },
  ];

  const handleLogin = (role) => {
    setOpen(false);

    navigate("/login", {
      state: {
        role,
      },
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg bg-[#CC6B27] px-5 py-2 font-semibold text-white transition-all hover:bg-[#A8561F]"
      >
        Login
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu login"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 h-full w-full cursor-default"
          />

          <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {roles.map((item, index) => (
              <button
                key={`${item.role}-${index}`}
                type="button"
                onClick={() => handleLogin(item.role)}
                className="block w-full px-5 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
              >
                Login sebagai {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}