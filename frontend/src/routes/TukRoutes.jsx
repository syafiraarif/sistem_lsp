// frontend/src/routes/TukRoutes.jsx

import { Routes, Route } from "react-router-dom";
import HomeTUK from "../pages/tuk/Home";
import BuatJadwal from "../pages/tuk/BuatJadwal";
import ListJadwal from "../pages/tuk/ListJadwal";
import ProfileTUK from "../pages/tuk/ProfileTUK"; 
import LupaPasswordTuk from "../pages/tuk/LupaPasswordTuk";

export default function TukRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeTUK />} />
      <Route path="/jadwal" element={<ListJadwal />} />
      <Route path="/jadwal/buat" element={<BuatJadwal />} />
      <Route path="/profile" element={<ProfileTUK />} />
      
      {/* Ganti path sini menjadi /lupa-password */}
      <Route path="/lupa-password" element={<LupaPasswordTuk />} />
    </Routes>
  );
}