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
import JadwalSaya from "../pages/asesi/JadwalSaya";
import BayarSkema from "../pages/asesi/BayarSkema";
import APL01 from "../pages/asesi/APL01";
import APL02 from "../pages/asesi/APL02"; 
import PraAsesmenAsesi from "../pages/asesi/PraAsesmenAsesi"; // halaman Pra Asesmen
import Banding from "../pages/asesi/Banding"; // <<< tambahan

/* Lupa Password */
import LupaPasswordAsesi from "../pages/asesi/LupaPasswordAsesi";

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
      <Route path="jadwal-saya" element={<JadwalSaya />} />

      {/* APLIKASI ASESMEN */}
      <Route path="apl01/:id_skema" element={<APL01 />} />
      <Route path="apl02/:id_skema" element={<APL02 />} />
      <Route path="pembayaran/:id_skema" element={<BayarSkema />} />
      <Route path="pra-asesmen/:id_skema" element={<PraAsesmenAsesi />} /> {/* PRA ASESMEN */}

      {/* BANDING */}
      <Route path="banding" element={<Banding />} /> {/* <<< route baru */}

      {/* PASSWORD */}
      <Route path="ubah-password" element={<LupaPasswordAsesi />} />
    </Routes>
  );
}