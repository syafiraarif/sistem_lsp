import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CalendarDays,
  MapPin,
  BadgeCheck
} from "lucide-react";
import Persyaratan from "./Persyaratan";
import Jadwal from "./Jadwal";
import TUK from "./TUK";
import Skema from "./Skema";

export default function InfoTabs() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("persyaratan");

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [location]);

  const tabs = [
    {
      key: "persyaratan",
      label: "Persyaratan",
      icon: ClipboardList
    },
    {
      key: "jadwal",
      label: "Jadwal",
      icon: CalendarDays
    },
    {
      key: "tuk",
      label: "Tempat Uji Kompetensi",
      icon: MapPin
    },
    {
      key: "skema",
      label: "Skema Kompetensi",
      icon: BadgeCheck
    }
  ];

  const activeTabData =
    tabs.find((tab) => tab.key === activeTab) || tabs[0];

  const ActiveIcon = activeTabData.icon;

  const renderContent = () => {
    switch (activeTab) {
      case "persyaratan":
        return <Persyaratan />;
      case "jadwal":
        return <Jadwal />;
      case "tuk":
        return <TUK />;
      case "skema":
        return <Skema />;
      default:
        return <Persyaratan />;
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#CC6B27]/[0.035] blur-[110px]" />

      <div className="pointer-events-none absolute left-0 top-[360px] h-[420px] w-[420px] rounded-full bg-[#071E3D]/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <header className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0
            }}
            animate={{
              opacity: 1,
              scaleX: 1
            }}
            transition={{
              duration: 0.5
            }}
            className="mx-auto mb-6 h-1 w-12 origin-center rounded-full bg-[#CC6B27]"
          />

          <motion.h1
            initial={{
              opacity: 0,
              y: 15
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.08
            }}
            className="text-4xl font-black tracking-tight text-[#071E3D] sm:text-5xl lg:text-6xl"
          >
            Informasi{" "}
            <span className="text-[#CC6B27]">
              Uji Kompetensi
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.16
            }}
            className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base"
          >
            Temukan informasi lengkap mengenai persyaratan,
            jadwal pelaksanaan, tempat uji kompetensi, dan
            skema sertifikasi.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.22
            }}
            className="relative mx-auto mt-7 h-8 w-[260px] sm:w-[340px]"
          >
            <svg
              viewBox="0 0 340 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
            >
              <path
                d="M8 16C55 16 63 6 103 6C142 6 149 26 180 26C212 26 223 6 262 6C299 6 313 16 332 16"
                stroke="#CC6B27"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.55"
              />

              <path
                d="M8 21C55 21 67 12 104 12C140 12 150 31 180 31C213 31 223 12 261 12C298 12 312 21 332 21"
                stroke="#071E3D"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.1"
              />
            </svg>
          </motion.div>
        </header>

        <div className="mx-auto mt-12 max-w-5xl sm:mt-14">
          <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-[0_18px_45px_-30px_rgba(7,30,61,0.2)]">
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`group flex min-h-[58px] items-center justify-center gap-2.5 rounded-lg px-3 py-3 text-center transition-all duration-300 ${
                      active
                        ? "bg-[#071E3D] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#071E3D]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`shrink-0 ${
                        active
                          ? "text-[#CC6B27]"
                          : "text-slate-400 group-hover:text-[#CC6B27]"
                      }`}
                    />

                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] leading-4 sm:text-[10px]">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.3
          }}
          className="mx-auto mt-8 max-w-6xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_20px_50px_-30px_rgba(7,30,61,0.18)]">
            <div className="border-b border-slate-100 px-6 py-5 md:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-[#CC6B27]" />

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Informasi
                    </p>

                    <h2 className="mt-1 text-lg font-black text-[#071E3D]">
                      {activeTabData.label}
                    </h2>
                  </div>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#CC6B27]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#071E3D]/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#071E3D]/10" />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}