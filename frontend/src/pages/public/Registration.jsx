import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import {
  User,
  MapPin,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Info,
  CheckCircle2,
  Mail,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";
import { submitPendaftaran } from "../../services/pendaftaran.service";
import { notifikasi } from "../../components/ui/notifikasi";

const API_URL = "http://localhost:3000/api/public";

export default function Registration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [apiMessage, setApiMessage] = useState("");
  const recaptchaRef = useRef(null);
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState({
    nik: "",
    nama_lengkap: "",
    email: "",
    no_hp: "08",
    provinsi_id: "",
    provinsi_nama: "",
    kota_id: "",
    kota_nama: "",
    kecamatan_id: "",
    kecamatan_nama: "",
    kelurahan_id: "",
    kelurahan_nama: "",
    alamat_lengkap: "",
    provinsi_wilayah_uji_id: "",
    provinsi_wilayah_uji: "",
    kota_wilayah_uji_id: "",
    kota_wilayah_uji: "",
    wilayah_rji: "",
    pendidikan_terakhir: "",
    id_skema: "",
    skema_yang_dipilih: "",
    captchaToken: ""
  });

  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);
  const [provinsiWilayahUji, setProvinsiWilayahUji] = useState([]);
  const [kotaWilayahUji, setKotaWilayahUji] = useState([]);
  const [skemaList, setSkemaList] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/provinsi`)
      .then((res) => {
        setProvinsi(res.data || []);
        setProvinsiWilayahUji(res.data || []);
      })
      .catch((err) =>
        console.error("Gagal load provinsi:", err)
      );

    axios
      .get(`${API_URL}/dropdown/skema`)
      .then((res) => setSkemaList(res.data || []))
      .catch((err) =>
        console.error("Gagal load skema:", err)
      );
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [step]);

  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.provinsi_nama) {
      setErrors((prev) => ({
        ...prev,
        provinsi_nama: null
      }));
    }

    setFormData((prev) => ({
      ...prev,
      provinsi_id: id,
      provinsi_nama: name,
      kota_id: "",
      kota_nama: "",
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: ""
    }));

    if (id) {
      try {
        const res = await axios.get(
          `${API_URL}/kota/${id}`
        );
        setKota(res.data || []);
      } catch (err) {
        console.error("Gagal load kota:", err);
        setKota([]);
      }
    } else {
      setKota([]);
    }

    setKecamatan([]);
    setKelurahan([]);
  };

  const handleKotaChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.kota_nama) {
      setErrors((prev) => ({
        ...prev,
        kota_nama: null
      }));
    }

    setFormData((prev) => ({
      ...prev,
      kota_id: id,
      kota_nama: name,
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: ""
    }));

    if (id) {
      try {
        const res = await axios.get(
          `${API_URL}/kecamatan/${id}`
        );
        setKecamatan(res.data || []);
      } catch (err) {
        console.error("Gagal load kecamatan:", err);
        setKecamatan([]);
      }
    } else {
      setKecamatan([]);
    }

    setKelurahan([]);
  };

  const handleKecamatanChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      kecamatan_id: id,
      kecamatan_nama: name,
      kelurahan_id: "",
      kelurahan_nama: ""
    }));

    if (id) {
      try {
        const res = await axios.get(
          `${API_URL}/kelurahan/${id}`
        );
        setKelurahan(res.data || []);
      } catch (err) {
        console.error("Gagal load kelurahan:", err);
        setKelurahan([]);
      }
    } else {
      setKelurahan([]);
    }
  };

  const handleKelurahanChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      kelurahan_id: id,
      kelurahan_nama: name
    }));
  };

  const handleProvinsiWilayahUjiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.provinsi_wilayah_uji) {
      setErrors((prev) => ({
        ...prev,
        provinsi_wilayah_uji: null
      }));
    }

    setFormData((prev) => ({
      ...prev,
      provinsi_wilayah_uji_id: id,
      provinsi_wilayah_uji: name,
      kota_wilayah_uji_id: "",
      kota_wilayah_uji: "",
      wilayah_rji: ""
    }));

    if (id) {
      try {
        const res = await axios.get(
          `${API_URL}/kota/${id}`
        );
        setKotaWilayahUji(res.data || []);
      } catch (err) {
        console.error(
          "Gagal load kota/kabupaten wilayah uji:",
          err
        );
        setKotaWilayahUji([]);
      }
    } else {
      setKotaWilayahUji([]);
    }
  };

  const handleKotaWilayahUjiChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;

    if (errors.kota_wilayah_uji) {
      setErrors((prev) => ({
        ...prev,
        kota_wilayah_uji: null
      }));
    }

    setFormData((prev) => ({
      ...prev,
      kota_wilayah_uji_id: id,
      kota_wilayah_uji: name,
      wilayah_rji: `${prev.provinsi_wilayah_uji} - ${name}`
    }));
  };

  const handleSkemaChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = e.target.value;
    const namaSkema = selectedOption.dataset.nama || "";

    if (errors.id_skema) {
      setErrors((prev) => ({
        ...prev,
        id_skema: null
      }));
    }

    setFormData((prev) => ({
      ...prev,
      id_skema: id,
      skema_yang_dipilih: namaSkema
    }));
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

    if (name === "nama_lengkap") {
      val = value.replace(/[0-9]/g, "");
    } else if (name === "nik") {
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
      no_hp: `08${digits}`
    }));

    if (errors.no_hp) {
      setErrors((prev) => ({
        ...prev,
        no_hp: null
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
      if (!formData.nama_lengkap.trim()) {
        newErrors.nama_lengkap = "Nama wajib diisi";
      }

      if (formData.nik.length !== 16) {
        newErrors.nik = "NIK harus tepat 16 digit";
      }

      if (
        !formData.email.match(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        )
      ) {
        newErrors.email = "Format email tidak valid";
      }

      if (
        formData.no_hp === "08" ||
        formData.no_hp.length < 10
      ) {
        newErrors.no_hp =
          "Nomor WhatsApp wajib diisi minimal 10 digit";
      } else if (
        formData.no_hp.length < 12 ||
        formData.no_hp.length > 13
      ) {
        newErrors.no_hp =
          "Nomor WhatsApp harus 12-13 digit";
      }
    }

    if (step === 2) {
      if (!formData.provinsi_id) {
        newErrors.provinsi_nama = "Pilih provinsi";
      }

      if (!formData.kota_id) {
        newErrors.kota_nama =
          "Pilih kota/kabupaten";
      }

      if (!formData.alamat_lengkap.trim()) {
        newErrors.alamat_lengkap =
          "Alamat lengkap wajib diisi";
      }

      if (!formData.provinsi_wilayah_uji_id) {
        newErrors.provinsi_wilayah_uji =
          "Pilih provinsi wilayah uji";
      }

      if (!formData.kota_wilayah_uji_id) {
        newErrors.kota_wilayah_uji =
          "Pilih kota/kabupaten wilayah uji";
      }
    }

    if (step === 3) {
      if (!formData.pendidikan_terakhir) {
        newErrors.pendidikan_terakhir =
          "Pilih pendidikan terakhir";
      }

      if (!formData.id_skema) {
        newErrors.id_skema = "Pilih keahlian";
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
      nik: "",
      nama_lengkap: "",
      email: "",
      no_hp: "08",
      provinsi_id: "",
      provinsi_nama: "",
      kota_id: "",
      kota_nama: "",
      kecamatan_id: "",
      kecamatan_nama: "",
      kelurahan_id: "",
      kelurahan_nama: "",
      alamat_lengkap: "",
      provinsi_wilayah_uji_id: "",
      provinsi_wilayah_uji: "",
      kota_wilayah_uji_id: "",
      kota_wilayah_uji: "",
      wilayah_rji: "",
      pendidikan_terakhir: "",
      id_skema: "",
      skema_yang_dipilih: "",
      captchaToken: ""
    });

    setErrors({});
    setSubmitStatus(null);
    setApiMessage("");
    setKota([]);
    setKecamatan([]);
    setKelurahan([]);
    setKotaWilayahUji([]);

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    setApiMessage("");

    try {
      const payload = {
        ...formData,
        provinsi: formData.provinsi_nama,
        kota: formData.kota_nama,
        kecamatan: formData.kecamatan_nama,
        kelurahan: formData.kelurahan_nama,
        provinsi_wilayah_uji:
          formData.provinsi_wilayah_uji,
        kota_wilayah_uji:
          formData.kota_wilayah_uji,
        wilayah_rji: `${formData.provinsi_wilayah_uji} - ${formData.kota_wilayah_uji}`,
        program_studi:
          formData.pendidikan_terakhir,
        kompetensi_keahlian:
          formData.skema_yang_dipilih
      };

      await submitPendaftaran(payload);

      setSubmitStatus("success");

      setApiMessage(
        "Pendaftaran Akun Asesi Berhasil! Silakan cek email Anda untuk langkah aktivasi selanjutnya."
      );

      await notifikasi.sukses(
        "Pendaftaran Berhasil",
        "Pendaftaran Akun Asesi berhasil dikirim. Silakan cek email Anda untuk langkah aktivasi selanjutnya."
      );

      resetForm();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal melakukan pendaftaran. Silakan coba lagi nanti.";

      setSubmitStatus("error");
      setApiMessage(errorMessage);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setFormData((prev) => ({
        ...prev,
        captchaToken: ""
      }));

      await notifikasi.gagal(
        "Pendaftaran Gagal",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={formTopRef}
      className="relative min-h-screen overflow-hidden bg-white py-16 lg:py-24"
    >
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
                Pendaftaran{" "}
                <span className="text-[#CC6B27]">
                  Akun Asesi
                </span>
              </motion.h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 md:text-base">
                Lengkapi data diri Anda untuk mengikuti
                uji kompetensi sertifikasi profesi melalui
                SIMLSP.
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
                      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                      : "border-red-100 bg-red-50 text-red-800"
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
                    <p className="text-sm font-bold leading-relaxed">
                      {apiMessage}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSubmitStatus(null)
                      }
                      className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 transition-opacity hover:opacity-60"
                    >
                      Tutup Notifikasi
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
                      <User size={19} />
                    ) : step === 2 ? (
                      <MapPin size={19} />
                    ) : (
                      <GraduationCap size={19} />
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#CC6B27]">
                      Langkah {step} dari 3
                    </p>

                    <h2 className="mt-1 text-base font-black text-white md:text-lg">
                      {step === 1
                        ? "Informasi Akun & Pribadi"
                        : step === 2
                        ? "Domisili & Lokasi Uji"
                        : "Data Kompetensi"}
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
                          name="nama_lengkap"
                          value={formData.nama_lengkap}
                          onChange={handleChange}
                          placeholder="Nama sesuai KTP"
                          error={errors.nama_lengkap}
                        />

                        <InputGroup
                          label="Nomor KTP / NIK*"
                          name="nik"
                          value={formData.nik}
                          onChange={handleChange}
                          placeholder="16 digit NIK"
                          error={errors.nik}
                          maxLength={16}
                        />

                        <InputGroup
                          label="Alamat Email*"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="nama@domain.com"
                          type="email"
                          error={errors.email}
                        />

                        <PhoneInputGroup
                          label="Nomor HP / WhatsApp*"
                          value={formData.no_hp.slice(2)}
                          onChange={handlePhoneChange}
                          placeholder="Contoh: 81234567890"
                          error={errors.no_hp}
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
                          label="Provinsi*"
                          onChange={handleProvinsiChange}
                          value={formData.provinsi_nama}
                          error={errors.provinsi_nama}
                        >
                          <option value="">
                            Pilih Provinsi
                          </option>

                          {provinsi.map((p) => (
                            <option
                              key={p.id}
                              data-id={p.id}
                              value={p.name}
                            >
                              {p.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <SelectGroup
                          label="Kota / Kabupaten*"
                          onChange={handleKotaChange}
                          value={formData.kota_nama}
                          disabled={!formData.provinsi_id}
                          error={errors.kota_nama}
                        >
                          <option value="">
                            Pilih Kota / Kabupaten
                          </option>

                          {kota.map((k) => (
                            <option
                              key={k.id}
                              data-id={k.id}
                              value={k.name}
                            >
                              {k.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <SelectGroup
                          label="Kecamatan"
                          onChange={handleKecamatanChange}
                          value={formData.kecamatan_nama}
                          disabled={!formData.kota_id}
                        >
                          <option value="">
                            Pilih Kecamatan
                          </option>

                          {kecamatan.map((kec) => (
                            <option
                              key={kec.id}
                              data-id={kec.id}
                              value={kec.name}
                            >
                              {kec.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <SelectGroup
                          label="Kelurahan"
                          onChange={handleKelurahanChange}
                          value={formData.kelurahan_nama}
                          disabled={!formData.kecamatan_id}
                        >
                          <option value="">
                            Pilih Kelurahan
                          </option>

                          {kelurahan.map((kel) => (
                            <option
                              key={kel.id}
                              data-id={kel.id}
                              value={kel.name}
                            >
                              {kel.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <SelectGroup
                          label="Provinsi Wilayah Uji*"
                          onChange={
                            handleProvinsiWilayahUjiChange
                          }
                          value={
                            formData.provinsi_wilayah_uji
                          }
                          error={
                            errors.provinsi_wilayah_uji
                          }
                        >
                          <option value="">
                            Pilih Provinsi Wilayah Uji
                          </option>

                          {provinsiWilayahUji.map((p) => (
                            <option
                              key={p.id}
                              data-id={p.id}
                              value={p.name}
                            >
                              {p.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <SelectGroup
                          label="Kota / Kabupaten Wilayah Uji*"
                          onChange={
                            handleKotaWilayahUjiChange
                          }
                          value={
                            formData.kota_wilayah_uji
                          }
                          disabled={
                            !formData.provinsi_wilayah_uji_id
                          }
                          error={
                            errors.kota_wilayah_uji
                          }
                        >
                          <option value="">
                            Pilih Kota / Kabupaten Wilayah Uji
                          </option>

                          {kotaWilayahUji.map((k) => (
                            <option
                              key={k.id}
                              data-id={k.id}
                              value={k.name}
                            >
                              {k.name}
                            </option>
                          ))}
                        </SelectGroup>

                        <div className="md:col-span-2">
                          <InputGroup
                            label="Alamat Lengkap*"
                            name="alamat_lengkap"
                            value={formData.alamat_lengkap}
                            onChange={handleChange}
                            placeholder="Jl. Raya No. 123, Kecamatan, Kabupaten / Kota"
                            error={errors.alamat_lengkap}
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
                        <SelectGroup
                          label="Pendidikan Terakhir*"
                          name="pendidikan_terakhir"
                          value={
                            formData.pendidikan_terakhir
                          }
                          onChange={handleChange}
                          error={
                            errors.pendidikan_terakhir
                          }
                        >
                          <option value="">
                            Pilih Pendidikan Terakhir
                          </option>
                          <option value="D3">
                            D3
                          </option>
                          <option value="D4">
                            D4
                          </option>
                          <option value="S1">
                            S1
                          </option>
                          <option value="S2">
                            S2
                          </option>
                          <option value="S3">
                            S3
                          </option>
                        </SelectGroup>

                        <SelectGroup
                          label="Keahlian yang Dipilih*"
                          name="id_skema"
                          value={formData.id_skema}
                          onChange={handleSkemaChange}
                          error={errors.id_skema}
                        >
                          <option value="">
                            Pilih Keahlian
                          </option>

                          {skemaList.map((s) => (
                            <option
                              key={s.id_skema}
                              value={s.id_skema}
                              data-nama={s.judul_skema}
                            >
                              {s.judul_skema}
                            </option>
                          ))}
                        </SelectGroup>
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
                              mengirim pendaftaran.
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

                            <span className="text-[10px] font-bold text-red-500">
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
                    className={`flex items-center gap-2 rounded-lg px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                      step === 3
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
                        Memproses...
                      </>
                    ) : step === 3 ? (
                      <>
                        Daftar Sekarang
                        <Send size={15} />
                      </>
                    ) : (
                      <>
                        Lanjut ke Lokasi
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
                      Sebelum Mendaftar
                    </p>

                    <h3 className="mt-1 text-sm font-black text-white">
                      Informasi Penting
                    </h3>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <InfoItem
                  icon={CreditCard}
                  title="NIK"
                  text="Pastikan NIK sesuai dengan KTP asli untuk validasi sertifikat."
                />

                <InfoItem
                  icon={Mail}
                  title="Email"
                  text="Gunakan email aktif untuk menerima informasi dan proses aktivasi akun."
                />

                <InfoItem
                  icon={FileText}
                  title="Data Pendaftaran"
                  text="Pastikan seluruh data sudah benar sebelum dikirim."
                />

                <InfoItem
                  icon={ShieldCheck}
                  title="Keamanan Data"
                  text="Data pendaftaran diproses melalui sistem LSP."
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
                      proses pendaftaran asesi.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-[#071E3D]">
                    Panduan Pendaftaran
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
  error,
  disabled
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
          disabled={disabled}
          className={`w-full appearance-none rounded-lg border bg-slate-50 px-4 py-3.5 pr-11 text-sm font-semibold text-[#071E3D] transition-all focus:bg-white focus:outline-none focus:ring-4 ${
            disabled
              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
              : error
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