import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Building2, ClipboardCheck, GraduationCap } from "lucide-react";
import api from "../../services/api";

const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

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
    asesi: 0
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
          asesi: Number(data.asesi) || 0
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
      icon: <GraduationCap size={30} />
    },
    {
      id: 2,
      value: statistics.tuk,
      label: "Tempat Uji Kompetensi",
      icon: <Building2 size={30} />
    },
    {
      id: 3,
      value: statistics.skema,
      label: "Skema Sertifikasi",
      icon: <ClipboardCheck size={30} />
    },
    {
      id: 4,
      value: statistics.asesi,
      label: "Peserta Tersertifikasi",
      icon: <Users size={30} />
    }
  ];

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#071E3D] py-32">
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] opacity-40 [background-size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            Statistik <span className="text-orange-500">SIMLSP</span>
          </h2>

          <div className="mx-auto mt-6 h-1.5 w-16 rounded-full bg-orange-500" />

          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium text-blue-100/60">
            Data capaian real-time pelaksanaan sertifikasi kompetensi nasional yang terukur dan akurat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }} className="group relative rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm transition-all duration-500 hover:border-orange-500/50 hover:bg-white/10">
              <div className="absolute inset-0 rounded-3xl bg-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 text-orange-500 shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:bg-orange-500 group-hover:text-white">
                {item.icon}
              </div>

              <div className="relative mb-4 text-5xl font-black tracking-tighter text-white">
                {loading ? (
                  <span className="inline-block h-12 w-20 animate-pulse rounded-xl bg-white/10" />
                ) : (
                  <Counter value={item.value} />
                )}
              </div>

              <div className="relative text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/40 transition-colors duration-500 group-hover:text-blue-100/70">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}