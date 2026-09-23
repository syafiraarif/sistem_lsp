import React from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AgendaCard({
  id,
  title,
  date,
  location,
  scheme,
  status
}) {
  const isOpen = status === "Dibuka";
  const isOngoing = status === "Berjalan";
  const navigate = useNavigate();

  const handleRegistration = () => {
    if (!isOpen) return;

    navigate("/pendaftaran", {
      state: {
        agendaTitle: title,
        agendaId: id
      }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.25,
        ease: "easeOut"
      }}
      className="group relative flex min-h-[500px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-20px_rgba(0,0,0,0.4)]"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-[#CC6B27]" />

      <div className="absolute right-0 top-0 h-28 w-28 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#CC6B27]/5" />

      <div className="relative flex flex-1 flex-col p-7 pl-8 md:p-8 md:pl-9">
        <div className="flex items-center justify-between gap-4">
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] ${
              isOpen
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : isOngoing
                ? "border-blue-100 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            {isOpen ? (
              <CheckCircle2 size={12} />
            ) : isOngoing ? (
              <Clock3 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {status}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#CC6B27]/15 bg-[#CC6B27]/5 text-[#CC6B27] transition-all duration-300 group-hover:border-[#CC6B27]/30 group-hover:bg-[#CC6B27] group-hover:text-white">
            <Clock3 size={18} />
          </div>
        </div>

        <div className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CC6B27]">
            Jadwal Uji Kompetensi
          </p>

          <h3 className="mt-2 text-[23px] font-black leading-tight text-[#071E3D]">
            {title}
          </h3>
        </div>

        <div className="my-7 h-px bg-slate-100" />

        <div className="flex-1">
          <Info
            icon={Calendar}
            label="Jadwal Pelaksanaan"
            value={date}
          />

          <div className="my-5 h-px bg-slate-100" />

          <Info
            icon={MapPin}
            label="Lokasi TUK"
            value={location}
          />

          <div className="my-5 h-px bg-slate-100" />

          <Info
            icon={BookOpen}
            label="Skema Kompetensi"
            value={scheme}
          />
        </div>

        <button
          type="button"
          onClick={handleRegistration}
          disabled={!isOpen}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-lg px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
            isOpen
              ? "bg-[#071E3D] text-white hover:bg-[#CC6B27]"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          {isOpen ? (
            <>
              Daftar Sekarang
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </>
          ) : (
            "Pendaftaran Ditutup"
          )}
        </button>
      </div>
    </motion.div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-[#CC6B27]/10 group-hover:text-[#CC6B27]">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {label}
        </p>

        <p className="mt-1 text-[12px] font-bold leading-snug text-slate-600">
          {value}
        </p>
      </div>
    </div>
  );
}