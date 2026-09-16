import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Target,
  Eye,
  Building2,
  CalendarDays,
  FileBadge2
} from "lucide-react";

import about1 from "../../assets/images/about/about-1.jpg";
import about2 from "../../assets/images/about/about-2.jpg";
import about3 from "../../assets/images/about/about-3.jpg";
import about4 from "../../assets/images/about/about-4.jpg";

const slides = [
  {
    image: about1,
    title: "Lembaga Sertifikasi Profesi",
    highlight: "Pustaka Ilmiah Elektronik",
    description: "Profesional, kompeten, dan berorientasi pada peningkatan mutu sumber daya manusia."
  },
  {
    image: about2,
    title: "Sertifikasi Kompetensi",
    highlight: "yang Terukur",
    description: "Mendorong pengakuan kompetensi sesuai standar kebutuhan profesi dan industri."
  },
  {
    image: about3,
    title: "Penguatan Kompetensi",
    highlight: "Profesional",
    description: "Mendukung tenaga profesional dalam bidang pustaka dan terbitan ilmiah."
  },
  {
    image: about4,
    title: "Pustaka Ilmiah",
    highlight: "Berkualitas",
    description: "Berkomitmen mendukung kualitas publikasi ilmiah Indonesia yang berdaya saing."
  }
];

const accordionItems = [
  {
    title: "Visi",
    icon: Eye,
    content:
      "Menjadi Lembaga Sertifikasi Profesi yang Unggul, Profesional, dan Kompeten dalam Bidang Perpustakaan dan Terbitan Ilmiah dalam skala Nasional maupun Internasional."
  },
  {
    title: "Tujuan",
    icon: Target,
    content:
      "Menciptakan sumber daya manusia yang kompeten dan memiliki karakteristik unggul serta profesional di dunia terbitan berkala ilmiah."
  },
  {
    title: "Misi",
    icon: ShieldCheck,
    content: [
      "Memberikan pelayanan uji sertifikasi kompetensi yang mengutamakan mutu dan kepuasan pelanggan.",
      "Memberikan jaminan bahwa proses uji sertifikasi dilaksanakan dengan kejujuran, teliti, tepat, akurat, efisien, dan efektif.",
      "Mengembangkan tersedianya tenaga kerja yang kompeten, profesional, dan kompetitif di bidang Perpustakaan dan Terbitan Ilmiah.",
      "Mengembangkan sarana dan prasarana standar kompetensi kerja di bidang Perpustakaan dan Terbitan Ilmiah secara konsisten dan berkesinambungan sesuai dengan perkembangan dan kebutuhan industri ataupun profesi.",
      "Mengembangkan tata kelola tenaga asesor kompetensi yang berkualifikasi dan bersertifikat sesuai dengan ruang lingkup sertifikasi LSP Pustaka Ilmiah Elektronik.",
      "Mengembangkan perangkat asesmen.",
      "Mengembangkan sistem pendukung berbasis teknologi dan informasi."
    ]
  }
];

