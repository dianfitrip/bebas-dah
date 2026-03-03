import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api"; 
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, 
  User as UserIcon, Loader2, Upload, FileSpreadsheet,
  GraduationCap, MapPin, Mail, CheckCircle, Send
} from 'lucide-react';

import './adminstyles/TambahAsesi.css'; 

const TambahAsesi = () => {
  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk melacak ID Asesi yang sudah dikirimi email
  const [emailSentIds, setEmailSentIds] = useState(new Set());
  const [sendingEmailId, setSendingEmailId] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // --- STATE WILAYAH ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  // Form State
  const initialForm = {
    nik: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    jenis_kelamin: 'laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [fileExcel, setFileExcel] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/asesi');
      setData(response.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal memuat data asesi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProvinsi();
  }, []);

  // --- WILAYAH FETCHERS ---
  const fetchProvinsi = async () => {
    try {
      const data = await getProvinsi();
      setProvinsiList(data);
    } catch (error) { console.error(error); }
  };

  const handleProvinsiChange = async (e) => {
    const provId = e.target.value;
    setFormData(prev => ({ ...prev, provinsi: provId, kota: '', kecamatan: '', kelurahan: '' }));
    try {
      const data = await getKota(provId);
      setKotaList(data);
    } catch (error) { console.error(error); }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/admin/asesi/${currentId}`, formData);
        Swal.fire('Sukses!', 'Data asesi berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/asesi', formData);
        Swal.fire('Sukses!', 'Data asesi berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Asesi?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/asesi/${id}`);
          Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
          fetchData();
        } catch (error) {
          Swal.fire('Error', 'Gagal menghapus data', 'error');
        }
      }
    });
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!fileExcel) return Swal.fire('Peringatan', 'Pilih file Excel terlebih dahulu', 'warning');

    const formUpload = new FormData();
    formUpload.append("file", fileExcel);

    try {
      await api.post('/admin/asesi/import', formUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire('Sukses', 'Data Asesi berhasil diimport', 'success');
      setShowImportModal(false);
      setFileExcel(null);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal import excel', 'error');
    }
  };

  // --- FITUR BARU: KIRIM EMAIL ---
  const handleSendEmail = async (id_user, email) => {
    // Tampilkan konfirmasi sebelum mengirim
    const confirm = await Swal.fire({
      title: 'Kirim Informasi Akun?',
      text: `Email berisi detail login akan dikirim ke ${email}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Kirim Email'
    });

    if (confirm.isConfirmed) {
      setSendingEmailId(id_user);
      try {
        // Sesuaikan endpoint ini dengan endpoint backend kamu (contoh: /admin/asesi/send-email)
        await api.post(`/admin/asesi/${id_user}/send-email`); 
        
        // Tandai tombol menjadi redup/disabled jika berhasil
        setEmailSentIds(prev => new Set(prev).add(id_user));
        Swal.fire('Berhasil!', `Email telah terkirim ke ${email}`, 'success');
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Gagal mengirim email', 'error');
      } finally {
        setSendingEmailId(null);
      }
    }
  };

  // --- FILTERING ---
  const filteredData = data.filter(item => 
    item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.nik?.includes(searchTerm)
  );

  return (
    <div className="asesi-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Data Asesi</h2>
          <p className="page-subtitle">Kelola data profil dan akun asesi.</p>
        </div>
        <div className="action-buttons-group">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary flex items-center gap-2">
            <FileSpreadsheet size={18} /> Import Excel
          </button>
          <button 
            onClick={() => { 
              setFormData(initialForm); 
              setIsEditMode(false); 
              setIsDetailMode(false); 
              setShowModal(true); 
            }} 
            className="btn-primary"
          >
            <Plus size={18} /> Tambah Asesi
          </button>
        </div>
      </div>

      {/* FILTER SEARCH */}
      <div className="mb-6 flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan Nama atau NIK..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={32} /> Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold w-16 text-center">No</th>
                  <th className="p-4 font-semibold">NIK</th>
                  <th className="p-4 font-semibold">Nama Lengkap</th>
                  <th className="p-4 font-semibold">Kontak</th>
                  <th className="p-4 font-semibold text-center w-56">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={item.id_user} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-700">{item.nik}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.nama_lengkap}</div>
                      <div className="text-xs text-slate-500">{item.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : 'Perempuan'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm flex items-center gap-2 text-slate-600"><Mail size={14}/> {item.user?.email || item.email || '-'}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* TOMBOL SEND EMAIL */}
                        <button 
                          onClick={() => handleSendEmail(item.id_user, item.user?.email || item.email)}
                          disabled={emailSentIds.has(item.id_user) || sendingEmailId === item.id_user}
                          className={`p-1.5 rounded-md flex items-center justify-center gap-1 text-sm font-medium transition-all ${
                            emailSentIds.has(item.id_user) 
                              ? 'bg-green-100 text-green-600 cursor-not-allowed opacity-70' // Redup jika sudah dikirim
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200' // Normal state
                          }`}
                          title="Kirim Informasi Akun ke Email"
                        >
                          {sendingEmailId === item.id_user ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          {emailSentIds.has(item.id_user) ? 'Terkirim' : 'Kirim Akun'}
                        </button>

                        <button onClick={() => handleDelete(item.id_user)} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">Tidak ada data asesi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL TAMBAH/EDIT --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? 'Edit Data Asesi' : isDetailMode ? 'Detail Asesi' : 'Tambah Asesi Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="asesiForm" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">NIK</label>
                  <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-orange-500" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-orange-500" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-orange-500" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">No. Handphone</label>
                  <input type="text" name="no_hp" value={formData.no_hp} onChange={handleInputChange} disabled={isDetailMode} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-orange-500" />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg font-medium">Batal</button>
              {!isDetailMode && (
                <button type="submit" form="asesiForm" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 font-medium">
                  <Save size={18}/> Simpan Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- IMPORT MODAL --- */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Import Data Excel</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleImportExcel}>
              <div className="p-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="mx-auto text-slate-400 mb-3" size={40} />
                  <p className="text-sm text-slate-600 font-medium mb-2">Upload file template Excel (.xlsx)</p>
                  <input type="file" accept=".xlsx, .xls" onChange={(e) => setFileExcel(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowImportModal(false)} className="px-4 py-2 text-slate-600 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Upload size={18}/> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahAsesi;