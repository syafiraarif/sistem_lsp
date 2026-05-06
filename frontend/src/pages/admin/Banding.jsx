// frontend/src/pages/admin/Banding.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Eye,
  X,
  Save,
  Gavel,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  ClipboardList,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

const Banding = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formUpdate, setFormUpdate] = useState({
    status_progress: "diajukan",
    keputusan: "belum_diputuskan",
    catatan_komite: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    const lowerTerm = searchTerm.toLowerCase();

    const filtered = data.filter((item) => {
      const ket = item.isi_banding?.toLowerCase() || "";
      const emailUser = item.user?.email?.toLowerCase() || "";
      const namaUser = item.user?.username?.toLowerCase() || "";

      return (
        emailUser.includes(lowerTerm) ||
        namaUser.includes(lowerTerm) ||
        ket.includes(lowerTerm)
      );
    });

    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/banding");
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

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setFormUpdate({
      status_progress: item.status_progress || "diajukan",
      keputusan: item.keputusan || "belum_diputuskan",
      catatan_komite: item.catatan_komite || "",
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      await api.put(`/admin/banding/${selectedItem.id_banding}`, formUpdate);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Status banding telah diperbarui",
        timer: 1500,
      });

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat update", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "diajukan":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "tindak_lanjut":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "pleno_komite":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "selesai":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getKeputusanBadge = (keputusan) => {
    if (keputusan === "diterima") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600">
          <CheckCircle size={15} />
          Diterima
        </span>
      );
    }

    if (keputusan === "ditolak") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500">
          <XCircle size={15} />
          Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <Clock size={15} />
        Belum Diputus
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalDiajukan = data.filter(
    (item) => item.status_progress === "diajukan"
  ).length;

  const totalSelesai = data.filter(
    (item) => item.status_progress === "selesai"
  ).length;

  const totalDiterima = data.filter(
    (item) => item.keputusan === "diterima"
  ).length;

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
                <Gavel size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Layanan Banding
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Data Banding
                <br />
                <span className="text-orange-500">Asesmen</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola pengajuan banding asesi, proses tindak lanjut, pleno
                komite, dan keputusan akhir banding asesmen.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Ringkasan Banding
                </p>

                <h2 className="mb-4 text-2xl font-black">
                  {data.length} Pengajuan Banding
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Pantau status progres dan keputusan banding melalui tabel
                  pengajuan.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Diajukan" value={`${totalDiajukan}`} />
                  <HeroPill label="Selesai" value={`${totalSelesai}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <MiniStat
            icon={<ClipboardList size={22} />}
            label="Total Banding"
            value={`${data.length} Data`}
          />
          <MiniStat
            icon={<Clock size={22} />}
            label="Diajukan"
            value={`${totalDiajukan} Data`}
            tone="yellow"
          />
          <MiniStat
            icon={<BadgeCheck size={22} />}
            label="Diterima"
            value={`${totalDiterima} Data`}
            tone="green"
          />
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <Search size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Daftar Pengajuan
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#071E3D]">
                Pengajuan Banding Asesmen
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-400">
                Cari berdasarkan email, username, atau alasan banding.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                placeholder="Cari Email atau Alasan Banding..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 animate-spin text-orange-500" size={40} />
              <p className="font-black text-[#071E3D]">
                Sedang memuat data...
              </p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#071E3D]">
                    <TableHead center>No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Asesi</TableHead>
                    <TableHead>Alasan Banding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keputusan</TableHead>
                    <TableHead center>Aksi</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id_banding}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-bold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-500">
                          {formatDate(item.tanggal_ajukan)}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-[#071E3D]">
                            {item.user?.username || "User"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {item.user?.email || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div
                            className="max-w-xs truncate text-sm font-semibold text-slate-500"
                            title={item.isi_banding}
                          >
                            {item.isi_banding || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${getStatusBadge(
                              item.status_progress
                            )}`}
                          >
                            {item.status_progress
                              ?.replace("_", " ")
                              .toUpperCase() || "-"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {getKeputusanBadge(item.keputusan)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-orange-500"
                            onClick={() => handleDetailClick(item)}
                            title="Lihat Detail"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-16 text-center">
                        <FileText
                          size={48}
                          className="mx-auto mb-4 text-slate-300"
                        />
                        <p className="font-black text-[#071E3D]">
                          Tidak ada data banding ditemukan.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Gavel size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#071E3D]">
                    Proses Banding Asesmen
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    Review pengajuan dan update keputusan pleno.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="flex-1 space-y-6 overflow-y-auto p-6"
            >
              <section className="rounded-[30px] border border-slate-100 bg-slate-50/60 p-5">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
                    <FileText size={18} />
                  </div>

                  <h4 className="text-lg font-black text-[#071E3D]">
                    Detail Pengajuan
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoBox label="Asesi">
                    {selectedItem.user?.username || "User"} (
                    {selectedItem.user?.email || "-"})
                  </InfoBox>

                  <InfoBox label="Tanggal Pengajuan">
                    {formatDate(selectedItem.tanggal_ajukan)}
                  </InfoBox>

                  <div className="md:col-span-2">
                    <InfoBox label="Alasan Banding">
                      {selectedItem.isi_banding || "-"}
                    </InfoBox>
                  </div>

                  {selectedItem.file_bukti && (
                    <div className="md:col-span-2">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        File Bukti Pendukung
                      </p>
                      <a
                        href={`http://localhost:3000/uploads/${selectedItem.file_bukti}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                      >
                        <Eye size={16} />
                        Buka Lampiran Bukti
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-5">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                    <ShieldCheck size={15} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      Update Keputusan Pleno
                    </span>
                  </div>

                  <h4 className="text-2xl font-black text-[#071E3D]">
                    Status dan Keputusan
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status Progress
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                      value={formUpdate.status_progress}
                      onChange={(e) =>
                        setFormUpdate((p) => ({
                          ...p,
                          status_progress: e.target.value,
                        }))
                      }
                    >
                      <option value="diajukan">Diajukan</option>
                      <option value="tindak_lanjut">Tindak Lanjut</option>
                      <option value="pleno_komite">Pleno Komite</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Keputusan Akhir
                    </label>
                    <select
                      className={`w-full rounded-2xl border px-4 py-4 text-sm font-black outline-none transition-all focus:ring-4 ${
                        formUpdate.keputusan === "diterima"
                          ? "border-green-100 bg-green-50 text-green-700 focus:border-green-200 focus:ring-green-500/10"
                          : formUpdate.keputusan === "ditolak"
                          ? "border-red-100 bg-red-50 text-red-700 focus:border-red-200 focus:ring-red-500/10"
                          : "border-slate-100 bg-slate-50 text-[#071E3D] focus:border-orange-200 focus:bg-white focus:ring-orange-500/10"
                      }`}
                      value={formUpdate.keputusan}
                      onChange={(e) =>
                        setFormUpdate((p) => ({
                          ...p,
                          keputusan: e.target.value,
                        }))
                      }
                    >
                      <option value="belum_diputuskan">
                        -- Belum Diputuskan --
                      </option>
                      <option value="diterima">
                        Banding Diterima (Kompeten)
                      </option>
                      <option value="ditolak">
                        Banding Ditolak (Tetap BK)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Catatan Komite / Hasil Pleno
                  </label>
                  <textarea
                    rows="4"
                    className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-[#071E3D] outline-none placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    placeholder="Masukkan catatan detail hasil rapat pleno komite di sini..."
                    value={formUpdate.catatan_komite}
                    onChange={(e) =>
                      setFormUpdate((p) => ({
                        ...p,
                        catatan_komite: e.target.value,
                      }))
                    }
                  />
                </div>
              </section>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                >
                  <Save size={16} />
                  Simpan Keputusan
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
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
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

function InfoBox({ label, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-sm font-black leading-relaxed text-[#071E3D]">
        {children}
      </p>
    </div>
  );
}

export default Banding;