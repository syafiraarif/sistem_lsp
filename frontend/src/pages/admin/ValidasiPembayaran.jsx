import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API_BASE.replace("/api", "");

export default function ValidasiPembayaran() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pembayaran");
      setData(res.data?.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal memuat pembayaran", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approve = async (id) => {
    const confirm = await Swal.fire({
      title: "Terima pembayaran?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Terima",
      cancelButtonText: "Batal",
      confirmButtonColor: "#CC6B27",
    });

    if (!confirm.isConfirmed) return;

    await api.put(`/admin/pembayaran/${id}/approve`);
    Swal.fire("Berhasil", "Pembayaran diterima", "success");
    fetchData();
  };

  const reject = async (id) => {
    const result = await Swal.fire({
      title: "Tolak pembayaran?",
      input: "textarea",
      inputPlaceholder: "Catatan penolakan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444",
    });

    if (!result.isConfirmed) return;

    await api.put(`/admin/pembayaran/${id}/reject`, {
      catatan_admin: result.value || "Pembayaran ditolak admin",
    });

    Swal.fire("Ditolak", "Pembayaran ditolak", "success");
    fetchData();
  };

  const openFile = (path) => {
    if (!path) return;
    window.open(`${APP_BASE}/${path}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-2 mb-4">
                <CreditCard size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  Validasi Pembayaran
                </span>
              </div>
              <h1 className="text-3xl font-black text-[#071E3D]">
                Validasi Pembayaran Asesi
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                Terima atau tolak bukti pembayaran yang diajukan asesi.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-orange-500" size={40} />
              <p className="mt-3 font-black text-[#071E3D]">
                Memuat pembayaran...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-[#071E3D] text-white">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase">No</th>
                    <th className="p-4 text-xs font-black uppercase">Skema</th>
                    <th className="p-4 text-xs font-black uppercase">Metode</th>
                    <th className="p-4 text-xs font-black uppercase">Nominal</th>
                    <th className="p-4 text-xs font-black uppercase">Status</th>
                    <th className="p-4 text-xs font-black uppercase text-center">
                      Bukti
                    </th>
                    <th className="p-4 text-xs font-black uppercase text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id_pembayaran} className="border-b border-slate-100">
                      <td className="p-4 font-bold">{index + 1}</td>
                      <td className="p-4">
                        <p className="font-black text-[#071E3D]">
                          {item.skema?.judul_skema || item.Skema?.judul_skema || "-"}
                        </p>
                        <p className="text-xs text-slate-400 font-bold">
                          ID Skema: {item.id_skema}
                        </p>
                      </td>
                      <td className="p-4 font-bold capitalize">
                        {item.metode_pembayaran?.replace(/_/g, " ")}
                      </td>
                      <td className="p-4 font-black text-orange-500">
                        Rp {Number(item.nominal || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-center">
                        {item.bukti_bayar ? (
                          <button
                            onClick={() => openFile(item.bukti_bayar)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Eye size={15} />
                            Lihat
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {["pending", "menunggu_validasi"].includes(item.status) ? (
                    <div className="flex justify-center gap-2">
                        <button
                        onClick={() => approve(item.id_pembayaran)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600 hover:bg-emerald-600 hover:text-white"
                        >
                        <CheckCircle size={15} />
                        Terima
                        </button>
                        <button
                        onClick={() => reject(item.id_pembayaran)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 hover:bg-red-600 hover:text-white"
                        >
                        <XCircle size={15} />
                        Tolak
                        </button>
                    </div>
                    ) : (
                    <span className="text-xs font-bold text-slate-400">
                        Tidak ada aksi
                    </span>
                    )}
                      </td>
                    </tr>
                  ))}

                  {data.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center font-bold text-slate-400">
                        Belum ada data pembayaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
  menunggu_validasi: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
  pending: "bg-slate-50 text-slate-600 border-slate-100",
};

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
        map[status] || map.pending
      }`}
    >
      {status === "menunggu_validasi" && <Clock size={13} />}
      {status || "-"}
    </span>
  );
}