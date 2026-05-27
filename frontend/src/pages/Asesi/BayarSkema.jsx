// frontend/src/pages/Asesi/BayarSkema.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Loader2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
  Wallet,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const APP_BASE = API_BASE.replace("/api", "");

export default function BayarSkema() {
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [skemaJudul, setSkemaJudul] = useState("");
  const [harga, setHarga] = useState(0);
  const [tujuanTransfer, setTujuanTransfer] = useState([]);
  const [qris, setQris] = useState(null);
  const [virtualAccount, setVirtualAccount] = useState(null);

  const [metode, setMetode] = useState("");
  const [jalurPembayaran, setJalurPembayaran] = useState("");
  const [selectedTujuan, setSelectedTujuan] = useState("");
  const [buktiBayar, setBuktiBayar] = useState(null);

  const [statusPembayaran, setStatusPembayaran] = useState("belum bayar");
  const [idPembayaran, setIdPembayaran] = useState(null);
  const [waktuBatas, setWaktuBatas] = useState(null);
  const [error, setError] = useState("");

  const hasFetchedRef = useRef(false);
  const requestRunningRef = useRef(false);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_skema]);

  const fetchData = async () => {
    if (requestRunningRef.current) return;

    try {
      requestRunningRef.current = true;
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const detailRes = await axios.get(
        `${API_BASE}/asesi/pembayaran/${id_skema}/detail`,
        { headers }
      );

      const detail = detailRes.data?.data || {};

      setSkemaJudul(detail.skema || "-");
      setHarga(detail.harga || 0);
      setTujuanTransfer(Array.isArray(detail.tujuan_transfer) ? detail.tujuan_transfer : []);
      setQris(detail.qris || null);
      setVirtualAccount(detail.virtual_account || null);

      try {
        const statusRes = await axios.get(
          `${API_BASE}/asesi/pembayaran/${id_skema}/status`,
          { headers }
        );

        const statusData = statusRes.data?.data || {};

        setStatusPembayaran(statusData.status || "belum bayar");
        setIdPembayaran(statusData.id_pembayaran || null);
        setWaktuBatas(statusData.waktu_batas || null);
      } catch (statusErr) {
        console.error("Gagal mengambil status pembayaran:", statusErr);

        setStatusPembayaran("belum bayar");
        setIdPembayaran(null);
        setWaktuBatas(null);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data pembayaran."
      );
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
    }
  };

  const formatRupiah = (value) =>
    `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  const formatTanggal = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedTujuanData = tujuanTransfer.find(
    (item) => String(item.id_tujuan_transfer) === String(selectedTujuan)
  );

  const handleMetode = (value) => {
    setMetode(value);
    setJalurPembayaran("");
    setSelectedTujuan("");
    setBuktiBayar(null);
  };

  const validateSubmit = () => {
    if (!metode) {
      alert("Silakan pilih metode pembayaran.");
      return false;
    }

    if (metode === "transfer_rekening") {
      if (!jalurPembayaran) {
        alert("Silakan pilih jalur pembayaran.");
        return false;
      }

      if (!selectedTujuan) {
        alert("Silakan pilih tujuan pembayaran.");
        return false;
      }
    }

    if (["transfer_rekening", "qris", "virtual_account"].includes(metode)) {
      if (!buktiBayar) {
        alert("Silakan upload bukti pembayaran.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    const isWaiting =
      statusPembayaran === "pending" ||
      statusPembayaran === "menunggu_validasi";

    if (isWaiting) {
      alert("Pembayaran sedang menunggu validasi admin.");
      navigate("/asesi/jadwal-saya");
      return;
    }

    if (statusPembayaran === "paid") {
      navigate("/asesi/jadwal-saya");
      return;
    }

    if (!validateSubmit()) return;

    try {
      setSubmitLoading(true);

      const submitRes = await axios.post(
        `${API_BASE}/asesi/pembayaran/submit`,
        {
          id_skema,
          metode_pembayaran: metode,
          jalur_pembayaran:
            metode === "tunai"
              ? "tunai"
              : metode === "qris"
              ? "qris"
              : metode === "virtual_account"
              ? "virtual_account"
              : jalurPembayaran,
          id_tujuan_transfer:
            metode === "transfer_rekening" ? selectedTujuan : null,
        },
        { headers }
      );

      const newIdPembayaran = submitRes.data?.data?.id_pembayaran;

      if (buktiBayar && newIdPembayaran) {
        const formData = new FormData();
        formData.append("bukti_bayar", buktiBayar);

        await axios.put(
          `${API_BASE}/asesi/pembayaran/${newIdPembayaran}/upload-bukti`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Pembayaran berhasil diajukan. Menunggu validasi admin.");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengajukan pembayaran.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const statusView = {
    "belum bayar": {
      title: "Belum Bayar",
      desc: "Silakan pilih metode pembayaran dan upload bukti bayar.",
      className: "bg-slate-50 text-slate-600 border-slate-100",
      icon: <CreditCard size={22} />,
    },
    pending: {
      title: "Belum Upload Bukti",
      desc: "Pembayaran dibuat. Silakan upload bukti bayar.",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <Clock size={22} />,
    },
    menunggu_validasi: {
      title: "Menunggu Validasi Admin",
      desc: "Bukti pembayaran sudah dikirim. APL01 akan terbuka setelah admin menerima pembayaran.",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <Clock size={22} />,
    },
    paid: {
      title: "Pembayaran Diterima",
      desc: "Pembayaran sudah divalidasi admin. Silakan kembali ke Jadwal Saya untuk lanjut APL01.",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: <CheckCircle size={22} />,
    },
    ditolak: {
      title: "Pembayaran Ditolak",
      desc: "Pembayaran ditolak admin. Silakan ajukan ulang.",
      className: "bg-red-50 text-red-700 border-red-100",
      icon: <AlertCircle size={22} />,
    },
  };

  const currentStatus = statusView[statusPembayaran] || statusView["belum bayar"];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="bg-white rounded-[36px] border border-slate-100 p-6 lg:p-8 shadow-sm">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-500"
            >
              <ArrowLeft size={15} />
              Kembali
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-2 mb-5">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pembayaran Sertifikasi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-[#071E3D] leading-tight">
                  Pembayaran
                  <br />
                  <span className="text-orange-500">Skema Sertifikasi</span>
                </h1>

                <p className="mt-5 max-w-2xl text-slate-500 font-medium leading-relaxed">
                  Pilih metode pembayaran, upload bukti bayar, lalu tunggu
                  validasi admin sebelum lanjut ke APL01.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                  >
                    Jadwal Saya
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] bg-[#071E3D] p-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Total Pembayaran
                </p>
                <h2 className="text-4xl font-black mt-2">
                  {formatRupiah(harga)}
                </h2>
                <p className="text-white/60 text-sm mt-4">{skemaJudul}</p>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <HeroPill label="ID Skema" value={id_skema || "-"} />
                  <HeroPill label="ID Bayar" value={idPembayaran || "-"} />
                </div>
              </div>
            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={fetchData} />}

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-6">
              <div className={`rounded-2xl border p-5 ${currentStatus.className}`}>
                <div className="flex items-start gap-3">
                  {currentStatus.icon}
                  <div>
                    <h3 className="font-black">{currentStatus.title}</h3>
                    <p className="text-sm font-medium mt-1">
                      {currentStatus.desc}
                    </p>
                  </div>
                </div>
              </div>

              {statusPembayaran !== "paid" &&
                statusPembayaran !== "menunggu_validasi" && (
                  <>
                    <PaymentStep number="1" title="Pilih Metode Pembayaran">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <ChoiceButton
                          active={metode === "tunai"}
                          icon={<Wallet size={22} />}
                          title="Tunai"
                          desc="Bayar langsung"
                          onClick={() => handleMetode("tunai")}
                        />
                        <ChoiceButton
                          active={metode === "transfer_rekening"}
                          icon={<CreditCard size={22} />}
                          title="Transfer"
                          desc="Bank / E-wallet"
                          onClick={() => handleMetode("transfer_rekening")}
                        />
                        <ChoiceButton
                          active={metode === "qris"}
                          icon={<QrCode size={22} />}
                          title="QRIS"
                          desc="Scan QR"
                          onClick={() => handleMetode("qris")}
                        />
                        <ChoiceButton
                          active={metode === "virtual_account"}
                          icon={<BadgeCheck size={22} />}
                          title="VA"
                          desc="Virtual Account"
                          onClick={() => handleMetode("virtual_account")}
                        />
                      </div>
                    </PaymentStep>

                    {metode === "transfer_rekening" && (
                      <PaymentStep number="2" title="Pilih Jalur Transfer">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {["m-banking", "atm", "e-wallet"].map((item) => (
                            <ChoiceButton
                              key={item}
                              active={jalurPembayaran === item}
                              title={item}
                              desc="Pilih jalur ini"
                              onClick={() => setJalurPembayaran(item)}
                              small
                            />
                          ))}
                        </div>

                        {jalurPembayaran && (
                          <select
                            value={selectedTujuan}
                            onChange={(e) => setSelectedTujuan(e.target.value)}
                            className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none"
                          >
                            <option value="">Pilih tujuan pembayaran</option>
                            {tujuanTransfer.map((item) => (
                              <option
                                key={item.id_tujuan_transfer}
                                value={item.id_tujuan_transfer}
                              >
                                {item.nama_bank} - {item.nomor_rekening} -{" "}
                                {item.atas_nama}
                              </option>
                            ))}
                          </select>
                        )}

                        {selectedTujuanData && (
                          <PaymentBox
                            label="Tujuan Transfer"
                            value={`${selectedTujuanData.nama_bank} - ${selectedTujuanData.nomor_rekening} a.n ${selectedTujuanData.atas_nama}`}
                          />
                        )}
                      </PaymentStep>
                    )}

                    {metode === "qris" && (
                      <PaymentStep number="2" title="QRIS">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-center">
                          <img
                            src={`${APP_BASE}${qris?.image_url || "/uploads/qris/qris.png"}`}
                            alt="QRIS"
                            className="mx-auto max-h-72 rounded-2xl bg-white border border-slate-100 p-3"
                          />
                          <p className="mt-3 text-sm font-bold text-slate-500">
                            Scan QRIS lalu upload bukti pembayaran.
                          </p>
                        </div>
                      </PaymentStep>
                    )}

                    {metode === "virtual_account" && (
                      <PaymentStep number="2" title="Virtual Account">
                        <PaymentBox
                          label="Nomor Virtual Account"
                          value={virtualAccount?.nomor_va || "-"}
                          highlight
                        />
                        <PaymentBox
                          label="Atas Nama"
                          value={virtualAccount?.atas_nama || "LSP"}
                        />
                      </PaymentStep>
                    )}

                    {["transfer_rekening", "qris", "virtual_account"].includes(
                      metode
                    ) && (
                      <PaymentStep number="3" title="Upload Bukti Pembayaran">
                        <label className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 cursor-pointer hover:border-orange-200">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <UploadCloud size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-[#071E3D]">
                              {buktiBayar
                                ? buktiBayar.name
                                : "Pilih file bukti pembayaran"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Format JPG, PNG, atau PDF.
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              setBuktiBayar(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </PaymentStep>
                    )}

                    {metode === "tunai" && (
                      <PaymentStep number="2" title="Pembayaran Tunai">
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-amber-700 text-sm font-bold">
                          Ajukan pembayaran tunai. Admin akan memvalidasi setelah
                          pembayaran diterima langsung.
                        </div>
                      </PaymentStep>
                    )}
                  </>
                )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitLoading ||
                  statusPembayaran === "pending" ||
                  statusPembayaran === "menunggu_validasi" ||
                  statusPembayaran === "paid"
                }
                className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : statusPembayaran === "paid" ? (
                  <CheckCircle size={18} />
                ) : (
                  <UploadCloud size={18} />
                )}

                {statusPembayaran === "paid"
                  ? "Pembayaran Sudah Diterima"
                  : statusPembayaran === "pending" ||
                    statusPembayaran === "menunggu_validasi"
                  ? "Menunggu Validasi Admin"
                  : submitLoading
                  ? "Mengajukan..."
                  : "Ajukan Pembayaran"}
              </button>
            </div>

            <aside className="space-y-5">
              <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                <h3 className="font-black text-[#071E3D] text-xl mb-4">
                  Ringkasan
                </h3>
                <SummaryRow label="Skema" value={skemaJudul} />
                <SummaryRow label="Total" value={formatRupiah(harga)} />
                <SummaryRow label="Metode" value={metode || "-"} />
                <SummaryRow label="Status" value={statusPembayaran} />
                <SummaryRow label="Batas" value={formatTanggal(waktuBatas)} />
              </div>

              <div className="bg-[#071E3D] rounded-[32px] p-6 text-white">
                <h3 className="font-black text-lg mb-3">Alur Pembayaran</h3>
                <ol className="space-y-2 text-sm text-white/70 font-medium">
                  <li>1. Pilih metode pembayaran.</li>
                  <li>2. Bayar sesuai nominal.</li>
                  <li>3. Upload bukti pembayaran.</li>
                  <li>4. Tunggu validasi admin.</li>
                  <li>5. APL01 terbuka setelah pembayaran diterima.</li>
                </ol>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center">
        <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={38} />
        <h2 className="font-black text-[#071E3D] text-xl">Memuat Pembayaran</h2>
      </div>
    </div>
  );
}

function ChoiceButton({ active, icon, title, desc, onClick, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active
          ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
          : "bg-slate-50 text-[#071E3D] border-slate-100 hover:bg-orange-50 hover:border-orange-200"
      } ${small ? "min-h-[96px]" : "min-h-[130px]"}`}
    >
      <div className={active ? "text-white" : "text-orange-500"}>{icon}</div>
      <h4 className="font-black mt-3 uppercase text-xs tracking-widest">
        {title}
      </h4>
      <p className={`text-xs mt-1 font-medium ${active ? "text-white/70" : "text-slate-400"}`}>
        {desc}
      </p>
    </button>
  );
}

function PaymentStep({ number, title, children }) {
  return (
    <div>
      <h3 className="font-black text-[#071E3D] mb-3">
        <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-orange-500 text-white text-xs mr-2">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function PaymentBox({ label, value, highlight }) {
  return (
    <div
      className={`mt-4 rounded-2xl border p-5 ${
        highlight
          ? "bg-orange-50 border-orange-100 text-orange-600"
          : "bg-slate-50 border-slate-100 text-[#071E3D]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
        {label}
      </p>
      <p className="font-black text-lg mt-1">{value || "-"}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-[#071E3D] text-right">
        {value || "-"}
      </span>
    </div>
  );
}

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

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold flex items-center justify-between gap-3 text-red-600">
      <span>{message}</span>
      <button onClick={onRetry} className="font-black uppercase text-xs">
        Coba Lagi
      </button>
    </div>
  );
}