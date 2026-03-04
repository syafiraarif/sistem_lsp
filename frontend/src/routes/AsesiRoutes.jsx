import { Routes, Route } from "react-router-dom";
import HomeAsesi from "../pages/asesi/HomeAsesi";

/* Profile System */
import ProfileView from "../pages/asesi/ProfileView";
import ProfileEdit from "../pages/asesi/ProfileEdit";
import ProfileDokumen from "../pages/asesi/ProfileDokumen";

/* Other Pages (Siap Pakai) */
// import SkemaAsesi from "../pages/asesi/SkemaAsesi";
// import AsesmenAsesi from "../pages/asesi/AsesmenAsesi";
// import PembayaranAsesi from "../pages/asesi/PembayaranAsesi";
// import UbahPasswordAsesi from "../pages/asesi/UbahPasswordAsesi";

export default function AsesiRoutes() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<HomeAsesi />} />

      {/* View Profile */}
      <Route path="/profile" element={<ProfileView />} />

      {/* Edit Profile */}
      <Route path="/profile/edit" element={<ProfileEdit />} />

      {/* Upload Dokumen + TTD */}
      <Route path="/profile/dokumen" element={<ProfileDokumen />} />

      {/* =================================================== */}

      {/* Route Lain Siap Aktif Kalau Dibutuhkan */}
      {/* 
      <Route path="/skema" element={<SkemaAsesi />} />
      <Route path="/asesmen" element={<AsesmenAsesi />} />
      <Route path="/pembayaran" element={<PembayaranAsesi />} />
      <Route path="/ubah-password" element={<UbahPasswordAsesi />} />
      */}

    </Routes>
  );
}