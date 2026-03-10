import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  LayoutGrid,
  ArrowRight,
  Loader2,
  Info
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Jadwal() {

  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const response = await axios.get(`${API_URL}/jadwal`);

        const data = response.data;

        if (!data || data.length === 0) {
          setSchedules([]);
          return;
        }

        // Mapping backend → frontend format
        const mapped = data.map(item => ({
          id: item.id_jadwal,
          skema: item.nama_kegiatan,
          tanggal: item.tgl_awal,
          waktu: item.jam,
          jenis: item.pelaksanaan_uji,
          status: item.status,
          tuk: item.tuk?.nama_tuk,
          alamat: `${item.tuk?.kota || ""} ${item.tuk?.provinsi || ""}`
        }));

        setSchedules(mapped);

      } catch (err) {

        console.error("Gagal load Jadwal:", err);

        setError("Jadwal asesmen belum tersedia saat ini.");

        setSchedules([]);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  /* ================= SEARCH FILTER ================= */

  const filteredSchedules = schedules.filter(item =>
    item.skema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tuk?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= FORMAT TANGGAL ================= */

  const formatTanggal = (tgl) => {

    if (!tgl) return "-";

    const date = new Date(tgl);

    return isNaN(date.getTime())
      ? tgl
      : date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });

  };

  /* ================= FORMAT JENIS ================= */

  const formatJenis = (jenis) => {

    if (!jenis) return "Uji Sertifikasi";

    const map = {
      luring: "Uji Sertifikasi Luring (Offline)",
      daring: "Uji Sertifikasi Daring (Online)",
      hybrid: "Uji Sertifikasi Hybrid",
      onsite: "Uji Sertifikasi On-Site"
    };

    return map[jenis] || jenis;

  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#071E3D]/[0.02] rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* HEADER */}

        <div className="text-center mb-16">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-orange-100"
          >
            <LayoutGrid size={14} /> Schedule Events
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-[#071E3D] mb-6">
            Jadwal Pelaksanaan <span className="text-orange-500">Asesmen</span>
          </h2>

          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Pantau jadwal uji kompetensi terbaru dan lokasi TUK yang tersedia.
          </p>

        </div>

        {/* SEARCH */}

        <div className="max-w-2xl mx-auto mb-12 relative">

          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

          <input
            type="text"
            placeholder="Cari skema atau lokasi TUK..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

        {/* CONTENT */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-sm">
              Sedang memuat jadwal terbaru...
            </p>
          </div>

        ) : error || filteredSchedules.length === 0 ? (

          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">

            <Info size={48} className="mx-auto text-slate-300 mb-4" />

            <p className="text-slate-500 font-bold">
              {error || "Jadwal tidak ditemukan."}
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <AnimatePresence>

              {filteredSchedules.map((item, index) => (

                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow hover:shadow-xl transition"
                >

                  <div className="flex justify-between mb-8">

                    <span className="px-4 py-1 rounded-full bg-[#071E3D]/5 text-[#071E3D] text-[10px] font-black uppercase">
                      {formatJenis(item.jenis)}
                    </span>

                    <div className="text-orange-500 font-black text-[10px] uppercase">
                      ● {item.status}
                    </div>

                  </div>

                  <h3 className="text-xl font-black text-[#071E3D] mb-6">
                    {item.skema}
                  </h3>

                  <div className="space-y-4 mb-8">

                    <div className="flex items-center gap-4">
                      <Calendar size={18} />
                      <p className="text-sm font-bold">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Clock size={18} />
                      <p className="text-sm font-bold">
                        {item.waktu || "08:00 - Selesai"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <MapPin size={18} />
                      <div>
                        <p className="text-sm font-bold">{item.tuk}</p>
                        <p className="text-xs text-slate-400">{item.alamat}</p>
                      </div>
                    </div>

                  </div>

                  <button className="w-full py-4 rounded-2xl bg-[#071E3D] text-white text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition">
                    Detail Jadwal <ArrowRight size={14} />
                  </button>

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

        )}

      </div>

    </section>
  );

}