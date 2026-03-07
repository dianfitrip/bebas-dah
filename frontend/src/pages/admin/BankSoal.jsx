import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bankSoalService } from "../../services/bankSoalService";
import { unitKompetensiService } from "../../services/unitKompetensiService"; // asumsi sudah ada
import Swal from "sweetalert2"; // untuk konfirmasi & notifikasi

const BankSoal = () => {
  const navigate = useNavigate();
  const [soalList, setSoalList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id_unit: "",
    jenis: "IA05_pg",
    pertanyaan: "",
    tingkat_kesulitan: "sedang",
    status: "aktif",
  });

  // Filter state
  const [filterUnit, setFilterUnit] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  useEffect(() => {
    fetchSoal();
    fetchUnits();
  }, []);

  const fetchSoal = async () => {
    setLoading(true);
    try {
      const res = await bankSoalService.getAll();
      setSoalList(res.data.data || []);
    } catch (error) {
      Swal.fire("Error", "Gagal memuat data soal", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await unitKompetensiService.getAll(); // asumsikan service ini ada
      setUnitList(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat unit kompetensi");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (soal = null) => {
    if (soal) {
      setEditingId(soal.id_soal);
      setFormData({
        id_unit: soal.id_unit,
        jenis: soal.jenis,
        pertanyaan: soal.pertanyaan,
        tingkat_kesulitan: soal.tingkat_kesulitan || "sedang",
        status: soal.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        id_unit: "",
        jenis: "IA05_pg",
        pertanyaan: "",
        tingkat_kesulitan: "sedang",
        status: "aktif",
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
      if (editingId) {
        await bankSoalService.update(editingId, formData);
        Swal.fire("Berhasil", "Soal berhasil diperbarui", "success");
      } else {
        await bankSoalService.create(formData);
        Swal.fire("Berhasil", "Soal berhasil ditambahkan", "success");
      }
      closeModal();
      fetchSoal();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan soal", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
    });

    if (result.isConfirmed) {
      try {
        await bankSoalService.delete(id);
        Swal.fire("Terhapus", "Soal berhasil dihapus", "success");
        fetchSoal();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus soal", "error");
      }
    }
  };

  // Filter logic
  const filteredSoal = soalList.filter((soal) => {
    if (filterUnit && soal.id_unit != filterUnit) return false;
    if (filterJenis && soal.jenis !== filterJenis) return false;
    return true;
  });

  const getUnitName = (id) => {
    const unit = unitList.find((u) => u.id_unit === id);
    return unit ? unit.nama_unit : "-";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Bank Soal</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Soal
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-4">
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Unit</option>
          {unitList.map((unit) => (
            <option key={unit.id_unit} value={unit.id_unit}>
              {unit.nama_unit}
            </option>
          ))}
        </select>
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Jenis</option>
          <option value="IA05_pg">IA05 PG</option>
          <option value="IA06_essay">IA06 Essay</option>
          <option value="IA07_lisan">IA07 Lisan</option>
          <option value="IA09_wawancara">IA09 Wawancara</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Pertanyaan</th>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Kesulitan</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredSoal.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredSoal.map((soal) => (
                <tr key={soal.id_soal} className="border-t">
                  <td className="px-4 py-2">{soal.id_soal}</td>
                  <td className="px-4 py-2">{getUnitName(soal.id_unit)}</td>
                  <td className="px-4 py-2 max-w-md truncate">
                    {soal.pertanyaan}
                  </td>
                  <td className="px-4 py-2">{soal.jenis}</td>
                  <td className="px-4 py-2">{soal.tingkat_kesulilan}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        soal.status === "aktif"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {soal.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openModal(soal)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(soal.id_soal)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                    {soal.jenis === "IA05_pg" && (
                      <button
                        onClick={() => navigate(`/admin/bank-soal-pg/${soal.id_soal}`)}
                        className="text-green-600 hover:underline"
                      >
                        Kelola Opsi
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Soal" : "Tambah Soal"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Unit Kompetensi</label>
                <select
                  name="id_unit"
                  value={formData.id_unit}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Pilih Unit</option>
                  {unitList.map((unit) => (
                    <option key={unit.id_unit} value={unit.id_unit}>
                      {unit.nama_unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Jenis Soal</label>
                <select
                  name="jenis"
                  value={formData.jenis}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="IA05_pg">IA05 PG</option>
                  <option value="IA06_essay">IA06 Essay</option>
                  <option value="IA07_lisan">IA07 Lisan</option>
                  <option value="IA09_wawancara">IA09 Wawancara</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Pertanyaan</label>
                <textarea
                  name="pertanyaan"
                  value={formData.pertanyaan}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Tingkat Kesulitan</label>
                <select
                  name="tingkat_kesulitan"
                  value={formData.tingkat_kesulitan}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
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

export default BankSoal;