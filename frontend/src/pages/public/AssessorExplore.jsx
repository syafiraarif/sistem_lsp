import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Loader2,
  Users,
  AlertCircle,
  X,
} from "lucide-react";
import AssessorCard from "../../components/assessors/AssessorCard";

const API_URL = "http://localhost:3000/api/public";

export default function AssessorExplore() {
  const [assessors, setAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBackToHome = () => {
    sessionStorage.setItem("simlsp-home-scroll-target", "assessor-section");
    navigate("/");
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    const fetchAllAssessors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/asesor`);

        const result =
          response.data?.success &&
          Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (isMounted) {
          setAssessors(result);
        }
      } catch (err) {
        console.error("Gagal mengambil direktori asesor:", err);

        if (isMounted) {
          setError("Koneksi ke server terputus. Silakan coba kembali.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllAssessors();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAssessors = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return assessors;

    return assessors.filter((item) => {
      const searchable = [
        item.name,
        item.nama_lengkap,
        item.competency,
        item.bidang_keahlian,
        item.institution,
        item.institut_asal,
        item.no_reg_asesor,
        item.no_lisensi,
        item.email,
        item.no_hp,
        item.kota_domisili,
        item.provinsi_domisili,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [assessors, searchTerm]);

  return (
    <main className="min-h-screen bg-slate-50/70 pb-24 pt-5">
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[380px] w-full bg-gradient-to-b from-white to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <button
          type="button"
          onClick={handleBackToHome}
          className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#071E3D] transition-colors hover:text-[#CC6B27]"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1"
          />
          Kembali ke Beranda
        </button>

        <div className="mb-10 w-full max-w-[430px]">
          <label
            htmlFor="search-assessor"
            className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/55"
          >
            Cari Asesor
          </label>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />

            <input
              id="search-assessor"
              type="text"
              placeholder="Cari nama, bidang keahlian, atau institusi..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-11 text-sm font-semibold text-[#071E3D] shadow-sm outline-none transition-colors placeholder:font-medium placeholder:text-slate-400 focus:border-[#CC6B27]"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#CC6B27]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 border-b border-[#071E3D]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[#071E3D]">
            <Users size={17} className="text-[#CC6B27]" />
            <h1 className="text-sm font-bold">Daftar Asesor Profesional</h1>
          </div>

          {!loading && !error && (
            <p className="text-[11px] font-semibold text-slate-400">
              Menampilkan {filteredAssessors.length} dari {assessors.length} asesor
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="mb-4 animate-spin text-[#CC6B27]" size={38} />
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">
              Memuat Data Asesor
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={42} />
            <p className="text-sm font-bold text-[#071E3D]">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#071E3D] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
            >
              Muat Ulang
            </button>
          </div>
        ) : filteredAssessors.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06 },
              },
            }}
            className="grid grid-cols-1 items-stretch justify-items-start gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredAssessors.map((assessor) => (
                <motion.div
                  key={assessor.id || assessor.id_user}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <AssessorCard {...assessor} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <Search size={23} />
            </div>

            <h2 className="text-base font-bold text-[#071E3D]">
              Asesor tidak ditemukan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tidak ada asesor yang sesuai dengan kata kunci pencarian.
            </p>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="mt-5 rounded-lg bg-[#071E3D] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#CC6B27]"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}