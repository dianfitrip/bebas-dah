import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, Trash2, X, Save, 
  Gavel, User, FileText, Calendar, CheckCircle, XCircle, Clock, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

const Banding = () => {
  // --- STATE ---
  const [data, setData] = useState([]); // Data mentah dari API
  const [filteredData, setFilteredData] = useState([]); // Data setelah disearch
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State untuk Update
  const [formUpdate, setFormUpdate] = useState({
    status_progress: '',
    keputusan: '',
    catatan_komite: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data setiap kali search term atau data berubah
  useEffect(() => {
    if (!data) return;
    
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const noPendaftaran = item.no_pendaftaran?.toLowerCase() || '';
      const emailUser = item.user?.email?.toLowerCase() || '';
      const ket = item.keterangan_banding?.toLowerCase() || '';
      
      return noPendaftaran.includes(lowerTerm) || 
             emailUser.includes(lowerTerm) || 
             ket.includes(lowerTerm);
    });
    
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banding');
      const result = response.data.data || [];
      
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching banding:", error);
      Swal.fire("Error", "Gagal memuat data banding", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setFormUpdate({
      status_progress: item.status_progress || 'diterima_admin',
      keputusan: item.keputusan || 'belum_diputus',
      catatan_komite: item.catatan_komite || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.put(`/admin/banding/${selectedItem.id_banding}`, formUpdate);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status banding telah diperbarui',
        timer: 1500
      });
      
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire('Gagal', 'Terjadi kesalahan saat update', 'error');
    }
  };

  // Helper untuk warna badge status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ditolak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getKeputusanBadge = (keputusan) => {
    if (keputusan === 'diterima') return <span className="flex items-center text-green-600 gap-1.5 font-bold text-sm"><CheckCircle size={16}/> Diterima</span>;
    if (keputusan === 'ditolak') return <span className="flex items-center text-red-600 gap-1.5 font-bold text-sm"><XCircle size={16}/> Ditolak</span>;
    return <span className="flex items-center text-gray-500 gap-1.5 font-bold text-sm"><Clock size={16}/> Belum Diputus</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">
      {/* HEADER PAGE */}
      <div>
        <h2 className="text-2xl font-bold text-[#071E3D]">Data Banding Asesmen</h2>
        <p className="text-[#182D4A] mt-1 text-sm">Kelola pengajuan banding dan keputusan pleno.</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white border border-[#071E3D]/10 rounded-xl shadow-sm p-6">
        
        {/* --- TOOLBAR (SEARCH & TITLE) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h4 className="text-lg font-bold text-[#071E3D]">Daftar Pengajuan</h4>
          </div>
          
          <div className="w-full md:w-80 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CC6B27]" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#071E3D]/15 text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all text-sm" 
              placeholder="Cari No Pendaftaran / Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#CC6B27]" size={36} />
            <p className="text-[#071E3D] mt-3 font-medium">Sedang memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full text-left border-collapse min-w-max bg-white">
              <thead>
                {/* UPDATE: Mengganti text-[#FAFAFA] menjadi text-white secara eksplisit */}
                <tr className="bg-[#071E3D] hover:bg-[#071E3D] border-b-4 border-[#CC6B27] text-white text-sm">
                  <th className="py-3 px-4 font-semibold text-white">No</th>
                  <th className="py-3 px-4 font-semibold text-white">Tanggal</th>
                  <th className="py-3 px-4 font-semibold text-white">Asesi</th>
                  <th className="py-3 px-4 font-semibold text-white">Keterangan Banding</th>
                  <th className="py-3 px-4 font-semibold text-white">Status</th>
                  <th className="py-3 px-4 font-semibold text-white">Keputusan</th>
                  <th className="py-3 px-4 font-semibold text-white text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id_banding} className="border-b border-[#071E3D]/10 bg-white hover:bg-white">
                      <td className="py-4 px-4 text-[#071E3D] text-sm">{index + 1}</td>
                      <td className="py-4 px-4 text-[#071E3D] text-sm">{formatDate(item.tanggal_ajukan)}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#071E3D] text-sm">{item.user?.username || 'User'}</span>
                          <span className="text-xs font-medium text-[#CC6B27]">{item.user?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-xs truncate" title={item.keterangan_banding}>
                          <span className="font-mono text-xs font-semibold block text-[#182D4A]/70 mb-1">{item.no_pendaftaran}</span>
                          <span className="text-[#071E3D] text-sm">{item.keterangan_banding}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs border font-semibold ${getStatusBadge(item.status_progress)}`}>
                          {item.status_progress?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getKeputusanBadge(item.keputusan)}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          className="inline-flex p-2 rounded-lg text-[#CC6B27] bg-[#CC6B27]/10 hover:bg-[#CC6B27] hover:text-white transition-all shadow-sm hover:shadow-[#CC6B27]/30" 
                          onClick={() => handleDetailClick(item)}
                          title="Proses & Detail"
                        >
                          <Gavel size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-white bg-white">
                    <td colSpan="7" className="py-12 text-center bg-white hover:bg-white">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="text-[#071E3D]/20 mb-3"/>
                        <p className="text-[#182D4A] font-medium">Tidak ada data banding ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PROSES BANDING */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#071E3D]/10 flex justify-between items-center bg-[#FAFAFA]">
              <h3 className="text-xl font-bold text-[#071E3D] flex items-center">
                <Gavel size={22} className="mr-2 text-[#CC6B27]"/> Proses Banding Asesmen
              </h3>
              <button 
                className="text-[#182D4A] hover:text-[#CC6B27] hover:bg-[#CC6B27]/10 p-1.5 rounded-lg transition-colors" 
                onClick={() => setShowModal(false)}
              >
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="overflow-y-auto flex-1 flex flex-col px-6 py-5">
              
              {/* INFO DETAIL */}
              <div className="bg-[#071E3D]/5 p-5 rounded-lg mb-6 border border-[#071E3D]/10">
                <h4 className="text-sm font-bold text-[#071E3D] mb-4 flex items-center border-b pb-2 border-[#071E3D]/10">
                  <FileText size={16} className="mr-2 text-[#CC6B27]"/> Detail Pengajuan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[#182D4A]/70 text-xs uppercase font-bold">No Pendaftaran</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5">{selectedItem.no_pendaftaran}</p>
                  </div>
                  <div>
                    <label className="text-[#182D4A]/70 text-xs uppercase font-bold">Tanggal Pengajuan</label>
                    <p className="font-semibold text-[#071E3D] mt-0.5">{formatDate(selectedItem.tanggal_ajukan)}</p>
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <label className="text-[#182D4A]/70 text-xs uppercase font-bold">Alasan Banding</label>
                    <div className="bg-white p-3 border border-[#071E3D]/10 rounded mt-1 text-[#071E3D] leading-relaxed shadow-sm">
                      {selectedItem.keterangan_banding}
                    </div>
                  </div>
                  
                  {/* Link Bukti */}
                  {selectedItem.file_bukti && (
                    <div className="md:col-span-2 mt-2">
                      <label className="text-[#182D4A]/70 text-xs uppercase font-bold">File Bukti Pendukung</label>
                      <a 
                        href={`http://localhost:3000/uploads/${selectedItem.file_bukti}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#CC6B27] hover:text-[#a8561f] hover:underline flex items-center gap-2 mt-1 font-bold bg-[#CC6B27]/10 w-fit px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye size={16}/> Buka Lampiran Bukti
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* FORM UPDATE */}
              <div>
                <h4 className="text-lg font-bold text-[#CC6B27] mb-4 border-b border-[#CC6B27]/20 pb-2">Update Keputusan Pleno</h4>
                
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#071E3D] mb-1.5">Status Progress</label>
                    <select 
                      className="w-full p-2.5 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all font-medium"
                      value={formUpdate.status_progress}
                      onChange={(e) => setFormUpdate(p => ({...p, status_progress: e.target.value}))}
                    >
                      <option value="diterima_admin">Diterima Admin</option>
                      <option value="on_review">Sedang Direview Pleno</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#071E3D] mb-1.5">Keputusan Akhir</label>
                    <select 
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                        formUpdate.keputusan === 'diterima' ? 'bg-green-50 text-green-700 border-green-300 focus:border-green-500 focus:ring-green-200' : 
                        formUpdate.keputusan === 'ditolak' ? 'bg-red-50 text-red-700 border-red-300 focus:border-red-500 focus:ring-red-200' : 
                        'border-[#071E3D]/20 text-[#071E3D] bg-white focus:border-[#CC6B27] focus:ring-[#CC6B27]/10'
                      }`}
                      value={formUpdate.keputusan}
                      onChange={(e) => setFormUpdate(p => ({...p, keputusan: e.target.value}))}
                    >
                      <option value="belum_diputus">-- Belum Diputus --</option>
                      <option value="diterima">✅ Banding Diterima (Kompeten)</option>
                      <option value="ditolak">❌ Banding Ditolak (Tetap BK)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-bold text-[#071E3D] mb-1.5">Catatan Komite / Hasil Pleno</label>
                  <textarea 
                    rows="4" 
                    className="w-full p-3 border border-[#071E3D]/20 rounded-lg text-[#071E3D] bg-white focus:outline-none focus:border-[#CC6B27] focus:ring-2 focus:ring-[#CC6B27]/10 transition-all resize-none font-medium placeholder:text-[#182D4A]/40"
                    placeholder="Masukkan catatan detail hasil rapat pleno komite di sini..."
                    value={formUpdate.catatan_komite}
                    onChange={(e) => setFormUpdate(p => ({...p, catatan_komite: e.target.value}))}
                  ></textarea>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="mt-8 pt-4 border-t border-[#071E3D]/10 flex justify-end gap-3 pb-2">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-lg font-semibold border border-[#071E3D]/20 text-[#071E3D] hover:bg-[#071E3D]/5 transition-colors" 
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-lg font-semibold bg-[#CC6B27] text-white hover:bg-[#a6561f] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save size={18} /> Simpan Keputusan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banding;