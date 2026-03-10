import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";
import AdminNavbar from "../pages/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      
      {/* KUNCI SIDEBAR:
        Menggunakan "sticky top-0 h-screen" agar Sidebar menempel di atas
        dan tidak ikut tergulung (scroll) saat konten kanan sangat panjang.
      */}
      <aside className="sticky top-0 h-screen flex-shrink-0 shadow-xl z-50">
        <Sidebar />
      </aside>

      {/* KONTEN SEBELAH KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar (Otomatis sticky dari file AdminDashboard.css kamu) */}
        <AdminNavbar />
        
        {/* Area Utama (Outlet) -> Bagian ini yang akan scroll ke bawah */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}