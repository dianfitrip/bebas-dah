import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* ================= FRIEND'S IMPORTS ================= */
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import TukRoutes from "./routes/TukRoutes";
import AsesiRoutes from "./routes/AsesiRoutes";

/* ================= PUBLIC PAGES (USER) ================= */
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import About from "./pages/public/About";
import Complaint from "./pages/public/Complaint";
import FAQ from "./pages/public/FAQ";
import Information from "./pages/public/Information";
import Profile from "./pages/public/Profile";
import Registration from "./pages/public/Registration";
import Surveillance from "./pages/public/Surveillance";

/* ================= ADMIN PAGES (USER) ================= */
import AdminDashboard from "./pages/admin/AdminDashboard";
import DokumenMutu from "./pages/admin/DokumenMutu";
import IA01Observasi from "./pages/admin/IA01Observasi";
import IA03Pertanyaan from "./pages/admin/IA03Pertanyaan";
import JadwalUji from "./pages/admin/JadwalUji";
import Notifikasi from "./pages/admin/Notifikasi";
import Pengaduan from "./pages/admin/Pengaduan";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import Skema from "./pages/admin/Skema";
import Skkni from "./pages/admin/Skkni";
import TempatUji from "./pages/admin/TempatUji";
import UnitKompetensi from "./pages/admin/UnitKompetensi";
import VerifikasiPendaftaran from "./pages/admin/VerifikasiPendaftaran";
import Asesor from "./pages/admin/Asesor";
import Banding from "./pages/admin/Banding";
import TambahAsesi from "./pages/admin/TambahAsesi";

/* --- HALAMAN BARU: KELOLA SKEMA (Tombol Aksi di Tabel Skema) --- */
import SkemaPersyaratan from "./pages/admin/SkemaPersyaratan";
import SkemaPersyaratanTuk from "./pages/admin/SkemaPersyaratanTuk";

/* =========================================================
   ROLE GUARDS (FUNGSI PELINDUNG ROUTE)
========================================================= */

/* 1. PROTECTED ROUTE ADMIN (USER) */
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const ProtectedRoute = ({ children, role }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role?.toLowerCase() !== role) return <Navigate to="/login" replace />;
  return children;
};

/* 2. PROTECTED TUK (FRIEND) */
function ProtectedTuk({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "tuk") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* 3. PROTECTED ASESI (FRIEND) */
function ProtectedAsesi({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "asesi") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* =========================================================
   KOMPONEN APP UTAMA
========================================================= */
export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* ================= PUBLIC ROUTES (USER) ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/information" element={<Information />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/surveillance" element={<Surveillance />} />

        {/* ================= ROUTE TUK (FRIEND) ================= */}
        <Route
          path="/tuk/*"
          element={
            <ProtectedTuk>
              <TukRoutes />
            </ProtectedTuk>
          }
        />

        {/* ================= ROUTE ASESI (FRIEND) ================= */}
        <Route
          path="/asesi/*"
          element={
            <ProtectedAsesi>
              <AsesiRoutes />
            </ProtectedAsesi>
          }
        />

        {/* ================= ADMIN ROUTES NESTED (USER) ================= */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          {/* Index akan otomatis mengarah ke dashboard overview */}
          <Route path="dashboard" element={null} /> 

          {/* MENU: MASTER DATA */}
          <Route path="unit-kompetensi" element={<UnitKompetensi />} />
          <Route path="skkni" element={<Skkni />} />
          <Route path="skema" element={<Skema />} />
          <Route path="skema/:id/persyaratan" element={<SkemaPersyaratan />} />
          <Route path="skema/:id/persyaratan-tuk" element={<SkemaPersyaratanTuk />} />
          <Route path="dokumen-mutu" element={<DokumenMutu />} />

          {/* MENU: EVENT & JADWAL */}
          <Route path="jadwal/uji-kompetensi" element={<JadwalUji />} /> 
          
          {/* MENU: TEMPAT UJI */}
          <Route path="tuk" element={<TempatUji />} />

          {/* MENU: DATA ASESI */}
          <Route path="verifikasi-pendaftaran" element={<VerifikasiPendaftaran />} />
          <Route path="asesi/tambah" element={<TambahAsesi />} />
          <Route path="asesi/ia01-observasi" element={<IA01Observasi />} />
          <Route path="asesi/ia03-pertanyaan" element={<IA03Pertanyaan />} />

          {/* MENU: DATA ASESOR */}
          <Route path="asesor" element={<Asesor />} />

          {/* MENU: SISTEM & WEB */}
          <Route path="notifikasi" element={<Notifikasi />} />

          {/* MENU: LAYANAN */}
          <Route path="pengaduan" element={<Pengaduan />} />
          <Route path="profil-lsp" element={<ProfileAdmin />} />
          <Route path="banding" element={<Banding />} />
          
          {/* Placeholder untuk menu yang belum jadi */}
          <Route path="laporan/*" element={<div>Halaman Laporan (Belum dibuat)</div>} />
          <Route path="keuangan" element={<div>Halaman Keuangan (Belum dibuat)</div>} />
        </Route>

        {/* ================= ROUTE PUBLIC / FALLBACK (FRIEND) ================= */}
        {/* Rute ini ("/*") sengaja ditaruh di paling bawah agar menjadi fallback 
            jika URL tidak cocok dengan rute manapun di atas */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          }
        />

      </Routes>
    </Router>
  );
}