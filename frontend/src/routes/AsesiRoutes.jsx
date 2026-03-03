// frontend/src/routes/AsesiRoutes.jsx

import { Routes, Route } from "react-router-dom";
import HomeAsesi from "../pages/asesi/HomeAsesi";
// import ProfileAsesi from "../pages/asesi/ProfileAsesi";
// import SkemaAsesi from "../pages/asesi/SkemaAsesi";
// import AsesmenAsesi from "../pages/asesi/AsesmenAsesi";
// import PembayaranAsesi from "../pages/asesi/PembayaranAsesi";
// import UbahPasswordAsesi from "../pages/asesi/UbahPasswordAsesi";

export default function AsesiRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeAsesi />} />
      
      {/* 
      <Route path="/profile" element={<ProfileAsesi />} />
      <Route path="/skema" element={<SkemaAsesi />} />
      <Route path="/asesmen" element={<AsesmenAsesi />} />
      <Route path="/pembayaran" element={<PembayaranAsesi />} />
      <Route path="/ubah-password" element={<UbahPasswordAsesi />} />
      */}
      
    </Routes>
  );
}