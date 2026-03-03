import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";
import AdminNavbar from "../pages/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <AdminNavbar />
        <Outlet />
      </div>
    </div>
  );
}