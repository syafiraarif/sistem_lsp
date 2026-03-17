// src/routes/AsesiRoutes.jsx
import { Routes, Route } from "react-router-dom";

/* Pages */
import HomeAsesi from "../pages/asesi/HomeAsesi";

/* Profile System */
import ProfileView from "../pages/asesi/ProfileView";
import ProfileEdit from "../pages/asesi/ProfileEdit";
import ProfileDokumen from "../pages/asesi/ProfileDokumen";

/* Jadwal & Skema */
import JadwalAsesi from "../pages/asesi/JadwalAsesi";
import JadwalSaya from "../pages/asesi/JadwalSaya"; // import baru

export default function AsesiRoutes() {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<HomeAsesi />} />

      {/* PROFILE */}
      <Route path="profile" element={<ProfileView />} />
      <Route path="profile/edit" element={<ProfileEdit />} />
      <Route path="profile/dokumen" element={<ProfileDokumen />} />

      {/* JADWAL & SKEMA */}
      <Route path="jadwal" element={<JadwalAsesi />} />
      <Route path="jadwal-saya" element={<JadwalSaya />} /> {/* route baru */}
    </Routes>
  );
}