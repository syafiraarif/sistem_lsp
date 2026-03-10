// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import TukRoutes from "./routes/TukRoutes";
import AsesiRoutes from "./routes/AsesiRoutes";
import AdminRoutes from "./routes/AdminRoutes";

/* Protected Route Helpers */
function ProtectedTuk({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "tuk") return <Navigate to="/login" replace />;
  return children;
}

function ProtectedAsesi({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "asesi") return <Navigate to="/login" replace />;
  return children;
}

function ProtectedAdmin({ children }) {
  const user = localStorage.getItem("user");
  let parsedUser = null;
  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch (err) {
    parsedUser = null;
  }
  if (!parsedUser || parsedUser.role?.toLowerCase() !== "admin") return <Navigate to="/login" replace />;
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