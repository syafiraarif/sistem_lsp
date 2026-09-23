import { Link, useLocation } from "react-router-dom";

export default function NavItem({ label, href }) {
  const location = useLocation();

  const isActive =
    href === "/"
      ? location.pathname === "/"
      : location.pathname === href ||
        location.pathname.startsWith(`${href}/`);

  return (
    <Link
      to={href}
      className={`font-medium transition-colors duration-300 ${
        isActive
          ? "font-bold text-[#CC6B27]"
          : "text-gray-700 hover:text-[#CC6B27]"
      }`}
    >
      {label}
    </Link>
  );
}