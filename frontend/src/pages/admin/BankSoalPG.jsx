// frontend/src/pages/admin/BankSoalPG.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  FileText,
} from "lucide-react";

const BankSoalPG = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idSoalQuery = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [activeSoal, setActiveSoal] = useState(null);
  const [opsiList, setOpsiList] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    opsi_label: "A",
    isi_opsi: "",
    is_benar: false,
  });

  useEffect(() => {
    if (!idSoalQuery) {
      Swal.fire(
        "Perhatian",
        "Tidak ada soal yang dipilih. Anda akan dialihkan kembali.",
        "warning"
      ).then(() => navigate("/admin/bank-soal"));
      return;
    }

    fetchSoalDetail(idSoalQuery);
    fetchOpsi(idSoalQuery);
  }, [idSoalQuery, navigate]);

  const fetchSoalDetail = async (id) => {
    try {
      setLoading(true);

      const res = await api.get("/admin/bank-soal");
      const data = res.data?.data || res.data || [];

      const foundSoal = data.find((s) => String(s.id_soal) === String(id));

      if (foundSoal) {
        setActiveSoal(foundSoal);
      } else {
        Swal.fire("Error", "Data soal tidak ditemukan!", "error").then(() =>
          navigate("/admin/bank-soal")
        );
      }
    } catch (error) {
      console.error("Gagal memuat detail soal:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpsi = async (id_soal) => {
    setLoading(true);

    try {
      const res = await api.get(`/admin/bank-soal-pg/${id_soal}`);
      setOpsiList(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openModal = () => {
    setEditingId(null);
    setFormData({
      opsi_label: "A",
      isi_opsi: "",
      is_benar: false,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleEdit = (opsi) => {
    setEditingId(opsi.id_opsi);
    setFormData({
      opsi_label: opsi.opsi_label,
      isi_opsi: opsi.isi_opsi,
      is_benar: opsi.is_benar,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    const isDuplicate = opsiList.some(
      (opsi) =>
        opsi.opsi_label === formData.opsi_label && opsi.id_opsi !== editingId
    );

    if (isDuplicate) {
      return `Pilihan dengan label "${formData.opsi_label}" sudah ada! Silakan pilih label yang lain.`;
    }

    const isi = String(formData.isi_opsi).trim();

    if (!isi || isi.length < 4) {
      return "Teks pilihan jawaban terlalu pendek. Minimal harus 4 karakter!";
    }

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!activeSoal) return;

    const errorMsg = validateForm();

    if (errorMsg) {
      return Swal.fire("Validasi Gagal", errorMsg, "warning");
    }

    const confirmResult = await Swal.fire({
      title: "Konfirmasi Simpan",
      text: `Yakin ingin ${
        editingId ? "menyimpan perubahan" : "menambahkan"
      } pilihan jawaban ini?`,
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
      const payload = { ...formData, id_soal: activeSoal.id_soal };

      if (editingId) {
        await api.put(`/admin/bank-soal-pg/${editingId}`, payload);
        Swal.fire({
          title: "Berhasil",
          text: "Pilihan jawaban diperbarui!",
          icon: "success",
          timer: 1500,
        });
      } else {
        await api.post("/admin/bank-soal-pg", payload);
        Swal.fire({
          title: "Berhasil",
          text: "Pilihan jawaban ditambahkan!",
          icon: "success",
          timer: 1500,
        });
      }

      closeModal();
      fetchOpsi(activeSoal.id_soal);
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan pilihan jawaban", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Yakin ingin menghapus pilihan jawaban ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await api.delete(`/admin/bank-soal-pg/${id}`);
      Swal.fire({
        title: "Terhapus",
        text: "Pilihan jawaban berhasil dibuang",
        icon: "success",
        timer: 1500,
      });
      fetchOpsi(activeSoal.id_soal);
    } catch (error) {
      Swal.fire("Error", "Gagal menghapus pilihan jawaban", "error");
    }
  };

  const totalKunci = opsiList.filter((opsi) => opsi.is_benar).length;

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
                <HelpCircle size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Opsi Pilihan Ganda
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Kelola Opsi
                <br />
                <span className="text-orange-500">Pilihan Ganda</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Tambahkan atau edit opsi jawaban A, B, C, D, dan E untuk soal
                pilihan ganda yang dipilih.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admin/bank-soal")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={openModal}
                  disabled={!activeSoal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus size={17} />
                  Tambah Opsi
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
                  Ringkasan Opsi
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {opsiList.length} Opsi Jawaban
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Pastikan hanya satu opsi yang ditandai sebagai kunci jawaban
                  benar.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Opsi" value={`${opsiList.length}`} />
                  <HeroPill label="Kunci" value={`${totalKunci}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Total Opsi"
            value={`${opsiList.length} Opsi`}
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Kunci Jawaban"
            value={`${totalKunci} Opsi`}
            tone="green"
          />
          <MiniStat
            icon={<HelpCircle size={22} />}
            label="Soal Aktif"
            value={activeSoal ? "Dipilih" : "Memuat"}
            tone="navy"
          />
        </section>

        {/* SOAL INFO + OPSI */}
        {!activeSoal ? (
          <div className="flex items-center justify-center rounded-[32px] border border-slate-100 bg-white py-20 shadow-sm">
            <Loader2 className="animate-spin text-orange-500" size={42} />
          </div>
        ) : (
          <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-slate-100 bg-white p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <HelpCircle size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pertanyaan Soal
                  </span>
                </div>

                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Unit:{" "}
                  {activeSoal.unit_kompetensi?.kode_unit || activeSoal.id_unit}
                </p>

                <h3 className="border-l-4 border-orange-500 pl-4 text-lg font-black leading-relaxed text-[#071E3D]">
                  {activeSoal.pertanyaan}
                </h3>
              </div>

              <button
                type="button"
                onClick={openModal}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
              >
                <Plus size={16} />
                Tambah Opsi Jawaban
              </button>
            </div>

            <div className="bg-slate-50/50 p-6">
              {loading && opsiList.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <Loader2
                    className="mb-3 animate-spin text-orange-500"
                    size={36}
                  />
                  <p className="text-sm font-semibold text-slate-500">
                    Memuat jawaban...
                  </p>
                </div>
              ) : opsiList.length === 0 ? (
                <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <FileText size={44} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-black text-[#071E3D]">
                    Belum Ada Pilihan Jawaban
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-400">
                    Tambahkan opsi A/B/C/D/E untuk soal ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {opsiList.map((opsi) => (
                    <div
                      key={opsi.id_opsi}
                      className={`relative overflow-hidden rounded-[28px] border bg-white p-5 shadow-sm transition-all ${
                        opsi.is_benar
                          ? "border-green-200 ring-4 ring-green-50"
                          : "border-slate-100 hover:border-orange-100"
                      }`}
                    >
                      {opsi.is_benar && (
                        <div className="absolute right-0 top-0 rounded-bl-2xl bg-green-500 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white">
                          Kunci Jawaban
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${
                            opsi.is_benar
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                              : "bg-slate-50 text-[#071E3D]"
                          }`}
                        >
                          {opsi.opsi_label}
                        </div>

                        <div className="min-w-0 flex-1 pr-16">
                          <p className="text-sm font-semibold leading-relaxed text-slate-600">
                            {opsi.isi_opsi}
                          </p>

                          {opsi.is_benar && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                              <CheckCircle2 size={14} />
                              Benar
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-5 right-5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(opsi)}
                            className="rounded-xl bg-slate-50 p-2 text-[#071E3D] transition-all hover:bg-orange-50 hover:text-orange-500"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(opsi.id_opsi)}
                            className="rounded-xl bg-red-50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-black text-[#071E3D]">
                  {editingId ? "Edit Jawaban" : "Tambah Jawaban Baru"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Lengkapi label, isi opsi, dan kunci jawaban.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="mb-5">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Label Pilihan
                </label>
                <select
                  name="opsi_label"
                  value={formData.opsi_label}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                  <option value="E">Pilihan E</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Teks Pilihan Jawaban
                </label>
                <textarea
                  name="isi_opsi"
                  rows="4"
                  value={formData.isi_opsi}
                  onChange={handleInputChange}
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  placeholder="Ketik jawaban di sini..."
                />
              </div>

              <div
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 transition-all hover:bg-green-100"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_benar: !prev.is_benar,
                  }))
                }
              >
                <input
                  type="checkbox"
                  name="is_benar"
                  checked={formData.is_benar}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 cursor-pointer rounded border-gray-300 text-green-600"
                />
                <label className="flex-1 cursor-pointer select-none text-sm font-black text-green-800">
                  Tandai ini sebagai Kunci Jawaban Benar
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
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

export default BankSoalPG;