// frontend/src/pages/asesi/BayarSkema.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Loader2,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  Wallet,
  XCircle,
} from "lucide-react";

const BayarSkema = () => {
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE;
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
      style: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <AlertCircle size={22} />,
    },
    pending: {
      title: "Menunggu Konfirmasi",
      desc: "Pembayaran sudah diajukan dan sedang diperiksa admin.",
      style: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock size={22} />,
    },
    paid: {
      title: "Pembayaran Diterima",
      desc: "Pembayaran sudah dikonfirmasi. Silakan lanjut ke APL01.",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle size={22} />,
    },
    expired: {
      title: "Pembayaran Expired",
      desc: "Batas waktu pembayaran sudah habis. Silakan ajukan ulang.",
      style: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle size={22} />,
    },
    cancelled: {
      title: "Pembayaran Dibatalkan",
      desc: "Pembayaran dibatalkan. Silakan ajukan ulang jika diperlukan.",
      style: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle size={22} />,
    },
  };

  const currentStatus =
    statusView[statusPembayaran] || statusView["belum bayar"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="bg-white rounded-[28px] p-10 shadow-xl text-center">
          <Loader2 className="animate-spin mx-auto text-orange-500" size={46} />
          <h2 className="mt-5 text-xl font-black text-[#071E3D]">
            Memuat Pembayaran
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex">
        <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      <SidebarAsesi isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 p-5 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="bg-white rounded-[30px] border border-slate-100 p-6 md:p-8 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-bold"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                  <ReceiptText size={15} />
                  Pembayaran Sertifikasi
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-[#071E3D]">
                  Pembayaran Skema
                </h1>

                <p className="text-slate-500 mt-2 max-w-2xl">
                  Pilih kategori pembayaran, pilih jalur pembayaran, lalu upload
                  bukti bayar sebelum diajukan.
                </p>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[26px] p-6 min-w-[260px]">
                <p className="text-white/50 text-xs font-black uppercase tracking-widest">
                  Total Pembayaran
                </p>
                <h2 className="text-3xl font-black mt-2">
                  {formatRupiah(harga)}
                </h2>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100">
                <h2 className="text-2xl font-black text-[#071E3D]">
                  Detail Pembayaran
                </h2>
                <p className="text-slate-500 mt-1">
                  Pastikan data pembayaran sudah benar.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <InfoBox label="Skema Sertifikasi" value={skemaJudul} />

                <div
                  className={`rounded-[24px] border p-5 flex gap-4 ${currentStatus.style}`}
                >
                  <div>{currentStatus.icon}</div>
                  <div>
                    <h3 className="font-black">{currentStatus.title}</h3>
                    <p className="text-sm mt-1 font-medium">
                      {currentStatus.desc}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-[#071E3D] mb-3">
                    1. Pilih Kategori Pembayaran
                  </h3>

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
                </div>

                {kategori === "transfer" && (
                  <div>
                    <h3 className="font-black text-[#071E3D] mb-3">
                      2. Pilih Jalur Pembayaran
                    </h3>

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
                  </div>
                )}

                {kategori === "transfer" && jalurPembayaran && (
                  <div>
                    <h3 className="font-black text-[#071E3D] mb-3">
                      3. Pilih Tujuan Pembayaran
                    </h3>

                    <select
                      value={selectedTujuan}
                      onChange={(e) => setSelectedTujuan(e.target.value)}
                      disabled={statusPembayaran === "pending"}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-[#071E3D] outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
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
                  </div>
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
                  <div>
                    <h3 className="font-black text-[#071E3D] mb-3">
                      4. Upload Bukti Bayar
                    </h3>

                    <label className="block rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-6 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all">
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
                  </div>
                )}

                {kategori === "tunai" && (
                  <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5 flex gap-4">
                    <Wallet className="text-orange-500" />
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

              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
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
                    className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
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
            </section>

            <aside className="space-y-6">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm p-6">
                <h3 className="text-xl font-black text-[#071E3D]">
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
                  <SummaryRow
                    label="Jalur"
                    value={jalurPembayaran || "-"}
                  />
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

                <div className="border-t border-slate-100 mt-5 pt-5 flex justify-between items-center">
                  <span className="font-black text-[#071E3D]">Total</span>
                  <span className="font-black text-2xl text-orange-500">
                    {formatRupiah(harga)}
                  </span>
                </div>
              </div>

              <div className="bg-[#071E3D] text-white rounded-[30px] p-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-orange-300 mb-4">
                  <ShieldCheck size={26} />
                </div>

                <h3 className="text-xl font-black">Alur Pembayaran</h3>
                <ol className="text-white/70 text-sm mt-3 space-y-2 list-decimal list-inside">
                  <li>Pilih tunai atau transfer.</li>
                  <li>Jika transfer, pilih m-banking, ATM, atau e-wallet.</li>
                  <li>Pilih tujuan pembayaran.</li>
                  <li>Upload bukti bayar.</li>
                  <li>Tunggu konfirmasi admin.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

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
      <p className={`text-slate-500 font-semibold mt-1 ${small ? "text-xs" : "text-sm"}`}>
        {desc}
      </p>
    </button>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-[24px] bg-slate-50 border border-slate-100 p-5">
      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
        {label}
      </p>
      <h3 className="text-xl font-black text-[#071E3D] mt-2">{value}</h3>
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

export default BayarSkema;