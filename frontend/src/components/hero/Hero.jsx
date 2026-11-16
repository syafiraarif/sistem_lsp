import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const advantages = [
    "Pendaftaran Real-time Online",
    "Manajemen Asesor Terintegrasi",
    "Penjadwalan Otomatis TUK",
    "E-Sertifikat & Validasi QR",
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[#CC6B27]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[#071E3D]/10 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="z-10"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-black leading-[1.1] text-[#071E3D] md:text-6xl xl:text-7xl"
          >
            Sistem <br /> Informasi <br />
            <span className="relative text-[#CC6B27]">
              Manajemen LSP
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5C20 2 40 2 60 5C80 8 100 8 100 5"
                  stroke="#CC6B27"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-gray-500 md:text-xl"
          >
            Platform digital terpadu untuk percepatan sertifikasi kompetensi nasional.
            Kelola pendaftaran, asesmen, hingga penerbitan sertifikat dalam satu pintu.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={() => navigate("/pendaftaran")}
              className="group flex items-center gap-2 rounded-xl bg-[#CC6B27] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#CC6B27]/20 transition-all hover:bg-[#A8561F]"
            >
              Daftar Uji Kompetensi
              <ChevronRight
                className="transition-transform group-hover:translate-x-1"
                size={18}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/informasi", {
                  state: {
                    activeTab: "skema",
                  },
                })
              }
              className="rounded-xl border-2 border-[#071E3D]/10 px-8 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
            >
              Lihat Skema Kami
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative w-full lg:ml-auto lg:max-w-[620px]"
        >
          <div className="relative z-20 rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_24px_56px_-20px_rgba(7,30,61,0.16)] md:p-10">
            <h3 className="mb-7 text-2xl font-black tracking-tight text-[#071E3D] md:text-[27px]">
              Keunggulan <span className="text-[#CC6B27]">Utama</span>
            </h3>

            <div className="space-y-3.5">
              {advantages.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 transition-colors hover:border-[#CC6B27]/30 hover:bg-[#CC6B27]/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#CC6B27] shadow-sm transition-colors group-hover:bg-[#CC6B27] group-hover:text-white">
                    <CheckCircle2 size={20} />
                  </div>

                  <span className="text-sm font-bold text-[#071E3D]">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
