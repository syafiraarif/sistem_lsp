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
import DetailPesertaAsesor from "../pages/Asesor/DetailPesertaAsesor";
import MAPA01Asesor from "../pages/Asesor/MAPA01Asesor";
import MAPA02Asesor from "../pages/Asesor/MAPA02Asesor";

import FRIA01Asesor from "../pages/Asesor/FRIA01Asesor";
import FRIA02Asesor from "../pages/Asesor/FRIA02Asesor";
import FRIA03Asesor from "../pages/Asesor/FRIA03Asesor";
import PresensiAsesor from "../pages/Asesor/PresensiAsesor";
import FRIA05Asesor from "../pages/Asesor/FRIA05Asesor";
import FRAK01Asesor from "../pages/Asesor/FRAK01Asesor";
import FRAK02Asesor from "../pages/Asesor/FRAK02Asesor";
import FRAK05Asesor from "../pages/Asesor/FRAK05Asesor";
import FRAK06Asesor from "../pages/Asesor/FRAK06Asesor";

import FRIA02 from "../pages/Asesor/komiteTeknis/FRIA02";
import FRIA05 from "../pages/Asesor/komiteTeknis/FRIA05";
import FRIA03Komite from "../pages/Asesor/komiteTeknis/FRIA03Komite";


export default function AsesorRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="/asesor/dashboard" replace />} />

            <Route path="dashboard" element={<DashboardAsesor />} />
            <Route path="profile" element={<ProfileAsesor />} />

            <Route
                path="jadwal-saya"
                element={<JadwalSayaAsesor />}
            />

            <Route
                path="jadwal-saya/:id_jadwal/peserta"
                element={<PesertaJadwalAsesor />}
            />

            <Route
                path="jadwal-saya/:id_jadwal/peserta/:id_peserta"
                element={<DetailPesertaAsesor />}
            />

            <Route
                path="presensi/:id_jadwal"
                element={<PresensiAsesor />}
            />

            <Route
                path="mapa01/:id_jadwal/:id_peserta"
                element={<MAPA01Asesor />}
            />

            <Route
                path="mapa02/:id_jadwal/:id_peserta"
                element={<MAPA02Asesor />}
            />

            <Route
                path="verifikasi-tuk"
                element={<JadwalVerifikasiTuk />}
            />

            <Route
                path="komite-teknis"
                element={<JadwalKomiteTeknis />}
            />

            <Route
                path="komite-teknis/:id_jadwal/fr-ia02"
                element={<FRIA02 />}
            />

            <Route
                path="komite-teknis/:id_jadwal/paket-soal"
                element={<FRIA05 />}
            />

            <Route
                path="komite-teknis/:id_jadwal/fr-ia03"
                element={<FRIA03Komite />}
            />

            <Route
                path="fr-ia01/:id_jadwal/:id_peserta"
                element={<FRIA01Asesor />}
            />

            <Route
                path="fr-ia02/:id_jadwal/:id_peserta"
                element={<FRIA02Asesor />}
            />

            <Route
                path="fr-ia03/asesor/:id_jadwal/:id_peserta"
                element={<FRIA03Asesor />}
            />

            <Route
                path="fr-ia05/:id_jadwal/:id_peserta"
                element={<FRIA05Asesor />}
            />

            <Route
                path="fr-ak01/:id_jadwal/:id_peserta"
                element={<FRAK01Asesor />}
            />

            <Route
                path="fr-ak02/:id_jadwal/:id_peserta"
                element={<FRAK02Asesor />}
            />

            <Route
                path="fr-ak05/:id_jadwal/:id_peserta"
                element={<FRAK05Asesor />}
            />

            <Route
                path="fr-ak06/:id_jadwal/:id_peserta"
                element={<FRAK06Asesor />}
            />

            <Route
                path="mkva"
                element={<JadwalMkva />}
            />

            <Route
                path="mkva/:id_jadwal/isi"
                element={<IsiMKVA />}
            />

            <Route
                path="mkva/jadwal/:id_jadwal"
                element={<IsiMKVA />}
            />

            <Route
                path="mkva/jadwal/:id_jadwal/isi"
                element={<IsiMKVA />}
            />

            <Route
                path="ubah-password"
                element={<UbahSandiAsesor />}
            />

            <Route
                path="*"
                element={<Navigate to="/asesor/dashboard" replace />}
            />
        </Routes>
    );
}