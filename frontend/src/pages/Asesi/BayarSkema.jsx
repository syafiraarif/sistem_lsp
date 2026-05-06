// frontend/src/pages/asesi/BayarSkema.jsx

import React, { useEffect, useMemo, useState } from "react";
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
  FileCheck,
  Loader2,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wallet,
  XCircle,
} from "lucide-react";

const BayarSkema = () => {
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [skemaJudul, setSkemaJudul] = useState("");
  const [harga, setHarga] = useState(0);
  const [tujuanTransfer, setTujuanTransfer] = useState([]);

  const [kategori, setKategori] = useState("");
  const [jalurPembayaran, setJalurPembayaran] = useState("");
  const [selectedTujuan, setSelectedTujuan] = useState("");
  const [buktiBayar, setBuktiBayar] = useState(null);

  const [statusPembayaran, setStatusPembayaran] = useState("belum bayar");
  const [idPembayaran, setIdPembayaran] = useState(null);
  const [waktuBatas, setWaktuBatas] = useState(null);
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_skema]);

  const fetchData = async () => {
    try {
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

      const detail = detailRes.data?.data;

      setSkemaJudul(detail?.skema || "-");
      setHarga(detail?.harga || 0);
      setTujuanTransfer(detail?.tujuan_transfer || []);

      try {
        const statusRes = await axios.get(
          `${API_BASE}/asesi/pembayaran/${id_skema}/status`,
          { headers }
        );

        const statusData = statusRes.data?.data;

        setStatusPembayaran(statusData?.status || "belum bayar");
        setIdPembayaran(statusData?.id_pembayaran || null);
        setWaktuBatas(statusData?.waktu_batas || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setStatusPembayaran("belum bayar");
        } else {
          setError("Gagal mengambil status pembayaran.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil detail pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTujuanData = tujuanTransfer.find(
    (item) => String(item.id_tujuan_transfer) === String(selectedTujuan)
  );

  const pilihanTujuan = tujuanTransfer.filter((item) => {
    const nama = `${item.nama_bank || ""} ${item.jenis || ""}`.toLowerCase();

    if (jalurPembayaran === "e-wallet") {
      return (
        nama.includes("dana") ||
        nama.includes("ovo") ||
        nama.includes("gopay") ||
        nama.includes("shopee") ||
        nama.includes("wallet") ||
        nama.includes("ewallet") ||
        nama.includes("e-wallet")
      );
    }

    return true;
  });

  const formatRupiah = (value) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const formatTanggal = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKategori = (value) => {
    setKategori(value);
    setJalurPembayaran("");
    setSelectedTujuan("");
    setBuktiBayar(null);
  };

  const handleJalur = (value) => {
    setJalurPembayaran(value);
    setSelectedTujuan("");
  };

  const handleSubmit = async () => {
    if (statusPembayaran === "pending") {
      alert("Pembayaran Anda sedang menunggu konfirmasi admin.");
      return;
    }

    if (statusPembayaran === "paid") {
      navigate(`/asesi/apl01/${id_skema}`);
      return;
    }

    if (!kategori) {
      alert("Silakan pilih kategori pembayaran.");
      return;
    }

    if (kategori === "transfer") {
      if (!jalurPembayaran) {
        alert("Silakan pilih jalur pembayaran.");
        return;
      }

      if (!selectedTujuan) {
        alert("Silakan pilih tujuan pembayaran.");
        return;
      }

      if (!buktiBayar) {
        alert("Silakan upload bukti pembayaran.");
        return;
      }
    }

    try {
      setSubmitLoading(true);

      const submitRes = await axios.post(
        `${API_BASE}/asesi/pembayaran/submit`,
        {
          id_skema,
          metode_pembayaran:
            kategori === "tunai" ? "tunai" : "transfer_rekening",
          jalur_pembayaran:
            kategori === "tunai" ? "tunai" : jalurPembayaran,
          id_tujuan_transfer:
            kategori === "tunai" ? null : selectedTujuan,
        },
        { headers }
      );

      const newIdPembayaran = submitRes.data?.data?.id_pembayaran;

      if (kategori === "transfer" && buktiBayar && newIdPembayaran) {
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

      setStatusPembayaran("pending");
      setIdPembayaran(newIdPembayaran || null);
      alert("Pembayaran berhasil diajukan. Tunggu konfirmasi admin.");
      fetchData();
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
      desc: "Silakan pilih metode pembayaran dan upload bukti jika transfer.",
      style: "bg-slate-50 text-slate-600 border-slate-100",
      icon: <AlertCircle size={22} />,
    },
    pending: {
      title: "Menunggu Konfirmasi",
      desc: "Pembayaran sudah diajukan dan sedang diperiksa admin.",
      style: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <Clock size={22} />,
    },
    paid: {
      title: "Pembayaran Diterima",
      desc: "Pembayaran sudah dikonfirmasi. Silakan lanjut ke APL01.",
      style: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: <CheckCircle size={22} />,
    },
    expired: {
      title: "Pembayaran Expired",
      desc: "Batas waktu pembayaran sudah habis. Silakan ajukan ulang.",
      style: "bg-red-50 text-red-700 border-red-100",
      icon: <XCircle size={22} />,
    },
    cancelled: {
      title: "Pembayaran Dibatalkan",
      desc: "Pembayaran dibatalkan. Silakan ajukan ulang jika diperlukan.",
      style: "bg-red-50 text-red-700 border-red-100",
      icon: <XCircle size={22} />,
    },
  };

  const currentStatus =
    statusView[statusPembayaran] || statusView["belum bayar"];

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
          <div className="w-full max-w-[1500px] mx-auto">
            <ErrorAlert message={error} onRetry={fetchData} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-orange-50 hover:text-orange-500"
                >
                  <ArrowLeft size={14} />
                  Kembali
                </button>

                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ReceiptText size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pembayaran Sertifikasi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Pembayaran
                  <br />
                  <span className="text-orange-500">Skema Sertifikasi</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pilih kategori pembayaran, tentukan tujuan transfer, lalu
                  upload bukti pembayaran sebelum diajukan ke admin.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("detail-pembayaran")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Isi Pembayaran
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={fetchData}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    <RefreshCcw size={17} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Total Pembayaran
                  </p>

                  <h2 className="text-3xl font-black leading-tight">
                    {formatRupiah(harga)}
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    {skemaJudul || "-"}
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Status" value={currentStatus.title} />
                    <HeroPill
                      label="Metode"
                      value={
                        kategori === "tunai"
                          ? "Tunai"
                          : kategori === "transfer"
                          ? "Transfer"
                          : "Belum"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MiniStat
              icon={<Wallet size={22} />}
              label="Biaya"
              value={formatRupiah(harga)}
            />

            <MiniStat
              icon={currentStatus.icon}
              label="Status"
              value={currentStatus.title}
            />

            <MiniStat
              icon={<ReceiptText size={22} />}
              label="ID Pembayaran"
              value={idPembayaran || "-"}
            />
          </section>

          <section
            id="detail-pembayaran"
            className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start"
          >
            <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <CreditCard size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Detail Pembayaran
                  </span>
                </div>

                <h2 className="text-xl font-black text-[#071E3D]">
                  Informasi Pembayaran
                </h2>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  Pastikan data pembayaran sudah benar
                </p>
              </div>

              <div className="p-6 space-y-6">
                <InfoBox label="Skema Sertifikasi" value={skemaJudul} />

                <div
                  className={`rounded-[24px] border p-5 flex gap-4 ${currentStatus.style}`}
                >
                  <div className="shrink-0">{currentStatus.icon}</div>
                  <div>
                    <h3 className="font-black">{currentStatus.title}</h3>
                    <p className="text-sm mt-1 font-medium">
                      {currentStatus.desc}
                    </p>
                  </div>
                </div>

                <PaymentStep number="1" title="Pilih Kategori Pembayaran">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChoiceButton
                      active={kategori === "tunai"}
                      disabled={statusPembayaran === "pending"}
                      icon={<Wallet size={24} />}
                      title="Tunai"
                      desc="Bayar langsung kepada admin atau petugas LSP."
                      onClick={() => handleKategori("tunai")}
                    />

                    <ChoiceButton
                      active={kategori === "transfer"}
                      disabled={statusPembayaran === "pending"}
                      icon={<CreditCard size={24} />}
                      title="Transfer"
                      desc="Bayar melalui m-banking, ATM, atau e-wallet."
                      onClick={() => handleKategori("transfer")}
                    />
                  </div>
                </PaymentStep>

                {kategori === "transfer" && (
                  <PaymentStep number="2" title="Pilih Jalur Pembayaran">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ChoiceButton
                        active={jalurPembayaran === "m-banking"}
                        disabled={statusPembayaran === "pending"}
                        icon={<CreditCard size={22} />}
                        title="M-Banking"
                        desc="Mandiri, BCA, BRI, BNI, dll."
                        onClick={() => handleJalur("m-banking")}
                        small
                      />

                      <ChoiceButton
                        active={jalurPembayaran === "atm"}
                        disabled={statusPembayaran === "pending"}
                        icon={<CreditCard size={22} />}
                        title="ATM"
                        desc="Transfer melalui mesin ATM."
                        onClick={() => handleJalur("atm")}
                        small
                      />

                      <ChoiceButton
                        active={jalurPembayaran === "e-wallet"}
                        disabled={statusPembayaran === "pending"}
                        icon={<Wallet size={22} />}
                        title="E-Wallet"
                        desc="DANA, OVO, GoPay, dll."
                        onClick={() => handleJalur("e-wallet")}
                        small
                      />
                    </div>
                  </PaymentStep>
                )}

                {kategori === "transfer" && jalurPembayaran && (
                  <PaymentStep number="3" title="Pilih Tujuan Pembayaran">
                    <select
                      value={selectedTujuan}
                      onChange={(e) => setSelectedTujuan(e.target.value)}
                      disabled={statusPembayaran === "pending"}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
                    >
                      <option value="">Pilih tujuan pembayaran</option>

                      {pilihanTujuan.map((tujuan) => (
                        <option
                          key={tujuan.id_tujuan_transfer}
                          value={tujuan.id_tujuan_transfer}
                        >
                          {tujuan.nama_bank} - {tujuan.nomor_rekening}
                        </option>
                      ))}
                    </select>
                  </PaymentStep>
                )}

                {kategori === "transfer" && selectedTujuanData && (
                  <div className="rounded-[28px] bg-[#071E3D] text-white p-6">
                    <h3 className="text-xl font-black mb-5">
                      Instruksi Pembayaran
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PaymentBox
                        label="Tujuan"
                        value={selectedTujuanData.nama_bank}
                      />

                      <PaymentBox
                        label="Nomor Rekening / Nomor VA / Nomor E-Wallet"
                        value={selectedTujuanData.nomor_rekening}
                      />

                      <PaymentBox
                        label="Atas Nama"
                        value={
                          selectedTujuanData.atas_nama ||
                          selectedTujuanData.nama_pemilik ||
                          "-"
                        }
                      />

                      <PaymentBox
                        label="Nominal"
                        value={formatRupiah(harga)}
                        highlight
                      />
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/10 border border-white/10 p-4 text-white/70 text-sm leading-relaxed">
                      Bayar sesuai nominal yang tertera, lalu upload bukti
                      pembayaran di bawah ini.
                    </div>
                  </div>
                )}

                {kategori === "transfer" && selectedTujuanData && (
                  <PaymentStep number="4" title="Upload Bukti Bayar">
                    <label className="block rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-6 cursor-pointer transition-all hover:border-orange-300 hover:bg-orange-50">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-orange-500 flex items-center justify-center shadow-sm">
                          <UploadCloud size={28} />
                        </div>

                        <div>
                          <p className="font-black text-[#071E3D]">
                            {buktiBayar
                              ? buktiBayar.name
                              : "Pilih file bukti pembayaran"}
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            Format JPG, PNG, atau PDF.
                          </p>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setBuktiBayar(e.target.files?.[0])}
                      />
                    </label>
                  </PaymentStep>
                )}

                {kategori === "tunai" && (
                  <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5 flex gap-4">
                    <Wallet className="text-orange-500 shrink-0" />
                    <div>
                      <h3 className="font-black text-[#071E3D]">
                        Pembayaran Tunai
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        Silakan lakukan pembayaran langsung kepada admin atau
                        petugas LSP. Setelah diajukan, status akan menunggu
                        konfirmasi admin.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50/60 border-t border-slate-100">
                {statusPembayaran === "paid" ? (
                  <button
                    onClick={() => navigate(`/asesi/apl01/${id_skema}`)}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2"
                  >
                    <FileCheck size={20} />
                    Lanjut ke APL01
                  </button>
                ) : statusPembayaran === "pending" ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-slate-300 text-slate-600 font-black cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock size={20} />
                    Menunggu Konfirmasi Admin
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Mengajukan...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={20} />
                        Ajukan Pembayaran
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <ReceiptText size={22} />
                </div>

                <h3 className="text-2xl font-black text-[#071E3D]">
                  Ringkasan
                </h3>

                <div className="mt-5 space-y-4">
                  <SummaryRow label="Biaya" value={formatRupiah(harga)} />
                  <SummaryRow
                    label="Kategori"
                    value={
                      kategori === "tunai"
                        ? "Tunai"
                        : kategori === "transfer"
                        ? "Transfer"
                        : "-"
                    }
                  />
                  <SummaryRow label="Jalur" value={jalurPembayaran || "-"} />
                  <SummaryRow
                    label="Tujuan"
                    value={selectedTujuanData?.nama_bank || "-"}
                  />
                  <SummaryRow label="Status" value={currentStatus.title} />
                  <SummaryRow
                    label="Batas Bayar"
                    value={formatTanggal(waktuBatas)}
                  />
                </div>

                <div className="border-t border-slate-100 mt-5 pt-5 flex justify-between items-center gap-4">
                  <span className="font-black text-[#071E3D]">Total</span>
                  <span className="font-black text-2xl text-orange-500 text-right">
                    {formatRupiah(harga)}
                  </span>
                </div>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[32px] p-6 shadow-2xl shadow-[#071E3D]/15">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-orange-300 mb-4">
                  <ShieldCheck size={26} />
                </div>

                <h3 className="text-xl font-black">Alur Pembayaran</h3>

                <ol className="text-white/70 text-sm mt-4 space-y-2 list-decimal list-inside">
                  <li>Pilih tunai atau transfer.</li>
                  <li>Jika transfer, pilih m-banking, ATM, atau e-wallet.</li>
                  <li>Pilih tujuan pembayaran.</li>
                  <li>Upload bukti bayar.</li>
                  <li>Tunggu konfirmasi admin.</li>
                </ol>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-5">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#071E3D] flex items-center justify-center mb-5">
          <Loader2 className="animate-spin text-white" size={34} />
        </div>

        <h2 className="text-[#071E3D] font-black text-xl">
          Memuat Pembayaran
        </h2>

        <p className="text-slate-500 text-sm mt-2 font-medium">
          Mengambil detail skema dan status pembayaran.
        </p>
      </div>
    </div>
  );
}

function ChoiceButton({ active, disabled, icon, title, desc, onClick, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-[24px] border p-5 transition-all ${
        active
          ? "border-orange-400 bg-orange-50 ring-4 ring-orange-100"
          : "border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white text-orange-500 flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>

      <h4 className="font-black text-[#071E3D]">{title}</h4>

      <p
        className={`text-slate-500 font-semibold mt-1 ${
          small ? "text-xs" : "text-sm"
        }`}
      >
        {desc}
      </p>
    </button>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-[24px] bg-slate-50/70 border border-slate-100 p-5">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
        {label}
      </p>

      <h3 className="text-xl font-black text-[#071E3D] mt-2">
        {value || "-"}
      </h3>
    </div>
  );
}

function PaymentStep({ number, title, children }) {
  return (
    <div>
      <h3 className="font-black text-[#071E3D] mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-xs font-black text-orange-500">
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
      className={`rounded-2xl p-4 border ${
        highlight
          ? "bg-orange-500 text-white border-orange-400"
          : "bg-white/10 border-white/10"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-widest opacity-70">
        {label}
      </p>

      <p className="font-black text-lg break-all mt-2">{value || "-"}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500 font-semibold">{label}</span>
      <span className="text-[#071E3D] font-black text-right">{value}</span>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[#071E3D] font-black mt-1 truncate">{value}</p>
      </div>
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
    <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-red-600">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 border border-red-100 hover:bg-red-100"
      >
        <RefreshCcw size={14} />
        Coba Lagi
      </button>
    </div>
  );
}

export default BayarSkema;