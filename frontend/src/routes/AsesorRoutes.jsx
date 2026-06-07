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

import FRIA02 from "../pages/Asesor/komiteTeknis/FRIA02";
import FRIA05 from "../pages/Asesor/komiteTeknis/FRIA05";

export default function AsesorRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/asesor/dashboard" replace />} />

      {/* DASHBOARD */}
      <Route path="dashboard" element={<DashboardAsesor />} />
      <Route path="profile" element={<ProfileAsesor />} />

      {/* JADWAL SAYA */}
      <Route path="jadwal-saya" element={<JadwalSayaAsesor />} />
      <Route
        path="jadwal-saya/:id_jadwal/peserta"
        element={<PesertaJadwalAsesor />}
      />

      {/* VERIFIKASI TUK */}
      <Route path="verifikasi-tuk" element={<JadwalVerifikasiTuk />} />

      {/* KOMITE TEKNIS */}
      <Route path="komite-teknis" element={<JadwalKomiteTeknis />} />

      {/* FR.IA.02 Komite Teknis */}
      <Route
        path="komite-teknis/:id_jadwal/fr-ia02"
        element={<FRIA02 />}
      />

      {/* FR.IA.05 Paket Soal */}
      <Route
        path="komite-teknis/:id_jadwal/paket-soal"
        element={<FRIA05 />}
      />

      {/* MKVA */}
      <Route path="mkva" element={<JadwalMkva />} />

      {/* Route untuk tombol Isi MKVA */}
      <Route path="mkva/:id_jadwal/isi" element={<IsiMKVA />} />

      {/* Route cadangan kalau tombol mengarah ke /asesor/mkva/jadwal/:id_jadwal */}
      <Route path="mkva/jadwal/:id_jadwal" element={<IsiMKVA />} />

      {/* Route cadangan kalau URL /asesor/mkva/jadwal/:id_jadwal/isi */}
      <Route path="mkva/jadwal/:id_jadwal/isi" element={<IsiMKVA />} />

      {/* UBAH PASSWORD */}
      <Route path="ubah-password" element={<UbahSandiAsesor />} />

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/asesor/dashboard" replace />} />
    </Routes>
  );
}