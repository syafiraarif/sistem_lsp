// frontend/src/pages/asesi/BayarSkema.jsx
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
  Info
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
  const [kodeSkema, setKodeSkema] = useState("");
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
  
  const requestRunningRef = useRef(false);
  
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
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
      
      const detailRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/detail`, { headers });
      const detail = detailRes.data?.data || {};
      
      setSkemaJudul(detail.skema || "-");
      setKodeSkema(detail.kode_skema || "-");
      setHarga(Number(detail.harga || 0));
      setTujuanTransfer(Array.isArray(detail.tujuan_transfer) ? detail.tujuan_transfer : []);
      setQris(detail.qris || null);
      setVirtualAccount(detail.virtual_account || null);
      
      const statusRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/status`, { headers });
      const statusData = statusRes.data?.data || {};
      
      setStatusPembayaran(statusData.status || "belum bayar");
      setIdPembayaran(statusData.id_pembayaran || null);
      setWaktuBatas(statusData.waktu_batas || null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal mengambil data pembayaran.");
      setStatusPembayaran("belum bayar");
      setIdPembayaran(null);
      setWaktuBatas(null);
    } finally {
      requestRunningRef.current = false;
      setLoading(false);
    }
  };

  const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  
  const formatTanggal = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const selectedTujuanData = tujuanTransfer.find((item) => String(item.id_tujuan_transfer) === String(selectedTujuan));

  const handleMetode = (value) => {
    setMetode(value);
    setJalurPembayaran("");
    setSelectedTujuan("");
    setBuktiBayar(null);
  };

  const handleBuktiChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBuktiBayar(null);
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Bukti bayar harus berupa JPG, PNG, JPEG, atau PDF.");
      e.target.value = "";
      setBuktiBayar(null);
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran bukti bayar maksimal 3 MB.");
      e.target.value = "";
      setBuktiBayar(null);
      return;
    }
    setBuktiBayar(file);
  };

  const validateSubmit = () => {
    if (!metode) { alert("Silakan pilih metode pembayaran."); return false; }
    if (metode === "transfer_rekening") {
      if (!jalurPembayaran) { alert("Silakan pilih jalur pembayaran."); return false; }
      if (!selectedTujuan) { alert("Silakan pilih tujuan pembayaran."); return false; }
    }
    if (["transfer_rekening", "qris", "virtual_account"].includes(metode)) {
      if (!buktiBayar) { alert("Silakan upload bukti pembayaran."); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    const isWaiting = statusPembayaran === "pending" || statusPembayaran === "menunggu_validasi";
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
      const payload = {
        id_skema,
        metode_pembayaran: metode,
        jalur_pembayaran: metode === "tunai" ? "tunai" : metode === "qris" ? "qris" : metode === "virtual_account" ? "virtual_account" : jalurPembayaran,
        id_tujuan_transfer: metode === "transfer_rekening" ? selectedTujuan : null,
      };
      
      const submitRes = await axios.post(`${API_BASE}/asesi/pembayaran/submit`, payload, { headers });
      const newIdPembayaran = submitRes.data?.data?.id_pembayaran;
      
      if (buktiBayar && newIdPembayaran) {
        const formData = new FormData();
        formData.append("bukti_bayar", buktiBayar);
        await axios.put(`${API_BASE}/asesi/pembayaran/${newIdPembayaran}/upload-bukti`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }
      alert("Pembayaran berhasil diajukan. Menunggu validasi admin.");
      navigate("/asesi/jadwal-saya");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.response?.data?.error || "Gagal mengajukan pembayaran.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const statusView = {
    "belum bayar": {
      title: "Belum Bayar",
      desc: "Silakan pilih metode pembayaran dan upload bukti bayar.",
      className: "bg-slate-50 border-slate-200",
      textColor: "text-[#071E3D]",
      icon: <CreditCard size={20} />,
      iconBg: "bg-slate-200 text-slate-500"
    },
    pending: {
      title: "Belum Upload Bukti",
      desc: "Pembayaran dibuat. Silakan upload bukti bayar.",
      className: "bg-amber-50 border-amber-200",
      textColor: "text-amber-800",
      icon: <Clock size={20} />,
      iconBg: "bg-amber-100 text-amber-600"
    },
    menunggu_validasi: {
      title: "Menunggu Validasi Admin",
      desc: "Bukti pembayaran sudah dikirim. APL01 akan terbuka setelah admin memvalidasi.",
      className: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
      icon: <Clock size={20} />,
      iconBg: "bg-blue-100 text-blue-600"
    },
    paid: {
      title: "Pembayaran Diterima",
      desc: "Pembayaran divalidasi. Silakan kembali ke Jadwal Saya untuk lanjut APL01.",
      className: "bg-emerald-50 border-emerald-200",
      textColor: "text-emerald-800",
      icon: <CheckCircle size={20} />,
      iconBg: "bg-emerald-100 text-emerald-600"
    },
    ditolak: {
      title: "Pembayaran Ditolak",
      desc: "Pembayaran ditolak admin. Silakan ajukan ulang dengan bukti valid.",
      className: "bg-red-50 border-red-200",
      textColor: "text-red-800",
      icon: <AlertCircle size={20} />,
      iconBg: "bg-red-100 text-red-600"
    },
  };

  const currentStatus = statusView[statusPembayaran] || statusView["belum bayar"];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* PENAMBAHAN min-w-0 AGAR GRID/FLEX BISA MENYUSUT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden min-w-0">
        <div className="mx-auto w-full max-w-[1500px] space-y-6">
          
          {/* HEADER SECTION (Menyamakan APL01 & APL02) */}
          <section className="relative overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm p-6 lg:p-8 min-w-0 w-full">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/2 rounded-full bg-[#CC6B27]/10 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center w-full min-w-0">
              
              <div className="min-w-0 w-full">
                <h1 className="text-3xl lg:text-4xl font-black leading-tight text-[#071E3D] break-words">
                  Pembayaran <span className="text-[#CC6B27]">Skema Sertifikasi</span>
                </h1>
                <p className="mt-2 text-[14px] font-medium text-[#182D4A]/70 max-w-2xl break-words whitespace-normal">
                  Selesaikan pembayaran Anda. Pilih metode pembayaran yang tersedia, unggah bukti transfer yang valid, dan tunggu konfirmasi dari pihak admin LSP.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#a8561f] disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/asesi/jadwal-saya")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-[#071E3D]/5"
                  >
                    <ArrowLeft size={16} /> Jadwal Saya
                  </button>
                </div>
              </div>

              {/* Box Total Harga Kanan */}
              <div className="relative overflow-hidden rounded-xl bg-[#071E3D] p-5 w-full lg:w-[320px] xl:w-[360px] shrink-0 border border-[#071E3D]/10">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#CC6B27]/30 blur-2xl" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Total Pembayaran</p>
                  <h2 className="text-3xl font-black text-white">{formatRupiah(harga)}</h2>
                  <p className="text-[12px] font-medium text-white/70 mt-2 line-clamp-2 leading-relaxed">
                    {kodeSkema} - {skemaJudul}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <div className="bg-white/10 border border-white/5 rounded-lg p-2.5">
                      <p className="text-[9px] font-bold text-white/50 uppercase">ID Skema</p>
                      <p className="text-sm font-black text-white mt-0.5 truncate">{id_skema || "-"}</p>
                    </div>
                    <div className="bg-white/10 border border-white/5 rounded-lg p-2.5">
                      <p className="text-[9px] font-bold text-white/50 uppercase">ID Bayar</p>
                      <p className="text-sm font-black text-[#CC6B27] mt-0.5 truncate">{idPembayaran || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {error && <ErrorAlert message={error} onRetry={fetchData} />}

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-6 items-start w-full min-w-0">
            
            {/* KIRI - METODE & UPLOAD */}
            <section className="space-y-6 min-w-0 w-full">
              
              <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm p-5 md:p-6 w-full min-w-0">
                
                {/* Status Box */}
                <div className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-4 mb-6 w-full min-w-0 ${currentStatus.className}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${currentStatus.iconBg}`}>
                    {currentStatus.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-black text-[14px] ${currentStatus.textColor}`}>{currentStatus.title}</h3>
                    <p className={`text-[12px] font-medium mt-1 leading-relaxed ${currentStatus.textColor} opacity-80`}>
                      {currentStatus.desc}
                    </p>
                    {waktuBatas && (
                      <p className={`text-[11px] font-bold mt-2 ${currentStatus.textColor}`}>
                        Batas waktu: {formatTanggal(waktuBatas)}
                      </p>
                    )}
                  </div>
                </div>

                {statusPembayaran !== "paid" && statusPembayaran !== "menunggu_validasi" && (
                  <div className="space-y-6">
                    
                    {/* STEP 1 */}
                    <PaymentStep number="1" title="Pilih Metode Pembayaran">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
                        <ChoiceButton active={metode === "tunai"} icon={<Wallet size={20} />} title="Tunai" desc="Bayar langsung" onClick={() => handleMetode("tunai")} />
                        <ChoiceButton active={metode === "transfer_rekening"} icon={<CreditCard size={20} />} title="Transfer" desc="Bank / E-wallet" onClick={() => handleMetode("transfer_rekening")} />
                        <ChoiceButton active={metode === "qris"} icon={<QrCode size={20} />} title="QRIS" desc="Scan Kode QR" onClick={() => handleMetode("qris")} />
                        <ChoiceButton active={metode === "virtual_account"} icon={<BadgeCheck size={20} />} title="VA" desc="Virtual Account" onClick={() => handleMetode("virtual_account")} />
                      </div>
                    </PaymentStep>

                    {/* STEP 2 - CONDITIONAL */}
                    {metode === "transfer_rekening" && (
                      <PaymentStep number="2" title="Pilih Jalur & Tujuan Transfer">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          {["m-banking", "atm", "e-wallet"].map((item) => (
                            <ChoiceButton key={item} active={jalurPembayaran === item} title={item.replace("-", " ")} desc="Pilih jalur ini" onClick={() => setJalurPembayaran(item)} small />
                          ))}
                        </div>
                        {jalurPembayaran && (
                          <div className="w-full min-w-0">
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#071E3D] mb-1.5">Tujuan Pembayaran</label>
                            <select
                              value={selectedTujuan}
                              onChange={(e) => setSelectedTujuan(e.target.value)}
                              className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#071E3D]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC6B27]/10 focus:border-[#CC6B27] transition-all text-[13px] text-[#071E3D] font-semibold appearance-none"
                            >
                              <option value="">-- Pilih tujuan pembayaran --</option>
                              {tujuanTransfer.map((item) => (
                                <option key={item.id_tujuan_transfer} value={item.id_tujuan_transfer}>
                                  {item.nama_bank} - {item.nomor_rekening} (a.n {item.atas_nama})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {selectedTujuanData && (
                          <PaymentBox label="Tujuan Transfer Terpilih" value={`${selectedTujuanData.nama_bank} - ${selectedTujuanData.nomor_rekening}`} subValue={`a.n ${selectedTujuanData.atas_nama}`} />
                        )}
                      </PaymentStep>
                    )}

                    {metode === "qris" && (
                      <PaymentStep number="2" title="Scan QRIS">
                        <div className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-6 text-center w-full min-w-0">
                          <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block shadow-sm">
                            <img
                              src={`${APP_BASE}${qris?.image_url || "/uploads/qris/qris.png"}`}
                              alt="QRIS"
                              className="mx-auto max-h-64 object-contain"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          </div>
                          <p className="mt-4 text-[13px] font-medium text-[#182D4A]/60">Scan QRIS di atas dengan aplikasi E-Wallet atau M-Banking Anda, lalu unggah bukti pembayarannya.</p>
                        </div>
                      </PaymentStep>
                    )}

                    {metode === "virtual_account" && (
                      <PaymentStep number="2" title="Detail Virtual Account">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
                          <PaymentBox label="Nomor Virtual Account" value={virtualAccount?.nomor_va || "-"} highlight />
                          <PaymentBox label="Atas Nama" value={virtualAccount?.atas_nama || "LSP Terdaftar"} />
                        </div>
                      </PaymentStep>
                    )}

                    {metode === "tunai" && (
                      <PaymentStep number="2" title="Instruksi Pembayaran Tunai">
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 w-full min-w-0">
                          <div className="flex gap-3">
                            <Info size={20} className="text-amber-600 shrink-0" />
                            <p className="text-[13px] font-medium text-amber-800 leading-relaxed">
                              Silakan ajukan pembayaran tunai di bawah ini. Anda dapat membayar langsung secara tunai ke pihak admin / panitia di lokasi (TUK). Admin akan memvalidasi form ini setelah uang tunai diterima.
                            </p>
                          </div>
                        </div>
                      </PaymentStep>
                    )}

                    {/* STEP 3 - UPLOAD */}
                    {["transfer_rekening", "qris", "virtual_account"].includes(metode) && (
                      <PaymentStep number="3" title="Unggah Bukti Pembayaran">
                        <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#071E3D]/20 bg-[#FAFAFA] p-6 cursor-pointer hover:border-[#CC6B27] hover:bg-[#CC6B27]/5 transition-all text-center group w-full min-w-0">
                          <UploadCloud size={28} className="text-[#CC6B27] mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[13px] font-bold text-[#071E3D] truncate w-full px-2">
                            {buktiBayar ? "File Siap Diunggah" : "Klik untuk pilih file bukti pembayaran"}
                          </span>
                          <span className="text-[11px] text-[#182D4A]/50 mt-1 truncate w-full px-2">
                            {buktiBayar ? buktiBayar.name : "Format didukung: JPG, PNG, JPEG, atau PDF. Maksimal 3 MB."}
                          </span>
                          <input type="file" accept="image/png,image/jpeg,image/jpg,application/pdf" className="hidden" onChange={handleBuktiChange} />
                        </label>
                      </PaymentStep>
                    )}

                  </div>
                )}
                
                {/* ACTION BUTTON */}
                <div className="mt-6 pt-6 border-t border-[#071E3D]/10">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitLoading || statusPembayaran === "pending" || statusPembayaran === "menunggu_validasi" || statusPembayaran === "paid"}
                    className={`w-full py-3.5 rounded-lg font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm ${
                      submitLoading || statusPembayaran === "pending" || statusPembayaran === "menunggu_validasi" || statusPembayaran === "paid" 
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                        : "bg-[#CC6B27] text-white hover:bg-[#a8561f] shadow-[#CC6B27]/20"
                    }`}
                  >
                    {submitLoading ? <Loader2 size={16} className="animate-spin" /> : statusPembayaran === "paid" ? <CheckCircle size={16} /> : <UploadCloud size={16} />}
                    {statusPembayaran === "paid" ? "Pembayaran Diterima" : statusPembayaran === "pending" || statusPembayaran === "menunggu_validasi" ? "Menunggu Validasi" : submitLoading ? "Mengajukan..." : "Ajukan Pembayaran"}
                  </button>
                </div>

              </div>
            </section>

            {/* KANAN - RINGKASAN */}
            <aside className="w-full shrink-0">
              <div className="sticky top-6 space-y-6">
                
                <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-sm overflow-hidden w-full min-w-0">
                  <div className="bg-[#071E3D] p-4 md:p-5 text-white">
                    <h3 className="font-black text-[15px] mb-1">Ringkasan Pembayaran</h3>
                    <p className="text-[11px] text-white/70">Periksa rincian tagihan Anda</p>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col gap-3">
                    <SummaryItem label="Skema" value={skemaJudul} />
                    <SummaryItem label="Kode Skema" value={kodeSkema} />
                    <SummaryItem label="Metode Bayar" value={metode ? metode.replace("_", " ") : "-"} />
                    <SummaryItem label="Status Pembayaran" value={statusPembayaran.replace("_", " ")} highlight={statusPembayaran !== "belum bayar"} />
                    
                    <div className="border-t border-[#071E3D]/10 my-1 pt-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[12px] font-bold text-[#182D4A]/60 uppercase tracking-wide truncate">Total Bayar</span>
                        <span className="text-[16px] font-black text-[#CC6B27] whitespace-nowrap">{formatRupiah(harga)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#071E3D]/10 p-5 shadow-sm w-full min-w-0">
                  <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#071E3D] mb-4 border-b border-[#071E3D]/10 pb-3">
                    <AlertCircle size={16} className="text-[#CC6B27]" /> Alur Validasi
                  </h4>
                  <ol className="space-y-3 text-[12px] text-[#182D4A]/70 font-medium">
                    <li className="flex gap-2"><span className="text-[#CC6B27] font-black">1.</span> Pilih metode dan lunasi tagihan.</li>
                    <li className="flex gap-2"><span className="text-[#CC6B27] font-black">2.</span> Unggah bukti pada form ini.</li>
                    <li className="flex gap-2"><span className="text-[#CC6B27] font-black">3.</span> Tunggu admin LSP memvalidasi.</li>
                    <li className="flex gap-2"><span className="text-[#CC6B27] font-black">4.</span> Form APL.01 akan otomatis terbuka setelah status pembayaran <strong className="text-emerald-600">Diterima</strong>.</li>
                  </ol>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl border border-[#071E3D]/10 shadow-lg p-8 text-center max-w-sm w-full">
        <Loader2 className="animate-spin text-[#CC6B27] mx-auto mb-4" size={36} />
        <h2 className="text-[#071E3D] font-black text-lg">Memuat Data Pembayaran</h2>
        <p className="text-[#182D4A]/70 text-sm mt-1 font-medium">Harap tunggu sebentar.</p>
      </div>
    </div>
  );
}

function ChoiceButton({ active, icon, title, desc, onClick, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all w-full flex flex-col items-start min-w-0 ${
        active
          ? "bg-[#CC6B27]/5 border-[#CC6B27] ring-1 ring-[#CC6B27]"
          : "bg-white border-[#071E3D]/10 hover:border-[#CC6B27]/40 hover:bg-[#FAFAFA]"
      } ${small ? "min-h-[85px] p-3" : "min-h-[110px]"}`}
    >
      <div className={`${active ? "text-[#CC6B27]" : "text-[#182D4A]/50"} shrink-0`}>
        {icon}
      </div>
      <div className="mt-auto w-full pt-3">
        <h4 className={`font-bold text-[12px] uppercase tracking-wide truncate w-full ${active ? "text-[#071E3D]" : "text-[#071E3D]"}`}>
          {title}
        </h4>
        <p className={`text-[10px] mt-0.5 font-medium truncate w-full ${active ? "text-[#CC6B27]" : "text-[#182D4A]/50"}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}

function PaymentStep({ number, title, children }) {
  return (
    <div className="w-full min-w-0">
      <h3 className="font-black text-[#071E3D] text-[14px] flex items-center mb-3">
        <span className="flex shrink-0 w-6 h-6 items-center justify-center rounded-full bg-[#CC6B27]/10 text-[#CC6B27] text-[11px] mr-2.5">
          {number}
        </span>
        <span className="truncate">{title}</span>
      </h3>
      <div className="w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

function PaymentBox({ label, value, subValue, highlight }) {
  return (
    <div className={`mt-2 rounded-xl border p-4 w-full min-w-0 ${highlight ? "bg-[#CC6B27]/5 border-[#CC6B27]/20" : "bg-[#FAFAFA] border-[#071E3D]/10"}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#182D4A]/50 truncate w-full">
        {label}
      </p>
      <p className={`font-black text-[15px] mt-1 break-words whitespace-normal ${highlight ? "text-[#CC6B27]" : "text-[#071E3D]"}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[12px] font-semibold text-[#182D4A]/60 mt-0.5 truncate w-full">{subValue}</p>
      )}
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center border-b border-[#071E3D]/5 pb-2 last:border-0 last:pb-0 gap-3">
      <span className="text-[11px] font-bold text-[#182D4A]/60 uppercase tracking-wide truncate">{label}</span>
      <span className={`text-[12px] font-black capitalize whitespace-nowrap ${highlight ? "text-[#CC6B27]" : "text-[#071E3D]"}`}>
        {value}
      </span>
    </div>
  );
}

function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
      <div className="flex items-start gap-3 min-w-0">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-bold text-[14px]">Perhatian</p>
          <p className="mt-1 text-[12px] font-medium text-red-600/80 leading-relaxed truncate whitespace-normal">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-[11px] font-bold tracking-wide text-white transition-all hover:bg-red-600 shrink-0"
      >
        <RefreshCcw size={14} /> Coba Lagi
      </button>
    </div>
  );
}