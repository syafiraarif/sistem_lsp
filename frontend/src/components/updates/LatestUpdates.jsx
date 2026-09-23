import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquareQuote,
  Quote,
  Star
} from "lucide-react";
import api from "../../services/api";

export default function LatestUpdates() {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  const pointerStart = useRef(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/public/feedback/active");

        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setTestimonials(data);
        setActiveIndex(0);
      } catch (err) {
        console.error("Gagal memuat feedback:", err);
        setError("Feedback belum tersedia saat ini.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const total = testimonials.length;

  const currentIndex = useMemo(() => {
    if (!total) return 0;

    return ((activeIndex % total) + total) % total;
  }, [activeIndex, total]);

  const goNext = () => {
    if (total < 2) return;
    setActiveIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (total < 2) return;
    setActiveIndex((prev) => prev - 1);
  };

  const getOffset = (index) => {
    let offset = index - currentIndex;

    if (offset > total / 2) {
      offset -= total;
    }

    if (offset < -total / 2) {
      offset += total;
    }

    return offset;
  };

  const visibleCards = useMemo(() => {
    if (!total) return [];

    return testimonials
      .map((item, index) => ({
        item,
        index,
        offset: getOffset(index)
      }))
      .filter(({ offset }) => Math.abs(offset) <= 3)
      .sort((a, b) => a.offset - b.offset);
  }, [testimonials, currentIndex, total]);

  const getPosition = (offset) => {
    const abs = Math.abs(offset);
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    if (isMobile) {
      const positions = {
        0: {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          blur: 0,
          rotate: 0
        },
        1: {
          x: 155,
          y: 35,
          scale: 0.78,
          opacity: 0.48,
          blur: 1.5,
          rotate: 4
        },
        2: {
          x: 285,
          y: 82,
          scale: 0.6,
          opacity: 0.22,
          blur: 3,
          rotate: 6
        },
        3: {
          x: 390,
          y: 145,
          scale: 0.44,
          opacity: 0.08,
          blur: 5,
          rotate: 8
        }
      };

      const position = positions[abs] || positions[3];

      return {
        ...position,
        x: offset < 0 ? -position.x : position.x,
        rotate: offset < 0 ? -position.rotate : position.rotate,
        zIndex: 40 - abs * 5
      };
    }

    if (isTablet) {
      const positions = {
        0: {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          blur: 0,
          rotate: 0
        },
        1: {
          x: 255,
          y: 38,
          scale: 0.8,
          opacity: 0.5,
          blur: 1.5,
          rotate: 4
        },
        2: {
          x: 480,
          y: 88,
          scale: 0.63,
          opacity: 0.23,
          blur: 3,
          rotate: 6
        },
        3: {
          x: 680,
          y: 155,
          scale: 0.47,
          opacity: 0.08,
          blur: 5,
          rotate: 8
        }
      };

      const position = positions[abs] || positions[3];

      return {
        ...position,
        x: offset < 0 ? -position.x : position.x,
        rotate: offset < 0 ? -position.rotate : position.rotate,
        zIndex: 40 - abs * 5
      };
    }

    const positions = {
      0: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        blur: 0,
        rotate: 0
      },
      1: {
        x: 360,
        y: 42,
        scale: 0.8,
        opacity: 0.52,
        blur: 1.5,
        rotate: 4
      },
      2: {
        x: 670,
        y: 95,
        scale: 0.63,
        opacity: 0.24,
        blur: 3,
        rotate: 6
      },
      3: {
        x: 930,
        y: 165,
        scale: 0.47,
        opacity: 0.08,
        blur: 5,
        rotate: 8
      }
    };

    const position = positions[abs] || positions[3];

    return {
      ...position,
      x: offset < 0 ? -position.x : position.x,
      rotate: offset < 0 ? -position.rotate : position.rotate,
      zIndex: 40 - abs * 5
    };
  };

  const getInitial = (name) => {
    if (!name) return "?";

    return name.trim().charAt(0).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return "Peserta";

    return role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handlePointerDown = (event) => {
    pointerStart.current = {
      x: event.clientX,
      pointerId: event.pointerId
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (!pointerStart.current) return;

    const difference =
      event.clientX - pointerStart.current.x;

    const threshold = width < 640 ? 40 : 60;

    if (
      event.currentTarget.hasPointerCapture(
        pointerStart.current.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        pointerStart.current.pointerId
      );
    }

    pointerStart.current = null;

    if (difference < -threshold) {
      goNext();
      return;
    }

    if (difference > threshold) {
      goPrev();
    }
  };

  const handlePointerCancel = (event) => {
    if (!pointerStart.current) return;

    if (
      event.currentTarget.hasPointerCapture(
        pointerStart.current.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        pointerStart.current.pointerId
      );
    }

    pointerStart.current = null;
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-52 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#CC6B27]/5 blur-[110px]" />

      <div className="pointer-events-none absolute -right-52 top-1/3 h-[500px] w-[500px] rounded-full bg-[#071E3D]/5 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 18
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            duration: 0.5
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto mb-5 h-1 w-12 bg-[#CC6B27]" />

          <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-[#071E3D] md:text-5xl lg:text-6xl">
            Feedback{" "}
            <span className="relative inline-block text-[#CC6B27]">
              Para Peserta
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5C20 2.5 40 2.5 60 5C80 7.5 100 7 100 4"
                  stroke="#CC6B27"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="mt-4 text-sm font-medium leading-7 text-slate-500 md:text-base">
            Dengarkan pengalaman peserta yang telah mengikuti proses
            sertifikasi melalui layanan kami.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-2 max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-[39%] h-[250px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#071E3D]/[0.03]" />

          <div className="pointer-events-none absolute left-1/2 top-[39%] h-[190px] w-[660px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#CC6B27]/[0.05]" />

          <div className="relative h-[535px] overflow-hidden">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5">
                  <MessageSquareQuote
                    size={21}
                    className="text-[#CC6B27]"
                  />
                </div>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Memuat feedback...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5">
                  <MessageSquareQuote
                    size={21}
                    className="text-[#CC6B27]"
                  />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#071E3D]">
                  {error}
                </p>

                <p className="mt-2 text-[11px] text-slate-400">
                  Silakan coba kembali beberapa saat lagi.
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              total === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#CC6B27]/20 bg-[#CC6B27]/5">
                    <MessageSquareQuote
                      size={21}
                      className="text-[#CC6B27]"
                    />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#071E3D]">
                    Belum Ada Feedback
                  </p>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Feedback peserta akan tampil di sini.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              total > 0 &&
              visibleCards.map(({ item, index, offset }) => {
                const position = getPosition(offset);
                const isActive = offset === 0;

                return (
                  <motion.div
                    key={`${item.id_feedback}-${index}`}
                    className="absolute left-1/2 top-[34%] w-[330px] sm:w-[430px] md:w-[500px]"
                    initial={false}
                    animate={{
                      x: `calc(-50% + ${position.x}px)`,
                      y: `calc(-50% + ${position.y}px)`,
                      scale: position.scale,
                      opacity: position.opacity,
                      rotate: position.rotate,
                      filter: `blur(${position.blur}px)`
                    }}
                    transition={{
                      duration: 0.58,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    style={{
                      zIndex: position.zIndex
                    }}
                  >
                    <motion.div
                      onPointerDown={
                        isActive
                          ? handlePointerDown
                          : undefined
                      }
                      onPointerUp={
                        isActive
                          ? handlePointerUp
                          : undefined
                      }
                      onPointerCancel={
                        isActive
                          ? handlePointerCancel
                          : undefined
                      }
                      onClick={() => {
                        if (!isActive) {
                          setActiveIndex(index);
                        }
                      }}
                      className={`relative min-h-[235px] overflow-visible select-none rounded-xl border bg-white ${
                        isActive
                          ? "cursor-grab border-slate-200 shadow-[0_28px_70px_-28px_rgba(7,30,61,0.28)]"
                          : "cursor-pointer border-slate-100 shadow-[0_15px_35px_-20px_rgba(7,30,61,0.15)]"
                      }`}
                    >
                      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#CC6B27]" />

                      <div className="absolute right-7 top-5 text-[#071E3D]/[0.035]">
                        <Quote
                          size={68}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="relative flex min-h-[235px] flex-col px-7 pb-7 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
                        <div className="flex items-center justify-between pr-10">
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#CC6B27]">
                              Feedback Peserta
                            </p>

                            <div className="mt-2 h-px w-8 bg-[#CC6B27]" />
                          </div>
                        </div>

                        <div className="my-5 h-px bg-slate-100" />

                        <div className="flex flex-1 items-center">
                          <p className="max-w-[440px] text-[15px] font-semibold leading-7 text-[#071E3D] sm:text-base">
                            “{item.pesan || "Tidak ada pesan."}”
                          </p>
                        </div>

                        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#071E3D] text-sm font-black text-white">
                            {getInitial(item.nama_lengkap)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-[13px] font-bold text-[#071E3D]">
                              {item.nama_lengkap || "Peserta"}
                            </h3>

                            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#CC6B27]">
                              {formatRole(item.peran)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-1/2 z-30 flex h-11 -translate-x-1/2 translate-y-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 shadow-[0_8px_25px_-10px_rgba(7,30,61,0.3)]">
                        {[...Array(5)].map((_, starIndex) => {
                          const filled =
                            starIndex < Number(item.rating || 0);

                          return (
                            <Star
                              key={starIndex}
                              size={15}
                              className={
                                filled
                                  ? "text-[#CC6B27]"
                                  : "text-slate-200"
                              }
                              fill={
                                filled
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

            {!loading &&
              !error &&
              total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-[34%] z-50 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#071E3D] shadow-sm transition-all duration-300 hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white md:left-10"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-[34%] z-50 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#071E3D] shadow-sm transition-all duration-300 hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white md:right-10"
                  >
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
          </div>

          {!loading &&
            !error &&
            total > 1 && (
              <div className="flex justify-center gap-2 pt-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-[#CC6B27]"
                        : "w-1.5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}