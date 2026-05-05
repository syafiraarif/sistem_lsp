// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import TukRoutes from "./routes/TukRoutes";
import AsesiRoutes from "./routes/AsesiRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AsesorRoutes from "./routes/AsesorRoutes";

function getStoredRole() {
  const role = localStorage.getItem("role");

  if (role) {
    return role.toLowerCase();
  }

  const user = localStorage.getItem("user");

  try {
    const parsedUser = user ? JSON.parse(user) : null;
    return parsedUser?.role?.toLowerCase() || "";
  } catch (err) {
    return "";
  }
}

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedTuk({ children }) {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token || role !== "tuk") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedAsesi({ children }) {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token || role !== "asesi") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedAsesor({ children }) {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token || role !== "asesor") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* ADMIN */}
      <Route
        path="/admin/*"
        element={
          <ProtectedAdmin>
            <AdminRoutes />
          </ProtectedAdmin>
        }
      />

      {/* TUK */}
      <Route
        path="/tuk/*"
        element={
          <ProtectedTuk>
            <TukRoutes />
          </ProtectedTuk>
        }
      />

      {/* ASESOR */}
      <Route
        path="/asesor/*"
        element={
          <ProtectedAsesor>
            <AsesorRoutes />
          </ProtectedAsesor>
        }
      />

      {/* ASESI */}
      <Route
        path="/asesi/*"
        element={
          <ProtectedAsesi>
            <AsesiRoutes />
          </ProtectedAsesi>
        }
      />

      {/* PUBLIC */}
      <Route
        path="/*"
        element={
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}