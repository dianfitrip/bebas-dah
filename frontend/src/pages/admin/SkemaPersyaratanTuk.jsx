import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Trash2, X, Save, ArrowLeft, Building2
} from 'lucide-react';
import './adminstyles/Persyaratan.css';

const SkemaPersyaratanTuk = () => {
  const { id } = useParams(); // id_skema
  const navigate = useNavigate();

  const [skemaDetail, setSkemaDetail] = useState(null);
  const [data, setData] = useState([]); // Persyaratan TUK yang di-attach
  const [allPersyaratanTuk, setAllPersyaratanTuk] = useState([]); // Master Persyaratan TUK
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('pilih');

  const initialForm = {
    id_persyaratan_tuk: '',
    nama_perlengkapan: '',
    spesifikasi: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data.data);
      
      // Ambil relasi persyaratan_tuk dari detail skema
      setData(resSkema.data.data.persyaratan_tuks || []);

      const resAll = await api.get('/admin/persyaratan-tuk');
      setAllPersyaratanTuk(resAll.data.data || []);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data persyaratan TUK skema', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrAttach = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'pilih') {
        if (!formData.id_persyaratan_tuk) return Swal.fire('Peringatan', 'Pilih perlengkapan terlebih dahulu', 'warning');
        
        await api.post('/admin/persyaratan-tuk/attach', {
          id_skema: id,
          id_persyaratan_tuk: formData.id_persyaratan_tuk
        });
        Swal.fire('Sukses!', 'Persyaratan TUK berhasil dikaitkan', 'success');
      } else {
        // Buat baru dan attach 
        await api.post('/admin/persyaratan-tuk', {
          nama_perlengkapan: formData.nama_perlengkapan,
          spesifikasi: formData.spesifikasi,
          id_skema: id // Pastikan backend handle attachment jika request ini dikirim
        });
        Swal.fire('Sukses!', 'Persyaratan TUK baru berhasil dibuat', 'success');
      }
      
      setShowModal(false);
      setFormData(initialForm);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = (id_persyaratan_tuk) => {
    Swal.fire({
      title: 'Hapus Persyaratan?',
      text: "Persyaratan perlengkapan ini akan dilepas dari skema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Lepaskan!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Endpoint yang terdaftar di persyaratanTuk.controller.js
          await api.delete(`/admin/persyaratan-tuk/detach/${id}/${id_persyaratan_tuk}`);
          Swal.fire('Terhapus!', 'Persyaratan telah dilepas dari skema.', 'success');
          fetchData();
        } catch (error) {
          Swal.fire('Error', 'Gagal melepas persyaratan', 'error');
        }
      }
    });
  };

  const filteredData = data.filter(item => 
    item.nama_perlengkapan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="persyaratan-container">
      <div className="header-section">
        <div>
          <button onClick={() => navigate('/admin/skema')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 text-sm font-medium">
            <ArrowLeft size={16} /> Kembali ke Daftar Skema
          </button>
          <h2 className="page-title">Persyaratan TUK Skema</h2>
          <p className="page-subtitle text-purple-600 font-semibold">{skemaDetail?.nama_skema || 'Memuat Skema...'}</p>
        </div>
        <button 
          onClick={() => { setFormMode('pilih'); setFormData(initialForm); setShowModal(true); }}
          className="btn-create bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus size={18} /> Tambah Peralatan
        </button>
      </div>

      <div className="content-card">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Cari peralatan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Nama Perlengkapan/Peralatan</th>
                <th className="p-4 font-semibold">Spesifikasi</th>
                <th className="p-4 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-800">{item.nama_perlengkapan}</td>
                    <td className="p-4 text-slate-600 text-sm">{item.spesifikasi || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleDelete(item.id_persyaratan_tuk)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Hapus dari Skema">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
                    Belum ada persyaratan peralatan TUK untuk skema ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Tambah Peralatan TUK</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateOrAttach} className="p-5">
              
              <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formMode === 'pilih'} onChange={() => setFormMode('pilih')} className="text-purple-600" />
                  Pilih Master yang Ada
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formMode === 'baru'} onChange={() => setFormMode('baru')} className="text-purple-600" />
                  Buat Master Baru
                </label>
              </div>

              <div className="space-y-4">
                {formMode === 'pilih' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Peralatan</label>
                    <select 
                      name="id_persyaratan_tuk" 
                      value={formData.id_persyaratan_tuk} 
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 outline-none"
                      required
                    >
                      <option value="">-- Pilih Peralatan TUK --</option>
                      {allPersyaratanTuk.map(p => (
                        <option key={p.id_persyaratan_tuk} value={p.id_persyaratan_tuk}>{p.nama_perlengkapan}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Perlengkapan Baru</label>
                      <input 
                        type="text" 
                        name="nama_perlengkapan" 
                        value={formData.nama_perlengkapan} 
                        onChange={handleInputChange} 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 outline-none"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Spesifikasi</label>
                      <textarea 
                        name="spesifikasi" 
                        rows="3" 
                        value={formData.spesifikasi} 
                        onChange={handleInputChange}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-100 outline-none"
                        placeholder="Contoh: Prosesor i5, RAM 8GB, SSD 256GB"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Save size={18}/> Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkemaPersyaratanTuk;