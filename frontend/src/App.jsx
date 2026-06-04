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

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = getStoredRole();

  if (!token || role !== allowedRole) {
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
          <ProtectedRoute allowedRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* TUK */}
      <Route
        path="/tuk/*"
        element={
          <ProtectedRoute allowedRole="tuk">
            <TukRoutes />
          </ProtectedRoute>
        }
      />

      {/* ASESOR */}
      <Route
        path="/asesor/*"
        element={
          <ProtectedRoute allowedRole="asesor">
            <AsesorRoutes />
          </ProtectedRoute>
        }
      />

      {/* ASESI */}
      <Route
        path="/asesi/*"
        element={
          <ProtectedRoute allowedRole="asesi">
            <AsesiRoutes />
          </ProtectedRoute>
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