import React, { useEffect, useMemo, useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Filter,
  Loader2,
  MapPin,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";
import api from "../../services/api";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  api?.defaults?.baseURL ||
  "";

const FILE_BASE = String(API_BASE).replace(
  /\/api\/?$/,
  ""
);

export default function JadwalVerifikasiTuk() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [jadwalList, setJadwalList] =
    useState([]);
  const [persyaratanList, setPersyaratanList] =
    useState([]);
  const [selectedJadwal, setSelectedJadwal] =
    useState(null);
  const [detail, setDetail] =
    useState([]);
  const [keputusan, setKeputusan] =
    useState("sesuai");
  const [existingVerifikasi, setExistingVerifikasi] =
    useState(null);
  const [profileAsesor, setProfileAsesor] =
    useState(null);
  const [search, setSearch] =
    useState("");
  const [filterStatus, setFilterStatus] =
    useState("semua");
  const [loading, setLoading] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [pesan, setPesan] =
    useState("");
  const [error, setError] =
    useState("");

  const displayName =
    getDisplayName(profileAsesor);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");
      setPesan("");

      const [
        jadwalRes,
        formRes,
        profileRes
      ] = await Promise.all([
        api.get(
          "/asesor/jadwal-verifikasi-tuk"
        ),
        api.get(
          "/asesor/verifikasi-tuk/form"
        ),
        api
          .get("/asesor/profile")
          .catch(() => null)
      ]);

      const jadwalData =
        Array.isArray(
          jadwalRes.data?.data
        )
          ? jadwalRes.data.data
          : [];

      const formData =
        Array.isArray(
          formRes.data?.data
        )
          ? formRes.data.data
          : [];

      const profileData =
        profileRes?.data?.data ||
        profileRes?.data ||
        null;

      setJadwalList(jadwalData);
      setPersyaratanList(formData);
      setProfileAsesor(profileData);

      if (jadwalData.length > 0) {
        const firstJadwal =
          jadwalData[0];

        setSelectedJadwal(
          firstJadwal
        );

        await loadDetailVerifikasi(
          firstJadwal,
          formData
        );
      } else {
        setSelectedJadwal(null);
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(
          createEmptyDetail(formData)
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Gagal memuat jadwal verifikasi TUK"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDetailVerifikasi = async (
    jadwalItem,
    formData = persyaratanList
  ) => {
    try {
      const idJadwal =
        getJadwalId(jadwalItem);

      if (!idJadwal) {
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(
          createEmptyDetail(formData)
        );
        return;
      }

      const res = await api.get(
        `/asesor/verifikasi-tuk/${idJadwal}`
      );

      const data =
        res.data?.data || null;

      if (!data) {
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(
          createEmptyDetail(formData)
        );
        return;
      }

      setExistingVerifikasi(
        data?.id_verifikasi
          ? data
          : null
      );

      setKeputusan(
        data.keputusan || "sesuai"
      );

      const existingDetails =
        Array.isArray(data.detail)
          ? data.detail
          : Array.isArray(
              data.details
            )
          ? data.details
          : [];

      setDetail(
        mergeDetailWithPersyaratan(
          formData,
          existingDetails
        )
      );
    } catch (err) {
      console.error(
        "LOAD DETAIL VERIFIKASI ERROR:",
        err
      );

      setExistingVerifikasi(null);
      setKeputusan("sesuai");
      setDetail(
        createEmptyDetail(formData)
      );
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return jadwalList.filter(
      (item) => {
        const jadwal =
          item.jadwal || {};

        const text = [
          item.status,
          item.catatan,
          item.nama_kegiatan,
          getSkemaText(item.skema),
          item.tempat,
          item.nama_tuk,
          jadwal.kode_jadwal,
          jadwal.nama_kegiatan,
          jadwal.nama_skema,
          jadwal.judul_skema,
          getSkemaText(
            jadwal.skema
          ),
          jadwal.nama_tuk,
          jadwal.tuk?.nama_tuk,
          jadwal.tuk?.nama,
          jadwal.tuk?.kecamatan,
          jadwal.tuk?.kecamatan_tuk,
          jadwal.tempat,
          jadwal.lokasi,
          jadwal.status
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchSearch =
          !keyword ||
          text.includes(keyword);

        const matchStatus =
          filterStatus ===
            "semua" ||
          item.status ===
            filterStatus;

        return (
          matchSearch &&
          matchStatus
        );
      }
    );
  }, [
    jadwalList,
    search,
    filterStatus
  ]);

  const totalJadwal =
    jadwalList.length;

  const totalAktif =
    jadwalList.filter(
      (item) =>
        item.status === "aktif"
    ).length;

  const totalNonaktif =
    jadwalList.filter(
      (item) =>
        item.status ===
        "nonaktif"
    ).length;

  const totalPersyaratan =
    detail.length;

  const totalTerisi =
    detail.filter(
      (item) =>
        Number(
          item.jumlah_total || 0
        ) > 0 ||
        Number(
          item.jumlah_baik || 0
        ) > 0 ||
        Number(
          item.jumlah_rusak || 0
        ) > 0 ||
        item.spesifikasi ||
        item.catatan
    ).length;

  const handleSelectJadwal =
    async (item) => {
      setSelectedJadwal(item);
      setPesan("");
      setError("");

      await loadDetailVerifikasi(
        item,
        persyaratanList
      );
    };

  const handleDetailChange = (
    index,
    field,
    value
  ) => {
    setDetail((prev) =>
      prev.map(
        (item, itemIndex) => {
          if (
            itemIndex !== index
          ) {
            return item;
          }

          const isTextField =
            field === "catatan" ||
            field === "spesifikasi";

          return {
            ...item,
            [field]: isTextField
              ? value
              : onlyNumber(value)
          };
        }
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedJadwal) {
      setError(
        "Pilih jadwal verifikasi TUK terlebih dahulu"
      );
      return;
    }

    if (!keputusan) {
      setError(
        "Keputusan verifikasi wajib diisi"
      );
      return;
    }

    if (
      !detail ||
      detail.length === 0
    ) {
      setError(
        "Detail persyaratan tidak boleh kosong"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setPesan("");

      const idJadwal =
        getJadwalId(
          selectedJadwal
        );

      const payload = {
        keputusan,
        detail: detail.map(
          (item) => ({
            id_persyaratan_tuk:
              item.id_persyaratan_tuk,
            spesifikasi:
              item.spesifikasi ||
              "",
            jumlah_total:
              Number(
                item.jumlah_total ||
                  0
              ),
            jumlah_baik:
              Number(
                item.jumlah_baik ||
                  0
              ),
            jumlah_rusak:
              Number(
                item.jumlah_rusak ||
                  0
              ),
            keterangan:
              item.catatan ||
              ""
          })
        )
      };

      if (
        existingVerifikasi?.id_verifikasi
      ) {
        await api.put(
          `/asesor/verifikasi-tuk/${existingVerifikasi.id_verifikasi}/update`,
          payload
        );

        setPesan(
          "Verifikasi TUK berhasil diupdate"
        );
      } else {
        await api.post(
          `/asesor/verifikasi-tuk/${idJadwal}/submit`,
          payload
        );

        setPesan(
          "Verifikasi TUK berhasil disimpan"
        );
      }

      await loadDetailVerifikasi(
        selectedJadwal,
        persyaratanList
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Gagal menyimpan verifikasi TUK"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (existingVerifikasi) {
      loadDetailVerifikasi(
        selectedJadwal,
        persyaratanList
      );
      return;
    }

    setKeputusan("sesuai");
    setDetail(
      createEmptyDetail(
        persyaratanList
      )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <div className="print:hidden">
        <SidebarAsesor
          isOpen={sidebarOpen}
          setIsOpen={
            setSidebarOpen
          }
        />
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden print:p-0 print:overflow-visible">
        <div className="w-full max-w-[1500px] mx-auto space-y-6 print:max-w-none print:space-y-0">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm print:hidden">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <ShieldCheck
                    size={15}
                    className="text-orange-500"
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Jadwal Verifikasi TUK
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Verifikasi Tempat Uji
                  <br />
                  <span className="text-orange-500">
                    {displayName}
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Pilih jadwal TUK, isi kondisi persyaratan, lalu simpan keputusan verifikasi untuk mendukung kesiapan pelaksanaan asesmen.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={
                      loadPageData
                    }
                    disabled={
                      loading
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={17}
                      />
                    )}

                    Refresh Data
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      saving ||
                      !selectedJadwal
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={17}
                      />
                    )}

                    {existingVerifikasi
                      ? "Update Verifikasi"
                      : "Simpan Verifikasi"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handlePrint
                    }
                    disabled={
                      !selectedJadwal
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    Cetak / PDF
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="relative z-10 flex h-full flex-col">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Ringkasan Verifikasi
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    {totalJadwal} Jadwal TUK
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Jadwal ini khusus untuk asesor dengan tugas sebagai verifikator TUK.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill
                      label="Aktif"
                      value={`${totalAktif} Jadwal`}
                    />

                    <HeroPill
                      label="Nonaktif"
                      value={`${totalNonaktif} Jadwal`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {pesan && (
            <div className="print:hidden">
              <AlertBox
                type="success"
                icon={
                  <BadgeCheck
                    size={20}
                  />
                }
                message={pesan}
              />
            </div>
          )}

          {error && (
            <div className="print:hidden">
              <AlertBox
                type="error"
                icon={
                  <XCircle
                    size={20}
                  />
                }
                message={error}
              />
            </div>
          )}

          {loading && (
            <div className="print:hidden">
              <AlertBox
                type="loading"
                icon={
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                }
                message="Memuat data verifikasi TUK..."
              />
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 print:hidden">
            <MiniStat
              icon={
                <CalendarDays
                  size={22}
                />
              }
              label="Jadwal Verifikasi"
              value={`${totalJadwal} Jadwal`}
            />

            <MiniStat
              icon={
                <ShieldCheck
                  size={22}
                />
              }
              label="Persyaratan"
              value={`${totalPersyaratan} Item`}
            />

            <MiniStat
              icon={
                <BadgeCheck
                  size={22}
                />
              }
              label="Terisi"
              value={`${totalTerisi} Item`}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[410px_1fr] gap-6 items-start print:block print:w-full">
            <aside className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden print:hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <Filter
                    size={15}
                    className="text-orange-500"
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Pilih Jadwal
                  </span>
                </div>

                <h2 className="text-2xl font-black text-[#071E3D]">
                  Jadwal Verifikasi
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Pilih jadwal TUK yang akan diverifikasi.
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari jadwal, skema, TUK..."
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-12 py-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <select
                  value={
                    filterStatus
                  }
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                >
                  <option value="semua">
                    Semua Status
                  </option>

                  <option value="aktif">
                    Aktif
                  </option>

                  <option value="nonaktif">
                    Nonaktif
                  </option>
                </select>
              </div>

              <div className="max-h-[700px] overflow-y-auto p-5 pt-0 space-y-3">
                {filteredJadwal.length ===
                0 ? (
                  <EmptySmall
                    title="Jadwal tidak ditemukan"
                    description="Belum ada jadwal verifikasi TUK yang cocok."
                  />
                ) : (
                  filteredJadwal.map(
                    (
                      item,
                      index
                    ) => (
                      <JadwalCard
                        key={`${getJadwalId(
                          item
                        )}-${index}`}
                        item={
                          item
                        }
                        active={isSameJadwal(
                          item,
                          selectedJadwal
                        )}
                        onClick={() =>
                          handleSelectJadwal(
                            item
                          )
                        }
                      />
                    )
                  )
                )}
              </div>
            </aside>

            <section className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none print:w-full print:overflow-visible">
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                    Form Ceklist Verifikasi TUK
                  </h2>

                  <p className="mt-2 text-sm font-medium text-slate-400">
                    {selectedJadwal
                      ? getJadwalTitle(
                          selectedJadwal
                        )
                      : "Pilih jadwal terlebih dahulu."}
                  </p>
                </div>

                <StatusSubmitBadge
                  existing={
                    existingVerifikasi
                  }
                />
              </div>

              <div className="p-6 print:p-0 print:w-full">
                {!selectedJadwal ? (
                  <EmptyState
                    title="Belum Ada Jadwal Dipilih"
                    description="Pilih jadwal verifikasi TUK di sisi kiri untuk mulai mengisi form."
                  />
                ) : (
                  <div className="print-document">
                    <DocumentChecklist
                      selectedJadwal={
                        selectedJadwal
                      }
                      detail={
                        detail
                      }
                      keputusan={
                        keputusan
                      }
                      setKeputusan={
                        setKeputusan
                      }
                      onDetailChange={
                        handleDetailChange
                      }
                      profileAsesor={
                        profileAsesor
                      }
                    />
                  </div>
                )}

                {selectedJadwal && (
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[30px] border border-slate-100 bg-slate-50/60 p-5 print:hidden">
                    <div>
                      <p className="text-sm font-black text-[#071E3D]">
                        {existingVerifikasi
                          ? "Update data verifikasi TUK"
                          : "Simpan data verifikasi TUK"}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        TTD asesor otomatis memakai tanda tangan yang tersimpan pada profile asesor.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={
                          handleResetForm
                        }
                        disabled={
                          saving
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:bg-slate-200 disabled:cursor-not-allowed"
                      >
                        <RefreshCcw
                          size={16}
                        />
                        Reset
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleSubmit
                        }
                        disabled={
                          saving ||
                          detail.length ===
                            0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={16}
                          />
                        )}

                        {existingVerifikasi
                          ? "Update"
                          : "Simpan"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            width: 210mm !important;
            min-width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            box-sizing: border-box !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print-document {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-document * {
            box-sizing: border-box !important;
          }

          .print-document .print-document-content {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .print-table-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow: visible !important;
          }

          .print-table {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }

          .print-table th,
          .print-table td {
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            white-space: normal !important;
          }

          .print-table col:nth-child(1) {
            width: 5% !important;
          }

          .print-table col:nth-child(2) {
            width: 18% !important;
          }

          .print-table col:nth-child(3) {
            width: 25% !important;
          }

          .print-table col:nth-child(4) {
            width: 8% !important;
          }

          .print-table col:nth-child(5) {
            width: 8% !important;
          }

          .print-table col:nth-child(6) {
            width: 8% !important;
          }

          .print-table col:nth-child(7) {
            width: 28% !important;
          }

          .print-table input,
          .print-table textarea {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            resize: none !important;
            background: transparent !important;
            color: #000000 !important;
            font-size: 8pt !important;
            line-height: 1.25 !important;
            overflow: visible !important;
          }

          .print-table textarea {
            min-height: 0 !important;
            height: auto !important;
          }

          .print-info {
            width: 100% !important;
            max-width: 100% !important;
            margin-bottom: 8px !important;
          }

          .print-info td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
            font-size: 9pt !important;
          }

          .print-title {
            font-size: 13pt !important;
            margin-bottom: 10px !important;
          }

          .print-decision {
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 8px !important;
            padding: 7px !important;
            font-size: 8pt !important;
            border: 1px solid #000000 !important;
          }

          .print-decision select {
            max-width: 100% !important;
            border: none !important;
            font-size: 8pt !important;
            background: transparent !important;
            appearance: none !important;
          }

          .print-signature {
            width: 100% !important;
            max-width: 100% !important;
            margin-top: 18px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-signature-box {
            width: 220px !important;
            max-width: 220px !important;
          }

          .print-signature-box img {
            max-width: 150px !important;
            max-height: 65px !important;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-document-content,
          .print-document-content section,
          .print-document-content table,
          .print-document-content tbody,
          .print-document-content tr {
            page-break-inside: auto !important;
          }

          .print-document-content thead {
            display: table-header-group !important;
          }

          .print-document-content tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .print-document-content th {
            background: #d1d5db !important;
            color: #000000 !important;
          }
        }

        @media screen {
          .print-document {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

function DocumentChecklist({
  selectedJadwal,
  detail,
  keputusan,
  setKeputusan,
  onDetailChange,
  profileAsesor
}) {
  const jadwal =
    selectedJadwal?.jadwal ||
    selectedJadwal ||
    {};

  const namaTuk =
    getJadwalTuk(jadwal);

  const skema =
    getJadwalSkema(jadwal);

  const namaAsesor =
    getDisplayName(
      profileAsesor
    );

  const ttdUrl =
    getTtdUrl(
      profileAsesor
    );

  const tempatTtd =
    getTempatTtd(jadwal);

  const tanggalAwal =
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    selectedJadwal?.tanggal;

  const tanggalAkhir =
    jadwal?.tgl_akhir ||
    jadwal?.tanggal_selesai ||
    selectedJadwal?.tgl_akhir ||
    tanggalAwal;

  return (
    <div className="print-document-content w-full max-w-[1000px] mx-auto text-black bg-white text-[14px] leading-tight">
      <h1 className="print-title text-center font-bold underline text-[17px] mb-6">
        CEKLIST VERIFIKASI TEMPAT UJI KOMPETENSI (TUK)
      </h1>

      <table className="print-info w-full mb-4">
        <tbody>
          <InfoRow
            label="Nama TUK"
            value={
              namaTuk
            }
          />

          <InfoRow
            label="Hari/Tanggal"
            value={formatHariTanggal(
              tanggalAwal,
              tanggalAkhir
            )}
          />

          <InfoRow
            label="Metode Asesmen"
            value="Observasi/Demonstrasi/Praktek/Tes Tulis/Wawancara"
          />

          <InfoRow
            label="Skema"
            value={
              skema
            }
          />
        </tbody>
      </table>

      <div className="print-table-wrapper overflow-x-auto">
        <table className="print-table w-full border-collapse border border-black">
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>

          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan="2"
                className="border border-black px-2 py-2 text-center font-bold"
              >
                No.
              </th>

              <th
                rowSpan="2"
                className="border border-black px-2 py-2 text-center font-bold"
              >
                Perlengkapan
              </th>

              <th
                rowSpan="2"
                className="border border-black px-2 py-2 text-center font-bold"
              >
                Spesifikasi
              </th>

              <th
                rowSpan="2"
                className="border border-black px-2 py-2 text-center font-bold"
              >
                Jumlah
              </th>

              <th
                colSpan="2"
                className="border border-black px-2 py-1 text-center font-bold"
              >
                Kondisi
              </th>

              <th
                rowSpan="2"
                className="border border-black px-2 py-2 text-center font-bold"
              >
                Catatan
              </th>
            </tr>

            <tr className="bg-gray-300">
              <th className="border border-black px-2 py-1 text-center font-bold">
                Baik
              </th>

              <th className="border border-black px-2 py-1 text-center font-bold">
                Rusak
              </th>
            </tr>
          </thead>

          <tbody>
            {detail.length >
            0 ? (
              detail.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={`${item.id_persyaratan_tuk}-${index}`}
                    className="print-avoid-break"
                  >
                    <td className="border border-black px-2 py-2 text-center align-top font-semibold">
                      {index +
                        1}
                      .
                    </td>

                    <td className="border border-black px-2 py-2 align-top font-semibold">
                      {item.nama_perlengkapan ||
                        "-"}
                    </td>

                    <td className="border border-black px-2 py-2 align-top">
                      <input
                        type="text"
                        value={
                          item.spesifikasi ??
                          ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "spesifikasi",
                            e.target.value
                          )
                        }
                        className="w-full min-w-[180px] bg-transparent outline-none font-medium"
                        placeholder="Isi spesifikasi..."
                      />
                    </td>

                    <td className="border border-black px-2 py-2 text-center align-top">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          item.jumlah_total ??
                          ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "jumlah_total",
                            e.target.value
                          )
                        }
                        className="w-full text-center bg-transparent outline-none font-semibold"
                      />
                    </td>

                    <td className="border border-black px-2 py-2 text-center align-top">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          item.jumlah_baik ??
                          ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "jumlah_baik",
                            e.target.value
                          )
                        }
                        className="w-full text-center bg-transparent outline-none font-semibold"
                      />
                    </td>

                    <td className="border border-black px-2 py-2 text-center align-top">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          item.jumlah_rusak ??
                          ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "jumlah_rusak",
                            e.target.value
                          )
                        }
                        className="w-full text-center bg-transparent outline-none font-semibold"
                      />
                    </td>

                    <td className="border border-black px-2 py-2 align-top">
                      <textarea
                        value={
                          item.catatan ||
                          ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "catatan",
                            e.target.value
                          )
                        }
                        placeholder="Catatan..."
                        className="w-full min-h-[70px] bg-transparent outline-none resize-none"
                      />
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="border border-black px-2 py-5 text-center"
                >
                  Belum ada data persyaratan TUK.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="print-decision mt-4 rounded-xl border border-black p-3 font-bold flex flex-col gap-2 sm:flex-row sm:items-center">
        <span>
          Keputusan Verifikasi:
        </span>

        <select
          value={
            keputusan
          }
          onChange={(e) =>
            setKeputusan(
              e.target.value
            )
          }
          className="font-bold bg-transparent outline-none border border-black px-2 py-2 print:border-none"
        >
          <option value="sesuai">
            Sesuai persyaratan teknis Tempat Uji Kompetensi (TUK)
          </option>

          <option value="tidak_sesuai">
            Tidak sesuai persyaratan teknis Tempat Uji Kompetensi (TUK)
          </option>
        </select>
      </div>

      <div className="print-signature mt-8 flex justify-end">
        <div className="print-signature-box w-[280px] text-center">
          <p>
            {tempatTtd},{" "}
            {formatTanggal(
              new Date()
            )}
          </p>

          <p className="mt-1">
            Verifikator TUK
          </p>

          <div className="h-24 flex items-center justify-center">
            {ttdUrl ? (
              <img
                src={
                  ttdUrl
                }
                alt="Tanda tangan asesor"
                className="max-h-24 max-w-[220px] object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400">
                TTD belum tersedia
              </span>
            )}
          </div>

          <p className="font-bold underline">
            {namaAsesor}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value
}) {
  return (
    <tr>
      <td className="w-[160px] py-1">
        {label}
      </td>

      <td className="w-[20px] py-1">
        :
      </td>

      <td className="py-1 font-semibold">
        {value || "-"}
      </td>
    </tr>
  );
}

function JadwalCard({
  item,
  active,
  onClick
}) {
  const jadwal =
    item.jadwal ||
    item;

  const title =
    getJadwalTitle(item);

  const tanggal =
    getJadwalDate(jadwal);

  const tuk =
    getJadwalTuk(jadwal);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-[24px] border p-4 transition-all ${
        active
          ? "border-orange-200 bg-orange-50 shadow-lg shadow-orange-500/5"
          : "border-slate-100 bg-slate-50/60 hover:border-orange-100 hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${
              active
                ? "text-orange-500"
                : "text-slate-400"
            }`}
          >
            Verifikator TUK
          </p>

          <h3 className="mt-2 line-clamp-2 text-sm font-black text-[#071E3D]">
            {title}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
            item.status ===
              "aktif" ||
            !item.status
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {item.status ||
            "aktif"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <SmallLine
          icon={
            <CalendarCheck
              size={14}
            />
          }
          text={formatTanggal(
            tanggal
          )}
        />

        <SmallLine
          icon={
            <MapPin
              size={14}
            />
          }
          text={tuk}
        />
      </div>
    </button>
  );
}

function StatusSubmitBadge({
  existing
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest ${
        existing
          ? "bg-green-50 text-green-600"
          : "bg-orange-50 text-orange-500"
      }`}
    >
      {existing
        ? "Sudah Mengisi"
        : "Belum Mengisi"}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value
}) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>

        <p className="text-[#071E3D] font-black mt-1 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function HeroPill({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}

function AlertBox({
  type,
  icon,
  message
}) {
  const styles = {
    success:
      "border-green-100 bg-green-50 text-green-700",
    error:
      "border-red-100 bg-red-50 text-red-600",
    loading:
      "border-blue-100 bg-blue-50 text-blue-600"
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 print:hidden ${
        styles[type] ||
        styles.loading
      }`}
    >
      <div className="shrink-0">
        {icon}
      </div>

      <span>
        {message}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  description
}) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
      <h3 className="text-2xl font-black text-[#071E3D]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptySmall({
  title,
  description
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
      <CalendarDays
        size={32}
        className="mx-auto mb-3 text-slate-300"
      />

      <p className="text-sm font-black text-[#071E3D]">
        {title}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
}

function SmallLine({
  icon,
  text
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span className="text-orange-500">
        {icon}
      </span>

      <span className="line-clamp-1">
        {text || "-"}
      </span>
    </div>
  );
}

function createEmptyDetail(
  persyaratanList
) {
  return persyaratanList.map(
    (item) => ({
      id_persyaratan_tuk:
        item.id_persyaratan_tuk ||
        item.id,
      nama_perlengkapan:
        item.nama_perlengkapan ||
        item.nama_persyaratan ||
        item.nama ||
        item.persyaratan ||
        item.nama_item ||
        "",
      spesifikasi:
        item.spesifikasi ||
        "",
      jumlah_total: 0,
      jumlah_baik: 0,
      jumlah_rusak: 0,
      catatan: ""
    })
  );
}

function mergeDetailWithPersyaratan(
  persyaratanList,
  existingDetails
) {
  const existingMap =
    new Map(
      existingDetails.map(
        (item) => [
          Number(
            item.id_persyaratan_tuk
          ),
          item
        ]
      )
    );

  return persyaratanList.map(
    (persyaratan) => {
      const idPersyaratan =
        persyaratan.id_persyaratan_tuk ||
        persyaratan.id;

      const found =
        existingMap.get(
          Number(
            idPersyaratan
          )
        );

      return {
        id_detail:
          found?.id_detail ||
          found?.id_verifikasi_detail ||
          null,
        id_verifikasi_detail:
          found?.id_verifikasi_detail ||
          null,
        id_persyaratan_tuk:
          idPersyaratan,
        nama_perlengkapan:
          found?.nama_perlengkapan ||
          found?.nama_persyaratan ||
          persyaratan.nama_perlengkapan ||
          persyaratan.nama_persyaratan ||
          persyaratan.nama ||
          persyaratan.persyaratan ||
          persyaratan.nama_item ||
          "",
        spesifikasi:
          found?.spesifikasi ??
          persyaratan.spesifikasi ??
          "",
        jumlah_total:
          found?.jumlah_total ??
          0,
        jumlah_baik:
          found?.jumlah_baik ??
          0,
        jumlah_rusak:
          found?.jumlah_rusak ??
          0,
        catatan:
          parseCatatan(
            found?.keterangan ??
              found?.catatan
          )
      };
    }
  );
}

function parseCatatan(
  value
) {
  if (!value) return "";

  try {
    const parsed =
      JSON.parse(value);

    return (
      parsed.catatan ||
      value ||
      ""
    );
  } catch {
    return value || "";
  }
}

function isSameJadwal(
  a,
  b
) {
  if (!a || !b) {
    return false;
  }

  return (
    Number(
      getJadwalId(a)
    ) ===
    Number(
      getJadwalId(b)
    )
  );
}

function getJadwalId(
  item
) {
  return (
    item?.id_jadwal ||
    item?.jadwal
      ?.id_jadwal ||
    item?.jadwal?.id
  );
}

function getSkemaText(
  skema
) {
  if (!skema) return "";

  if (
    typeof skema ===
    "string"
  ) {
    return skema;
  }

  if (
    typeof skema ===
    "object"
  ) {
    return (
      skema.judul_skema ||
      skema.nama_skema ||
      skema.kode_skema ||
      skema.judul_skema_en ||
      ""
    );
  }

  return String(skema);
}

function getJadwalTitle(
  item
) {
  const jadwal =
    item?.jadwal ||
    item ||
    {};

  const itemSkema =
    getSkemaText(
      item?.skema
    );

  const jadwalSkema =
    getSkemaText(
      jadwal?.skema
    );

  return (
    item?.nama_kegiatan ||
    jadwal.nama_kegiatan ||
    itemSkema ||
    jadwal.nama_skema ||
    jadwal.judul_skema ||
    jadwalSkema ||
    jadwal.kode_jadwal ||
    "Jadwal Verifikasi TUK"
  );
}

function getJadwalSkema(
  jadwal
) {
  const skemaText =
    getSkemaText(
      jadwal?.skema
    );

  return (
    skemaText ||
    jadwal?.skema_nama ||
    jadwal?.nama_skema ||
    jadwal?.judul_skema ||
    jadwal?.kode_skema ||
    "Skema belum tersedia"
  );
}

function getJadwalDate(
  jadwal
) {
  return (
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    jadwal?.tgl_pelaksanaan ||
    jadwal?.tanggal_pelaksanaan ||
    jadwal?.created_at
  );
}

function getJadwalTuk(
  jadwal
) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tempat ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.lokasi ||
    "Lokasi / TUK belum tersedia"
  );
}

function getTempatTtd(
  jadwal
) {
  return (
    jadwal?.kecamatan_tuk ||
    jadwal?.kecamatan ||
    jadwal?.tuk
      ?.kecamatan_tuk ||
    jadwal?.tuk
      ?.kecamatan ||
    jadwal?.tuk
      ?.nama_kecamatan ||
    jadwal?.tuk
      ?.kabupaten ||
    jadwal?.tuk?.kota ||
    jadwal?.tempat ||
    "Tempat"
  );
}

function getDisplayName(
  profile = null
) {
  if (profile) {
    return (
      profile.nama_lengkap ||
      profile.nama ||
      profile.name ||
      profile.user?.nama ||
      profile.user?.nama_lengkap ||
      profile.user?.username ||
      "Asesor"
    );
  }

  try {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    const user =
      storedUser
        ? JSON.parse(
            storedUser
          )
        : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      user?.name ||
      "Asesor"
    );
  } catch {
    return "Asesor";
  }
}

function getTtdUrl(
  profile
) {
  const raw =
    profile?.ttd_path ||
    profile?.ttd ||
    profile?.tanda_tangan ||
    profile?.signature ||
    profile?.user
      ?.ttd_path ||
    "";

  if (!raw) {
    return "";
  }

  if (
    String(raw).startsWith(
      "http://"
    ) ||
    String(raw).startsWith(
      "https://"
    )
  ) {
    return raw;
  }

  const cleaned =
    String(raw).replace(
      /^\/+/,
      ""
    );

  if (!FILE_BASE) {
    return `/${cleaned}`;
  }

  return `${FILE_BASE}/${cleaned}`;
}

function formatTanggal(
  value
) {
  if (!value) return "-";

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return parsed.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}

function formatHariTanggal(
  start,
  end
) {
  if (!start && !end) {
    return "-";
  }

  const awal =
    new Date(start);

  const akhir =
    new Date(
      end || start
    );

  if (
    Number.isNaN(
      awal.getTime()
    )
  ) {
    return "-";
  }

  const hari =
    awal.toLocaleDateString(
      "id-ID",
      {
        weekday: "long"
      }
    );

  const tanggalAwal =
    formatTanggal(
      awal
    );

  const tanggalAkhir =
    formatTanggal(
      akhir
    );

  if (
    !end ||
    tanggalAwal ===
      tanggalAkhir
  ) {
    return `${hari}/ ${tanggalAwal}`;
  }

  return `${hari}/ ${tanggalAwal} s.d ${tanggalAkhir}`;
}

function onlyNumber(
  value
) {
  if (value === "") {
    return "";
  }

  return String(value).replace(
    /[^\d]/g,
    ""
  );
}