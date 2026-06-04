// frontend/src/routes/AsesorRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardAsesor from "../pages/Asesor/DashboardAsesor";
import ProfileAsesor from "../pages/Asesor/ProfileAsesor";
import JadwalSayaAsesor from "../pages/Asesor/JadwalSayaAsesor";
import JadwalVerifikasiTuk from "../pages/Asesor/JadwalVerifikasiTuk";
import JadwalKomiteTeknis from "../pages/Asesor/JadwalKomiteTeknis";
import JadwalMkva from "../pages/Asesor/JadwalMkva";
import IsiMKVA from "../pages/Asesor/IsiMKVA";
import UbahSandiAsesor from "../pages/Asesor/UbahSandiAsesor";
import PesertaJadwalAsesor from "../pages/Asesor/PesertaJadwalAsesor";

export default function AsesorRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={<DashboardAsesor />} />
      <Route path="profile" element={<ProfileAsesor />} />

      <Route path="jadwal-saya" element={<JadwalSayaAsesor />} />
      <Route
        path="jadwal-saya/:id_jadwal/peserta"
        element={<PesertaJadwalAsesor />}
      />

      <Route path="verifikasi-tuk" element={<JadwalVerifikasiTuk />} />
      <Route path="komite-teknis" element={<JadwalKomiteTeknis />} />

      <Route path="mkva" element={<JadwalMkva />} />
      <Route path="mkva/:id_jadwal/isi" element={<IsiMKVA />} />

      <Route path="ubah-password" element={<UbahSandiAsesor />} />

      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}