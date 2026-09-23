import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import FAQItem from "./FAQItem";

export default function FAQSection() {
  const [activeId, setActiveId] = useState(null);

  const faqList = [
    {
      id: 1,
      question: "Apa itu Lembaga Sertifikasi Profesi (LSP)?",
      answer:
        "Lembaga Sertifikasi Profesi (LSP) adalah lembaga yang berwenang melakukan sertifikasi kompetensi kerja sesuai dengan standar nasional yang ditetapkan oleh BNSP.",
    },
    {
      id: 2,
      question: "Siapa saja yang dapat mengikuti uji kompetensi?",
      answer:
        "Mahasiswa, lulusan baru, maupun tenaga kerja profesional yang memenuhi persyaratan sesuai skema sertifikasi.",
    },
    {
      id: 3,
      question: "Bagaimana cara mendaftar uji kompetensi?",
      answer:
        "Pendaftaran dilakukan melalui sistem SIMLSP dengan mengisi formulir dan mengunggah dokumen pendukung.",
    },
    {
      id: 4,
      question: "Apakah sertifikat yang diterbitkan resmi?",
      answer:
        "Ya. Sertifikat diterbitkan secara resmi dan diakui secara nasional melalui BNSP.",
    },
    {
      id: 5,
      question: "Di mana lokasi Tempat Uji Kompetensi (TUK)?",
      answer:
        "TUK dapat dilaksanakan secara luring di lokasi yang ditentukan atau secara daring sesuai kebijakan.",
    },
  ];

  const toggleFAQ = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#CC6B27]/[0.035] blur-[100px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#071E3D]/[0.025] blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mb-4 flex justify-center"
          >
            <div className="h-1 w-10 bg-[#CC6B27]" />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.4,
              delay: 0.05,
            }}
            className="flex items-center justify-center gap-2 text-[#CC6B27]"
          >
          </motion.div>

          <motion.h2
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            className="mt-3 text-3xl font-black tracking-tight text-[#071E3D] sm:text-4xl md:text-[42px]"
          >
            Frequently Asked{" "}
            <span className="relative inline-block text-[#CC6B27]">
              Questions
              <svg
                className="absolute -bottom-3 left-0 h-[9px] w-full"
                viewBox="0 0 100 9"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 5.5C18 2.5 33 2.5 49 5C65 7.5 82 8 99 4.5"
                  stroke="#CC6B27"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
              delay: 0.12,
            }}
            className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base"
          >
            Temukan jawaban atas pertanyaan yang paling sering diajukan
            terkait sertifikasi kompetensi melalui SIMLSP.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="mt-10 space-y-3 sm:mt-12"
        >
          {faqList.map((faq) => (
            <motion.div
              key={faq.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 12,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.35,
                  },
                },
              }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={activeId === faq.id}
                onClick={() => toggleFAQ(faq.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.4,
            delay: 0.2,
          }}
          className="mt-10"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                <HelpCircle size={17} />
              </div>

              <div>
                <p className="text-xs font-bold text-[#071E3D]">
                  Masih memiliki pertanyaan?
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Hubungi helpdesk untuk mendapatkan informasi lebih lanjut.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#071E3D] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-[#CC6B27]"
            >
              Hubungi Helpdesk
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}