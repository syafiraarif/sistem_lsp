import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";
import AssessorCard from "./AssessorCard";

const API_URL = "http://localhost:3000/api/public";

export default function AssessorList() {
  const [assessors, setAssessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/asesor`);

        if (
          response.data?.success &&
          Array.isArray(response.data?.data)
        ) {
          setAssessors(response.data.data);
        } else {
          setAssessors([]);
        }
      } catch (err) {
        console.error("Gagal mengambil data asesor:", err);
        setError("Data asesor belum tersedia saat ini.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessors();
  }, []);

  const displayedAssessors = assessors.slice(0, 4);

  return (
    <section className="border-t border-[#071E3D]/10 bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mb-12 text-center"
        >
          <motion.h2
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-3xl font-black leading-tight tracking-tight text-[#071E3D] md:text-4xl"
          >
            Tim Asesor{" "}
            <span className="relative inline-block text-[#CC6B27]">
              Profesional

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
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.1,
            }}
            className="mx-auto mt-7 max-w-2xl text-[14px] font-medium leading-relaxed text-[#182D4A]/60 md:text-[15px]"
          >
            Kenali asesor yang terlibat dalam proses sertifikasi
            kompetensi di LSP kami.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              className="mb-4 animate-spin text-[#CC6B27]"
              size={34}
            />

            <p className="text-[11px] font-bold uppercase tracking-widest text-[#182D4A]/50">
              Memuat Data Asesor
            </p>
          </div>
        ) : error || displayedAssessors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#071E3D]/25">
              <Info size={24} />
            </div>

            <p className="text-[14px] font-bold text-[#071E3D]">
              {error || "Data asesor belum tersedia."}
            </p>

            <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
              Silakan coba kembali beberapa saat lagi.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            variants={{
              hidden: {
                opacity: 0,
              },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatePresence>
              {displayedAssessors.map((assessor) => (
                <motion.div
                  key={assessor.id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 20,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                >
                  <AssessorCard {...assessor} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && !error && assessors.length > 4 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={() =>
                navigate("/explore-assessors")
              }
              className="group inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#CC6B27]"
            >
              Lihat Semua Asesor

              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}