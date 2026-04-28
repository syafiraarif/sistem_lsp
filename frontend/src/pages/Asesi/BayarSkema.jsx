// frontend/src/pages/asesi/BayarSkema.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const BayarSkema = () => {
  const { id_skema } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [skemaJudul, setSkemaJudul] = useState("");
  const [harga, setHarga] = useState(0);
  const [tujuanTransfer, setTujuanTransfer] = useState([]);
  const [metode, setMetode] = useState("tunai");
  const [jalur, setJalur] = useState("tunai");
  const [selectedTujuan, setSelectedTujuan] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("belum bayar");
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const detailRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const detailData = detailRes.data?.data;
        setSkemaJudul(detailData.skema);
        setHarga(detailData.harga);
        setTujuanTransfer(detailData.tujuan_transfer || []);

        try {
          const statusRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const status = statusRes.data?.data?.status || "belum bayar";
          setStatusPembayaran(status);

          if (status === "paid") {
            alert("Pembayaran selesai");
            navigate(`/asesi/apl01/${id_skema}`);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            setError("Gagal ambil status");
          }
        }

      } catch (err) {
        setError("Gagal ambil data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, id_skema, navigate]);

  const handleSubmit = async () => {
    if (statusPembayaran === "pending") return;

    if (metode === "transfer_rekening" && !selectedTujuan) {
      return alert("Pilih tujuan transfer");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE}/asesi/pembayaran/submit`,
        {
          id_skema,
          metode_pembayaran: metode,
          jalur_pembayaran: metode === "tunai" ? "tunai" : jalur,
          id_tujuan_transfer: selectedTujuan || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Pembayaran berhasil dibuat");
      navigate(`/asesi/apl01/${id_skema}`);

    } catch (err) {
      alert("Gagal submit pembayaran");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SidebarAsesi />

      <div className="flex-1 p-6 lg:p-10">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#071E3D]">
            Pembayaran Skema
          </h1>
          <p className="text-gray-500">
            Selesaikan pembayaran untuk melanjutkan asesmen
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6">

          {/* INFO */}
          <div>
            <p className="text-sm text-gray-500">Skema</p>
            <p className="font-bold text-lg text-[#071E3D]">{skemaJudul}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Harga</p>
            <p className="text-2xl font-black text-orange-500">
              Rp {Number(harga).toLocaleString("id-ID")}
            </p>
          </div>

          {/* STATUS */}
          <div
            className={`p-4 rounded-2xl flex justify-between items-center ${
              statusPembayaran === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : statusPembayaran === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className="font-semibold">
              Status: {statusPembayaran}
            </span>
            {statusPembayaran === "paid" ? (
              <CheckCircle />
            ) : (
              <AlertCircle />
            )}
          </div>

          {/* METODE */}
          <div>
            <label className="block mb-2 font-semibold">
              Metode Pembayaran
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMetode("tunai")}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${
                  metode === "tunai"
                    ? "bg-orange-500 text-white"
                    : "bg-white"
                }`}
              >
                <Wallet />
                Tunai
              </button>

              <button
                onClick={() => setMetode("transfer_rekening")}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${
                  metode === "transfer_rekening"
                    ? "bg-orange-500 text-white"
                    : "bg-white"
                }`}
              >
                <CreditCard />
                Transfer
              </button>
            </div>
          </div>

          {/* TRANSFER */}
          {metode === "transfer_rekening" && (
            <div>
              <label className="block mb-2 font-semibold">
                Pilih Rekening
              </label>
              <select
                value={selectedTujuan}
                onChange={(e) => setSelectedTujuan(e.target.value)}
                className="w-full p-3 border rounded-xl"
              >
                <option value="">Pilih Tujuan</option>
                {tujuanTransfer.map((t) => (
                  <option key={t.id_tujuan_transfer} value={t.id_tujuan_transfer}>
                    {t.nama_bank} - {t.nomor_rekening}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={statusPembayaran === "pending"}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg ${
              statusPembayaran === "pending"
                ? "bg-gray-400"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {statusPembayaran === "pending"
              ? "Menunggu Pembayaran..."
              : "Submit Pembayaran"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default BayarSkema;