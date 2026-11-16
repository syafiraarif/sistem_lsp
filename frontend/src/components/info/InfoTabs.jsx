import React from "react";
import { motion } from "framer-motion";
import Skema from "./Skema";

export default function InfoTabs() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-20">
      <section className="relative overflow-hidden bg-white px-6 pb-12 pt-14 md:pb-16 md:pt-16">
        <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-[#CC6B27]/[0.035] blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#071E3D]/[0.025] blur-[100px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.45 }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="text-3xl font-black tracking-tight text-[#071E3D] sm:text-4xl md:text-5xl"
          >
            Informasi <span className="text-[#CC6B27]">Uji Kompetensi</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base"
          >
            Temukan skema sertifikasi beserta persyaratan, biaya, unit kompetensi,
            dan jadwal pelaksanaan yang tersedia.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pt-8 md:pt-10">
        <Skema />
      </div>
    </main>
  );
}
