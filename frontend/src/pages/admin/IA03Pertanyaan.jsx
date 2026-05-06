// frontend/src/pages/admin/IA03Pertanyaan.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Plus,
  Trash2,
  X,
  Save,
  Loader2,
  MessageCircleQuestion,
  FileText,
  Filter,
  Sparkles,
  BadgeCheck,
  Layers,
  HelpCircle,
  RefreshCcw,
} from "lucide-react";

const IA03Pertanyaan = () => {
  // State Utama
  const [dataList, setDataList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    id_unit: "",
    pertanyaan: "",
  });

  // 1. Ambil data Unit Kompetensi untuk dropdown filter dan form modal
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get("/admin/unit-kompetensi");
        setUnitList(response.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data Unit Kompetensi");
      }
    };
    fetchUnits();
  }, []);

  // 2. Tampilkan data otomatis berdasarkan Dropdown Unit Kompetensi yang dipilih
  useEffect(() => {
    if (selectedUnitId) {
      fetchDataByUnit(selectedUnitId);
    } else {
      setDataList([]);
    }
  }, [selectedUnitId]);

  const fetchDataByUnit = async (id) => {
    setFetching(true);
    try {
      const response = await api.get(`/admin/ia03-pertanyaan/unit/${id}`);
      setDataList(response.data.data || []);
    } catch (err) {
      setDataList([]);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Tambah Pertanyaan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_unit)
      return Swal.fire({
        title: "Peringatan",
        text: "Pilih Unit Kompetensi terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#CC6B27",
      });

    try {
      setLoading(true);
      const payload = {
        id_unit: parseInt(formData.id_unit, 10),
        pertanyaan: formData.pertanyaan,
      };

      await api.post("/admin/ia03-pertanyaan", payload);

      Swal.fire({
        title: "Berhasil",
        text: "Pertanyaan berhasil ditambahkan!",
        icon: "success",
        confirmButtonColor: "#CC6B27",
      });
      setFormData({ id_unit: "", pertanyaan: "" });
      setShowModal(false);

      if (selectedUnitId === payload.id_unit.toString()) {
        fetchDataByUnit(selectedUnitId);
      } else {
        setSelectedUnitId(payload.id_unit.toString());
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal",
        text: err.response?.data?.message || "Gagal menambah data",
        icon: "error",
        confirmButtonColor: "#CC6B27",
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Hapus Pertanyaan
  const handleDelete = async (id_ia03) => {
    const result = await Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Pertanyaan ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setFetching(true);
        await api.delete(`/admin/ia03-pertanyaan/${id_ia03}`);
        Swal.fire({
          title: "Terhapus!",
          text: "Pertanyaan berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#CC6B27",
        });
        fetchDataByUnit(selectedUnitId);
      } catch (err) {
        Swal.fire({
          title: "Gagal",
          text: "Gagal menghapus data",
          icon: "error",
          confirmButtonColor: "#CC6B27",
        });
        setFetching(false);
      }
    }
  };

  const selectedUnit = unitList.find(
    (unit) => String(unit.id_unit) === String(selectedUnitId)
  );

  const totalUnit = unitList.length;
  const totalPertanyaan = dataList.length;
  const totalTerisi = dataList.filter((item) => item.pertanyaan).length;

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
                <MessageCircleQuestion size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  IA.03 Pertanyaan
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Data Instrumen
                <br />
                <span className="text-orange-500">Pertanyaan</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola instrumen pertanyaan lisan atau tertulis berdasarkan
                unit kompetensi yang digunakan dalam proses asesmen.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Pertanyaan
                </button>

                <button
                  type="button"
                  onClick={() => selectedUnitId && fetchDataByUnit(selectedUnitId)}
                  disabled={!selectedUnitId || fetching}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  {fetching ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <RefreshCcw size={17} />
                  )}
                  Refresh Data
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
                  Ringkasan Pertanyaan
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {totalPertanyaan} Pertanyaan
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  {selectedUnit
                    ? `${selectedUnit.kode_unit} - ${selectedUnit.judul_unit}`
                    : "Pilih unit kompetensi untuk melihat daftar pertanyaan."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Unit" value={`${totalUnit}`} />
                  <HeroPill label="Terisi" value={`${totalTerisi}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<Layers size={22} />}
            label="Unit Kompetensi"
            value={`${totalUnit} Unit`}
          />
          <MiniStat
            icon={<HelpCircle size={22} />}
            label="Pertanyaan"
            value={`${totalPertanyaan} Data`}
            tone="navy"
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Terisi"
            value={`${totalTerisi} Item`}
            tone="green"
          />
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Filter size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Filter Unit
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Daftar IA.03 Pertanyaan
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Pilih unit kompetensi untuk menampilkan data pertanyaan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Tambah Pertanyaan
            </button>
          </div>

          {/* TOOLBAR */}
          <div className="p-6">
            <div className="rounded-[28px] border border-slate-100 bg-slate-50/60 p-5">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Unit Kompetensi
              </label>

              <div className="relative">
                <Filter
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-white px-12 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="">
                    -- Pilih Unit Kompetensi untuk melihat data --
                  </option>
                  {unitList.map((unit) => (
                    <option key={unit.id_unit} value={unit.id_unit}>
                      {unit.kode_unit} - {unit.judul_unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No.</TableHead>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="3" className="p-16 text-center">
                      <Loader2
                        className="mx-auto mb-4 animate-spin text-orange-500"
                        size={42}
                      />
                      <p className="font-black text-[#071E3D]">
                        Memuat data pertanyaan...
                      </p>
                    </td>
                  </tr>
                ) : dataList.length > 0 ? (
                  dataList.map((item, index) => (
                    <tr
                      key={item.id_ia03}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                        {index + 1}
                      </td>

                      <td className="whitespace-pre-wrap px-5 py-4 text-sm font-semibold leading-relaxed text-slate-600">
                        {item.pertanyaan}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id_ia03)}
                          className="mx-auto flex rounded-xl bg-red-50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                          title="Hapus Data"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-16 text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        {!selectedUnitId
                          ? "Silakan pilih Unit Kompetensi di atas terlebih dahulu."
                          : "Belum ada data pertanyaan untuk Unit Kompetensi ini."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL TAMBAH DATA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-black text-[#071E3D]">
                  <Plus size={20} className="text-orange-500" />
                  Tambah Pertanyaan Baru
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Tambahkan pertanyaan berdasarkan unit kompetensi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form id="pertanyaanForm" onSubmit={handleSubmit} className="space-y-5 p-6">
                <div>
                  <Label required>Pilih Unit Kompetensi</Label>
                  <select
                    name="id_unit"
                    value={formData.id_unit}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    required
                  >
                    <option value="">-- Pilih Unit Kompetensi --</option>
                    {unitList.map((unit) => (
                      <option key={unit.id_unit} value={unit.id_unit}>
                        {unit.kode_unit} - {unit.judul_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label required>Isi Pertanyaan</Label>
                  <textarea
                    name="pertanyaan"
                    value={formData.pertanyaan}
                    onChange={handleChange}
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    rows="5"
                    required
                    placeholder="Tuliskan pertanyaan disini..."
                  />
                </div>
              </form>
            </div>

            <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
              >
                Batal
              </button>

              <button
                type="submit"
                form="pertanyaanForm"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Simpan Data
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

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export default IA03Pertanyaan;