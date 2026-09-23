import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  User,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Info,
  CheckCircle2,
  Mail,
  Send,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:3000/api/public";

export default function Complaint() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    nama_pengadu: "",
    nik_pengadu: "",
    email_pengadu: "",
    no_hp_pengadu: "08",
    sebagai_siapa: "",
    isi_pengaduan: "",
    captchaToken: ""
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  const validateStep1 = () => {
    const newErrors = {};
    const {
      nama_pengadu,
      nik_pengadu,
      email_pengadu,
      no_hp_pengadu,
      sebagai_siapa
    } = formData;

    if (!nama_pengadu.trim()) {
      newErrors.nama_pengadu = "Nama wajib diisi";
    }

    if (!nik_pengadu) {
      newErrors.nik_pengadu = "NIK wajib diisi";
    } else if (nik_pengadu.length !== 16) {
      newErrors.nik_pengadu = "NIK harus tepat 16 digit";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email_pengadu) {
      newErrors.email_pengadu = "Email wajib diisi";
    } else if (!emailRegex.test(email_pengadu)) {
      newErrors.email_pengadu = "Format email tidak valid";
    }

    if (no_hp_pengadu === "08") {
      newErrors.no_hp_pengadu = "Nomor WhatsApp wajib diisi";
    } else if (no_hp_pengadu.length !== 13) {
      newErrors.no_hp_pengadu =
        "Nomor WhatsApp harus tepat 13 digit";
    }

    if (!sebagai_siapa) {
      newErrors.sebagai_siapa = "Pilih kategori pelapor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }

    if (name === "nama_pengadu") {
      val = value.replace(/[0-9]/g, "");
    } else if (name === "nik_pengadu") {
      val = value.replace(/[^0-9]/g, "").slice(0, 16);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value
      .replace(/[^0-9]/g, "")
      .slice(0, 11);

    setFormData((prev) => ({
      ...prev,
      no_hp_pengadu: `08${digits}`
    }));

    if (errors.no_hp_pengadu) {
      setErrors((prev) => ({
        ...prev,
        no_hp_pengadu: null
      }));
    }
  };

  const onCaptchaChange = (token) => {
    setFormData((prev) => ({
      ...prev,
      captchaToken: token
    }));

    if (token) {
      setErrors((prev) => ({
        ...prev,
        captchaToken: null
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      const stepErrors = validateStep1();

      return stepErrors;
    }

    if (step === 2) {
      if (
        !formData.isi_pengaduan ||
        formData.isi_pengaduan.trim().length < 10
      ) {
        newErrors.isi_pengaduan =
          "Isi pengaduan minimal 10 karakter";
      }

      if (!formData.captchaToken) {
        newErrors.captchaToken =
          "Verifikasi Captcha diperlukan";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const resetForm = () => {
    setStep(1);

    setFormData({
      nama_pengadu: "",
      nik_pengadu: "",
      email_pengadu: "",
      no_hp_pengadu: "08",
      sebagai_siapa: "",
      isi_pengaduan: "",
      captchaToken: ""
    });

    setErrors({});

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        tanggal_pengaduan: new Date().toISOString()
      };

      const response = await axios.post(
        `${API_URL}/pengaduan`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        await notifikasi.sukses(
          "Pengaduan Berhasil Dikirim",
          "Pengaduan Anda telah berhasil dikirim dan akan diproses oleh petugas."
        );

        resetForm();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Gagal mengirim pengaduan.";

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setFormData((prev) => ({
        ...prev,
        captchaToken: ""
      }));

      await notifikasi.gagal(
        "Pengaduan Gagal Dikirim",
        errorMsg
      );
    } finally {
      setLoading(false);
    }
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
                  Pengaduan Masyarakat
                </span>
              </motion.h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base">
                Sampaikan keluhan atau ketidaksesuaian pelayanan
                LSP melalui kanal resmi SIMLSP.
              </p>
            </header>

            <div className="mb-7 flex items-center">
              {[1, 2].map((num) => (
                <React.Fragment key={num}>
                  <button
                    type="button"
                    onClick={() => {
                      if (num < step) {
                        setStep(num);
                      }
                    }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-all duration-300 ${
                      step === num
                        ? "bg-[#071E3D] text-white shadow-md shadow-[#071E3D]/15"
                        : step > num
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {step > num ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      num
                    )}
                  </button>

                  {num < 2 && (
                    <div
                      className={`h-px w-12 transition-all duration-300 ${
                        step > num
                          ? "bg-emerald-400"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_20px_50px_-30px_rgba(7,30,61,0.18)]">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-6 py-5 md:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/15 text-[#CC6B27]">
                    {step === 1 ? (
                      <User size={19} />
                    ) : (
                      <MessageSquare size={19} />
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Langkah {step} dari 2
                    </p>

                    <h2 className="mt-1 text-base font-black text-white md:text-lg">
                      {step === 1
                        ? "Informasi Pelapor"
                        : "Detail Pengaduan"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{
                        opacity: 0,
                        y: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        y: -10
                      }}
                      transition={{
                        duration: 0.25
                      }}
                    >
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <InputGroup
                          label="Nama Lengkap*"
                          name="nama_pengadu"
                          value={formData.nama_pengadu}
                          onChange={handleChange}
                          placeholder="Nama sesuai KTP"
                          error={errors.nama_pengadu}
                        />

                        <InputGroup
                          label="Nomor KTP / NIK*"
                          name="nik_pengadu"
                          value={formData.nik_pengadu}
                          onChange={handleChange}
                          placeholder="16 digit NIK"
                          error={errors.nik_pengadu}
                          maxLength={16}
                        />

                        <InputGroup
                          label="Alamat Email*"
                          name="email_pengadu"
                          value={formData.email_pengadu}
                          onChange={handleChange}
                          placeholder="nama@domain.com"
                          type="email"
                          error={errors.email_pengadu}
                        />

                        <PhoneInputGroup
                          label="Nomor HP / WhatsApp*"
                          value={formData.no_hp_pengadu.slice(2)}
                          onChange={handlePhoneChange}
                          placeholder="Contoh: 81234567890"
                          error={errors.no_hp_pengadu}
                        />

                        <div className="md:col-span-2">
                          <SelectGroup
                            label="Bertindak Sebagai*"
                            name="sebagai_siapa"
                            value={formData.sebagai_siapa}
                            onChange={handleChange}
                            error={errors.sebagai_siapa}
                          >
                            <option value="">
                              Pilih Kategori Pelapor
                            </option>
                            <option value="asesi">
                              Asesi (Peserta Sertifikasi)
                            </option>
                            <option value="asesor">
                              Asesor (Penguji)
                            </option>
                            <option value="masyarakat">
                              Masyarakat Umum
                            </option>
                          </SelectGroup>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{
                        opacity: 0,
                        y: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        y: -10
                      }}
                      transition={{
                        duration: 0.25
                      }}
                    >
                      <div className="flex flex-col gap-2">
                        <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
                          Isi Pengaduan*
                        </label>

                        <textarea
                          name="isi_pengaduan"
                          value={formData.isi_pengaduan}
                          onChange={handleChange}
                          rows="7"
                          placeholder="Ceritakan keluhan Anda secara mendetail agar kami dapat memproses lebih cepat."
                          className={`w-full resize-none rounded-lg border bg-slate-50 px-4 py-3.5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
                            errors.isi_pengaduan
                              ? "border-red-300 focus:border-red-400 focus:ring-red-500/5"
                              : "border-slate-200 focus:border-[#CC6B27] focus:ring-[#CC6B27]/5"
                          }`}
                        />

                        <div className="flex items-center justify-between">
                          <span className="px-1 text-[9px] font-medium text-slate-400">
                            Minimal 10 karakter
                          </span>

                          <span className="text-[9px] font-medium text-slate-400">
                            {formData.isi_pengaduan.length} karakter
                          </span>
                        </div>

                        {errors.isi_pengaduan && (
                          <div className="flex items-center gap-1.5 px-1">
                            <AlertTriangle
                              size={11}
                              className="text-red-500"
                            />

                            <span className="text-[9px] font-bold text-red-500">
                              {errors.isi_pengaduan}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                            <ShieldCheck size={17} />
                          </div>

                          <div>
                            <h3 className="text-xs font-black text-[#071E3D]">
                              Verifikasi Keamanan
                            </h3>

                            <p className="mt-1 text-[10px] font-medium text-slate-400">
                              Selesaikan verifikasi untuk
                              mengirim pengaduan.
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-center overflow-x-auto">
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6LdSGX4sAAAAAA7BAt1iY8OVxtnx_EFunFBQV-QF"
                            onChange={onCaptchaChange}
                          />
                        </div>

                        {errors.captchaToken && (
                          <div className="mt-4 flex items-center justify-center gap-1.5">
                            <AlertTriangle
                              size={11}
                              className="text-red-500"
                            />

                            <span className="text-[9px] font-bold text-red-500">
                              {errors.captchaToken}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-all hover:bg-slate-50 hover:text-[#071E3D]"
                    >
                      <ChevronLeft size={16} />
                      Kembali
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={
                      step === 2
                        ? handleSubmit
                        : nextStep
                    }
                    disabled={loading}
                    className={`flex items-center gap-2 rounded-lg px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                      step === 2
                        ? "bg-[#CC6B27] text-white hover:bg-[#A8561F]"
                        : "bg-[#071E3D] text-white hover:bg-[#CC6B27]"
                    } ${
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          size={15}
                        />
                        Mengirim...
                      </>
                    ) : step === 2 ? (
                      <>
                        Kirim Pengaduan
                        <Send size={15} />
                      </>
                    ) : (
                      <>
                        Lanjut ke Pengaduan
                        <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                </div>
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
                      Informasi Penting
                    </h3>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <InfoItem
                  icon={Fingerprint}
                  title="Identitas"
                  text="Gunakan NIK yang valid untuk keperluan verifikasi data pelapor."
                />

                <InfoItem
                  icon={Mail}
                  title="Email"
                  text="Pastikan email aktif untuk menerima informasi dan koordinasi lebih lanjut."
                />

                <InfoItem
                  icon={AlertCircle}
                  title="Isi Pengaduan"
                  text="Jelaskan keluhan atau ketidaksesuaian pelayanan secara jelas dan lengkap."
                />

                <InfoItem
                  icon={ShieldCheck}
                  title="Kerahasiaan"
                  text="Data identitas pelapor diproses secara aman melalui sistem LSP."
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
                      proses pengaduan masyarakat.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-[#071E3D]">
                    Panduan Pengaduan
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

function PhoneInputGroup({
  label,
  value,
  onChange,
  placeholder,
  error
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
        {label}
      </label>

      <div
        className={`flex overflow-hidden rounded-lg border bg-slate-50 transition-all focus-within:bg-white focus-within:ring-4 ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-500/5"
            : "border-slate-200 focus-within:border-[#CC6B27] focus-within:ring-[#CC6B27]/5"
        }`}
      >
        <span className="flex items-center border-r border-slate-200 bg-slate-100 px-4 text-sm font-black text-[#071E3D]">
          08
        </span>

        <input
          type="tel"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={11}
          inputMode="numeric"
          className="w-full border-0 bg-transparent px-4 py-3.5 text-sm font-semibold text-[#071E3D] placeholder:text-slate-300 focus:outline-none focus:ring-0"
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

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronRight
            size={16}
            className="rotate-90"
          />
        </div>
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