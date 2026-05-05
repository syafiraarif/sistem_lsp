// src/routes/AsesorRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProfileAsesor from "../pages/asesor/ProfileAsesor";

export default function AsesorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<ProfileAsesor />} />
      <Route path="*" element={<Navigate to="profile" replace />} />
    </Routes>
  );
}