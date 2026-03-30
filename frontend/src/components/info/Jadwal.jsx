import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // IMPORT INI
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
  const navigate = useNavigate(); // INISIALISASI NAVIGATE
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Jadwal asesmen belum tersedia saat ini.");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSchedules = schedules.filter(item =>
    item.skema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tuk?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    const date = new Date(tgl);
    return isNaN(date.getTime()) ? tgl : date.toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const formatJenis = (jenis) => {
    const map = {
      luring: "Uji Sertifikasi Luring (Offline)",
      daring: "Uji Sertifikasi Daring (Online)",
      hybrid: "Uji Sertifikasi Hybrid",
      onsite: "Uji Sertifikasi On-Site"
    };
    return map[jenis] || "Uji Sertifikasi";
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* HEADER & SEARCH (Disederhanakan untuk jawaban ini) */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#071E3D]">Jadwal <span className="text-orange-500">Asesmen</span></h2>
        </div>

        <div className="max-w-2xl mx-auto mb-12 relative">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input
            type="text"
            placeholder="Cari skema..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredSchedules.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
                >
                  <div className="flex justify-between mb-8">
                    <span className="px-4 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase">{formatJenis(item.jenis)}</span>
                    <div className="text-orange-500 font-black text-[10px]">● {item.status}</div>
                  </div>

                  <h3 className="text-xl font-black text-[#071E3D] mb-6">{item.skema}</h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-sm font-bold"><Calendar size={18}/> {formatTanggal(item.tanggal)}</div>
                    <div className="flex items-center gap-4 text-sm font-bold"><Clock size={18}/> {item.waktu || "08:00 - Selesai"}</div>
                    <div className="flex items-center gap-4 text-sm font-bold"><MapPin size={18}/> {item.tuk}</div>
                  </div>

                  {/* ACTION: NAVIGASI KE DETAIL */}
                  <button 
                    onClick={() => navigate(`/jadwal-detail/${item.id}`, { state: { schedule: item } })}
                    className="w-full py-4 rounded-2xl bg-[#071E3D] text-white text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition"
                  >
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