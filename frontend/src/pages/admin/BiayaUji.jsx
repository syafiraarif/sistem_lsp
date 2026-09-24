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
  ClipboardList,
  BadgeCheck,
  Wallet,
  FileText,
} from "lucide-react";

const BiayaUji = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [skemaDetail, setSkemaDetail] = useState(null);
  const [biayaList, setBiayaList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    metode_uji: "luring",
    nominal: "",
    keterangan: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
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

  // --- HELPERS & FORMATTERS ---
  const formatNumberInput = (value) => {
    const numberString = value.replace(/\D/g, "");
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumberInput = (value) => {
    return value.replace(/\./g, "");
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka || 0);
  };

  const formatEnum = (text) => {
    if (!text) return "-";
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // --- HANDLERS ---
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
        Swal.fire("Berhasil", "Data biaya berhasil diperbarui", "success");
      } else {
        await api.post("/admin/biaya-uji", payload);
        Swal.fire("Berhasil", "Data biaya berhasil ditambahkan", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan",
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
      cancelButtonColor: "#182D4A",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
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

  // --- STATS CALCULATION ---
  const totalNominal = biayaList.reduce((total, item) => total + Number(item.nominal || 0), 0);
  const totalLuring = biayaList.filter((item) => item.metode_uji === "luring").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#CC6B27]" size={42} />
          <p className="font-bold text-[#071E3D]">Memuat data biaya uji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-8">
      <div className="flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <div className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#CC6B27]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#CC6B27]">
                <FileText size={14} /> Skema: {skemaDetail?.judul_skema || "Memuat..."}
              </div>
              <h2 className="m-0 mb-1 text-[24px] md:text-[28px] font-black text-[#071E3D]">Pengaturan Biaya Uji</h2>
              <p className="m-0 text-[14px] font-medium text-[#182D4A]/70">
                Atur rincian biaya yang dibebankan kepada asesi berdasarkan jenis biaya dan metode uji.
              </p>
            </div>
            
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] md:flex-none"
              >
                <Plus size={16} /> Tambah Biaya
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<ClipboardList size={22} />} label="Total Data Biaya" value={`${biayaList.length} Item`} tone="navy" />
          <StatCard icon={<Wallet size={22} />} label="Total Nominal" value={formatRupiah(totalNominal)} tone="green" />
          <StatCard icon={<BadgeCheck size={22} />} label="Metode Luring" value={`${totalLuring} Item`} tone="orange" />
        </div>

        {/* CONTENT CARD */}
        <div className="rounded-xl border border-[#071E3D]/10 bg-white p-6 shadow-sm">
          
          {/* Header Table */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h4 className="m-0 flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
              <DollarSign size={18} className="text-[#CC6B27]" />
              Daftar Rincian Biaya Skema
            </h4>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#071E3D]/10">
            <table className="w-full min-w-[900px] border-collapse bg-white text-left">
              <thead>
                <tr>
                  <th className="w-12 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">No</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Metode Uji</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Nominal</th>
                  <th className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Keterangan</th>
                  <th className="w-28 border-b-4 border-[#CC6B27] bg-[#071E3D] px-4 py-3.5 text-center text-[12px] font-semibold uppercase tracking-wider text-[#FAFAFA]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {biayaList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <FileText size={48} className="mx-auto mb-3 text-[#071E3D]/20" />
                      <p className="text-[14px] font-medium text-[#182D4A]">Belum ada data biaya untuk skema ini.</p>
                    </td>
                  </tr>
                ) : (
                  biayaList.map((item, index) => (
                    <tr key={item.id_biaya} className="border-b border-[#071E3D]/5 transition-colors hover:bg-[#CC6B27]/5">
                      <td className="px-4 py-3 text-center text-[13.5px] font-semibold text-[#071E3D]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            item.metode_uji === "daring"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : item.metode_uji === "hybrid"
                              ? "bg-purple-50 text-purple-600 border-purple-200"
                              : "bg-green-50 text-green-600 border-green-200"
                          }`}
                        >
                          {formatEnum(item.metode_uji)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[13.5px] font-bold text-[#CC6B27]">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#182D4A]/80">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-[#CC6B27]/10 p-1.5 text-[#CC6B27] transition-colors hover:bg-[#CC6B27] hover:text-white"
                            title="Edit Data"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_biaya)}
                            className="rounded-lg bg-red-50 p-1.5 text-red-600 border border-red-100 transition-colors hover:bg-red-600 hover:text-white"
                            title="Hapus Data"
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
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#CC6B27]/10 p-2 text-[#CC6B27]">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-[16px] font-bold text-[#071E3D]">
                    {isEdit ? "Edit Biaya Uji" : "Tambah Biaya Uji"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[#182D4A] transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-4 bg-white p-6">
                <div>
                  <label className="mb-1 block text-[12px] font-bold text-[#071E3D]">
                    Metode Uji <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="metode_uji"
                    value={formData.metode_uji}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-medium text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  >
                    <option value="luring">Luring</option>
                    <option value="daring">Daring</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-bold text-[#071E3D]">
                    Nominal Biaya (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: 1.500.000"
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-bold text-[#071E3D] outline-none placeholder:text-[#182D4A]/40 transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-bold text-[#071E3D]">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Tambahkan catatan jika ada (opsional)..."
                    className="w-full resize-none rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-4 py-2.5 text-[13px] font-medium text-[#071E3D] outline-none placeholder:text-[#182D4A]/40 transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-5 py-2.5 text-[13px] font-bold text-[#182D4A] transition-colors hover:bg-[#E2E8F0]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Simpan Data
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatCard = ({ icon, label, value, tone = "orange" }) => {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-600",
    navy: "bg-[#071E3D]/10 text-[#071E3D]"
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/60">{label}</p>
        <p className="mt-1 text-[20px] font-black text-[#071E3D]">{value}</p>
      </div>
    </div>
  );
};

export default BiayaUji;