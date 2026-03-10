import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, Info } from "lucide-react";
import axios from "axios";
import AgendaCard from "./AgendaCard";

const API_URL = "http://localhost:3000/api/public";

export default function AgendaCarousel() {

  const sliderRef = useRef(null);

  const [agendaList, setAgendaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CARD_WIDTH = 360;
  const GAP = 48;
  const TOTAL_WIDTH = CARD_WIDTH + GAP;

  const [activeIndex, setActiveIndex] = useState(0);

  /* ================= FETCH DATA ================= */

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

  /* ================= DUPLICATE ARRAY UNTUK INFINITE ================= */

  const extendedList =
    agendaList.length > 0
      ? [...agendaList, ...agendaList, ...agendaList, ...agendaList]
      : [];

  /* ================= SET POSISI AWAL ================= */

  useEffect(() => {

    if (sliderRef.current && agendaList.length > 0) {

      sliderRef.current.style.scrollBehavior = "auto";

      sliderRef.current.scrollLeft = agendaList.length * 2 * TOTAL_WIDTH;

    }

  }, [agendaList]);

  /* ================= HANDLE INFINITE ================= */

  const handleInfiniteScroll = () => {

    if (!sliderRef.current || agendaList.length === 0) return;

    const scrollLeft = sliderRef.current.scrollLeft;

    const index = Math.round(scrollLeft / TOTAL_WIDTH);

    setActiveIndex(index);

    if (scrollLeft >= agendaList.length * 3 * TOTAL_WIDTH) {

      sliderRef.current.style.scrollBehavior = "auto";

      sliderRef.current.scrollLeft = agendaList.length * 2 * TOTAL_WIDTH;

    } else if (scrollLeft <= agendaList.length * TOTAL_WIDTH) {

      sliderRef.current.style.scrollBehavior = "auto";

      sliderRef.current.scrollLeft = agendaList.length * 2 * TOTAL_WIDTH;

    }

  };

  /* ================= BUTTON SCROLL ================= */

  const scrollByStep = (direction) => {

    if (!sliderRef.current) return;

    sliderRef.current.style.scrollBehavior = "smooth";

    const targetIndex =
      direction === "next" ? activeIndex + 1 : activeIndex - 1;

    sliderRef.current.scrollLeft = targetIndex * TOTAL_WIDTH;

  };

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/70">
        <Loader2 className="animate-spin text-orange-500 mb-6" size={48} />
        <p className="font-bold text-sm tracking-[0.2em] uppercase">
          Memuat Agenda Terbaru...
        </p>
      </div>
    );

  }

  /* ================= EMPTY ================= */

  if (error || agendaList.length === 0) {

    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 mx-auto max-w-lg text-center border border-white/10 bg-white/5 rounded-[2.5rem] backdrop-blur-md">

        <Info size={40} className="mb-4 text-orange-500/80" />

        <p className="font-bold text-white tracking-widest uppercase text-sm mb-2">
          {error || "Belum Ada Jadwal Tersedia"}
        </p>

        <p className="text-white/50 text-xs">
          Silakan cek kembali nanti atau hubungi helpdesk kami.
        </p>

      </div>
    );

  }

  /* ================= CAROUSEL ================= */

  return (

    <div className="relative group/carousel">

      <button
        onClick={() => scrollByStep("prev")}
        className="absolute -left-16 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-2xl text-white hover:bg-orange-500 hover:scale-110 transition-all flex items-center justify-center shadow-2xl"
      >
        <ArrowLeft size={28} />
      </button>

      <button
        onClick={() => scrollByStep("next")}
        className="absolute -right-16 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-2xl text-white hover:bg-orange-500 hover:scale-110 transition-all flex items-center justify-center shadow-2xl"
      >
        <ArrowRight size={28} />
      </button>

      <div
        ref={sliderRef}
        onScroll={handleInfiniteScroll}
        className="flex gap-12 overflow-x-auto pb-10 px-[20%] md:px-[35%] scroll-smooth"
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
              className={`snap-center transition-all duration-700 ease-in-out
                ${
                  isActive
                    ? "scale-100 opacity-100 blur-0 z-10"
                    : "scale-90 opacity-30 blur-[2px]"
                }`}
              style={{ minWidth: CARD_WIDTH }}
            >

              <AgendaCard {...item} />

            </div>

          );

        })}

      </div>

    </div>

  );

}