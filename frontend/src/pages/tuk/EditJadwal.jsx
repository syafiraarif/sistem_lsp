import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarTUK from "../../components/sidebar/SidebarTuk";
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  CalendarDays,
  Clock,
  FileText,
  Hash,
  Link as LinkIcon,
  Settings,
  ClipboardList,
  BadgeCheck,
  ChevronRight,
  CalendarCheck,
  Monitor,
  MapPin,
  Video,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const API =
  `${API_BASE}/tuk/jadwal`;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

const EditJadwal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [msg, setMsg] = useState({
    type: "",
    text: "",
  });

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

  const [form, setForm] =
    useState({
      kode_jadwal: "",
      id_skema: "",
      nama_kegiatan: "",
      tahun: "",
      periode_bulan: "",
      gelombang: "",
      tgl_awal: "",
      tgl_akhir: "",
      jam: "",
      pelaksanaan_uji:
        "luring",
      url_agenda: "",
      status: "draft",
    });

  useEffect(() => {
    const fetchData =
      async () => {
        try {
          setLoading(true);

          const res =
            await api.get(
              `${API}/${id}`
            );

          const data =
            res.data?.data;

          if (!data) {
            setMsg({
              type: "error",
              text: "Data jadwal tidak ditemukan.",
            });

            return;
          }

          setForm({
            kode_jadwal:
              data.kode_jadwal ||
              "",
            id_skema:
              data.id_skema ||
              "",
            nama_kegiatan:
              data.nama_kegiatan ||
              "",
            tahun:
              data.tahun ||
              "",
            periode_bulan:
              data.periode_bulan ||
              "",
            gelombang:
              data.gelombang ||
              "",
            tgl_awal:
              data.tgl_awal
                ?.split("T")[0] ||
              "",
            tgl_akhir:
              data.tgl_akhir
                ?.split("T")[0] ||
              "",
            jam:
              data.jam ||
              "",
            pelaksanaan_uji:
              data.pelaksanaan_uji ||
              "luring",
            url_agenda:
              data.url_agenda ||
              "",
            status:
              data.status ||
              "draft",
          });
        } catch (err) {
          console.error(
            "Gagal mengambil data jadwal:",
            err
          );

          setMsg({
            type: "error",
            text:
              err.response?.data
                ?.message ||
              "Gagal mengambil data jadwal.",
          });
        } finally {
          setLoading(false);
        }
      };

    fetchData();
  }, [id]);

  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm(
        (prev) => ({
          ...prev,
          [name]: value,
        })
      );

      if (msg.text) {
        setMsg({
          type: "",
          text: "",
        });
      }
    };

  const handleTypeChange =
    (type) => {
      setForm(
        (prev) => ({
          ...prev,
          pelaksanaan_uji:
            type,
        })
      );

      if (msg.text) {
        setMsg({
          type: "",
          text: "",
        });
      }
    };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !form.nama_kegiatan
          .trim()
      ) {
        setMsg({
          type: "error",
          text: "Nama kegiatan wajib diisi.",
        });

        return;
      }

      if (
        !form.tgl_awal ||
        !form.tgl_akhir
      ) {
        setMsg({
          type: "error",
          text: "Tanggal awal dan tanggal akhir wajib diisi.",
        });

        return;
      }

      if (
        new Date(
          form.tgl_akhir
        ) <
        new Date(
          form.tgl_awal
        )
      ) {
        setMsg({
          type: "error",
          text: "Tanggal akhir tidak boleh lebih kecil dari tanggal awal.",
        });

        return;
      }

      try {
        setSaving(true);

        const payload = {
          ...form,
          tahun:
            parseInt(
              form.tahun,
              10
            ) || null,
        };

        delete payload.kuota;

        await api.put(
          `${API}/${id}`,
          payload
        );

        setMsg({
          type: "success",
          text: "Jadwal berhasil diperbarui.",
        });

        setTimeout(() => {
          navigate(
            "/tuk/jadwal"
          );
        }, 1200);
      } catch (err) {
        console.error(
          "Gagal update jadwal:",
          err
        );

        setMsg({
          type: "error",
          text:
            err.response?.data
              ?.message ||
            "Gagal memperbarui jadwal.",
        });
      } finally {
        setSaving(false);
      }
    };

  const handleLogout =
    () => {
      localStorage.clear();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  const formatStatus =
    (status) => {
      const statusMap = {
        draft: "Draft",
        disetujui:
          "Disetujui",
        ditolak:
          "Ditolak",
        open: "Open",
        ongoing:
          "Ongoing",
        selesai:
          "Selesai",
        arsip: "Arsip",
      };

      return (
        statusMap[status] ||
        status ||
        "-"
      );
    };

  const getStatusClass =
    (status) => {
      if (
        status ===
          "disetujui" ||
        status ===
          "open"
      ) {
        return "bg-green-50 border-green-100 text-green-600";
      }

      if (
        status ===
        "ongoing"
      ) {
        return "bg-blue-50 border-blue-100 text-blue-600";
      }

      if (
        status ===
        "ditolak"
      ) {
        return "bg-red-50 border-red-100 text-red-600";
      }

      if (
        status ===
        "selesai"
      ) {
        return "bg-slate-50 border-slate-200 text-slate-600";
      }

      return "bg-orange-50 border-orange-100 text-orange-600";
    };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <SidebarTUK
          isOpen={
            sidebarOpen
          }
          setIsOpen={
            setSidebarOpen
          }
          onLogout={
            handleLogout
          }
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
              Memuat Data Jadwal
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
        isOpen={
          sidebarOpen
        }
        setIsOpen={
          setSidebarOpen
        }
        onLogout={
          handleLogout
        }
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
                      navigate(
                        "/tuk/jadwal"
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#071E3D]/15 bg-white text-[#071E3D] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white"
                  >
                    <ArrowLeft
                      size={18}
                    />
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
                      Edit Jadwal Uji Kompetensi
                    </h1>

                    <p className="mt-1 text-[11px] font-medium text-[#182D4A]/60">
                      Perbarui informasi jadwal dan
                      pengaturan pelaksanaan uji.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${getStatusClass(
                      form.status
                    )}`}
                  >
                    <BadgeCheck
                      size={13}
                    />
                    {formatStatus(
                      form.status
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      saving
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-2.5 text-[11px] font-bold text-white transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-[#CC6B27]/50"
                  >
                    {saving ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={15}
                      />
                    )}

                    {saving
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {msg.text && (
            <section
              className={`rounded-xl border px-5 py-4 shadow-sm ${
                msg.type ===
                "success"
                  ? "border-green-100 bg-green-50"
                  : "border-red-100 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {msg.type ===
                "success" ? (
                  <CheckCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-green-600"
                  />
                ) : (
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                )}

                <div>
                  <p
                    className={`text-[12px] font-black ${
                      msg.type ===
                      "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {msg.type ===
                    "success"
                      ? "Berhasil"
                      : "Terjadi Kesalahan"}
                  </p>

                  <p
                    className={`mt-0.5 text-[11px] font-medium ${
                      msg.type ===
                      "success"
                        ? "text-green-700/70"
                        : "text-red-700/70"
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            </section>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={
                      <FileText
                        size={17}
                      />
                    }
                    title="Identitas Jadwal"
                    description="Informasi dasar jadwal uji kompetensi"
                  />

                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6">
                    <InputField
                      label="Kode Jadwal"
                      name="kode_jadwal"
                      value={
                        form.kode_jadwal
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan kode jadwal"
                      icon={
                        <Hash
                          size={
                            17
                          }
                        />
                      }
                    />

                    <InputField
                      label="Nama Kegiatan"
                      name="nama_kegiatan"
                      value={
                        form.nama_kegiatan
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Masukkan nama kegiatan"
                      required
                      icon={
                        <BadgeCheck
                          size={
                            17
                          }
                        />
                      }
                    />

                    <InputField
                      label="Tahun"
                      name="tahun"
                      type="number"
                      value={
                        form.tahun
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Contoh: 2026"
                    />

                    <SelectField
                      label="Periode Bulan"
                      name="periode_bulan"
                      value={
                        form.periode_bulan
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="">
                        Pilih Bulan
                      </option>

                      {bulanList.map(
                        (
                          bulan
                        ) => (
                          <option
                            key={
                              bulan
                            }
                            value={
                              bulan
                            }
                          >
                            {
                              bulan
                            }
                          </option>
                        )
                      )}
                    </SelectField>

                    <InputField
                      label="Gelombang"
                      name="gelombang"
                      value={
                        form.gelombang
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Contoh: Gelombang 1"
                    />
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={
                      <CalendarDays
                        size={17}
                      />
                    }
                    title="Tanggal & Waktu"
                    description="Atur periode dan waktu pelaksanaan"
                  />

                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
                    <InputField
                      label="Tanggal Mulai"
                      name="tgl_awal"
                      type="date"
                      value={
                        form.tgl_awal
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                    <InputField
                      label="Tanggal Selesai"
                      name="tgl_akhir"
                      type="date"
                      value={
                        form.tgl_akhir
                      }
                      min={
                        form.tgl_awal ||
                        undefined
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                    <InputField
                      label="Jam Pelaksanaan"
                      name="jam"
                      type="time"
                      value={
                        form.jam
                      }
                      onChange={
                        handleChange
                      }
                      icon={
                        <Clock
                          size={
                            17
                          }
                        />
                      }
                    />
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                  <SectionHeader
                    icon={
                      <Settings
                        size={17}
                      />
                    }
                    title="Pengaturan Pelaksanaan"
                    description="Tentukan metode pelaksanaan dan tautan agenda"
                  />

                  <div className="space-y-5 p-5 md:p-6">
                    <div>
                      <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
                        Metode Pelaksanaan Uji
                      </label>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <TypeButton
                          label="Luring"
                          description="Tatap muka"
                          icon={
                            <MapPin
                              size={
                                17
                              }
                            />
                          }
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
                          icon={
                            <Video
                              size={
                                17
                              }
                            />
                          }
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

                        <TypeButton
                          label="Hybrid"
                          description="Gabungan"
                          icon={
                            <Monitor
                              size={
                                17
                              }
                            />
                          }
                          active={
                            form.pelaksanaan_uji ===
                            "hybrid"
                          }
                          onClick={() =>
                            handleTypeChange(
                              "hybrid"
                            )
                          }
                        />

                        <TypeButton
                          label="Onsite"
                          description="Lokasi TUK"
                          icon={
                            <MapPin
                              size={
                                17
                              }
                            />
                          }
                          active={
                            form.pelaksanaan_uji ===
                            "onsite"
                          }
                          onClick={() =>
                            handleTypeChange(
                              "onsite"
                            )
                          }
                        />
                      </div>
                    </div>

                    <InputField
                      label="URL Agenda / Zoom"
                      name="url_agenda"
                      value={
                        form.url_agenda
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://..."
                      icon={
                        <LinkIcon
                          size={
                            17
                          }
                        />
                      }
                    />
                  </div>
                </section>
              </div>

              <aside>
                <div className="space-y-5 xl:sticky xl:top-6">
                  <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-4">
                      <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                        <ClipboardList
                          size={16}
                          className="text-[#CC6B27]"
                        />
                        Ringkasan Jadwal
                      </h2>
                    </div>

                    <div className="space-y-3 p-5">
                      <SummaryItem
                        icon={
                          <BadgeCheck
                            size={
                              15
                            }
                          />
                        }
                        label="Status"
                        value={formatStatus(
                          form.status
                        )}
                      />

                      <SummaryItem
                        icon={
                          <FileText
                            size={
                              15
                            }
                          />
                        }
                        label="Nama Kegiatan"
                        value={
                          form.nama_kegiatan ||
                          "-"
                        }
                      />

                      <SummaryItem
                        icon={
                          <Hash
                            size={
                              15
                            }
                          />
                        }
                        label="Kode Jadwal"
                        value={
                          form.kode_jadwal ||
                          "-"
                        }
                      />

                      <SummaryItem
                        icon={
                          <CalendarCheck
                            size={
                              15
                            }
                          />
                        }
                        label="Tanggal"
                        value={
                          form.tgl_awal &&
                          form.tgl_akhir
                            ? `${formatShortDate(
                                form.tgl_awal
                              )} - ${formatShortDate(
                                form.tgl_akhir
                              )}`
                            : "-"
                        }
                      />

                      <SummaryItem
                        icon={
                          <Clock
                            size={
                              15
                            }
                          />
                        }
                        label="Waktu"
                        value={
                          form.jam ||
                          "-"
                        }
                      />

                      <SummaryItem
                        icon={
                          <Settings
                            size={
                              15
                            }
                          />
                        }
                        label="Pelaksanaan"
                        value={
                          form.pelaksanaan_uji ||
                          "-"
                        }
                      />
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                    <div className="border-b border-[#071E3D]/10 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                          <Save
                            size={17}
                          />
                        </div>

                        <div>
                          <h3 className="text-[14px] font-black text-[#071E3D]">
                            Simpan Perubahan
                          </h3>

                          <p className="mt-0.5 text-[10px] font-medium text-[#182D4A]/50">
                            Pastikan data sudah benar.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 p-5">
                      <button
                        type="submit"
                        disabled={
                          saving
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-3 text-[11px] font-bold text-white transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-[#CC6B27]/50"
                      >
                        {saving ? (
                          <Loader2
                            size={
                              15
                            }
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={
                              15
                            }
                          />
                        )}

                        {saving
                          ? "Menyimpan..."
                          : "Update Jadwal"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/tuk/jadwal"
                          )
                        }
                        disabled={
                          saving
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#071E3D]/15 bg-white px-4 py-3 text-[11px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowLeft
                          size={
                            15
                          }
                        />
                        Batal / Kembali
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#CC6B27] shadow-sm">
                        <AlertCircle
                          size={
                            16
                          }
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-black text-[#071E3D]">
                          Catatan
                        </p>

                        <p className="mt-1 text-[10px] font-medium leading-5 text-[#182D4A]/55">
                          Perubahan yang disimpan akan
                          langsung memperbarui data jadwal
                          di sistem TUK.
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
          onChange={
            onChange
          }
          placeholder={
            placeholder
          }
          required={
            required
          }
          min={min}
          className={`w-full rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] px-4 py-3 text-[12px] font-semibold text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/30 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10 ${
            icon
              ? "pl-11"
              : ""
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
  children,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={
            onChange
          }
          className="w-full appearance-none rounded-lg border border-[#071E3D]/15 bg-[#FAFAFA] px-4 py-3 pr-10 text-[12px] font-semibold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
        >
          {children}
        </select>

        <ChevronRight
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-[#182D4A]/40"
        />
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
      onClick={
        onClick
      }
      className={`flex min-h-[78px] flex-col items-start rounded-lg border p-3 text-left transition-all ${
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

      <p className="mt-1.5 line-clamp-2 text-[12px] font-bold leading-5 text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
};

const formatShortDate =
  (date) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

export default EditJadwal;