export default function About() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(0);
  const [dragStart, setDragStart] = useState(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion((prev) => (prev === index ? null : index));
  };

  const handleDragStart = (_, info) => {
    setDragStart(info.point.x);
  };

  const handleDragEnd = (_, info) => {
    if (dragStart === null) return;

    const difference = info.point.x - dragStart;

    if (Math.abs(difference) > 60) {
      if (difference < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setDragStart(null);
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#071E3D]">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="relative h-[560px] cursor-grab overflow-hidden active:cursor-grabbing md:h-[650px]"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable="false"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-[#071E3D]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E3D]/80 via-transparent to-black/10" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45 }}
                  className="max-w-3xl"
                >
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-5 py-2.5 backdrop-blur-md">
                    <Building2 size={15} className="text-orange-400" />

                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-300">
                      Tentang Kami
                    </span>
                  </div>

                  <h1 className="text-4xl font-black leading-[1.05] text-white md:text-6xl lg:text-7xl">
                    {slides[currentSlide].title}
                    <span className="mt-2 block text-orange-500">
                      {slides[currentSlide].highlight}
                    </span>
                  </h1>

                  <p className="mt-7 max-w-2xl text-sm font-medium leading-relaxed text-white/75 md:text-lg">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            onClick={prevSlide}
            aria-label="Foto sebelumnya"
            className="absolute left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-all hover:border-orange-400 hover:bg-orange-500 md:left-8"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Foto berikutnya"
            className="absolute right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition-all hover:border-orange-400 hover:bg-orange-500 md:right-8"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Lihat foto ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-9 bg-orange-500"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-7 right-6 z-20 hidden rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/60 backdrop-blur-md md:block">
            Swipe untuk melihat foto
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-orange-500/[0.04] blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[450px] w-[450px] rounded-full bg-[#071E3D]/[0.03] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_0.75fr]">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileBadge2 size={15} className="text-orange-500" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                  Lembaga Sertifikasi Profesi Pustaka Ilmiah Elektronik
                </span>
              </div>

              <h2 className="text-3xl font-black leading-tight text-[#071E3D] md:text-4xl">
                Lembaga Sertifikasi Profesi
                <span className="block text-orange-500">
                  Pustaka Ilmiah Elektronik
                </span>
              </h2>

              <div className="mt-8 space-y-6 text-sm font-medium leading-[1.9] text-slate-500 md:text-base">
                <p>
                  Lembaga Sertifikasi Profesi Pustaka Ilmiah Elektronik
                  (LSP-PIE) adalah lembaga sertifikasi pihak ketiga resmi
                  (LSP-P3) yang berlisensi BNSP dengan nomor SK lisensi
                  <span className="font-black text-[#071E3D]">
                    {" "}KEP.2321/BNSP/IX/2024
                  </span>{" "}
                  dan nomor lisensi
                  <span className="font-black text-[#071E3D]">
                    {" "}BNSP-LSP-2542-ID.
                  </span>
                </p>

                <p>
                  Lembaga Sertifikasi Pustaka Ilmiah Elektronik (LSP PIE)
                  adalah lembaga sertifikasi resmi yang berfokus pada
                  peningkatan kompetensi sumber daya manusia di bidang
                  pengelolaan pustaka ilmiah, khususnya jurnal ilmiah
                  elektronik.
                </p>

                <p>
                  Kami hadir untuk memastikan para profesional di bidang
                  pengelolaan jurnal seperti editor, reviewer, manajer jurnal,
                  dan teknisi penerbitan elektronik memiliki standar kompetensi
                  yang sesuai dengan kebutuhan industri dan perkembangan
                  teknologi informasi.
                </p>

                <p>
                  Sertifikasi yang kami selenggarakan mengacu pada Standar
                  Kompetensi Kerja Nasional Indonesia (SKKNI) dan dirancang
                  untuk mendukung kualitas publikasi ilmiah Indonesia yang
                  berdaya saing global.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1"
            >
              <InfoCard
                icon={Award}
                title="Lisensi BNSP"
                value="BNSP-LSP-2542-ID"
              />

              <InfoCard
                icon={CalendarDays}
                title="Tanggal Berdiri"
                value="27 September 2024"
              />

              <InfoCard
                icon={ShieldCheck}
                title="Jenis Lembaga"
                value="LSP Pihak Ketiga"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <ShieldCheck size={15} className="text-orange-500" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                Arah & Komitmen
              </span>
            </div>

            <h2 className="text-3xl font-black text-[#071E3D] md:text-4xl">
              Visi, Tujuan & Misi
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 md:text-base">
              Landasan yang menjadi arah pengembangan LSP Pustaka Ilmiah Elektronik.
            </p>
          </motion.div>

          <div className="space-y-4">
            {accordionItems.map((item, index) => {
              const Icon = item.icon;
              const isOpen = openAccordion === index;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`overflow-hidden rounded-[28px] border bg-white shadow-sm transition-all duration-300 ${
                    isOpen
                      ? "border-orange-200 shadow-[0_20px_50px_-30px_rgba(204,107,39,0.35)]"
                      : "border-slate-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                          isOpen
                            ? "bg-orange-500 text-white"
                            : "bg-orange-50 text-orange-500"
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      <span className="text-base font-black text-[#071E3D] md:text-lg">
                        {item.title}
                      </span>
                    </div>

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isOpen
                          ? "rotate-90 bg-[#071E3D] text-white"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <ChevronRight size={18} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-slate-100 px-6 pb-7 pt-5">
                          {Array.isArray(item.content) ? (
                            <ol className="space-y-4 pl-5">
                              {item.content.map((mission, missionIndex) => (
                                <li
                                  key={missionIndex}
                                  className="text-sm font-medium leading-relaxed text-slate-600 md:text-base"
                                >
                                  {mission}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-sm font-medium leading-relaxed text-slate-600 md:text-base">
                              {item.content}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071E3D] py-20">
        <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
              LSP Pustaka Ilmiah Elektronik
            </span>

            <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">
              Kompetensi yang Terukur,
              <span className="text-orange-500">
                {" "}Profesionalisme yang Terjaga.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-blue-100/60 md:text-base">
              LSP-PIE berkomitmen menghadirkan proses sertifikasi kompetensi
              yang profesional, terukur, dan selaras dengan kebutuhan profesi.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-sm font-black text-[#071E3D]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}