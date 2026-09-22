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
      .catch((err) => console.error("Gagal load provinsi:", err));

    axios
      .get(`${API_URL}/dropdown/skema`)
      .then((res) => setSkemaList(res.data || []))
      .catch((err) => console.error("Gagal load skema:", err));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleProvinsiChange = async (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const id = selectedOption.dataset.id;
    const name = e.target.value;
    
    if (errors.provinsi_nama) {
      setErrors((prev) => ({ ...prev, provinsi_nama: null }));
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
        const res = await axios.get(`${API_URL}/kota/${id}`);
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
      setErrors((prev) => ({ ...prev, kota_nama: null }));
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
        const res = await axios.get(`${API_URL}/kecamatan/${id}`);
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
        const res = await axios.get(`${API_URL}/kelurahan/${id}`);
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
      setErrors((prev) => ({ ...prev, provinsi_wilayah_uji: null }));
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
        const res = await axios.get(`${API_URL}/kota/${id}`);
        setKotaWilayahUji(res.data || []);
      } catch (err) {
        console.error("Gagal load kota/kabupaten wilayah uji:", err);
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
      setErrors((prev) => ({ ...prev, kota_wilayah_uji: null }));
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
      setErrors((prev) => ({ ...prev, id_skema: null }));
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
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    
    if (name === "nama_lengkap") {
      val = value.replace(/[0-9]/g, "");
    } else if (name === "nik") {
      val = value.replace(/[^0-9]/g, "").slice(0, 16);
    } else if (name === "alamat_lengkap") {
      val = value;
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handlePhoneChange = (e) => {
    // Membatasi sisa digit yang bisa diketik jadi max 11 (karena awalan "08" sudah 2 digit = Total 13 digit)
    const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    setFormData((prev) => ({
      ...prev,
      no_hp: `08${digits}`
    }));
    if (errors.no_hp) {
      setErrors((prev) => ({ ...prev, no_hp: null }));
    }
  };

  const onCaptchaChange = (token) => {
    setFormData((prev) => ({ ...prev, captchaToken: token }));
    if (token) {
      setErrors((prev) => ({ ...prev, captchaToken: null }));
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
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors.email = "Format email tidak valid";
      }
      if (formData.no_hp === "08" || formData.no_hp.length < 10) {
        newErrors.no_hp = "Nomor WhatsApp wajib diisi minimal 10 digit";
      } 
      // PERBAIKAN DI SINI: Bolehin 12 atau 13 digit
      else if (formData.no_hp.length < 12 || formData.no_hp.length > 13) {
        newErrors.no_hp = "Nomor WhatsApp harus 12-13 digit";
      }
    } else if (step === 2) {
      if (!formData.provinsi_id) {
        newErrors.provinsi_nama = "Pilih provinsi";
      }
      if (!formData.kota_id) {
        newErrors.kota_nama = "Pilih kota/kabupaten";
      }
      if (!formData.alamat_lengkap.trim()) {
        newErrors.alamat_lengkap = "Alamat lengkap wajib diisi";
      }
      if (!formData.provinsi_wilayah_uji_id) {
        newErrors.provinsi_wilayah_uji = "Pilih provinsi wilayah uji";
      }
      if (!formData.kota_wilayah_uji_id) {
        newErrors.kota_wilayah_uji = "Pilih kota/kabupaten wilayah uji";
      }
    } else if (step === 3) {
      if (!formData.pendidikan_terakhir) {
        newErrors.pendidikan_terakhir = "Pilih pendidikan terakhir";
      }
      if (!formData.id_skema) {
        newErrors.id_skema = "Pilih keahlian";
      }
      if (!formData.captchaToken) {
        newErrors.captchaToken = "Verifikasi Captcha diperlukan";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

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
        provinsi_wilayah_uji: formData.provinsi_wilayah_uji,
        kota_wilayah_uji: formData.kota_wilayah_uji,
        wilayah_rji: `${formData.provinsi_wilayah_uji} - ${formData.kota_wilayah_uji}`,
        program_studi: formData.pendidikan_terakhir,
        kompetensi_keahlian: formData.skema_yang_dipilih
      };
      await submitPendaftaran(payload);
      setSubmitStatus("success");
      setApiMessage("Pendaftaran Akun Asesi Berhasil! Silakan cek email Anda untuk langkah aktivasi selanjutnya.");
      await notifikasi.sukses(
        "Pendaftaran Berhasil",
        "Pendaftaran Akun Asesi berhasil dikirim. Silakan cek email Anda untuk langkah aktivasi selanjutnya."
      );
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal melakukan pendaftaran. Silakan coba lagi nanti.";
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
    <section ref={formTopRef} className="relative min-h-screen overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-orange-500/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#071E3D]/[0.04] blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <header className="mb-10">
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 text-4xl font-black tracking-tight text-[#071E3D]">
                Pendaftaran <span className="text-orange-500">Akun Asesi</span>
              </motion.h1>
              <p className="font-medium leading-relaxed text-slate-500">
                Silakan lengkapi data diri Anda untuk mengikuti uji kompetensi sertifikasi profesi melalui SIMLSP.
              </p>
            </header>
            <AnimatePresence>
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-8 flex items-start gap-4 rounded-[2rem] border p-6 ${
                    submitStatus === "success"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                      : "border-red-100 bg-red-50 text-red-800"
                  }`}
                >
                  <div className={`rounded-xl bg-white p-2 shadow-sm ${submitStatus === "success" ? "text-emerald-500" : "text-red-500"}`}>
                    {submitStatus === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-relaxed">
                      {apiMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitStatus(null)}
                      className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                      Tutup Notifikasi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mb-12 flex items-center gap-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold transition-all duration-500 ${step === num ? "scale-110 bg-[#071E3D] text-white shadow-xl shadow-[#071E3D]/20" : step > num ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {step > num ? <CheckCircle2 size={22} /> : num}
                  </div>
                  {num < 3 && <div className="h-[2px] w-10 bg-slate-100" />}
                </div>
              ))}
            </div>

            <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_30px_70px_-20px_rgba(7,30,61,0.08)] md:p-14">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                        <User size={24} />
                      </div>
                      <h2 className="text-xl font-black text-[#071E3D]">
                        Informasi Akun & Pribadi
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <InputGroup label="Nama Lengkap*" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Nama sesuai KTP" error={errors.nama_lengkap} />
                      <InputGroup label="Nomor KTP/NIK* (16 Digit)" name="nik" value={formData.nik} onChange={handleChange} placeholder="Contoh: 3201..." error={errors.nik} maxLength={16} />
                      <InputGroup label="Alamat Email*" name="email" value={formData.email} onChange={handleChange} placeholder="nama@domain.com" type="email" error={errors.email} />
                      
                      {/* PERBAIKAN: Ubah label agar pengguna mengerti max 13 digit */}
                      <PhoneInputGroup label="Nomor HP / WhatsApp* (12-13 Digit)" value={formData.no_hp.slice(2)} onChange={handlePhoneChange} placeholder="12345678901" error={errors.no_hp} />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                        <MapPin size={24} />
                      </div>
                      <h2 className="text-xl font-black text-[#071E3D]">
                        Domisili & Lokasi Uji
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <SelectGroup label="Provinsi*" onChange={handleProvinsiChange} value={formData.provinsi_nama} error={errors.provinsi_nama}>
                        <option value="">Pilih Provinsi</option>
                        {provinsi.map((p) => (
                          <option key={p.id} data-id={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <SelectGroup label="Kota / Kabupaten*" onChange={handleKotaChange} value={formData.kota_nama} disabled={!formData.provinsi_id} error={errors.kota_nama}>
                        <option value="">Pilih Kota</option>
                        {kota.map((k) => (
                          <option key={k.id} data-id={k.id} value={k.name}>
                            {k.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <SelectGroup label="Kecamatan" onChange={handleKecamatanChange} value={formData.kecamatan_nama} disabled={!formData.kota_id}>
                        <option value="">Pilih Kecamatan</option>
                        {kecamatan.map((kec) => (
                          <option key={kec.id} data-id={kec.id} value={kec.name}>
                            {kec.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <SelectGroup label="Kelurahan" onChange={handleKelurahanChange} value={formData.kelurahan_nama} disabled={!formData.kecamatan_id}>
                        <option value="">Pilih Kelurahan</option>
                        {kelurahan.map((kel) => (
                          <option key={kel.id} data-id={kel.id} value={kel.name}>
                            {kel.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <SelectGroup label="Provinsi Wilayah Uji*" onChange={handleProvinsiWilayahUjiChange} value={formData.provinsi_wilayah_uji} error={errors.provinsi_wilayah_uji}>
                        <option value="">Pilih Provinsi Wilayah Uji</option>
                        {provinsiWilayahUji.map((p) => (
                          <option key={p.id} data-id={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <SelectGroup label="Kota / Kabupaten Wilayah Uji*" onChange={handleKotaWilayahUjiChange} value={formData.kota_wilayah_uji} disabled={!formData.provinsi_wilayah_uji_id} error={errors.kota_wilayah_uji}>
                        <option value="">Pilih Kota / Kabupaten Wilayah Uji</option>
                        {kotaWilayahUji.map((k) => (
                          <option key={k.id} data-id={k.id} value={k.name}>
                            {k.name}
                          </option>
                        ))}
                      </SelectGroup>
                      <div className="md:col-span-2">
                        <InputGroup label="Alamat Lengkap" name="alamat_lengkap" value={formData.alamat_lengkap} onChange={handleChange} placeholder="Jl. Raya No. 123..." error={errors.alamat_lengkap} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="mb-8 flex items-center gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                        <GraduationCap size={24} />
                      </div>
                      <h2 className="text-xl font-black text-[#071E3D]">
                        Data Kompetensi
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <SelectGroup label="Pendidikan Terakhir*" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} error={errors.pendidikan_terakhir}>
                        <option value="">Pilih Pendidikan Terakhir</option>
                        <option value="D3">D3</option>
                        <option value="D4">D4</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </SelectGroup>
                      <SelectGroup label="Keahlian yang Dipilih*" name="id_skema" value={formData.id_skema} onChange={handleSkemaChange} error={errors.id_skema}>
                        <option value="">Pilih keahlian</option>
                        {skemaList.map((s) => (
                          <option key={s.id_skema} value={s.id_skema} data-nama={s.judul_skema}>
                            {s.judul_skema}
                          </option>
                        ))}
                      </SelectGroup>
                    </div>
                    <div className="flex flex-col items-center rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50 p-8">
                      <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Verifikasi Keamanan
                        </span>
                      </div>
                      <ReCAPTCHA ref={recaptchaRef} sitekey="6LdSGX4sAAAAAA7BAt1iY8OVxtnx_EFunFBQV-QF" onChange={onCaptchaChange} />
                      {errors.captchaToken && (
                        <div className="mt-4 flex items-center gap-1.5">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-[10px] font-bold uppercase text-red-500">
                            {errors.captchaToken}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-14 flex items-center justify-between">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-[#071E3D]">
                    <ChevronLeft size={18} />
                    Kembali
                  </button>
                ) : (
                  <div />
                )}
                <button type="button" onClick={step === 3 ? handleSubmit : nextStep} disabled={loading} className={`rounded-2xl px-10 py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-300 ${step === 3 ? "bg-orange-500 text-white shadow-orange-500/20 hover:bg-[#071E3D]" : "bg-[#071E3D] text-white shadow-[#071E3D]/20 hover:bg-orange-600"} ${loading ? "cursor-not-allowed opacity-70" : ""}`}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Memproses...
                    </span>
                  ) : step === 3 ? (
                    <span className="flex items-center gap-2">
                      Daftar Sekarang
                      <Send size={16} />
                    </span>
                  ) : (
                    "Lanjut ke Lokasi"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-32 lg:col-span-4">
            <div className="rounded-[2.5rem] border border-orange-100 bg-orange-50 p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-3 text-orange-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                  <span className="animate-pulse">
                    <Info size={20} />
                  </span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Informasi Penting
                </h3>
              </div>
              <div className="space-y-6">
                <InfoItem icon={CreditCard} text="Pastikan NIK sesuai dengan KTP asli untuk validasi sertifikat." />
                <InfoItem icon={Mail} text="Gunakan email aktif (Gmail disarankan) untuk menerima kartu ujian." />
                <InfoItem icon={FileText} text="Data yang sudah dikirim tidak dapat diubah secara mandiri." />
                <InfoItem icon={ShieldCheck} text="Seluruh data dilindungi sesuai kebijakan privasi LSP." />
              </div>
            </div>
            <Link to="/faq" className="group block">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-[#071E3D] p-8 text-center">
                <HelpCircle className="mx-auto mb-4 text-orange-500" size={40} />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">
                  Butuh Bantuan?
                </h4>
                <p className="mt-2 mb-6 text-[11px] text-slate-400">
                  Klik untuk melihat panduan pendaftaran asesi.
                </p>
                <div className="rounded-xl bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all group-hover:bg-orange-500">
                  Lihat FAQ
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ icon: Icon, text }) {
  return (
    <div className="group/item flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm transition-all group-hover/item:bg-orange-500 group-hover/item:text-white">
        <Icon size={16} />
      </div>
      <p className="text-[11px] font-bold leading-relaxed text-slate-600">
        {text}
      </p>
    </div>
  );
}

function InputGroup({ label, name, value, onChange, placeholder, type = "text", error, maxLength }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none focus:ring-4 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-orange-500/5"}`}
      />
      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

function PhoneInputGroup({ label, value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
        {label}
      </label>
      <div className={`flex items-center overflow-hidden rounded-2xl border bg-slate-50 transition-all focus-within:ring-4 ${error ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/5" : "border-slate-100 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-orange-500/5"}`}>
        <span className="select-none border-r border-slate-200 bg-slate-100 px-5 py-4 text-sm font-black text-[#071E3D]">
          08
        </span>
        <input
          type="tel"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={11}
          inputMode="numeric"
          className="w-full border-0 bg-transparent px-5 py-4 text-sm font-bold text-[#071E3D] focus:outline-none focus:ring-0"
        />
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

function SelectGroup({ label, children, onChange, value, name, error, disabled }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] opacity-50">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-[#071E3D] transition-all focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${error ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/5" : "border-slate-100 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5"}`}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1.5 px-1">
          <AlertTriangle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}