// src/routes/AsesorRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardAsesor from "../pages/asesor/DashboardAsesor";
import ProfileAsesor from "../pages/asesor/ProfileAsesor";

export default function AsesorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardAsesor />} />
      <Route path="profile" element={<ProfileAsesor />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}