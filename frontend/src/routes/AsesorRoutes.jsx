import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProfileAsesor from "../pages/asesor/ProfileAsesor";

const AsesorRoutes = () => {
  return (
    <Routes>
      <Route path="/profile" element={<ProfileAsesor />} />

      <Route path="*" element={<Navigate to="/asesor/profile" replace />} />
    </Routes>
  );
};

export default AsesorRoutes;