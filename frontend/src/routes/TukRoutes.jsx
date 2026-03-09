// frontend/src/routes/TukRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";

/* ================= PAGES ================= */
import HomeTUK from "../pages/tuk/Home";
import BuatJadwal from "../pages/tuk/BuatJadwal";
import ListJadwal from "../pages/tuk/ListJadwal";
import ProfileTUK from "../pages/tuk/ProfileTUK";
import LupaPasswordTuk from "../pages/tuk/LupaPasswordTuk";
import DetailJadwal from "../pages/tuk/DetailJadwal";
import ManageAsesor from "../pages/tuk/ManageAsesor";
import EditJadwal from "../pages/tuk/EditJadwal";

/* ========================================= */

export default function TukRoutes() {
  return (
    <Routes>

      {/* ================= DASHBOARD ================= */}
      <Route path="/" element={<HomeTUK />} />

      {/* ================= JADWAL ================= */}
      <Route path="/jadwal" element={<ListJadwal />} />
      <Route path="/jadwal/buat" element={<BuatJadwal />} />

      {/* ✅ EDIT JADWAL */}
      <Route path="/jadwal/:id/edit" element={<EditJadwal />} />

      {/* ✅ DETAIL JADWAL */}
      <Route path="/jadwal/:id/detail" element={<DetailJadwal />} />

      {/* ✅ MANAGE ASESO R */}
      <Route path="/jadwal/:id/asesor" element={<ManageAsesor />} />

      {/* ================= PROFILE ================= */}
      <Route path="/profile" element={<ProfileTUK />} />

      {/* ================= PASSWORD ================= */}
      <Route path="/lupa-password" element={<LupaPasswordTuk />} />

      {/* ================= REDIRECT ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}