import React from 'react';
import './adminstyles/AdminDashboard.css';
import {
  FaLayerGroup,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaEllipsisV,
  FaCalendarAlt
} from "react-icons/fa";

const AdminDashboard = () => {
  const currentYear = new Date().getFullYear();

  const stats = [
    { label: "Total Skema", value: "12", icon: <FaLayerGroup />, color: "orange" },
    { label: "Total Asesor", value: "45", icon: <FaUserTie />, color: "blue" },
    { label: "Total Asesi", value: "1,250", icon: <FaUsers />, color: "green" },
    { label: "Data TUK", value: "8", icon: <FaBuilding />, color: "purple" },
  ];

  const recentRegistrations = [
    { name: "Budi Santoso", schema: "Pemrograman Web", date: "16 Feb 2026", status: "Menunggu" },
    { name: "Siti Aminah", schema: "Desain Grafis", date: "16 Feb 2026", status: "Verifikasi" },
    { name: "Andi Saputra", schema: "Jaringan Komputer", date: "15 Feb 2026", status: "Diterima" },
    { name: "Dewi Lestari", schema: "Digital Marketing", date: "15 Feb 2026", status: "Ditolak" },
    { name: "Rizky Pratama", schema: "Pemrograman Web", date: "14 Feb 2026", status: "Diterima" },
  ];

  return (
    <div className="dashboard-container">
      
      {/* --- INJEKSI OVERRIDE TEMA WARNA TERANG (AKSEN BIRU & ORANYE) --- */}
      <style>{`
        /* Background Utama Terang */
        .admin-layout, .main-content, .dashboard-container, .content-area {
          background-color: #FAFAFA !important; /* Putih agak abu biar bersih */
          color: #071E3D !important; /* Teks utama pakai biru gelap */
        }
        
        /* Card & Kotak (Putih Bersih) */
        .stat-card, .card-box {
          background-color: #FFFFFF !important;
          border: 1px solid rgba(7, 30, 61, 0.08) !important;
          color: #071E3D !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04) !important;
        }

        /* Teks di dalam Card */
        .stat-info h3, .card-header-inner h4, .schedule-item .info h5 {
          color: #071E3D !important;
          font-weight: 700 !important;
        }
        .stat-info p, .card-header-inner p, .bar-item span, .bar-item .val, .schedule-item .info p {
          color: #182D4A !important;
        }

        /* Icon Card Atas */
        .stat-icon {
          background-color: #182D4A !important; /* Background icon biru sekunder */
          color: #CC6B27 !important; /* Icon warna oranye */
        }

        /* Progress Bar (Chart Batang) */
        .progress-track {
          background-color: rgba(7, 30, 61, 0.1) !important; /* Track abu-biru tipis */
        }
        .progress-fill {
          background-color: #CC6B27 !important; /* Fill oranye */
        }

        /* Tabel Data Pendaftar */
        .dashboard-table th {
          background-color: #071E3D !important; /* Header tabel biru tua pekat */
          color: #FAFAFA !important; /* Teks header putih */
          border-bottom: 4px solid #CC6B27 !important; /* Aksen garis bawah oranye */
        }
        .dashboard-table td {
          color: #071E3D !important;
          border-bottom: 1px solid rgba(7, 30, 61, 0.08) !important;
        }
        .dashboard-table tr:hover {
          background-color: rgba(204, 107, 39, 0.04) !important; /* Efek hover oranye tipis */
        }

        /* Highlight, Link & Tombol (Titik 3 / Lihat Semua) */
        .btn-icon-small, .link-text, .text-muted {
          color: #CC6B27 !important;
        }
        .link-text:hover {
          color: #071E3D !important;
        }

        /* Kotak Tanggal Jadwal */
        .schedule-item .date-box {
          background-color: #071E3D !important; /* Kotak biru tua */
          color: #FAFAFA !important;
          border: 2px solid #CC6B27 !important; /* Border oranye */
        }
        .schedule-item .date-box .m {
          color: #CC6B27 !important; /* Bulan oranye */
          font-weight: bold;
        }

        /* Chart Pie & Legend */
        .pie-center {
          background-color: #FFFFFF !important; /* Tengah pie chart tetap putih */
          color: #071E3D !important;
        }
        .dot.orange { background-color: #CC6B27 !important; }
        .dot.gray { background-color: #182D4A !important; } /* Aksen sekunder */

        /* Badge Status */
        .badge.menunggu { background-color: rgba(204, 107, 39, 0.1) !important; color: #CC6B27 !important; border: 1px solid #CC6B27 !important; }
        .badge.verifikasi { background-color: rgba(24, 45, 74, 0.1) !important; color: #182D4A !important; border: 1px solid #182D4A !important; }
        .badge.diterima { background-color: rgba(40, 167, 69, 0.1) !important; color: #28a745 !important; border: 1px solid #28a745 !important; }
        .badge.ditolak { background-color: rgba(220, 53, 69, 0.1) !important; color: #dc3545 !important; border: 1px solid #dc3545 !important; }
      `}</style>

      {/* 1. STATS CARDS */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className={`stat-icon bg-${item.color}`}>
              {item.icon}
            </div>
            <div className="stat-info">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. CHARTS */}
      <div className="charts-grid">
        <div className="card-box">
          <div className="card-header-inner">
            <h4>Pendaftar dan Kandidat Tahun {currentYear}</h4>
            <button className="btn-icon-small"><FaEllipsisV /></button>
          </div>
          <div className="bar-chart-list">
            <div className="bar-item">
              <span>Web Dev</span>
              <div className="progress-track"><div className="progress-fill" style={{width: '85%'}}></div></div>
              <span className="val">850</span>
            </div>
            <div className="bar-item">
              <span>Jaringan</span>
              <div className="progress-track"><div className="progress-fill" style={{width: '60%'}}></div></div>
              <span className="val">600</span>
            </div>
            <div className="bar-item">
              <span>Desain</span>
              <div className="progress-track"><div className="progress-fill" style={{width: '45%'}}></div></div>
              <span className="val">450</span>
            </div>
            <div className="bar-item">
              <span>Admin</span>
              <div className="progress-track"><div className="progress-fill" style={{width: '75%'}}></div></div>
              <span className="val">750</span>
            </div>
          </div>
        </div>

        <div className="card-box">
          <div className="card-header-inner">
            <h4>Persentase Kelulusan</h4>
            <button className="btn-icon-small"><FaEllipsisV /></button>
          </div>
          <div className="pie-chart-container">
            {/* GRADIENT PIE CHART DISESUAIKAN: ORANYE (#CC6B27) & BIRU (#182D4A) */}
            <div className="pie-chart" style={{ background: `conic-gradient(#CC6B27 0% 70%, #182D4A 70% 100%)` }}>
              <div className="pie-center">
                <span>70%</span>
                <small>Kompeten</small>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item"><span className="dot orange"></span> Kompeten</div>
              <div className="legend-item"><span className="dot gray"></span> Belum Kompeten</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABLE & SCHEDULE */}
      <div className="bottom-grid">
        <div className="card-box table-section">
          <div className="card-header-inner">
            <h4>Pendaftaran Terbaru</h4>
            <a href="#" className="link-text">Lihat Semua</a>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nama Asesi</th>
                <th>Skema</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((row, idx) => (
                <tr key={idx}>
                  <td className="fw-bold">{row.name}</td>
                  <td>{row.schema}</td>
                  <td>{row.date}</td>
                  <td>
                    <span className={`badge ${row.status.toLowerCase()}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-box schedule-section">
          <div className="card-header-inner">
            <h4>Jadwal Asesmen</h4>
            <FaCalendarAlt className="text-muted" />
          </div>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="date-box">
                <span className="d">18</span><span className="m">FEB</span>
              </div>
              <div className="info">
                <h5>Uji Kompetensi Web</h5>
                <p>08:00 WIB • Lab 1</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="date-box">
                <span className="d">20</span><span className="m">FEB</span>
              </div>
              <div className="info">
                <h5>Uji Komp. Jaringan</h5>
                <p>09:00 WIB • Lab 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;