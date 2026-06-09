// src/routes/AsesiRoutes.jsx

import { Routes, Route } from "react-router-dom";

/* Pages */
import HomeAsesi from "../pages/asesi/HomeAsesi";

/* Profile System */
import ProfileView from "../pages/asesi/ProfileView";
import ProfileEdit from "../pages/asesi/ProfileEdit";

/* Jadwal & Skema */
import JadwalAsesi from "../pages/asesi/JadwalAsesi";
import JadwalSaya from "../pages/asesi/JadwalSaya";
import BayarSkema from "../pages/asesi/BayarSkema";
import APL01 from "../pages/asesi/APL01";
import APL02 from "../pages/asesi/APL02";
import PraAsesmenAsesi from "../pages/asesi/PraAsesmenAsesi";
import FRIA05Asesi from "../pages/asesi/FRIA05Asesi";
import HasilAkhirAsesi from "../pages/asesi/HasilAkhirAsesi";
import FRAK03Asesi from "../pages/asesi/FRAK03Asesi";
import FRAK04Asesi from "../pages/asesi/FRAK04Asesi";
import Banding from "../pages/asesi/Banding";

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

      {/* JADWAL & SKEMA */}
      <Route path="jadwal" element={<JadwalAsesi />} />
      <Route path="jadwal-saya" element={<JadwalSaya />} />

      {/* APLIKASI ASESMEN */}
      <Route path="apl01/:id_peserta" element={<APL01 />} />
      <Route path="apl02/:id_skema" element={<APL02 />} />
      <Route path="pembayaran/:id_skema" element={<BayarSkema />} />
      <Route path="pra-asesmen" element={<PraAsesmenAsesi />} />
      <Route path="pra-asesmen/:id_skema" element={<PraAsesmenAsesi />} />

      {/* FR.IA.05 ASESI */}
      <Route
        path="fr-ia05/jadwal/:id_jadwal/:id_peserta"
        element={<FRIA05Asesi />}
      />

      <Route
        path="fr-ia05/:id_fr_ia_05/:id_peserta"
        element={<FRIA05Asesi />}
      />

      {/* HASIL AKHIR */}
      <Route path="hasil-akhir" element={<HasilAkhirAsesi />} />
      <Route path="hasil-akhir/:id_peserta" element={<HasilAkhirAsesi />} />

      {/* FR.AK.03 */}
      <Route path="fr-ak03/:id_peserta" element={<FRAK03Asesi />} />

      {/* FR.AK.04 */}
      <Route path="fr-ak04/:id_peserta" element={<FRAK04Asesi />} />

      {/* BANDING LAMA */}
      <Route path="banding" element={<Banding />} />

      {/* PASSWORD */}
      <Route path="ubah-password" element={<LupaPasswordAsesi />} />
    </Routes>
  );
}