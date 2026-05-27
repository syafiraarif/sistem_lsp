// frontend/src/pages/admin/BiayaUji.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  DollarSign,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  Wallet,
  FileText,
} from "lucide-react";

const BiayaUji = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [skemaDetail, setSkemaDetail] = useState(null);
  const [biayaList, setBiayaList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    metode_uji: "luring",
    nominal: "",
    keterangan: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);

    try {
      const resSkema = await api.get(`/admin/skema/${id}`);
      setSkemaDetail(resSkema.data?.data || resSkema.data);

      const resBiaya = await api.get(`/admin/biaya-uji/skema/${id}`);
      let data = resBiaya.data?.data || resBiaya.data || [];

      if (!Array.isArray(data) && data.rows) data = data.rows;

      setBiayaList(data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      Swal.fire("Error", "Gagal memuat data biaya uji", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const formatNumberInput = (value) => {
  const numberString = value.replace(/\D/g, "");
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumberInput = (value) => {
    return value.replace(/\./g, "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nominal") {
      setFormData({
        ...formData,
        nominal: formatNumberInput(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);

    setFormData({
      id_biaya: item.id_biaya,
      metode_uji: item.metode_uji,
      nominal: formatNumberInput(String(item.nominal)),
      keterangan: item.keterangan || "",
    });

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        id_skema: parseInt(id),
        metode_uji: formData.metode_uji,
        nominal: parseInt(parseNumberInput(formData.nominal)),
        keterangan: formData.keterangan,
      };

      if (isEdit) {
        await api.put(`/admin/biaya-uji/${formData.id_biaya}`, payload);

        Swal.fire(
          "Berhasil",
          "Data biaya berhasil diperbarui",
          "success"
        );
      } else {
        await api.post("/admin/biaya-uji", payload);

        Swal.fire(
          "Berhasil",
          "Data biaya berhasil ditambahkan",
          "success"
        );
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id_biaya) => {
    const confirm = await Swal.fire({
      title: "Hapus Biaya?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/biaya-uji/${id_biaya}`);
        Swal.fire("Terhapus!", "Data biaya berhasil dihapus.", "success");
        fetchData();
      } catch (error) {
        Swal.fire(
          "Gagal",
          error.response?.data?.message || "Gagal menghapus data",
          "error"
        );
      }
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  const formatEnum = (text) => {
    if (!text) return "-";

    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const totalNominal = biayaList.reduce(
    (total, item) => total + Number(item.nominal || 0),
    0
  );

  const totalLuring = biayaList.filter(
    (item) => item.metode_uji === "luring"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="rounded-[32px] border border-slate-100 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-orange-500" size={42} />
          <p className="font-black text-[#071E3D]">Memuat data biaya uji...</p>
        </div>
      </div>
    );
  }

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
                <DollarSign size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Biaya Uji
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Pengaturan
                <br />
                <span className="text-orange-500">Biaya Uji</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Atur rincian biaya yang dibebankan kepada asesi berdasarkan
                jenis biaya dan metode uji untuk skema sertifikasi.
              </p>

              <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-[#071E3D]">
                Skema:{" "}
                <span className="text-orange-500">
                  {skemaDetail?.judul_skema || "Memuat..."}
                </span>
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admin/skema")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Plus size={17} />
                  Tambah Biaya
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
                  Ringkasan Biaya
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {biayaList.length} Data Biaya
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Total nominal dihitung dari seluruh biaya yang terdaftar pada
                  skema ini.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Jumlah" value={`${biayaList.length}`} />
                  <HeroPill label="Luring" value={`${totalLuring}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Total Biaya"
            value={`${biayaList.length} Data`}
          />
          <MiniStat
            icon={<Wallet size={22} />}
            label="Total Nominal"
            value={formatRupiah(totalNominal)}
            tone="green"
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Metode Luring"
            value={`${totalLuring} Data`}
            tone="navy"
          />
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Daftar Biaya
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Rincian Biaya Skema
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Atur rincian biaya yang dibebankan kepada asesi berdasarkan
                metodenya.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
            >
              <Plus size={16} />
              Tambah Biaya
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="bg-[#071E3D]">
                  <TableHead center>No</TableHead>
                  <TableHead>Metode Uji</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead center>Aksi</TableHead>
                </tr>
              </thead>

              <tbody>
                {biayaList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-slate-300"
                      />
                      <p className="font-black text-[#071E3D]">
                        Belum ada data biaya untuk skema ini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  biayaList.map((item, index) => (
                    <tr
                      key={item.id_biaya}
                      className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                    >
                      <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                            item.metode_uji === "daring"
                              ? "bg-blue-50 text-blue-600"
                              : item.metode_uji === "hybrid"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {formatEnum(item.metode_uji)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-black text-orange-500">
                        {formatRupiah(item.nominal)}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {item.keterangan || "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-xl bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_biaya)}
                            className="rounded-xl bg-red-50 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-black text-[#071E3D]">
                  {isEdit ? "Edit Biaya Uji" : "Tambah Biaya Uji"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Lengkapi jenis biaya, metode uji, nominal, dan keterangan.
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

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Metode Uji <span className="text-red-500">*</span>
                </label>
                <select
                  name="metode_uji"
                  value={formData.metode_uji}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="luring">Luring </option>
                  <option value="daring">Daring </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nominal Biaya (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nominal"
                  value={formData.nominal}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: 1.500.000"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Tambahkan catatan jika perlu..."
                  className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? (
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

export default BiayaUji;