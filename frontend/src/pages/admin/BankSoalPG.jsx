import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bankSoalPGService } from "../../services/bankSoalPGService";
import { bankSoalService } from "../../services/bankSoalService";
import Swal from "sweetalert2";

const BankSoalPG = () => {
  const { id_soal } = useParams();
  const navigate = useNavigate();
  const [soalInfo, setSoalInfo] = useState(null);
  const [opsiList, setOpsiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    opsi_label: "",
    isi_opsi: "",
    is_benar: false,
  });

  // Jika tidak ada id_soal, tampilkan daftar soal PG
  const [soalPGList, setSoalPGList] = useState([]);

  useEffect(() => {
    if (id_soal) {
      fetchSoalInfo();
      fetchOpsi();
    } else {
      fetchSoalPG();
    }
  }, [id_soal]);

  const fetchSoalInfo = async () => {
    try {
      const res = await bankSoalService.getAll();
      const soal = res.data.data.find((s) => s.id_soal == id_soal);
      setSoalInfo(soal);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat informasi soal", "error");
    }
  };

  const fetchOpsi = async () => {
    setLoading(true);
    try {
      const res = await bankSoalPGService.getBySoal(id_soal);
      setOpsiList(res.data.data || []);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat opsi", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSoalPG = async () => {
    setLoading(true);
    try {
      const res = await bankSoalService.getAll();
      // filter hanya yang jenis IA05_pg
      const filtered = res.data.data.filter((s) => s.jenis === "IA05_pg");
      setSoalPGList(filtered);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat daftar soal PG", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openModal = (opsi = null) => {
    if (opsi) {
      setEditingId(opsi.id_opsi);
      setFormData({
        opsi_label: opsi.opsi_label,
        isi_opsi: opsi.isi_opsi,
        is_benar: opsi.is_benar,
      });
    } else {
      setEditingId(null);
      setFormData({
        opsi_label: "",
        isi_opsi: "",
        is_benar: false,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_soal: parseInt(id_soal),
      };
      if (editingId) {
        await bankSoalPGService.update(editingId, payload);
        Swal.fire("Berhasil", "Opsi berhasil diperbarui", "success");
      } else {
        await bankSoalPGService.create(payload);
        Swal.fire("Berhasil", "Opsi berhasil ditambahkan", "success");
      }
      closeModal();
      fetchOpsi();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan opsi", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Opsi yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
    });

    if (result.isConfirmed) {
      try {
        await bankSoalPGService.delete(id);
        Swal.fire("Terhapus", "Opsi berhasil dihapus", "success");
        fetchOpsi();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus opsi", "error");
      }
    }
  };

  // Render daftar soal PG jika tidak ada id_soal
  if (!id_soal) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Bank Soal PG - Pilih Soal</h1>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Pertanyaan</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : soalPGList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Tidak ada soal PG
                  </td>
                </tr>
              ) : (
                soalPGList.map((soal) => (
                  <tr key={soal.id_soal} className="border-t">
                    <td className="px-4 py-2">{soal.id_soal}</td>
                    <td className="px-4 py-2">{soal.UnitKompetensi?.nama_unit || "-"}</td>
                    <td className="px-4 py-2 max-w-md truncate">{soal.pertanyaan}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/admin/bank-soal-pg/${soal.id_soal}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Kelola Opsi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render opsi untuk soal tertentu
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Opsi PG</h1>
          {soalInfo && (
            <p className="text-gray-600">
              Soal: {soalInfo.pertanyaan} (ID: {id_soal})
            </p>
          )}
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Opsi
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Label</th>
              <th className="px-4 py-2 text-left">Isi Opsi</th>
              <th className="px-4 py-2 text-left">Jawaban Benar</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : opsiList.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Belum ada opsi
                </td>
              </tr>
            ) : (
              opsiList.map((opsi) => (
                <tr key={opsi.id_opsi} className="border-t">
                  <td className="px-4 py-2 font-mono">{opsi.opsi_label}</td>
                  <td className="px-4 py-2">{opsi.isi_opsi}</td>
                  <td className="px-4 py-2">
                    {opsi.is_benar ? (
                      <span className="text-green-600 font-semibold">✓ Benar</span>
                    ) : (
                      <span className="text-red-600">✗ Salah</span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openModal(opsi)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(opsi.id_opsi)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Opsi */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Opsi" : "Tambah Opsi"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Label Opsi (huruf, misal A, B, C)</label>
                <input
                  type="text"
                  name="opsi_label"
                  value={formData.opsi_label}
                  onChange={handleInputChange}
                  maxLength="1"
                  required
                  className="w-full border rounded px-3 py-2 uppercase"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Isi Opsi</label>
                <textarea
                  name="isi_opsi"
                  value={formData.isi_opsi}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_benar"
                    checked={formData.is_benar}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Ini adalah jawaban benar</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSoalPG;