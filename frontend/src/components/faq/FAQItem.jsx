import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
        isOpen
          ? "border-[#CC6B27]/40 shadow-[0_14px_35px_-28px_rgba(204,107,39,0.45)]"
          : "border-slate-200 hover:border-[#CC6B27]/30 hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all duration-300 ${
              isOpen
                ? "bg-[#CC6B27] text-white"
                : "bg-[#071E3D]/5 text-[#071E3D]"
            }`}
          >
            {String(question).match(/^\d+/)
              ? String(question).match(/^\d+/)[0]
              : "?"}
          </div>

          <span
            className={`text-sm font-bold leading-6 transition-colors duration-300 sm:text-[15px] ${
              isOpen ? "text-[#CC6B27]" : "text-[#071E3D]"
            }`}
          >
            {question}
          </span>
        </div>

        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
            isOpen
              ? "bg-[#CC6B27]/10 text-[#CC6B27]"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <ChevronDown size={17} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="flex gap-4">
                <div className="mt-1 h-5 w-1 shrink-0 rounded-full bg-[#CC6B27]" />

                <p className="text-xs font-medium leading-6 text-slate-500 sm:text-sm">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}