// frontend/src/routes/AsesorRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardAsesor from "../pages/asesor/DashboardAsesor";
import ProfileAsesor from "../pages/asesor/ProfileAsesor";
import JadwalSayaAsesor from "../pages/asesor/JadwalSayaAsesor";
import JadwalVerifikasiTuk from "../pages/asesor/JadwalVerifikasiTuk";
import JadwalKomiteTeknis from "../pages/asesor/JadwalKomiteTeknis";
import JadwalMkva from "../pages/asesor/JadwalMkva";
import UbahSandiAsesor from "../pages/asesor/UbahSandiAsesor";
import PesertaJadwalAsesor from "../pages/asesor/PesertaJadwalAsesor";

export default function AsesorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardAsesor />} />
      <Route path="profile" element={<ProfileAsesor />} />
      <Route path="jadwal-saya" element={<JadwalSayaAsesor />} />
      <Route path="verifikasi-tuk" element={<JadwalVerifikasiTuk />} />
      <Route path="komite-teknis" element={<JadwalKomiteTeknis />} />
      <Route path="jadwal-saya/:id_jadwal/peserta" element={<PesertaJadwalAsesor />} />
      <Route path="mkva" element={<JadwalMkva />} />
      <Route path="ubah-password" element={<UbahSandiAsesor />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}