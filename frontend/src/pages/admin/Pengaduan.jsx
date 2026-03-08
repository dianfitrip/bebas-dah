import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, Save, X,
  MessageSquare, User, Mail, Phone, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';


const Pengaduan = () => {
  // --- STATE ---
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusEdit, setStatusEdit] = useState(''); 

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Filter Client-Side (Disesuaikan dengan nama kolom database baru)
  useEffect(() => {
    if (!data) return;
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      // PERBAIKAN: Menggunakan 'nama_pengadu' dan 'email_pengadu'
      const nama = item.nama_pengadu?.toLowerCase() || '';
      const email = item.email_pengadu?.toLowerCase() || '';
      const isi = item.isi_pengaduan?.toLowerCase() || '';
      
      return nama.includes(lowerTerm) || 
             email.includes(lowerTerm) || 
             isi.includes(lowerTerm);
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pengaduan');
      const result = response.data.data || [];
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching pengaduan:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setStatusEdit(item.status_pengaduan);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/admin/pengaduan/${selectedItem.id_pengaduan}/status`, {
        status_pengaduan: statusEdit
      });
      
      Swal.fire("Berhasil", "Status pengaduan diperbarui", "success");
      setShowModal(false);
      fetchData(); 
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat memperbarui status", "error");
    }
  };

  // Helper Badge Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'selesai': 
        return <span className="status-badge bg-green-100 text-green-800"><CheckCircle size={14}/> Selesai</span>;
      case 'tindak_lanjut': 
        return <span className="status-badge bg-blue-100 text-blue-800"><Clock size={14}/> Diproses</span>;
      default: 
        return <span className="status-badge bg-yellow-100 text-yellow-800"><AlertCircle size={14}/> Masuk</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="pengaduan-container">
      
      {/* --- INJEKSI TEMA WARNA BIRU & ORANYE (BACKGROUND PUTIH) --- */}
      <style>{`
        /* Header Title */
        .title-box h2 { color: #071E3D !important; font-weight: bold; }
        .title-box p { color: #182D4A !important; }

        /* Card Konten */
        .content-card {
          background-color: #FFFFFF !important;
          border: 1px solid rgba(7, 30, 61, 0.08) !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03) !important;
        }
        
        .toolbar-title h4 { color: #071E3D !important; font-weight: bold; }

        /* Search Input */
        .search-icon-inside { color: #CC6B27 !important; }
        .search-input { 
          border: 1px solid rgba(7, 30, 61, 0.15) !important; 
          color: #071E3D !important;
        }
        .search-input:focus {
          border-color: #CC6B27 !important;
          box-shadow: 0 0 0 3px rgba(204, 107, 39, 0.1) !important;
          outline: none;
        }

        /* Tabel Modern */
        .modern-table th {
          background-color: #071E3D !important;
          color: #FAFAFA !important;
          border-bottom: 4px solid #CC6B27 !important;
          font-weight: 600;
        }
        .modern-table td {
          color: #071E3D !important;
          border-bottom: 1px solid rgba(7, 30, 61, 0.08) !important;
        }
        .modern-table tr:hover td {
          background-color: rgba(204, 107, 39, 0.04) !important;
        }
        .user-info .name { color: #071E3D !important; font-weight: 700; }
        .user-info .email { color: #CC6B27 !important; font-weight: 500; }

        /* Tombol Aksi Tabel */
        .btn-icon.view {
          color: #CC6B27 !important;
          background-color: rgba(204, 107, 39, 0.1) !important;
          border: 1px solid transparent !important;
          transition: all 0.2s;
        }
        .btn-icon.view:hover {
          background-color: #CC6B27 !important;
          color: #FFFFFF !important;
          box-shadow: 0 2px 6px rgba(204, 107, 39, 0.3) !important;
        }

        /* Modal Styling */
        .modal-card { background-color: #FFFFFF !important; }
        .modal-header-modern h3 { color: #071E3D !important; font-weight: bold; }
        .btn-close-modern { color: #182D4A !important; transition: color 0.2s; }
        .btn-close-modern:hover { color: #CC6B27 !important; }

        /* Modal Body */
        .box-title { color: #CC6B27 !important; font-weight: bold; border-bottom: 1px solid rgba(204, 107, 39, 0.2) !important; padding-bottom: 8px; }
        .info-item label { color: #182D4A !important; opacity: 0.8; }
        .info-item p { color: #071E3D !important; font-weight: 500; }
        
        .message-box { 
          background-color: rgba(7, 30, 61, 0.02) !important; 
          border-left: 4px solid #CC6B27 !important; 
          border-radius: 4px;
        }
        .msg-text { color: #071E3D !important; line-height: 1.6; }
        .msg-date { color: #CC6B27 !important; font-weight: 600; }

        /* Input Status di Modal */
        .status-action-box label { color: #071E3D !important; font-weight: 600; }
        .status-select { 
          border: 1px solid rgba(7, 30, 61, 0.2) !important; 
          color: #071E3D !important; 
          background-color: #FAFAFA !important;
        }
        .status-select:focus { border-color: #CC6B27 !important; outline: none; }

        /* Button di Modal */
        .btn-primary { 
          background-color: #CC6B27 !important; 
          color: #FFFFFF !important; 
          border: none !important; 
        }
        .btn-primary:hover { background-color: #A8561D !important; }
        .btn-secondary { 
          background-color: #FFFFFF !important; 
          color: #071E3D !important; 
          border: 1px solid #071E3D !important; 
        }
        .btn-secondary:hover { background-color: rgba(7, 30, 61, 0.05) !important; }
      `}</style>

      {/* HEADER */}
      <div className="header-section">
        <div className="title-box">
          <h2>Layanan Pengaduan</h2>
          <p>Daftar keluhan dan masukan dari pengguna sistem.</p>
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="content-card">
        
        {/* TOOLBAR & SEARCH */}
        <div className="table-toolbar">
          <div className="toolbar-title">
            <h4>Daftar Laporan</h4>
          </div>
          <div className="toolbar-actions">
            <div className="search-bar-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Cari Nama / Isi Aduan..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin text-[#CC6B27]" size={32} />
            <p className="text-[#071E3D] mt-2 font-medium">Memuat data pengaduan...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Pengirim</th>
                  <th>Isi Singkat</th> {/* Diganti dari Subjek ke Isi Singkat */}
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id_pengaduan}>
                      <td>{index + 1}</td>
                      <td>{formatDate(item.tanggal_pengaduan)}</td>
                      <td>
                        <div className="user-info">
                          {/* PERBAIKAN: Mapping data sesuai DB */}
                          <span className="name">{item.nama_pengadu}</span>
                          <span className="email text-xs">{item.sebagai_siapa}</span>
                        </div>
                      </td>
                      <td className="subject-col">
                        {/* PERBAIKAN: Menampilkan cuplikan isi pengaduan karena tidak ada kolom subjek */}
                        {item.isi_pengaduan}
                      </td>
                      <td>{getStatusBadge(item.status_pengaduan)}</td>
                      <td className="text-center">
                        <button 
                          className="btn-icon view" 
                          onClick={() => handleDetailClick(item)}
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <MessageSquare size={40} className="text-gray-300 mb-2" style={{color: "rgba(7, 30, 61, 0.2)"}}/>
                      <p style={{color: "#182D4A"}}>Data tidak ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {showModal && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-card wide-modal">
            <div className="modal-header-modern">
              <h3>Detail Pengaduan</h3>
              <button className="btn-close-modern" onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            
            <div className="modal-body-scroll">
              
              {/* INFO PENGIRIM */}
              <div className="info-box">
                <h4 className="box-title flex items-center gap-2"><User size={16}/> Informasi Pengirim</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nama Lengkap</label>
                    <p>{selectedItem.nama_pengadu}</p>
                  </div>
                  <div className="info-item">
                    <label>Sebagai</label>
                    <p className="capitalize">{selectedItem.sebagai_siapa}</p>
                  </div>
                  <div className="info-item">
                    <label className="flex items-center gap-1"><Mail size={14}/> Email</label>
                    <p>{selectedItem.email_pengadu || '-'}</p>
                  </div>
                  <div className="info-item">
                    <label className="flex items-center gap-1"><Phone size={14}/> No HP</label>
                    <p>{selectedItem.no_hp_pengadu || '-'}</p>
                  </div>
                </div>
              </div>

              {/* ISI PENGADUAN */}
              <div className="message-box">
                <h4 className="box-title flex items-center gap-2"><MessageSquare size={16}/> Isi Laporan</h4>
                <div className="message-content p-3 mt-2">
                  <div className="message-header mb-2">
                    <span className="msg-date flex items-center gap-1"><Clock size={12}/>{formatDate(selectedItem.tanggal_pengaduan)}</span>
                  </div>
                  <p className="msg-text">{selectedItem.isi_pengaduan}</p>
                </div>
              </div>

              {/* UPDATE STATUS */}
              <div className="status-action-box mt-4">
                <label className="block mb-2">Update Status Penanganan</label>
                <select 
                  className="status-select p-2 w-full rounded"
                  value={statusEdit} 
                  onChange={(e) => setStatusEdit(e.target.value)}
                >
                  <option value="masuk">Masuk (Belum dibaca)</option>
                  <option value="tindak_lanjut">Sedang Ditindak Lanjuti</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

            </div>

            <div className="modal-footer-modern">
              <button type="button" className="btn-secondary py-2 px-4 rounded" onClick={() => setShowModal(false)}>Tutup</button>
              <button type="button" className="btn-primary py-2 px-4 rounded flex items-center" onClick={handleStatusChange}>
                <Save size={16} className="mr-2"/> Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pengaduan;