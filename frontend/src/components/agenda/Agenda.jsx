import React from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardCheck,
  ShieldCheck
} from "lucide-react";
import AgendaCarousel from "./AgendaCarousel";

export default function Agenda() {
  const highlights = [
    {
      icon: <CalendarCheck size={18} />,
      title: "Jadwal Terintegrasi",
      desc: "Informasi pelaksanaan uji kompetensi dalam satu sistem."
    },
    {
      icon: <ClipboardCheck size={18} />,
      title: "Proses Sertifikasi",
      desc: "Pantau agenda sertifikasi sesuai jadwal yang tersedia."
    },
    {
      icon: <ShieldCheck size={18} />,
      title: "Sesuai Standar",
      desc: "Pelaksanaan sertifikasi mengikuti ketentuan yang berlaku."
    }
  ];

  return (
    <section className="relative overflow-hidden bg-[#071E3D] py-24 lg:py-32">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#CC6B27]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-blue-400/10 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.02]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{
              opacity: 0,
              x: -25
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5
            }}
            className="lg:col-span-5"
          >
            <div className="mb-6 h-1 w-12 bg-[#CC6B27]" />

            <h2 className="text-4xl font-black leading-[1.08] tracking-tight text-white md:text-5xl xl:text-6xl">
              Agenda{" "}
              <span className="text-[#CC6B27]">&</span>{" "}
              Jadwal
              <br />
              <span className="relative inline-block">
                Uji Kompetensi
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5C20 2.5 38 2.5 57 4C74 5.5 88 7 100 4"
                    stroke="#CC6B27"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-[14px] font-medium leading-7 text-blue-100/60 md:text-base">
              Akses informasi pelaksanaan sertifikasi kompetensi
              nasional dan temukan jadwal uji kompetensi yang
              tersedia melalui sistem informasi LSP.
            </p>

            <div className="mt-9 border-t border-white/10 pt-7">
              <div className="space-y-5">
                {highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 12
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0
                    }}
                    viewport={{
                      once: true
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.08
                    }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/10 text-[#CC6B27]">
                      {item.icon}
                    </div>

                    <div className="pt-0.5">
                      <h3 className="text-[12px] font-bold uppercase tracking-wider text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 max-w-sm text-[11px] font-medium leading-relaxed text-blue-100/45">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-9 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              <span className="h-px w-8 bg-[#CC6B27]" />
              Lihat jadwal yang tersedia
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.55
            }}
            className="relative lg:col-span-7"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[410px] w-[410px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#CC6B27]/10" />

            <div className="relative">
              <AgendaCarousel />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}