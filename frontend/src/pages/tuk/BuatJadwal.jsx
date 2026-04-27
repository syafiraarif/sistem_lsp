// frontend/src/pages/tuk/BuatJadwal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  Calendar,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Hash,
  Link as LinkIcon,
  Settings,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

const BuatJadwal = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [skemaLoading, setSkemaLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skemaOptions, setSkemaOptions] = useState([]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayString = today.toISOString().split("T")[0];

  const bulanList = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const [form, setForm] = useState({
    kode_jadwal: "",
    id_skema: "",
    nama_kegiatan: "",
    tahun: currentYear,
    periode_bulan: "",
    gelombang: "",
    kuota: "",
    tgl_pra_asesmen: "",
    tgl_awal: "",
    tgl_akhir: "",
    jam: "09:00",
    pelaksanaan_uji: "luring",
    url_agenda: "",
    status: "draft",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchSkema = async () => {
      try {
        setSkemaLoading(true);

        const res = await axios.get("http://localhost:3000/api/tuk/skema", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSkemaOptions(res.data?.data || []);
      } catch (err) {
        console.error("Skema Error:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setSkemaLoading(false);
      }
    };

    fetchSkema();
  }, [navigate]);

  const getFilteredBulan = () => {
    if (parseInt(form.tahun) === currentYear) {
      return bulanList.filter((_, i) => i >= currentMonth);
    }

    return bulanList;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (msg.text) {
      setMsg({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_skema) {
      return setMsg({ type: "error", text: "Pilih Skema terlebih dahulu!" });
    }

    if (!form.nama_kegiatan) {
      return setMsg({ type: "error", text: "Nama kegiatan wajib diisi!" });
    }

    if (!form.kuota || isNaN(form.kuota)) {
      return setMsg({ type: "error", text: "Kuota harus angka!" });
    }

    if (!form.tgl_awal || !form.tgl_akhir) {
      return setMsg({
        type: "error",
        text: "Tanggal Awal & Akhir wajib diisi!",
      });
    }

    if (new Date(form.tgl_akhir) < new Date(form.tgl_awal)) {
      return setMsg({
        type: "error",
        text: "Tanggal akhir tidak boleh lebih kecil dari tanggal awal!",
      });
    }

    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");

      const payload = {
        kode_jadwal: form.kode_jadwal || null,
        id_skema: parseInt(form.id_skema),
        nama_kegiatan: form.nama_kegiatan,
        tahun: parseInt(form.tahun),
        periode_bulan: form.periode_bulan || null,
        gelombang: form.gelombang || null,
        tgl_pra_asesmen: form.tgl_pra_asesmen || null,
        tgl_awal: form.tgl_awal || null,
        tgl_akhir: form.tgl_akhir || null,
        jam: form.jam || null,
        kuota: parseInt(form.kuota),
        pelaksanaan_uji: form.pelaksanaan_uji,
        url_agenda: form.url_agenda || null,
        status: form.status,
      };

      await axios.post("http://localhost:3000/api/tuk/jadwal", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg({ type: "success", text: "Jadwal berhasil dibuat!" });

      setTimeout(() => navigate("/tuk/jadwal"), 1500);
    } catch (err) {
      console.error("Create jadwal error:", err.response?.data || err.message);

      setMsg({
        type: "error",
        text: err.response?.data?.message || "Gagal membuat jadwal!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ClipboardList size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Manajemen Jadwal TUK
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Buat Jadwal Uji Kompetensi
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Lengkapi detail skema, waktu pelaksanaan, kuota peserta, dan
                  pengaturan jadwal untuk diajukan ke admin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tuk/jadwal")}
                className="w-full sm:w-fit px-6 py-4 rounded-2xl border border-slate-200 bg-white text-[#071E3D] font-black text-xs uppercase tracking-widest hover:bg-[#071E3D] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Lihat Jadwal
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          {msg.text && (
            <div
              className={`mb-6 rounded-[24px] border p-5 flex items-start gap-3 ${
                msg.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-red-50 border-red-100 text-red-600"
              }`}
            >
              {msg.type === "success" ? (
                <CheckCircle size={22} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={22} className="shrink-0 mt-0.5" />
              )}

              <div>
                <p className="font-black">
                  {msg.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
                </p>
                <p className="text-sm font-medium mt-1">{msg.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <section className="xl:col-span-2 space-y-6">
                <Card title="Identitas Jadwal" icon={<FileText size={22} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Kode Jadwal"
                      name="kode_jadwal"
                      value={form.kode_jadwal}
                      onChange={handleChange}
                      placeholder="Opsional"
                      icon={<Hash size={18} />}
                    />

                    <SelectField
                      label="Skema Sertifikasi"
                      name="id_skema"
                      value={form.id_skema}
                      onChange={handleChange}
                      disabled={skemaLoading}
                      loading={skemaLoading}
                    >
                      <option value="">
                        {skemaLoading ? "Memuat skema..." : "Pilih Skema"}
                      </option>
                      {skemaOptions.map((s) => (
                        <option key={s.id_skema} value={s.id_skema}>
                          {s.judul_skema} ({s.kode_skema})
                        </option>
                      ))}
                    </SelectField>

                    <div className="md:col-span-2">
                      <InputField
                        label="Nama Kegiatan"
                        name="nama_kegiatan"
                        value={form.nama_kegiatan}
                        onChange={handleChange}
                        placeholder="Contoh: Uji Kompetensi Junior Web Developer"
                        required
                        icon={<BadgeCheck size={18} />}
                      />
                    </div>
                  </div>
                </Card>

                <Card title="Waktu Pelaksanaan" icon={<Clock size={22} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Tahun"
                      name="tahun"
                      type="number"
                      value={form.tahun}
                      onChange={handleChange}
                      min="2020"
                      max="2030"
                    />

                    <SelectField
                      label="Periode Bulan"
                      name="periode_bulan"
                      value={form.periode_bulan}
                      onChange={handleChange}
                    >
                      <option value="">Pilih Bulan</option>
                      {getFilteredBulan().map((bulan) => (
                        <option key={bulan} value={bulan}>
                          {bulan}
                        </option>
                      ))}
                    </SelectField>

                    <InputField
                      label="Gelombang"
                      name="gelombang"
                      value={form.gelombang}
                      onChange={handleChange}
                      placeholder="Opsional"
                    />

                    <InputField
                      label="Kuota Peserta"
                      name="kuota"
                      type="number"
                      value={form.kuota}
                      onChange={handleChange}
                      placeholder="Contoh: 30"
                      min="1"
                      required
                      icon={<Users size={18} />}
                    />
                  </div>
                </Card>

                <Card title="Tanggal Pelaksanaan" icon={<Calendar size={22} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Tanggal Pra Asesmen"
                      name="tgl_pra_asesmen"
                      type="date"
                      value={form.tgl_pra_asesmen}
                      onChange={handleChange}
                    />

                    <InputField
                      label="Tanggal Mulai Uji"
                      name="tgl_awal"
                      type="date"
                      min={todayString}
                      value={form.tgl_awal}
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="Tanggal Selesai Uji"
                      name="tgl_akhir"
                      type="date"
                      min={form.tgl_awal || todayString}
                      value={form.tgl_akhir}
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="Jam Pelaksanaan"
                      name="jam"
                      type="time"
                      value={form.jam}
                      onChange={handleChange}
                    />
                  </div>
                </Card>

                <Card title="Pengaturan Lain" icon={<Settings size={22} />}>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50 mb-3">
                        Tipe Pelaksanaan Uji
                      </label>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["luring", "daring", "hybrid", "onsite"].map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setForm({ ...form, pelaksanaan_uji: type })
                              }
                              className={`px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                                form.pelaksanaan_uji === type
                                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                                  : "bg-slate-50 text-[#071E3D] border-slate-100 hover:border-orange-200 hover:bg-orange-50"
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <InputField
                      label="URL Agenda / Zoom"
                      name="url_agenda"
                      value={form.url_agenda}
                      onChange={handleChange}
                      placeholder="Opsional"
                      icon={<LinkIcon size={18} />}
                    />
                  </div>
                </Card>
              </section>

              <aside className="xl:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm p-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
                      <Plus size={28} />
                    </div>

                    <h2 className="text-xl font-black text-[#071E3D] mb-3">
                      Ringkasan Pengajuan
                    </h2>

                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-5">
                      Jadwal baru akan tersimpan sebagai draft dan menunggu
                      proses persetujuan admin.
                    </p>

                    <div className="space-y-3">
                      <SummaryItem
                        label="Status Awal"
                        value="Draft"
                        color="text-orange-500"
                      />
                      <SummaryItem
                        label="Skema"
                        value={
                          form.id_skema
                            ? skemaOptions.find(
                                (s) =>
                                  String(s.id_skema) === String(form.id_skema)
                              )?.judul_skema || "Dipilih"
                            : "Belum dipilih"
                        }
                      />
                      <SummaryItem
                        label="Pelaksanaan"
                        value={form.pelaksanaan_uji}
                      />
                      <SummaryItem
                        label="Kuota"
                        value={form.kuota ? `${form.kuota} peserta` : "-"}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || skemaLoading}
                    className={`w-full px-7 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                      loading || skemaLoading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-[#071E3D] shadow-orange-500/20"
                    }`}
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {loading ? "Menyimpan..." : "Simpan Jadwal Baru"}
                  </button>

                  <div className="bg-[#071E3D] rounded-[30px] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="relative z-10">
                      <h3 className="font-black text-lg mb-2">
                        Catatan Penting
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Pastikan tanggal mulai dan selesai sudah benar sebelum
                        menyimpan jadwal.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Form Jadwal
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  icon,
  required,
  min,
  max,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
        {required && <span className="text-orange-500"> *</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          required={required}
          className={`w-full ${
            icon ? "pl-14" : "pl-6"
          } pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 focus:bg-white transition-all text-sm font-bold text-[#071E3D] placeholder:text-slate-300`}
        />
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  loading,
  children,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#071E3D] ml-1 opacity-50">
        {label}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none transition-all text-sm font-bold text-[#071E3D] appearance-none ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5`}
        >
          {children}
        </select>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-orange-500" />
          ) : (
            <ChevronRight size={18} className="rotate-90" />
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, color = "text-[#071E3D]" }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`font-black text-sm ${color} capitalize line-clamp-2`}>
        {value}
      </p>
    </div>
  );
};

export default BuatJadwal;