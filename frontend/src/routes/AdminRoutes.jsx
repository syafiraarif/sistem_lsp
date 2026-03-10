import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
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
import Banding from "../pages/admin/Banding";
import BankSoal from "../pages/admin/BankSoal";
import BankSoalPG from "../pages/admin/BankSoalPG";
import Surveillance from "../pages/admin/Surveillance";

// Rute Instrumen & Asesmen
import IA01Observasi from "../pages/admin/IA01Observasi";
import IA03Pertanyaan from "../pages/admin/IA03Pertanyaan";
import Mapa from "../pages/admin/Mapa";
import Mapa01 from "../pages/admin/Mapa01";
import Mapa02 from "../pages/admin/Mapa02";

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
          
          {/* PENGELOMPOKAN RUTE SKEMA DAN TURUNANNYA */}
          <Route path="skema" element={<Skema />} />
          <Route path="skema/:id/persyaratan" element={<SkemaPersyaratan />} />
          <Route path="skema/:id/persyaratan-tuk" element={<SkemaPersyaratanTuk />} />
          <Route path="skema/:id/biaya-uji" element={<BiayaUji />} />
          
          {/* STRUKTUR BARU UNTUK INSTRUMEN MENGINDUK KE SKEMA */}
          <Route path="skema/:id/ia01" element={<IA01Observasi />} />
          <Route path="skema/:id/ia03" element={<IA03Pertanyaan />} />
          <Route path="skema/:id/mapa" element={<Mapa />} />
          <Route path="skema/:id/mapa01" element={<Mapa01 />} />
          <Route path="skema/:id/mapa02" element={<Mapa02 />} />

          {/* RUTE LAINNYA */}
          <Route path="dokumen-mutu" element={<DokumenMutu />} />
          <Route path="jadwal/uji-kompetensi" element={<JadwalUji />} />
          <Route path="jadwal/:id_jadwal/asesor" element={<JadwalAsesor />} />
          <Route path="tuk" element={<TempatUji />} />
          <Route path="verifikasi-pendaftaran" element={<VerifikasiPendaftaran />} />
          <Route path="asesi/tambah" element={<TambahAsesi />} />
          
          <Route path="asesor" element={<Asesor />} />
          <Route path="notifikasi" element={<Notifikasi />} />
          <Route path="pengaduan" element={<Pengaduan />} />
          <Route path="profil-lsp" element={<ProfileAdmin />} />
          <Route path="banding" element={<Banding />} />
          <Route path="bank-soal" element={<BankSoal />} />
          <Route path="bank-soal-pg" element={<BankSoalPG />} />
          <Route path="surveillance" element={<Surveillance />} />
        </Route>
      </Routes>
    </ProtectedAdmin>
  );
}