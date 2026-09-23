import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users,
  Building2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import api from "../../services/api";

const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true });

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (value === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const end = Number(value) || 0;
    const totalMs = duration * 1000;
    const incrementTime = Math.max(totalMs / end, 10);
    const increment = Math.max(Math.ceil(end / 100), 1);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={countRef}>
      {count.toLocaleString("id-ID")}
    </span>
  );
};

export default function Statistics() {
  const [statistics, setStatistics] = useState({
    asesor: 0,
    tuk: 0,
    skema: 0,
    asesi: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get("/public/statistics");
        const data = response.data?.data || {};

        setStatistics({
          asesor: Number(data.asesor) || 0,
          tuk: Number(data.tuk) || 0,
          skema: Number(data.skema) || 0,
          asesi: Number(data.asesi) || 0,
        });
      } catch (error) {
        console.error("Gagal mengambil statistik SIMLSP:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const stats = [
    {
      id: 1,
      value: statistics.asesor,
      label: "Asesor Tersertifikasi",
      icon: <GraduationCap size={28} />,
    },
    {
      id: 2,
      value: statistics.tuk,
      label: "Tempat Uji Kompetensi",
      icon: <Building2 size={28} />,
    },
    {
      id: 3,
      value: statistics.skema,
      label: "Skema Sertifikasi",
      icon: <ClipboardCheck size={28} />,
    },
    {
      id: 4,
      value: statistics.asesi,
      label: "Peserta Tersertifikasi",
      icon: <Users size={28} />,
    },
  ];

  return (
    <section className="border-t border-[#071E3D]/10 bg-[#071E3D] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Statistik{" "}
            <span className="text-[#CC6B27]">
              SIMLSP
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1 w-14 rounded-full bg-[#CC6B27]" />

          <p className="mx-auto mt-6 max-w-2xl text-[14px] font-medium leading-relaxed text-white/60 md:text-[15px]">
            Data capaian real-time pelaksanaan sertifikasi kompetensi
            nasional yang terukur dan akurat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
              }}
              className="group rounded-xl border border-white/10 bg-white/[0.04] p-7 text-center transition-all duration-300 hover:border-[#CC6B27]/50 hover:bg-white/[0.07]"
            >
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27] transition-all duration-300 group-hover:bg-[#CC6B27] group-hover:text-white">
                {item.icon}
              </div>

              <div className="mb-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                {loading ? (
                  <span className="mx-auto block h-10 w-20 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <Counter value={item.value} />
                )}
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 group-hover:text-white/70">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}