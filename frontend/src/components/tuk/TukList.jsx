import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import TukCard from "./TukCard";

const API_URL = "http://localhost:3000/api/public";

export default function TukList() {
  const [tukList, setTukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchTuk = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/tuk`);

        const result = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        if (isMounted) {
          setTukList(result);
        }
      } catch (err) {
        console.error("Gagal mengambil data TUK:", err);

        if (isMounted) {
          setError("Data TUK belum dapat dimuat saat ini.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTuk();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExplore = () => {
    sessionStorage.setItem(
      "simlsp-home-scroll-target",
      "tuk-section"
    );

    navigate("/explore-tuk");
  };

  const displayedTuk = tukList.slice(0, 3);

  return (
    <section
      id="tuk-section"
      className="relative scroll-mt-24 overflow-hidden bg-[#071E3D] py-20 md:py-24"
    >
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#CC6B27]/10 blur-[110px]" />

      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[480px] w-[480px] rounded-full bg-blue-400/[0.07] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
            Tempat Uji{" "}
            <span className="relative inline-block text-[#CC6B27]">
              Kompetensi
              <svg
                className="absolute -bottom-3 left-0 w-full"
                height="9"
                viewBox="0 0 100 9"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5C20 2.5 40 2.5 60 5C78 7.5 91 7.5 100 5"
                  stroke="#CC6B27"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mx-auto mt-7 text-[14px] font-medium leading-relaxed text-blue-100/65 md:whitespace-nowrap md:text-[15px]">
            Kenali lokasi Tempat Uji Kompetensi yang terdaftar untuk mendukung pelaksanaan sertifikasi kompetensi.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              className="mb-4 animate-spin text-[#CC6B27]"
              size={34}
            />

            <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">
              Memuat Data TUK
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
              <Info size={24} />
            </div>

            <p className="text-sm font-bold text-white">{error}</p>

            <p className="mt-2 text-xs text-blue-100/50">
              Silakan coba kembali beberapa saat lagi.
            </p>
          </div>
        ) : displayedTuk.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="flex flex-wrap justify-center gap-5"
          >
            {displayedTuk.map((tuk) => (
              <motion.div
                key={tuk.id_tuk}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.35 }}
                className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] lg:max-w-[360px]"
              >
                <TukCard tuk={tuk} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
              <Info size={24} />
            </div>

            <p className="text-sm font-bold text-white">
              Data TUK belum tersedia.
            </p>
          </div>
        )}

        {!loading && !error && tukList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={handleExplore}
              className="group inline-flex items-center gap-2 rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-[#071E3D]"
            >
              Lihat Semua TUK

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}