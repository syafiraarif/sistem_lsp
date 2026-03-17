// frontend/src/routes/TukRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";

/* ================= PAGES ================= */

import HomeTUK from "../pages/tuk/Home";
import ListJadwal from "../pages/tuk/ListJadwal";
import BuatJadwal from "../pages/tuk/BuatJadwal";
import EditJadwal from "../pages/tuk/EditJadwal";

import AsesorPenguji from "../pages/tuk/AsesorPenguji";
import VerifikasiTUK from "../pages/tuk/VerifikasiTUK";
import ValidatorMKVA from "../pages/tuk/ValidatorMKVA"; // ✅ halaman baru

import ProfileTUK from "../pages/tuk/ProfileTUK";
import LupaPasswordTuk from "../pages/tuk/LupaPasswordTuk";

/* ========================================= */

export default function TukRoutes() {

  return (

    <Routes>

      {/* ================= DASHBOARD ================= */}
      <Route path="/" element={<HomeTUK />} />

      {/* ================= JADWAL ================= */}
      <Route path="/jadwal" element={<ListJadwal />} />
      <Route path="/jadwal/buat" element={<BuatJadwal />} />
      <Route path="/jadwal/:id/edit" element={<EditJadwal />} />

      {/* ================= ASESOR PENGUJI ================= */}
      <Route path="/jadwal/:id/asesor" element={<AsesorPenguji />} />

      {/* ================= VERIFIKASI TUK ================= */}
      <Route path="/jadwal/:id/verifikasi" element={<VerifikasiTUK />} />

      {/* ================= VALIDATOR MKVA ================= */}
      <Route path="/jadwal/:id/validator" element={<ValidatorMKVA />} />

      {/* ================= PROFILE ================= */}
      <Route path="/profile" element={<ProfileTUK />} />

      {/* ================= PASSWORD ================= */}
      <Route path="/lupa-password" element={<LupaPasswordTuk />} />

      {/* ================= DEFAULT REDIRECT ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}
