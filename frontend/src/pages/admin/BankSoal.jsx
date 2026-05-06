// frontend/src/pages/admin/BankSoal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Filter,
  Settings,
  FileText,
  List,
  ArrowLeft,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  ShieldCheck,
  Layers,
} from "lucide-react";

const BankSoal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitQuery = searchParams.get("unit");

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

  const [filterUnit, setFilterUnit] = useState(unitQuery || "");
  const [filterJenis, setFilterJenis] = useState("");

  useEffect(() => {
    if (unitQuery) {
      setFilterUnit(unitQuery);
    }
  }, [unitQuery]);

  useEffect(() => {
    fetchSoal();
    fetchUnits();
  }, []);

  const fetchSoal = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/bank-soal");
      setSoalList(res.data?.data || res.data || []);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Gagal mengambil data soal",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get("/admin/unit-kompetensi");
      setUnitList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Gagal mengambil data unit:", error);
    }
  };

  const filteredSoal = soalList.filter((s) => {
    const matchUnit = filterUnit ? String(s.id_unit) === String(filterUnit) : true;
    const matchJenis = filterJenis ? s.jenis === filterJenis : true;

    return matchUnit && matchJenis;
  });

  const activeUnitInfo = unitList.find(
    (u) => String(u.id_unit) === String(unitQuery)
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      id_unit: unitQuery || filterUnit || "",
      jenis: "IA05_pg",
      pertanyaan: "",
      tingkat_kesulitan: "sedang",
      status: "aktif",
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleEdit = (soal) => {
    setEditingId(soal.id_soal);
    setFormData({
      id_unit: soal.id_unit || "",
      jenis: soal.jenis || "IA05_pg",
      pertanyaan: soal.pertanyaan || "",
      tingkat_kesulitan: soal.tingkat_kesulitan || "sedang",
      status: soal.status || "aktif",
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.id_unit) {
      return "Silakan pilih Unit Kompetensi terlebih dahulu!";
    }

    const tanya = String(formData.pertanyaan).trim();

    if (!tanya || tanya.length < 4) {
      return "Teks pertanyaan terlalu pendek. Minimal harus 4 karakter!";
    }

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();

    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${
        editingId ? "menyimpan perubahan" : "menambahkan"
      } data Bank Soal ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#CC6B27",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/admin/bank-soal/${editingId}`, formData);
        Swal.fire({
          title: "Berhasil",
          text: "Soal berhasil diperbarui",
          icon: "success",
          timer: 1500,
        });
      } else {
        await api.post("/admin/bank-soal", formData);
        Swal.fire({
          title: "Berhasil",
          text: "Soal berhasil ditambahkan",
          icon: "success",
          timer: 1500,
        });
      }

      closeModal();
      fetchSoal();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Gagal menyimpan soal",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin menghapus data Soal ini? Aksi ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/bank-soal/${id}`);
      Swal.fire({
        title: "Terhapus",
        text: "Soal berhasil dihapus",
        icon: "success",
        timer: 1500,
      });
      fetchSoal();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus soal",
        icon: "error",
      });
    }
  };

  const totalAktif = soalList.filter((item) => item.status === "aktif").length;
  const totalPg = soalList.filter((item) => item.jenis === "IA05_pg").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Database size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Bank Soal
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Bank Soal
                <br />
                <span className="text-orange-500">Ujian</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                {unitQuery && activeUnitInfo
                  ? `Mengelola bank soal khusus untuk unit: ${activeUnitInfo.kode_unit}`
                  : "Pengelolaan bank soal untuk ujian tertulis, esai, lisan, dan wawancara asesi."}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {unitQuery && (
                  <button
                    type="button"
                    onClick={() => navigate("/admin/unit-kompetensi")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <ArrowLeft size={17} />
                    Kembali
                  </button>
                )}

                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Soal
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Soal
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {soalList.length} Soal Tersedia
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Filter soal berdasarkan unit kompetensi dan jenis instrumen
                  asesmen.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Aktif" value={`${totalAktif}`} />
                  <HeroPill label="PG" value={`${totalPg}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Total Soal"
            value={`${soalList.length} Soal`}
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Soal Aktif"
            value={`${totalAktif} Aktif`}
            tone="green"
          />
          <MiniStat
            icon={<Layers size={22} />}
            label="Hasil Filter"
            value={`${filteredSoal.length} Data`}
            tone="navy"
          />
        </section>

        {/* FILTER */}
        <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Filter size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Soal
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar Bank Soal
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Pilih unit kompetensi dan jenis soal untuk memfilter data.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-64">
                <Filter
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    unitQuery ? "text-slate-300" : "text-orange-500"
                  }`}
                />
                <select
                  className={`w-full appearance-none rounded-2xl border px-12 py-4 text-sm font-black outline-none transition-all ${
                    unitQuery
                      ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                      : "border-slate-100 bg-slate-50 text-[#071E3D] focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  }`}
                  value={filterUnit}
                  disabled={!!unitQuery}
                  onChange={(e) => setFilterUnit(e.target.value)}
                >
                  <option value="">Semua Unit Kompetensi</option>
                  {unitList.map((u) => (
                    <option key={u.id_unit} value={u.id_unit}>
                      {u.kode_unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full md:w-64">
                <Settings
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
                />
                <select
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                >
                  <option value="">Semua Jenis Soal</option>
                  <option value="IA05_pg">Pilihan Ganda (PG)</option>
                  <option value="IA06_essay">Ujian Esai</option>
                  <option value="IA07_lisan">Ujian Lisan</option>
                  <option value="IA09_wawancara">Wawancara</option>
                </select>
              </div>

              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Plus size={16} />
                Tambah Soal
              </button>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Jenis Soal</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead center>Kesulitan</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={38}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data...
                      </p>
                    </td>
                  </tr>
                ) : filteredSoal.length > 0 ? (
                  filteredSoal.map((item, idx) => (
                    <tr
                      key={item.id_soal}
                      className="border-b border-slate-100 text-sm transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4 font-black text-orange-500">
                        {item.unit_kompetensi?.kode_unit || item.id_unit}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D]">
                          {item.jenis === "IA05_pg"
                            ? "PILIHAN GANDA"
                            : item.jenis === "IA06_essay"
                            ? "ESAI"
                            : item.jenis === "IA07_lisan"
                            ? "LISAN"
                            : item.jenis === "IA09_wawancara"
                            ? "WAWANCARA"
                            : item.jenis}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        <div
                          className="line-clamp-2 max-w-md font-semibold"
                          title={item.pertanyaan}
                        >
                          {item.pertanyaan}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center font-black capitalize text-[#071E3D]">
                        {item.tingkat_kesulitan?.replace("_", " ")}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.jenis === "IA05_pg" && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/bank-soal-pg?id=${item.id_soal}`
                                )
                              }
                              className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                              title="Kelola Opsi Pilihan Ganda"
                            >
                              <List size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-xl bg-orange-50 p-2 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                            title="Edit Soal"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_soal)}
                            className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus Soal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        Belum ada data soal ditemukan.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  {editingId ? <Edit2 size={22} /> : <Plus size={22} />}
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#071E3D]">
                    {editingId ? "Edit Bank Soal" : "Tambah Bank Soal Baru"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Lengkapi unit kompetensi, jenis, tingkat kesulitan, dan isi
                    pertanyaan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-6">
              <form id="soalForm" onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pilih Unit Kompetensi{" "}
                    {unitQuery && (
                      <span className="font-bold normal-case tracking-normal text-red-500">
                        (Terkunci)
                      </span>
                    )}
                  </label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleInputChange}
                    disabled={!!unitQuery}
                    className={`w-full rounded-2xl border px-4 py-4 text-sm font-black outline-none transition-all ${
                      unitQuery
                        ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                        : "border-slate-100 bg-slate-50 text-[#071E3D] focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    }`}
                  >
                    <option value="">-- Silakan Pilih --</option>
                    {unitList.map((u) => (
                      <option key={u.id_unit} value={u.id_unit}>
                        {u.kode_unit} - {u.judul_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Jenis Soal
                    </label>
                    <select
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="IA05_pg">IA.05 Pilihan Ganda</option>
                      <option value="IA06_essay">IA.06 Esai</option>
                      <option value="IA07_lisan">IA.07 Lisan</option>
                      <option value="IA09_wawancara">IA.09 Wawancara</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tingkat Kesulitan
                    </label>
                    <select
                      name="tingkat_kesulitan"
                      value={formData.tingkat_kesulitan}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Isi Pertanyaan
                  </label>
                  <textarea
                    name="pertanyaan"
                    rows="5"
                    value={formData.pertanyaan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Apa yang dimaksud dengan..."
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Tidak Aktif</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 p-6">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
              >
                Batal
              </button>

              <button
                type="submit"
                form="soalForm"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingId ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    navy: "bg-slate-50 text-[#071E3D]",
  };

  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${
          tones[tone] || tones.orange
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-lg font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
}

function TableHead({ children, center }) {
  return (
    <th
      className={`border-b-4 border-orange-500 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white ${
        center ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export default BankSoal;