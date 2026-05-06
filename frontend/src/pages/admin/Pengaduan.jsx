// frontend/src/pages/admin/Pengaduan.jsx

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  Search,
  Eye,
  Save,
  X,
  MessageSquare,
  User,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Inbox,
  Activity,
  MessageCircleWarning,
} from "lucide-react";

const Pengaduan = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusEdit, setStatusEdit] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Filter Client-Side (Berdasarkan model database baru)
  useEffect(() => {
    if (!data) return;

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = data.filter((item) => {
      const nama = item.nama_pengadu?.toLowerCase() || "";
      const email = item.email_pengadu?.toLowerCase() || "";
      const isi = item.isi_pengaduan?.toLowerCase() || "";

      return (
        nama.includes(lowerTerm) ||
        email.includes(lowerTerm) ||
        isi.includes(lowerTerm)
      );
    });

    setFilteredData(filtered);
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/pengaduan");
      const result = response.data.data || [];
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching pengaduan:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setStatusEdit(item.status_pengaduan || "masuk");
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/admin/pengaduan/${selectedItem.id_pengaduan}/status`, {
        status_pengaduan: statusEdit,
      });

      Swal.fire("Berhasil", "Status pengaduan diperbarui", "success");
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui status",
        "error"
      );
    }
  };

  // Helper Badge Status
  const getStatusBadge = (status) => {
    switch (status) {
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-700">
            <CheckCircle size={14} /> Selesai
          </span>
        );
      case "tindak_lanjut":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            <Clock size={14} /> Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-700">
            <AlertCircle size={14} /> Masuk
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalMasuk = data.filter(
    (item) => !item.status_pengaduan || item.status_pengaduan === "masuk"
  ).length;
  const totalDiproses = data.filter(
    (item) => item.status_pengaduan === "tindak_lanjut"
  ).length;
  const totalSelesai = data.filter(
    (item) => item.status_pengaduan === "selesai"
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
                <MessageCircleWarning size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Layanan Pengaduan
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Daftar
                <br />
                <span className="text-orange-500">Pengaduan</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Kelola keluhan, masukan, dan laporan pengguna sistem secara
                terstruktur sampai status penanganannya selesai.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Total Laporan
                </p>

                <h2 className="mb-4 text-5xl font-black leading-none">
                  {data.length}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Laporan dari pengguna dapat ditinjau, diproses, dan diperbarui
                  status penanganannya langsung dari halaman ini.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Masuk" value={`${totalMasuk}`} />
                  <HeroPill label="Selesai" value={`${totalSelesai}`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MiniStat icon={<Inbox size={22} />} label="Total Laporan" value={data.length} />
          <MiniStat icon={<AlertCircle size={22} />} label="Masuk" value={totalMasuk} />
          <MiniStat icon={<Clock size={22} />} label="Diproses" value={totalDiproses} />
          <MiniStat icon={<CheckCircle size={22} />} label="Selesai" value={totalSelesai} />
        </section>

        {/* CONTENT CARD */}
        <section className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <Activity size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Tabel Pengaduan
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Daftar Laporan
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Cari laporan berdasarkan nama, email, atau isi aduan.
                </p>
              </div>

              <div className="relative w-full lg:w-[360px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  placeholder="Cari nama, email, atau isi aduan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto mb-3 animate-spin text-orange-500" size={36} />
              <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
                Memuat Pengaduan
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#071E3D]">
                    <TableHead center>No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Isi Singkat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead center>Aksi</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id_pengaduan}
                        className="border-b border-slate-100 transition-all last:border-0 hover:bg-orange-50/30"
                      >
                        <td className="px-5 py-4 text-center text-sm font-black text-[#071E3D]">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-500">
                          {formatDate(item.tanggal_pengaduan)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-black text-[#071E3D]">
                            {item.nama_pengadu}
                          </div>
                          <div className="mt-1 w-fit rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                            {item.sebagai_siapa}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div
                            className="max-w-xs truncate text-sm font-semibold text-slate-500"
                            title={item.isi_pengaduan}
                          >
                            {item.isi_pengaduan}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {getStatusBadge(item.status_pengaduan)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all hover:bg-orange-500 hover:text-white"
                            onClick={() => handleDetailClick(item)}
                            title="Lihat Detail"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <MessageSquare
                          size={48}
                          className="mx-auto mb-3 text-[#071E3D]/20"
                        />
                        <p className="text-sm font-black text-[#071E3D]">
                          Data tidak ditemukan.
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

      {/* MODAL DETAIL */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071E3D]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-xl font-black text-[#071E3D]">
                  Detail Pengaduan
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Rincian laporan dan update status penanganan.
                </p>
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* INFO PENGIRIM */}
                <DetailSection icon={<User size={17} />} title="Informasi Pengirim">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem label="Nama Lengkap">
                      {selectedItem.nama_pengadu}
                    </DetailItem>

                    <DetailItem label="Sebagai">
                      <span className="capitalize">{selectedItem.sebagai_siapa}</span>
                    </DetailItem>

                    <DetailItem label="Email" icon={<Mail size={12} />}>
                      {selectedItem.email_pengadu || "-"}
                    </DetailItem>

                    <DetailItem label="No HP" icon={<Phone size={12} />}>
                      {selectedItem.no_hp_pengadu || "-"}
                    </DetailItem>
                  </div>
                </DetailSection>

                {/* ISI PENGADUAN */}
                <div className="rounded-[24px] border-l-4 border-orange-500 bg-orange-50 p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-[#071E3D]">
                    <MessageSquare size={17} className="text-orange-500" />
                    Isi Laporan
                  </h4>

                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-500">
                    <Clock size={12} />
                    {formatDate(selectedItem.tanggal_pengaduan)}
                  </div>

                  <p className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-[#071E3D]">
                    {selectedItem.isi_pengaduan}
                  </p>
                </div>

                {/* UPDATE STATUS */}
                <DetailSection
                  icon={<CheckCircle size={17} />}
                  title="Update Status Penanganan"
                >
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                    value={statusEdit}
                    onChange={(e) => setStatusEdit(e.target.value)}
                  >
                    <option value="masuk">Masuk (Belum dibaca)</option>
                    <option value="tindak_lanjut">Sedang Ditindak Lanjuti</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </DetailSection>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-6">
              <button
                type="button"
                className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                onClick={() => setShowModal(false)}
              >
                Tutup
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                onClick={handleStatusChange}
              >
                <Save size={16} />
                Simpan Status
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

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-[#071E3D]">{value}</p>
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

function DetailSection({ icon, title, children }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-black text-[#071E3D]">
        <span className="text-orange-500">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailItem({ label, children, icon }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {icon}
        {label}
      </p>
      <div className="text-sm font-bold text-[#071E3D]">{children}</div>
    </div>
  );
}

export default Pengaduan;