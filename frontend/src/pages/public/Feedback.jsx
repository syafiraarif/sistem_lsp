import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  User,
  MessageSquare,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Send,
  AlertTriangle,
  Star,
  HeartHandshake,
  ThumbsUp,
  Info,
  ShieldCheck
} from "lucide-react";

export default function FeedbackPublic() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    peran: "",
    pesan: "",
    rating: 5
  });

  const validateForm = () => {
    const newErrors = {};
    const { nama_lengkap, peran, pesan } = formData;

    if (!nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama wajib diisi";
    }

    if (!peran) {
      newErrors.peran = "Pilih kategori Anda";
    }

    if (!pesan || pesan.trim().length < 10) {
      newErrors.pesan =
        "Isi ulasan/feedback terlalu singkat (minimal 10 karakter).";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_lengkap") {
      const sanitized = value.replace(/[0-9]/g, "");

      setFormData((prev) => ({
        ...prev,
        [name]: sanitized
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleRating = (value) => {
    setFormData((prev) => ({
      ...prev,
      rating: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      await notifikasi.peringatan(
        "Validasi Gagal",
        "Periksa kembali data feedback yang Anda masukkan."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/public/feedback",
        formData
      );

      if (
        response.status === 200 ||
        response.status === 201
      ) {
        await notifikasi.sukses(
          "Feedback Berhasil Dikirim",
          "Terima kasih telah memberikan feedback untuk layanan SIMLSP."
        );

        setFormData({
          nama_lengkap: "",
          peran: "",
          pesan: "",
          rating: 5
        });

        setErrors({});
        setHoveredRating(0);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Gagal mengirim feedback.";

      await notifikasi.gagal(
        "Feedback Gagal Dikirim",
        errorMsg
      );
    } finally {
      setLoading(false);
    }
  };

  const ratingLabel = {
    1: "Sangat Kurang",
    2: "Kurang",
    3: "Cukup",
    4: "Baik",
    5: "Sangat Baik, Terima Kasih!"
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white py-16 lg:py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-[#CC6B27]/[0.04] blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-[#071E3D]/[0.03] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <header className="mb-8">
              <div className="mb-5 h-1 w-12 bg-[#CC6B27]" />

              <motion.h1
                initial={{
                  opacity: 0,
                  x: -20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  duration: 0.45
                }}
                className="text-4xl font-black tracking-tight text-[#071E3D] md:text-5xl"
              >
                Layanan{" "}
                <span className="text-[#CC6B27]">
                  Feedback & Ulasan
                </span>
              </motion.h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base">
                Suara Anda sangat berarti. Bagikan pengalaman
                Anda selama menggunakan layanan SIMLSP.
              </p>
            </header>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_20px_50px_-30px_rgba(7,30,61,0.18)]">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-5 md:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/15 text-[#CC6B27]">
                    <MessageSquare size={19} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Form Feedback
                    </p>

                    <h2 className="mt-1 text-base font-black text-white md:text-lg">
                      Kirim Ulasan & Feedback
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <InputGroup
                        label="Nama Lengkap*"
                        name="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                        placeholder="Nama lengkap Anda"
                        error={errors.nama_lengkap}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <SelectGroup
                        label="Bertindak Sebagai*"
                        name="peran"
                        value={formData.peran}
                        onChange={handleChange}
                        error={errors.peran}
                      >
                        <option value="">
                          Pilih Kategori
                        </option>

                        <option value="asesi">
                          Asesi (Peserta Sertifikasi)
                        </option>

                        <option value="asesor">
                          Asesor (Penguji)
                        </option>

                        <option value="masyarakat_umum">
                          Masyarakat Umum
                        </option>
                      </SelectGroup>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                        <Star size={17} />
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-[#071E3D]">
                          Tingkat Kepuasan
                        </h3>

                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          Berikan penilaian terhadap layanan SIMLSP.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="flex gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRating(star)}
                            onMouseEnter={() =>
                              setHoveredRating(star)
                            }
                            onMouseLeave={() =>
                              setHoveredRating(0)
                            }
                            className="rounded-lg p-1 transition-transform focus:outline-none hover:scale-110"
                          >
                            <Star
                              size={30}
                              className={`transition-colors duration-200 ${
                                (hoveredRating ||
                                  formData.rating) >=
                                star
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-transparent text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <span className="mt-3 text-[10px] font-bold text-slate-500">
                        {ratingLabel[formData.rating]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
                      Pesan / Ulasan*
                    </label>

                    <textarea
                      name="pesan"
                      value={formData.pesan}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Berikan kritik, saran, atau pujian Anda mengenai layanan kami."
                      className={`w-full resize-none rounded-lg border bg-slate-50 px-4 py-3.5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
                        errors.pesan
                          ? "border-red-300 focus:border-red-400 focus:ring-red-500/5"
                          : "border-slate-200 focus:border-[#CC6B27] focus:ring-[#CC6B27]/5"
                      }`}
                    />

                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-medium text-slate-400">
                        Minimal 10 karakter
                      </span>

                      <span className="text-[9px] font-medium text-slate-400">
                        {formData.pesan.length} karakter
                      </span>
                    </div>

                    {errors.pesan && (
                      <div className="flex items-center gap-1.5 px-1">
                        <AlertTriangle
                          size={11}
                          className="text-red-500"
                        />

                        <span className="text-[9px] font-bold text-red-500">
                          {errors.pesan}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-end border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex items-center gap-2 rounded-lg px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 ${
                        loading
                          ? "cursor-not-allowed bg-[#CC6B27]/60"
                          : "bg-[#CC6B27] hover:bg-[#A8561F]"
                      }`}
                    >
                      {loading ? (
                        "Mengirim..."
                      ) : (
                        <>
                          Kirim Feedback
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:col-span-4">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_18px_45px_-30px_rgba(7,30,61,0.18)]">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC6B27]/15 text-[#CC6B27]">
                    <Info size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Sebelum Mengirim
                    </p>

                    <h3 className="mt-1 text-sm font-black text-white">
                      Pusat Feedback
                    </h3>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <InfoItem
                  icon={ThumbsUp}
                  title="Saran"
                  text="Saran Anda membantu kami meningkatkan kualitas sistem dan layanan."
                />

                <InfoItem
                  icon={MessageSquare}
                  title="Kritik"
                  text="Kritik yang membangun sangat kami hargai untuk evaluasi layanan."
                />

                <InfoItem
                  icon={CheckCircle2}
                  title="Ulasan"
                  text="Ulasan Anda dapat menjadi bahan evaluasi untuk pengembangan layanan."
                />

                <InfoItem
                  icon={ShieldCheck}
                  title="Data"
                  text="Feedback diproses melalui sistem SIMLSP."
                />
              </div>
            </div>

            <Link
              to="/faq"
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(7,30,61,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CC6B27]/30 hover:shadow-[0_22px_50px_-28px_rgba(204,107,39,0.25)]"
            >
              <div className="border-t-4 border-[#CC6B27] px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#071E3D]/10 text-[#071E3D] transition-all duration-300 group-hover:bg-[#CC6B27] group-hover:text-white">
                    <HelpCircle size={20} />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-[#071E3D]">
                      Butuh Bantuan?
                    </h4>

                    <p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">
                      Lihat panduan lengkap mengenai
                      proses memberikan feedback dan ulasan.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-[#071E3D]">
                    Panduan Feedback
                  </span>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#071E3D]/5 text-[#071E3D] transition-all duration-300 group-hover:bg-[#CC6B27] group-hover:text-white">
                    <ChevronRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3.5 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#071E3D]">
          {title}
        </p>

        <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function InputGroup({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  maxLength
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg border bg-slate-50 px-4 py-3.5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-500/5"
            : "border-slate-200 focus:border-[#CC6B27] focus:ring-[#CC6B27]/5"
        }`}
      />

      {error && (
        <div className="flex items-center gap-1.5 px-1">
          <AlertTriangle
            size={11}
            className="text-red-500"
          />

          <span className="text-[9px] font-bold text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

function SelectGroup({
  label,
  children,
  onChange,
  value,
  name,
  error
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-lg border bg-slate-50 px-4 py-3.5 pr-11 text-sm font-semibold text-[#071E3D] transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/5"
              : "cursor-pointer border-slate-200 focus:border-[#CC6B27] focus:ring-[#CC6B27]/5"
          }`}
        >
          {children}
        </select>

        <ChevronRight
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-1">
          <AlertTriangle
            size={11}
            className="text-red-500"
          />

          <span className="text-[9px] font-bold text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}