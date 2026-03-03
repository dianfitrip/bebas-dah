import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Plus, Trash2, X, Save, ArrowLeft, FileCheck 
} from 'lucide-react';
import './adminstyles/Persyaratan.css';

const SkemaPersyaratan = () => {
  const { id } = useParams(); // id_skema dari URL
  const navigate = useNavigate();

  const [skemaDetail, setSkemaDetail] = useState(null);
  const [data, setData] = useState([]); // Data persyaratan yang sudah di-attach
  const [allPersyaratan, setAllPersyaratan] = useState([]); // Master data persyaratan (opsional jika pilih dari yang ada)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState('pilih'); // 'pilih' (attach existing) atau 'baru' (create new)

  const initialForm = {
    id_persyaratan: '', // untuk attach
    nama_persyaratan: '',
    jenis_persyaratan: 'dasar',
    keterangan: '',
    wajib: true
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil detail skema beserta persyaratannya
      // Asumsi backend memiliki relasi Skema -> Persyaratan
      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data.data);
      
      // Jika API skema mengembalikan relasi persyaratannya di dalam property persyaratans
      setData(resSkema.data.data.persyaratans || []); 

      // Ambil semua master persyaratan untuk opsi dropdown "Pilih yang sudah ada"
      const resAll = await api.get('/admin/persyaratan');
      setAllPersyaratan(resAll.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal memuat data persyaratan skema', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateOrAttach = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'pilih') {
        if (!formData.id_persyaratan) return Swal.fire('Peringatan', 'Pilih persyaratan terlebih dahulu', 'warning');
        
        // Endpoint untuk mengaitkan (Attach) Persyaratan ke Skema
        await api.post('/admin/persyaratan/attach', {
          id_skema: id,
          id_persyaratan: formData.id_persyaratan,
          wajib: formData.wajib
        });
        Swal.fire('Sukses!', 'Persyaratan berhasil ditambahkan ke skema', 'success');
      } else {
        // Buat Persyaratan Baru lalu (opsional) attach ke skema dari backend
        // Kamu bisa mengirim id_skema di payload jika backend menanganinya langsung
        await api.post('/admin/persyaratan', {
          nama_persyaratan: formData.nama_persyaratan,
          jenis_persyaratan: formData.jenis_persyaratan,
          keterangan: formData.keterangan,
          id_skema: id, // Kirim id_skema agar backend tahu untuk meng-attach-nya juga
          wajib: formData.wajib
        });
        Swal.fire('Sukses!', 'Persyaratan baru berhasil dibuat dan ditambahkan ke skema', 'success');
      }
      
      setShowModal(false);
      setFormData(initialForm);
      fetchData();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = (id_persyaratan) => {
    Swal.fire({
      title: 'Hapus Persyaratan?',
      text: "Persyaratan ini akan dilepas dari skema ini.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Lepaskan!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Asumsi endpoint detach menggunakan parameter url atau body
          await api.delete(`/admin/persyaratan/detach/${id}/${id_persyaratan}`);
          Swal.fire('Terhapus!', 'Persyaratan telah dilepas dari skema.', 'success');
          fetchData();
        } catch (error) {
          Swal.fire('Error', 'Gagal melepas persyaratan', 'error');
        }
      }
    });
  };

  const filteredData = data.filter(item => 
    item.nama_persyaratan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="persyaratan-container">
      <div className="header-section">
        <div>
          <button onClick={() => navigate('/admin/skema')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 text-sm font-medium">
            <ArrowLeft size={16} /> Kembali ke Daftar Skema
          </button>
          <h2 className="page-title">Persyaratan Skema</h2>
          <p className="page-subtitle text-orange-600 font-semibold">{skemaDetail?.nama_skema || 'Memuat Skema...'}</p>
        </div>
        <button 
          onClick={() => { setFormMode('pilih'); setFormData(initialForm); setShowModal(true); }}
          className="btn-create bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={18} /> Tambah Persyaratan
        </button>
      </div>

      <div className="content-card">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Cari persyaratan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                <th className="p-4 font-semibold w-16 text-center">No</th>
                <th className="p-4 font-semibold">Nama Persyaratan</th>
                <th className="p-4 font-semibold">Jenis</th>
                <th className="p-4 font-semibold text-center">Wajib?</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-center text-slate-500">{index + 1}</td>
                    <td className="p-4 font-medium text-slate-800">{item.nama_persyaratan}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.jenis_persyaratan === 'dasar' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.jenis_persyaratan === 'dasar' ? 'Dasar' : 'Administratif'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* Asumsi data wajib ada di item.skema_persyaratan.wajib (Pivot table) */}
                      {item.skema_persyaratan?.wajib ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">Wajib</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">Opsional</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleDelete(item.id_persyaratan)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" title="Hapus dari Skema">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <FileCheck size={40} className="mx-auto mb-3 text-slate-300" />
                    Belum ada persyaratan yang ditambahkan ke skema ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL TAMBAH PERSYARATAN --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Tambah Persyaratan Skema</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateOrAttach} className="p-5">
              
              {/* Opsi Mode: Pilih yang ada atau Buat baru */}
              <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formMode === 'pilih'} onChange={() => setFormMode('pilih')} className="text-blue-600" />
                  Pilih Master yang Ada
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formMode === 'baru'} onChange={() => setFormMode('baru')} className="text-blue-600" />
                  Buat Master Baru
                </label>
              </div>

              <div className="space-y-4">
                {formMode === 'pilih' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Persyaratan</label>
                    <select 
                      name="id_persyaratan" 
                      value={formData.id_persyaratan} 
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      required
                    >
                      <option value="">-- Pilih Persyaratan --</option>
                      {allPersyaratan.map(p => (
                        <option key={p.id_persyaratan} value={p.id_persyaratan}>{p.nama_persyaratan} ({p.jenis_persyaratan})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Persyaratan Baru</label>
                      <input 
                        type="text" 
                        name="nama_persyaratan" 
                        value={formData.nama_persyaratan} 
                        onChange={handleInputChange} 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Persyaratan</label>
                      <select 
                        name="jenis_persyaratan" 
                        value={formData.jenis_persyaratan} 
                        onChange={handleInputChange}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                      >
                        <option value="dasar">Dasar</option>
                        <option value="administratif">Administratif</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      name="wajib" 
                      checked={formData.wajib} 
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    Persyaratan ini WAJIB dipenuhi?
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
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

export default SkemaPersyaratan;