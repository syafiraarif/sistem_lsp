// src/App.jsx

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import TukRoutes from "./routes/TukRoutes";
import AsesiRoutes from "./routes/AsesiRoutes";

/* ========================
   PROTECTED TUK
======================== */
function ProtectedTuk({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "tuk") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* ========================
   PROTECTED ASESI
======================== */
function ProtectedAsesi({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "asesi") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>

      {/* ROUTE TUK */}
      <Route
        path="/tuk/*"
        element={
          <ProtectedTuk>
            <TukRoutes />
          </ProtectedTuk>
        }
      />

      {/* ROUTE ASESI */}
      <Route
        path="/asesi/*"
        element={
          <ProtectedAsesi>
            <AsesiRoutes />
          </ProtectedAsesi>
        }
      />

      {/* ROUTE PUBLIC */}
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