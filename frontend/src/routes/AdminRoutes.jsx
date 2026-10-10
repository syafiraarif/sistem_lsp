import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Banding from "../pages/admin/Banding";
import TambahAsesi from "../pages/admin/TambahAsesi";
import UnitKompetensi from "../pages/admin/UnitKompetensi";
import Skkni from "../pages/admin/Skkni";
import Skema from "../pages/admin/Skema";
import SkemaPersyaratan from "../pages/admin/SkemaPersyaratan";
import SkemaPersyaratanTuk from "../pages/admin/SkemaPersyaratanTuk";
import BiayaUji from "../pages/admin/BiayaUji";
import DokumenMutu from "../pages/admin/DokumenMutu";
import JadwalUji from "../pages/admin/JadwalUji";
import JadwalAsesor from "../pages/admin/JadwalAsesor";
import TempatUji from "../pages/admin/TempatUji";
import VerifikasiPendaftaran from "../pages/admin/VerifikasiPendaftaran";
import Asesor from "../pages/admin/Asesor";
import Notifikasi from "../pages/admin/Notifikasi";
import Pengaduan from "../pages/admin/Pengaduan";
import ProfileAdmin from "../pages/admin/ProfileAdmin";
import CariAsesi from "../pages/admin/CariAsesi";
import StatistikWilayah from "../pages/admin/StatistikWilayah";
import AsesiTerjadwal from "../pages/admin/AsesiTerjadwal";
import AsesiKompeten from "../pages/admin/AsesiKompeten";
import PesertaJadwal from "../pages/admin/PesertaJadwal";
import KelompokPekerjaan from "../pages/admin/KelompokPekerjaan";
import AsesiBelumKompeten from "../pages/admin/AsesiBelumKompeten";
import ValidasiPembayaran from "../pages/admin/ValidasiPembayaran";
import FeedbackAdmin from "../pages/admin/Feedback";
import LaporanSertifikasi from "../pages/admin/LaporanSertifikasi";
import FRAK04Detail from "../pages/shared/FRAK04Detail";
import MasterFRIA05 from "../pages/admin/MasterFRIA05";

// IMPORT HALAMAN BARU FR.IA.02 dan FR.IA.03
import AdminFRIA02 from "../pages/admin/AdminFRIA02";
import AdminFRIA03 from "../pages/admin/AdminFRIA03";

/* PROTECTED */
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const ProtectedAdmin = ({ children }) => {
  const user = getUser();
  if (!user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function AdminRoutes() {
  return (
    <ProtectedAdmin>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="unit-kompetensi" element={<UnitKompetensi />} />
          <Route path="skkni" element={<Skkni />} />
          <Route path="banding" element={<Banding />} />
          <Route path="fr-ak04-detail/:id_peserta" element={<FRAK04Detail role="admin" />} />
          
          {/* PENGELOMPOKAN RUTE SKEMA DAN TURUNANNYA */}
          <Route path="skema" element={<Skema />} />
          <Route path="skema/:id/persyaratan" element={<SkemaPersyaratan />} />
          <Route path="skema/:id/persyaratan-tuk" element={<SkemaPersyaratanTuk />} />
          <Route path="skema/:id/biaya-uji" element={<BiayaUji />} />

          {/* RUTE INSTRUMEN UJI SKEMA */}
          <Route path="skema/:id_skema/fr-ia-02" element={<AdminFRIA02 />} />
          <Route path="skema/:id_skema/fr-ia-03" element={<AdminFRIA03 />} />
          <Route path="skema/:id_skema/bank-soal" element={<MasterFRIA05 />} />

          {/* RUTE LAINNYA */}
          <Route path="dokumen-mutu" element={<DokumenMutu />} />
          <Route path="jadwal/uji-kompetensi" element={<JadwalUji />} />
          <Route path="jadwal/:id_jadwal/asesor" element={<JadwalAsesor />} />
          <Route path="tuk" element={<TempatUji />} />
          <Route path="verifikasi-pendaftaran" element={<VerifikasiPendaftaran />} />
          <Route path="pembayaran" element={<ValidasiPembayaran />} />
          <Route path="asesi/tambah" element={<TambahAsesi />} />
          
          <Route path="asesor" element={<Asesor />} />
          <Route path="notifikasi" element={<Notifikasi />} />
          <Route path="pengaduan" element={<Pengaduan />} />
          <Route path="feedback" element={<FeedbackAdmin />} />
          <Route path="profil-lsp" element={<ProfileAdmin />} />
          <Route path="asesi/cari" element={<CariAsesi />} />

          <Route path="asesi/terjadwal" element={<AsesiTerjadwal />} />
          <Route path="asesi/kompeten" element={<AsesiKompeten />} />
          <Route path="asesi/belum-kompeten" element={<AsesiBelumKompeten />} />

          <Route path="asesor/statistik" element={<StatistikWilayah />} />
          <Route path="jadwal/:id_jadwal/peserta" element={<PesertaJadwal />} />
          <Route path="skema/:id/kelompok-pekerjaan" element={<KelompokPekerjaan />} />

          {/* RUTE LAPORAN SERTIFIKASI */}
          <Route path="laporan-sertifikasi" element={<LaporanSertifikasi />} />
        </Route>
      </Routes>
    </ProtectedAdmin>
  );
}