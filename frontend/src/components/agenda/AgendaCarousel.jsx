import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Info, Loader2 } from "lucide-react";
import axios from "axios";
import AgendaCard from "./AgendaCard";

const API_URL = "http://localhost:3000/api/public";

export default function AgendaCarousel() {
  const sliderRef = useRef(null);

  const [agendaList, setAgendaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = 390;
  const GAP = 28;
  const TOTAL_WIDTH = CARD_WIDTH + GAP;

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/jadwal`);
        const data = response.data;

        if (!data || data.length === 0) {
          setAgendaList([]);
          return;
        }

        const mappedData = data.map((item) => {
          const dateObj = new Date(item.tgl_awal);

          const formattedDate = isNaN(dateObj.getTime())
            ? "-"
            : dateObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              });

          return {
            id: item.id_jadwal,
            title: item.nama_kegiatan || "Uji Kompetensi",
            date: formattedDate,
            location: item.tuk?.nama_tuk || "TUK Belum Ditentukan",
            scheme: item.nama_kegiatan || "Skema Sertifikasi",
            status:
              item.status === "open"
                ? "Dibuka"
                : item.status === "ongoing"
                ? "Berjalan"
                : "Ditutup"
          };
        });

        setAgendaList(mappedData);
        setActiveIndex(mappedData.length * 2);
      } catch (err) {
        console.error("Gagal load Agenda:", err);
        setError("Jadwal asesmen belum tersedia saat ini.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, []);

  const extendedList =
    agendaList.length > 0
      ? [...agendaList, ...agendaList, ...agendaList, ...agendaList]
      : [];

  useEffect(() => {
    if (sliderRef.current && agendaList.length > 0) {
      sliderRef.current.style.scrollBehavior = "auto";
      sliderRef.current.scrollLeft =
        agendaList.length * 2 * TOTAL_WIDTH;
    }
  }, [agendaList, TOTAL_WIDTH]);

  const handleInfiniteScroll = () => {
    if (!sliderRef.current || agendaList.length === 0) return;

    const scrollLeft = sliderRef.current.scrollLeft;
    const index = Math.round(scrollLeft / TOTAL_WIDTH);

    setActiveIndex(index);

    if (scrollLeft >= agendaList.length * 3 * TOTAL_WIDTH) {
      sliderRef.current.style.scrollBehavior = "auto";
      sliderRef.current.scrollLeft =
        agendaList.length * 2 * TOTAL_WIDTH;
    } else if (scrollLeft <= agendaList.length * TOTAL_WIDTH) {
      sliderRef.current.style.scrollBehavior = "auto";
      sliderRef.current.scrollLeft =
        agendaList.length * 2 * TOTAL_WIDTH;
    }
  };

  const scrollByStep = (direction) => {
    if (!sliderRef.current) return;

    sliderRef.current.style.scrollBehavior = "smooth";

    const targetIndex =
      direction === "next"
        ? activeIndex + 1
        : activeIndex - 1;

    sliderRef.current.scrollLeft =
      targetIndex * TOTAL_WIDTH;
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-white/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/10">
          <Loader2
            className="animate-spin text-[#CC6B27]"
            size={22}
          />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em]">
          Memuat Agenda Terbaru...
        </p>
      </div>
    );
  }

  if (error || agendaList.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/10">
          <Info
            size={24}
            className="text-[#CC6B27]"
          />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white">
          {error || "Belum Ada Jadwal Tersedia"}
        </p>

        <p className="mt-2 max-w-sm text-[11px] leading-5 text-white/40">
          Silakan cek kembali nanti atau hubungi helpdesk kami.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.03]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <button
        type="button"
        onClick={() => scrollByStep("prev")}
        aria-label="Jadwal sebelumnya"
        className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-[#071E3D]/90 text-white/70 shadow-lg transition-all duration-300 hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white md:left-4"
      >
        <ArrowLeft size={17} />
      </button>

      <button
        type="button"
        onClick={() => scrollByStep("next")}
        aria-label="Jadwal berikutnya"
        className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-[#071E3D]/90 text-white/70 shadow-lg transition-all duration-300 hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white md:right-4"
      >
        <ArrowRight size={17} />
      </button>

      <div
        ref={sliderRef}
        onScroll={handleInfiniteScroll}
        className="flex gap-7 overflow-x-auto px-[12%] pb-4 pt-8 md:px-[20%]"
        style={{
          scrollSnapType: "x mandatory",
          msOverflowStyle: "none",
          scrollbarWidth: "none"
        }}
      >
        {extendedList.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`${item.id}-${index}`}
              className={`snap-center transition-all duration-500 ease-out ${
                isActive
                  ? "z-10 scale-100 opacity-100"
                  : "scale-[0.94] opacity-25"
              }`}
              style={{
                minWidth: CARD_WIDTH,
                maxWidth: CARD_WIDTH
              }}
            >
              <AgendaCard {...item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}