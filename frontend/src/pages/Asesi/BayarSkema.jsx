// src/pages/asesi/BayarSkema.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";

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

        // 1️⃣ Ambil detail skema & tujuan transfer
        const detailRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const detailData = detailRes.data?.data;
        if (!detailData) throw new Error("Data detail pembayaran tidak tersedia");

        setSkemaJudul(detailData.skema || "");
        setHarga(detailData.harga ?? 0);
        setTujuanTransfer(detailData.tujuan_transfer || []);

        // 2️⃣ Ambil status pembayaran
        try {
          const statusRes = await axios.get(`${API_BASE}/asesi/pembayaran/${id_skema}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const statusData = statusRes.data?.data;
          const status = statusData?.status || "belum bayar";
          setStatusPembayaran(status);

          // Redirect jika sudah paid
          if (status === "paid") {
            alert("Pembayaran sudah selesai. Anda bisa melanjutkan APL01.");
            navigate(`/asesi/apl01/${id_skema}`);
          }
        } catch (statusErr) {
          // Jika 404, anggap belum ada pembayaran
          if (statusErr.response?.status === 404) {
            setStatusPembayaran("belum bayar");
          } else {
            console.error(statusErr);
            setError(statusErr.response?.data?.message || statusErr.message || "Gagal mengambil status pembayaran");
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Gagal mengambil detail pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, id_skema, navigate]);

  const handleSubmit = async () => {
    if (statusPembayaran === "pending") return;

    if (metode === "transfer_rekening" && !selectedTujuan) {
      return alert("Pilih tujuan transfer terlebih dahulu");
    }

    if (metode === "tunai") setJalur("tunai");

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const body = {
        id_skema,
        metode_pembayaran: metode,
        jalur_pembayaran: jalur,
        id_tujuan_transfer: selectedTujuan || null,
      };

      const res = await axios.post(`${API_BASE}/asesi/pembayaran/submit`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const struk = res.data?.data;
      if (!struk) throw new Error("Respon pembayaran tidak valid");

      alert(
        `Berhasil membuat pembayaran!\n\nSkema: ${struk.skema}\nNominal: Rp ${Number(
          struk.nominal
        ).toLocaleString("id-ID")}\nMetode: ${struk.metode_pembayaran}\nInstruksi: ${struk.instruksi}`
      );

      navigate(`/asesi/apl01/${id_skema}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Terjadi kesalahan saat submit pembayaran");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!skemaJudul) return <div className="p-6 text-red-600">Skema tidak ditemukan</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarAsesi isOpen={true} setIsOpen={() => {}} />
      <div className="flex-1 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#071E3D] mb-4">Bayar Skema: {skemaJudul}</h2>

        <p className="mb-2">Harga: Rp {Number(harga).toLocaleString("id-ID")}</p>
        <p className="mb-4 font-semibold">Status Pembayaran: {statusPembayaran}</p>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Metode Pembayaran</label>
          <select
            value={metode}
            onChange={(e) => {
              const val = e.target.value;
              setMetode(val);
              setJalur(val === "tunai" ? "tunai" : "");
              if (val === "tunai") setSelectedTujuan("");
            }}
            className="border p-2 rounded w-full"
          >
            <option value="tunai">Tunai</option>
            <option value="transfer_rekening">Transfer Rekening</option>
          </select>
        </div>

        {metode === "transfer_rekening" && (
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Tujuan Transfer</label>
            <select
              value={selectedTujuan}
              onChange={(e) => setSelectedTujuan(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Pilih Tujuan</option>
              {tujuanTransfer.map((t) => (
                <option key={t.id_tujuan_transfer} value={t.id_tujuan_transfer}>
                  {t.nama_bank} - {t.nomor_rekening} ({t.nama_pemilik})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className={`px-4 py-2 rounded text-white ${
            statusPembayaran === "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleSubmit}
          disabled={statusPembayaran === "pending"}
        >
          {statusPembayaran === "pending"
            ? "Pembayaran Sedang Diproses..."
            : "Submit Pembayaran"}
        </button>
      </div>
    </div>
  );
};

export default BayarSkema;