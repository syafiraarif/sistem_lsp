import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import { notifikasi } from "../../components/ui/notifikasi";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Hash,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  Save,
  Settings,
  ClipboardList,
  Video,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const API = `${API_BASE}/tuk/jadwal`;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const BuatJadwal = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [skemaLoading, setSkemaLoading] = useState(true);
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
    tahun: currentYear,
    periode_bulan: "",
    gelombang: "",
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

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const fetchSkema = async () => {
      try {
        setSkemaLoading(true);

        const res = await api.get("/tuk/skema");

        setSkemaOptions(
          Array.isArray(res.data?.data)
            ? res.data.data
            : []
        );
      } catch (err) {
        console.error(
          "Skema Error:",
          err.response?.data || err.message
        );

        if (err.response?.status === 401) {
          localStorage.clear();

          await notifikasi.peringatan(
            "Sesi Berakhir",
            "Silakan login kembali untuk melanjutkan."
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        await notifikasi.gagal(
          "Gagal Memuat Skema",
          err.response?.data?.message ||
            "Data skema sertifikasi gagal dimuat."
        );
      } finally {
        setSkemaLoading(false);
      }
    };

    fetchSkema();
  }, [navigate]);

  const getFilteredBulan = () => {
    if (parseInt(form.tahun, 10) === currentYear) {
      return bulanList.filter(
        (_, index) => index >= currentMonth
      );
    }

    return bulanList;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      pelaksanaan_uji: type,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_skema) {
      await notifikasi.peringatan(
        "Skema Belum Dipilih",
        "Silakan pilih skema sertifikasi terlebih dahulu."
      );

      return;
    }

    if (!form.tgl_awal || !form.tgl_akhir) {
      await notifikasi.peringatan(
        "Tanggal Belum Lengkap",
        "Tanggal awal dan tanggal akhir wajib diisi."
      );

      return;
    }

    if (
      new Date(form.tgl_akhir) <
      new Date(form.tgl_awal)
    ) {
      await notifikasi.peringatan(
        "Tanggal Tidak Valid",
        "Tanggal akhir tidak boleh lebih kecil dari tanggal awal."
      );

      return;
    }

    if (
      !form.tahun ||
      Number(form.tahun) < 2020
    ) {
      await notifikasi.peringatan(
        "Tahun Tidak Valid",
        "Silakan masukkan tahun yang valid."
      );

      return;
    }

    try {
      setLoading(true);

      const selectedSkema = skemaOptions.find(
        (skema) =>
          String(skema.id_skema) ===
          String(form.id_skema)
      );

      const payload = {
        kode_jadwal:
          form.kode_jadwal || null,
        id_skema:
          parseInt(form.id_skema, 10),
        nama_kegiatan:
          selectedSkema?.judul_skema ||
          "Uji Kompetensi",
        tahun:
          parseInt(form.tahun, 10),
        periode_bulan:
          form.periode_bulan || null,
        gelombang:
          form.gelombang || null,
        tgl_pra_asesmen:
          form.tgl_pra_asesmen || null,
        tgl_awal:
          form.tgl_awal || null,
        tgl_akhir:
          form.tgl_akhir || null,
        jam:
          form.jam || null,
        pelaksanaan_uji:
          form.pelaksanaan_uji,
        url_agenda:
          form.url_agenda || null,
        status:
          form.status,
      };

      await api.post(API, payload);

      await notifikasi.sukses(
        "Berhasil",
        "Jadwal berhasil dibuat dan menunggu verifikasi admin."
      );

      navigate("/tuk/jadwal", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Create jadwal error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.clear();

        await notifikasi.peringatan(
          "Sesi Berakhir",
          "Silakan login kembali untuk melanjutkan."
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      await notifikasi.gagal(
        "Gagal Membuat Jadwal",
        err.response?.data?.message ||
          "Gagal membuat jadwal."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login", {
      replace: true,
    });
  };

  const selectedSkema = skemaOptions.find(
    (skema) =>
      String(skema.id_skema) ===
      String(form.id_skema)
  );

  const selectedSkemaName =
    selectedSkema?.judul_skema || "";

  if (skemaLoading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <SidebarTUK
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl border border-[#071E3D]/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <Loader2
                size={25}
                className="animate-spin"
              />
            </div>

            <p className="text-[16px] font-black text-[#071E3D]">
              Memuat Data Skema
            </p>

            <p className="mt-1 text-[11px] font-medium text-[#182D4A]/50">
              Mohon tunggu sebentar...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <SidebarTUK
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b-4 border-[#CC6B27] bg-white px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/tuk/jadwal")
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#071E3D]/15 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="h-9 w-px bg-[#071E3D]/10" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ClipboardList
                        size={17}
                        className="shrink-0 text-[#CC6B27]"
                      />

                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC6B27]">
                        Manajemen Jadwal TUK
                      </span>
                    </div>

                    <h1 className="mt-1 truncate text-[20px] font-black text-[#071E3D] md:text-[24px]">
                      Buat Jadwal Uji Kompetensi
                    </h1>

                    <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                      Lengkapi informasi jadwal sebelum
                      diajukan untuk proses verifikasi admin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/tuk/jadwal")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/15 bg-white px-4 py-2.5 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white"
                >
                  <CalendarCheck size={15} />
                  Lihat Jadwal
                </button>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={<FileText size={17} />}
                    title="Identitas Jadwal"
                    description="Tentukan skema dan identitas dasar jadwal"
                  />

                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6">
                    <InputField
                      label="Kode Jadwal"
                      name="kode_jadwal"
                      value={form.kode_jadwal}
                      onChange={handleChange}
                      placeholder="Opsional"
                      icon={<Hash size={17} />}
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
                        {skemaLoading
                          ? "Memuat skema..."
                          : "Pilih Skema"}
                      </option>

                      {skemaOptions.map(
                        (skema) => (
                          <option
                            key={skema.id_skema}
                            value={skema.id_skema}
                          >
                            {skema.judul_skema}
                            {skema.kode_skema
                              ? ` (${skema.kode_skema})`
                              : ""}
                          </option>
                        )
                      )}
                    </SelectField>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={<Clock size={17} />}
                    title="Periode & Gelombang"
                    description="Atur tahun, periode bulan, dan gelombang pelaksanaan"
                  />

                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
                    <InputField
                      label="Tahun"
                      name="tahun"
                      type="number"
                      value={form.tahun}
                      onChange={handleChange}
                      placeholder="Contoh: 2026"
                      min="2020"
                      max="2030"
                    />

                    <SelectField
                      label="Periode Bulan"
                      name="periode_bulan"
                      value={form.periode_bulan}
                      onChange={handleChange}
                    >
                      <option value="">
                        Pilih Bulan
                      </option>

                      {getFilteredBulan().map(
                        (bulan) => (
                          <option
                            key={bulan}
                            value={bulan}
                          >
                            {bulan}
                          </option>
                        )
                      )}
                    </SelectField>

                    <InputField
                      label="Gelombang"
                      name="gelombang"
                      value={form.gelombang}
                      onChange={handleChange}
                      placeholder="Contoh: Gelombang 1"
                    />
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={<CalendarDays size={17} />}
                    title="Tanggal & Waktu"
                    description="Tentukan periode dan waktu pelaksanaan uji"
                  />

                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
                    <InputField
                      label="Tanggal Mulai"
                      name="tgl_awal"
                      type="date"
                      value={form.tgl_awal}
                      min={todayString}
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="Tanggal Selesai"
                      name="tgl_akhir"
                      type="date"
                      value={form.tgl_akhir}
                      min={
                        form.tgl_awal ||
                        todayString
                      }
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="Jam Pelaksanaan"
                      name="jam"
                      type="time"
                      value={form.jam}
                      onChange={handleChange}
                      icon={<Clock size={17} />}
                    />
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={<Settings size={17} />}
                    title="Pengaturan Pelaksanaan"
                    description="Pilih metode uji dan tambahkan agenda jika diperlukan"
                  />

                  <div className="space-y-5 p-5 md:p-6">
                    <div>
                      <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
                        Metode Pelaksanaan Uji
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <TypeButton
                          label="Luring"
                          description="Tatap muka"
                          icon={<MapPin size={17} />}
                          active={
                            form.pelaksanaan_uji ===
                            "luring"
                          }
                          onClick={() =>
                            handleTypeChange(
                              "luring"
                            )
                          }
                        />

                        <TypeButton
                          label="Daring"
                          description="Online"
                          icon={<Video size={17} />}
                          active={
                            form.pelaksanaan_uji ===
                            "daring"
                          }
                          onClick={() =>
                            handleTypeChange(
                              "daring"
                            )
                          }
                        />
                      </div>
                    </div>

                    <InputField
                      label="URL Agenda / Zoom"
                      name="url_agenda"
                      value={form.url_agenda}
                      onChange={handleChange}
                      placeholder="Opsional"
                      icon={<LinkIcon size={17} />}
                    />
                  </div>
                </section>
              </div>

              <aside>
                <div className="space-y-5 xl:sticky xl:top-6">
                  <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4">
                      <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                        <Plus
                          size={16}
                          className="text-[#CC6B27]"
                        />
                        Ringkasan Pengajuan
                      </h2>
                    </div>

                    <div className="space-y-3 p-5">
                      <SummaryItem
                        icon={<CheckCircle size={15} />}
                        label="Status Awal"
                        value="Draft"
                        accent
                      />

                      <SummaryItem
                        icon={<FileText size={15} />}
                        label="Skema"
                        value={
                          selectedSkemaName ||
                          "Belum dipilih"
                        }
                      />

                      <SummaryItem
                        icon={<Hash size={15} />}
                        label="Kode Jadwal"
                        value={
                          form.kode_jadwal ||
                          "Otomatis / belum diisi"
                        }
                      />

                      <SummaryItem
                        icon={<CalendarCheck size={15} />}
                        label="Tanggal"
                        value={
                          form.tgl_awal &&
                          form.tgl_akhir
                            ? `${formatShortDate(
                                form.tgl_awal
                              )} - ${formatShortDate(
                                form.tgl_akhir
                              )}`
                            : "Belum diatur"
                        }
                      />

                      <SummaryItem
                        icon={<Clock size={15} />}
                        label="Waktu"
                        value={
                          form.jam ||
                          "Belum diatur"
                        }
                      />

                      <SummaryItem
                        icon={<Settings size={15} />}
                        label="Pelaksanaan"
                        value={
                          form.pelaksanaan_uji
                        }
                      />
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b border-[#071E3D]/10 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                          <Save size={17} />
                        </div>

                        <div>
                          <h3 className="text-[14px] font-black text-[#071E3D]">
                            Simpan Jadwal
                          </h3>

                          <p className="mt-0.5 text-[10px] font-medium text-[#182D4A]/50">
                            Pastikan semua data sudah benar.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 p-5">
                      <button
                        type="submit"
                        disabled={
                          loading ||
                          skemaLoading
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-3 text-[11px] font-bold text-white transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-[#CC6B27]/50"
                      >
                        {loading ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={15} />
                        )}

                        {loading
                          ? "Menyimpan..."
                          : "Simpan Jadwal Baru"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/tuk/jadwal")
                        }
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#071E3D]/15 bg-white px-4 py-3 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowLeft size={15} />
                        Batal / Kembali
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#CC6B27] shadow-sm">
                        <CheckCircle size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-black text-[#071E3D]">
                          Proses Pengajuan
                        </p>

                        <p className="mt-1 text-[10px] font-medium leading-5 text-[#182D4A]/55">
                          Setelah disimpan, jadwal akan
                          berstatus draft dan menunggu
                          proses verifikasi admin.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#CC6B27]">
          {icon}
        </div>

        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-white">
            {title}
          </h2>

          <p className="mt-0.5 text-[10px] font-medium text-white/50">
            {description}
          </p>
        </div>
      </div>
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
  required = false,
  min,
  max,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60"
      >
        {label}

        {required && (
          <span className="ml-1 text-[#CC6B27]">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-[#182D4A]/35">
            {icon}
          </div>
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          className={`w-full rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] px-4 py-3 text-[12px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/30 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 ${
            icon ? "pl-11" : ""
          }`}
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
  disabled = false,
  loading = false,
  children,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60"
      >
        {label}

        <span className="ml-1 text-[#CC6B27]">
          *
        </span>
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] px-4 py-3 pr-10 text-[12px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {children}
        </select>

        {loading ? (
          <Loader2
            size={15}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#CC6B27]"
          />
        ) : (
          <ChevronRight
            size={15}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-[#182D4A]/40"
          />
        )}
      </div>
    </div>
  );
};

const TypeButton = ({
  label,
  description,
  icon,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[80px] flex-col items-start rounded-lg border p-3 text-left transition-all ${
        active
          ? "border-[#CC6B27] bg-[#CC6B27] text-white"
          : "border-[#071E3D]/10 bg-[#FAFAFA] text-[#071E3D] hover:border-[#CC6B27]/50 hover:bg-white"
      }`}
    >
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
          active
            ? "bg-white/15 text-white"
            : "bg-[#CC6B27]/10 text-[#CC6B27]"
        }`}
      >
        {icon}
      </div>

      <span className="text-[11px] font-black">
        {label}
      </span>

      <span
        className={`mt-0.5 text-[9px] font-medium ${
          active
            ? "text-white/65"
            : "text-[#182D4A]/45"
        }`}
      >
        {description}
      </span>
    </button>
  );
};

const SummaryItem = ({
  icon,
  label,
  value,
  accent = false,
}) => {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-3">
      <div className="flex items-center gap-2">
        <span className="text-[#CC6B27]">
          {icon}
        </span>

        <p className="text-[9px] font-bold uppercase tracking-widest text-[#182D4A]/50">
          {label}
        </p>
      </div>

      <p
        className={`mt-1.5 line-clamp-2 text-[12px] font-bold leading-5 ${
          accent
            ? "text-[#CC6B27]"
            : "text-[#071E3D]"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
};

const formatShortDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default BuatJadwal;