import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Info,
  FileText,
  Briefcase,
  CheckCircle2,
  Search,
  HelpCircle,
  Database,
  Calendar,
  ClipboardList,
  AlertTriangle,
  X,
  Send,
  Loader2
} from "lucide-react";
import { createSurveillance } from "../../services/surveillance.service";
import { getSkema } from "../../services/skema.service";

export default function SurveillancePage() {
  const [step, setStep] = useState(1);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  const recaptchaRef = useRef(null);

  const initialForm = {
    nik: "",
    id_skema: "",
    periode_surveillance: "",
    nomor_sertifikat: "",
    nomor_registrasi: "",
    sumber_dana: "",
    nama_perusahaan: "",
    alamat_perusahaan: "",
    jabatan_pekerjaan: "",
    nama_proyek: "",
    jabatan_dalam_proyek: "",
    kesesuaian_kompetensi: "",
    keterangan_lainnya: "",
    captchaToken: ""
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step > 1 || form.nik) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [step, form.nik]);

  useEffect(() => {
    const fetchSkema = async () => {
      try {
        const data = await getSkema();
        setSkemaList(data);
      } catch (err) {
        console.error("Gagal load skema:", err);
      }
    };

    fetchSkema();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }

    if (name === "nik") {
      const onlyNums = value
        .replace(/[^0-9]/g, "")
        .slice(0, 16);

      setForm((prev) => ({
        ...prev,
        [name]: onlyNums
      }));

      return;
    }

    if (
      name === "nomor_sertifikat" ||
      name === "nomor_registrasi"
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: value.toUpperCase()
      }));

      return;
    }

    const textFields = [
      "nama_perusahaan",
      "jabatan_pekerjaan",
      "nama_proyek",
      "jabatan_dalam_proyek"
    ];

    if (textFields.includes(name)) {
      const cleanValue = value.replace(
        /[^a-zA-Z0-9\s.,-]/g,
        ""
      );

      setForm((prev) => ({
        ...prev,
        [name]: cleanValue
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const onCaptchaChange = (token) => {
    setForm((prev) => ({
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
      if (!form.nik || form.nik.length !== 16) {
        newErrors.nik = "NIK harus 16 digit";
      }

      if (!form.id_skema) {
        newErrors.id_skema =
          "Pilih skema sertifikasi";
      }

      if (!form.periode_surveillance) {
        newErrors.periode_surveillance =
          "Pilih periode";
      }

      if (!form.nomor_sertifikat) {
        newErrors.nomor_sertifikat =
          "Nomor sertifikat wajib diisi";
      }
    }

    if (step === 2) {
      if (!form.sumber_dana) {
        newErrors.sumber_dana =
          "Pilih sumber dana";
      }

      if (
        !form.nama_perusahaan ||
        form.nama_perusahaan.length < 3
      ) {
        newErrors.nama_perusahaan =
          "Nama perusahaan tidak valid";
      }

      if (!form.jabatan_pekerjaan) {
        newErrors.jabatan_pekerjaan =
          "Jabatan wajib diisi";
      }

      if (!form.nomor_registrasi) {
        newErrors.nomor_registrasi =
          "Nomor registrasi BNSP wajib diisi";
      }

      if (!form.alamat_perusahaan) {
        newErrors.alamat_perusahaan =
          "Alamat kantor wajib diisi";
      }
    }

    if (step === 3) {
      if (!form.nama_proyek) {
        newErrors.nama_proyek =
          "Nama proyek wajib diisi";
      }

      if (!form.kesesuaian_kompetensi) {
        newErrors.kesesuaian_kompetensi =
          "Pilih status kesesuaian";
      }

      if (!form.captchaToken) {
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

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    setApiMessage("");

    try {
      await createSurveillance(form);

      setSubmitStatus("success");
      setApiMessage(
        "Laporan Surveillance berhasil dikirim ke sistem LSP!"
      );

      setForm(initialForm);
      setStep(1);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } catch (err) {
      setSubmitStatus("error");

      setApiMessage(
        err.response?.data?.message ||
          "Gagal mengirim laporan. Cek koneksi Anda."
      );

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setForm((prev) => ({
        ...prev,
        captchaToken: ""
      }));
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
                Formulir{" "}
                <span className="text-[#CC6B27]">
                  Surveillance
                </span>
              </motion.h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base">
                Pemantauan berkala pemegang sertifikat
                kompetensi untuk memastikan pemeliharaan
                kompetensi tetap sesuai standar BNSP.
              </p>
            </header>

            <AnimatePresence>
              {submitStatus && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto"
                  }}
                  exit={{
                    opacity: 0,
                    height: 0
                  }}
                  className={`mb-7 flex items-start gap-4 rounded-xl border p-5 ${
                    submitStatus === "success"
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ${
                      submitStatus === "success"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {submitStatus === "success" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold leading-relaxed ${
                        submitStatus === "success"
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      {apiMessage}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSubmitStatus(null)
                      }
                      className="mt-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-[#071E3D]"
                    >
                      Tutup
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-7 flex items-center">
              {[1, 2, 3].map((num) => (
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

                  {num < 3 && (
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
                      <FileText size={19} />
                    ) : step === 2 ? (
                      <Briefcase size={19} />
                    ) : (
                      <ClipboardList size={19} />
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Langkah {step} dari 3
                    </p>

                    <h2 className="mt-1 text-base font-black text-white md:text-lg">
                      {step === 1
                        ? "Data Sertifikasi"
                        : step === 2
                        ? "Data Pekerjaan"
                        : "Aktivitas & Keamanan"}
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
                          label="NIK Sesuai Sertifikat*"
                          name="nik"
                          value={form.nik}
                          onChange={handleChange}
                          placeholder="Masukkan 16 digit NIK"
                          error={errors.nik}
                          maxLength={16}
                        />

                        <SelectGroup
                          label="Periode Surveillance*"
                          name="periode_surveillance"
                          value={
                            form.periode_surveillance
                          }
                          onChange={handleChange}
                          error={
                            errors.periode_surveillance
                          }
                        >
                          <option value="">
                            Pilih Tahun
                          </option>
                          <option value="2024">
                            2024
                          </option>
                          <option value="2025">
                            2025
                          </option>
                          <option value="2026">
                            2026
                          </option>
                        </SelectGroup>

                        <SelectGroup
                          label="Pilih Skema Sertifikasi*"
                          name="id_skema"
                          value={form.id_skema}
                          onChange={handleChange}
                          error={errors.id_skema}
                        >
                          <option value="">
                            Pilih Skema
                          </option>

                          {skemaList.map((s) => (
                            <option
                              key={s.id_skema}
                              value={s.id_skema}
                            >
                              {s.judul_skema}
                            </option>
                          ))}
                        </SelectGroup>

                        <InputGroup
                          label="Nomor Sertifikat*"
                          name="nomor_sertifikat"
                          value={form.nomor_sertifikat}
                          onChange={handleChange}
                          placeholder="Contoh: LSP/RJI/..."
                          error={
                            errors.nomor_sertifikat
                          }
                        />
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
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <SelectGroup
                          label="Sumber Dana*"
                          name="sumber_dana"
                          value={form.sumber_dana}
                          onChange={handleChange}
                          error={errors.sumber_dana}
                        >
                          <option value="">
                            Pilih Sumber Dana
                          </option>
                          <option value="apbn">
                            APBN
                          </option>
                          <option value="apbd">
                            APBD
                          </option>
                          <option value="perusahaan">
                            Instansi / Perusahaan
                          </option>
                          <option value="mandiri">
                            Mandiri / Pribadi
                          </option>
                        </SelectGroup>

                        <InputGroup
                          label="Nama Instansi/Perusahaan*"
                          name="nama_perusahaan"
                          value={form.nama_perusahaan}
                          onChange={handleChange}
                          placeholder="Nama Tempat Kerja"
                          error={
                            errors.nama_perusahaan
                          }
                        />

                        <InputGroup
                          label="Jabatan Struktural*"
                          name="jabatan_pekerjaan"
                          value={form.jabatan_pekerjaan}
                          onChange={handleChange}
                          placeholder="Jabatan Saat Ini"
                          error={
                            errors.jabatan_pekerjaan
                          }
                        />

                        <InputGroup
                          label="Nomor Registrasi BNSP*"
                          name="nomor_registrasi"
                          value={form.nomor_registrasi}
                          onChange={handleChange}
                          placeholder="MET.000.XXX..."
                          error={
                            errors.nomor_registrasi
                          }
                        />

                        <div className="md:col-span-2">
                          <InputGroup
                            label="Alamat Perusahaan*"
                            name="alamat_perusahaan"
                            value={
                              form.alamat_perusahaan
                            }
                            onChange={handleChange}
                            placeholder="Alamat lengkap lokasi kerja"
                            error={
                              errors.alamat_perusahaan
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
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
                          label="Nama Proyek/Pekerjaan*"
                          name="nama_proyek"
                          value={form.nama_proyek}
                          onChange={handleChange}
                          placeholder="Proyek yang sedang ditangani"
                          error={errors.nama_proyek}
                        />

                        <InputGroup
                          label="Jabatan Dalam Proyek"
                          name="jabatan_dalam_proyek"
                          value={
                            form.jabatan_dalam_proyek
                          }
                          onChange={handleChange}
                          placeholder="Contoh: Supervisor / Lead"
                        />

                        <div className="md:col-span-2">
                          <SelectGroup
                            label="Kesesuaian Kompetensi*"
                            name="kesesuaian_kompetensi"
                            value={
                              form.kesesuaian_kompetensi
                            }
                            onChange={handleChange}
                            error={
                              errors.kesesuaian_kompetensi
                            }
                          >
                            <option value="">
                              Apakah pekerjaan sesuai skema
                              sertifikasi?
                            </option>
                            <option value="sesuai">
                              Ya, Sangat Sesuai
                            </option>
                            <option value="tidak_sesuai">
                              Tidak Sesuai
                            </option>
                            <option value="lainnya">
                              Lainnya
                            </option>
                          </SelectGroup>
                        </div>

                        <div className="md:col-span-2">
                          <label className="ml-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#071E3D]/60">
                            Keterangan Tambahan
                          </label>

                          <textarea
                            name="keterangan_lainnya"
                            value={
                              form.keterangan_lainnya
                            }
                            onChange={handleChange}
                            placeholder="Berikan catatan tambahan mengenai relevansi pekerjaan Anda dengan sertifikat"
                            className="mt-2 min-h-[110px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-[#071E3D] transition-all placeholder:text-slate-300 focus:border-[#CC6B27] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#CC6B27]/5"
                          />
                        </div>
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
                              mengirim laporan.
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
                              size={12}
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
                      step === 3
                        ? handleSubmit
                        : nextStep
                    }
                    disabled={loading}
                    className={`flex items-center gap-2 rounded-lg px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 ${
                      step === 3
                        ? "bg-[#CC6B27] hover:bg-[#A8561F]"
                        : "bg-[#071E3D] hover:bg-[#CC6B27]"
                    } ${
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Memproses...
                      </>
                    ) : step === 3 ? (
                      <>
                        Kirim Laporan
                        <Send size={15} />
                      </>
                    ) : (
                      <>
                        Lanjut
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
                      Sebelum Mengisi
                    </p>

                    <h3 className="mt-1 text-sm font-black text-white">
                      Informasi Penting
                    </h3>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <SidebarInfo
                  icon={Calendar}
                  title="Periode"
                  text="Surveillance dilakukan secara berkala sesuai periode yang ditentukan."
                />

                <SidebarInfo
                  icon={Search}
                  title="Validasi"
                  text="Data pekerjaan dan aktivitas digunakan untuk proses pemantauan sertifikasi."
                />

                <SidebarInfo
                  icon={Database}
                  title="Data"
                  text="Pastikan data yang dimasukkan sesuai dengan kondisi pekerjaan Anda."
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
                      proses pengisian Surveillance.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-[#071E3D]">
                    Panduan Surveillance
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

function SidebarInfo({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3.5 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#071E3D]">
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