import React, { useEffect, useMemo, useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Loader2,
  MapPin,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

const API_BASE = import.meta.env.VITE_API_BASE || api?.defaults?.baseURL || "";
const FILE_BASE = String(API_BASE).replace(/\/api\/?$/, "");

export default function JadwalVerifikasiTuk() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jadwalList, setJadwalList] = useState([]);
  const [persyaratanList, setPersyaratanList] = useState([]);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [detail, setDetail] = useState([]);
  const [keputusan, setKeputusan] = useState("sesuai");
  const [existingVerifikasi, setExistingVerifikasi] = useState(null);
  const [profileAsesor, setProfileAsesor] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 3;
  const displayName = getDisplayName(profileAsesor);

  const loadPageData = async (showSuccess = false) => {
    try {
      setLoading(true);

      const [jadwalRes, formRes, profileRes] = await Promise.all([
        api.get("/asesor/jadwal-verifikasi-tuk"),
        api.get("/asesor/verifikasi-tuk/form"),
        api.get("/asesor/profile").catch(() => null),
      ]);

      const jadwalData = Array.isArray(jadwalRes.data?.data) ? jadwalRes.data.data : [];
      const formData = Array.isArray(formRes.data?.data) ? formRes.data.data : [];
      const profileData = profileRes?.data?.data || profileRes?.data || null;

      setJadwalList(jadwalData);
      setPersyaratanList(formData);
      setProfileAsesor(profileData);
      setCurrentPage(1);

      if (jadwalData.length > 0) {
        const firstJadwal = jadwalData[0];
        setSelectedJadwal(firstJadwal);
        await loadDetailVerifikasi(firstJadwal, formData, false);
      } else {
        setSelectedJadwal(null);
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(createEmptyDetail(formData));
      }

      if (showSuccess) {
        await notifikasi.sukses("Berhasil", "Data jadwal verifikasi TUK berhasil diperbarui.");
      }
    } catch (err) {
      console.error(err);
      await notifikasi.gagal(
        "Gagal Memuat Data",
        err.response?.data?.message || "Gagal memuat jadwal verifikasi TUK."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDetailVerifikasi = async (jadwalItem, formData = persyaratanList, notifyError = false) => {
    try {
      const idJadwal = getJadwalId(jadwalItem);

      if (!idJadwal) {
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(createEmptyDetail(formData));
        return;
      }

      const res = await api.get(`/asesor/verifikasi-tuk/${idJadwal}`);
      const data = res.data?.data || null;

      if (!data) {
        setExistingVerifikasi(null);
        setKeputusan("sesuai");
        setDetail(createEmptyDetail(formData));
        return;
      }

      setExistingVerifikasi(data?.id_verifikasi ? data : null);
      setKeputusan(data.keputusan || "sesuai");

      const existingDetails = Array.isArray(data.detail) ? data.detail : Array.isArray(data.details) ? data.details : [];
      setDetail(mergeDetailWithPersyaratan(formData, existingDetails));
    } catch (err) {
      console.error(err);
      setExistingVerifikasi(null);
      setKeputusan("sesuai");
      setDetail(createEmptyDetail(formData));

      if (notifyError) {
        await notifikasi.peringatan(
          "Detail Belum Tersedia",
          err.response?.data?.message || "Detail verifikasi untuk jadwal ini belum dapat dimuat."
        );
      }
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return jadwalList.filter((item) => {
      const jadwal = item.jadwal || {};

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
        getSkemaText(jadwal.skema),
        jadwal.nama_tuk,
        jadwal.tuk?.nama_tuk,
        jadwal.tuk?.nama,
        jadwal.tuk?.kecamatan,
        jadwal.tuk?.kecamatan_tuk,
        jadwal.tempat,
        jadwal.lokasi,
        jadwal.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || text.includes(keyword);
      const matchStatus = filterStatus === "semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [jadwalList, search, filterStatus]);

  const totalJadwal = jadwalList.length;
  const totalAktif = jadwalList.filter((item) => item.status === "aktif").length;
  const totalNonaktif = jadwalList.filter((item) => item.status === "nonaktif").length;
  const totalPersyaratan = detail.length;

  const totalTerisi = detail.filter(
    (item) =>
      Number(item.jumlah_total || 0) > 0 ||
      Number(item.jumlah_baik || 0) > 0 ||
      Number(item.jumlah_rusak || 0) > 0 ||
      item.spesifikasi ||
      item.catatan
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredJadwal.length / itemsPerPage));

  const paginatedJadwal = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJadwal.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJadwal, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSelectJadwal = async (item) => {
    setSelectedJadwal(item);
    await loadDetailVerifikasi(item, persyaratanList, true);
  };

  const handleDetailChange = (index, field, value) => {
    setDetail((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const isTextField = field === "catatan" || field === "spesifikasi";

        return {
          ...item,
          [field]: isTextField ? value : onlyNumber(value),
        };
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedJadwal) {
      await notifikasi.peringatan("Jadwal Belum Dipilih", "Pilih jadwal verifikasi TUK terlebih dahulu.");
      return;
    }

    if (!keputusan) {
      await notifikasi.peringatan("Keputusan Belum Diisi", "Keputusan verifikasi wajib diisi.");
      return;
    }

    if (!detail || detail.length === 0) {
      await notifikasi.peringatan("Data Persyaratan Kosong", "Detail persyaratan tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);

      const idJadwal = getJadwalId(selectedJadwal);

      const payload = {
        keputusan,
        detail: detail.map((item) => ({
          id_persyaratan_tuk: item.id_persyaratan_tuk,
          spesifikasi: item.spesifikasi || "",
          jumlah_total: Number(item.jumlah_total || 0),
          jumlah_baik: Number(item.jumlah_baik || 0),
          jumlah_rusak: Number(item.jumlah_rusak || 0),
          keterangan: item.catatan || "",
        })),
      };

      if (existingVerifikasi?.id_verifikasi) {
        await api.put(`/asesor/verifikasi-tuk/${existingVerifikasi.id_verifikasi}/update`, payload);
        await notifikasi.sukses("Berhasil", "Verifikasi TUK berhasil diperbarui.");
      } else {
        await api.post(`/asesor/verifikasi-tuk/${idJadwal}/submit`, payload);
        await notifikasi.sukses("Berhasil", "Verifikasi TUK berhasil disimpan.");
      }

      await loadDetailVerifikasi(selectedJadwal, persyaratanList);
    } catch (err) {
      console.error(err);
      await notifikasi.gagal(
        "Gagal Menyimpan",
        err.response?.data?.message || "Gagal menyimpan verifikasi TUK."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = async () => {
    if (existingVerifikasi) {
      await loadDetailVerifikasi(selectedJadwal, persyaratanList);
      return;
    }

    setKeputusan("sesuai");
    setDetail(createEmptyDetail(persyaratanList));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <div className="print:hidden">
        <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
        <div className="mx-auto w-full max-w-[1500px] space-y-5 print:max-w-none print:space-y-0">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm print:hidden">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Jadwal Verifikasi TUK
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola jadwal verifikasi, cek persyaratan TUK, dan simpan keputusan verifikasi asesor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadPageData(true)}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <MiniStat
                icon={<CalendarDays size={22} />}
                label="Jadwal Verifikasi"
                value={`${totalJadwal} Jadwal`}
              />

              <MiniStat
                icon={<ShieldCheck size={22} />}
                label="Persyaratan"
                value={`${totalPersyaratan} Item`}
              />

              <MiniStat
                icon={<BadgeCheck size={22} />}
                label="Terisi"
                value={`${totalTerisi} Item`}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[380px_1fr] print:block print:w-full">
            <aside className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm print:hidden">
              <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                  <CalendarDays size={17} className="text-[#CC6B27]" />
                  Jadwal Verifikasi
                </h2>
              </div>

              <div className="border-b border-[#071E3D]/10 p-5">
                <p className="text-[12px] font-medium text-[#182D4A]/60">
                  Pilih jadwal TUK yang akan diverifikasi.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/45" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari jadwal, skema, TUK..."
                      className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-3 text-[12px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3 py-2.5 text-[12px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="p-4">
                {paginatedJadwal.length === 0 ? (
                  <EmptySmall
                    title="Jadwal tidak ditemukan"
                    description="Belum ada jadwal verifikasi TUK yang cocok."
                  />
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedJadwal.map((item, index) => (
                        <JadwalCard
                          key={`${getJadwalId(item) || "jadwal"}-${currentPage}-${index}`}
                          item={item}
                          active={isSameJadwal(item, selectedJadwal)}
                          onClick={() => handleSelectJadwal(item)}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-4 border-t border-[#071E3D]/10 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-[#071E3D]/20 bg-white px-3 py-2 text-[10px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                          >
                            <span className="flex items-center gap-1">
                              <span>←</span>
                              Sebelumnya
                            </span>
                          </button>

                          <span className="text-[10px] font-bold text-[#182D4A]/60">
                            {currentPage} / {totalPages}
                          </span>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-[#071E3D]/20 bg-white px-3 py-2 text-[10px] font-bold text-[#071E3D] transition-all hover:border-[#CC6B27] hover:bg-[#CC6B27] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
                          >
                            <span className="flex items-center gap-1">
                              Berikutnya
                              <span>→</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>

            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm print:rounded-none print:border-none print:shadow-none print:w-full print:overflow-visible">
              <div className="flex flex-col gap-4 border-b border-[#071E3D]/10 px-5 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between print:hidden">
                <div>
                  <h2 className="flex items-center gap-2 text-[17px] font-bold text-[#071E3D]">
                    <ClipboardCheck size={18} className="text-[#CC6B27]" />
                    Form Ceklist Verifikasi TUK
                  </h2>

                  <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                    {selectedJadwal ? getJadwalTitle(selectedJadwal) : "Pilih jadwal terlebih dahulu."}
                  </p>
                </div>

                <StatusSubmitBadge existing={existingVerifikasi} />
              </div>

              <div className="p-5 md:p-6 print:p-0 print:w-full">
                {!selectedJadwal ? (
                  <EmptyState
                    title="Belum Ada Jadwal Dipilih"
                    description="Pilih jadwal verifikasi TUK di sisi kiri untuk mulai mengisi form."
                  />
                ) : (
                  <div className="print-document">
                    <DocumentChecklist
                      selectedJadwal={selectedJadwal}
                      detail={detail}
                      keputusan={keputusan}
                      setKeputusan={setKeputusan}
                      onDetailChange={handleDetailChange}
                      profileAsesor={profileAsesor}
                    />
                  </div>
                )}

                {selectedJadwal && (
                  <div className="mt-5 flex flex-col gap-4 rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5 print:hidden sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#071E3D]">
                        {existingVerifikasi ? "Update data verifikasi TUK" : "Simpan data verifikasi TUK"}
                      </p>

                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#182D4A]/60">
                        TTD asesor otomatis memakai tanda tangan yang tersimpan pada profile asesor.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        disabled={saving}
                        className="rounded-lg border border-[#071E3D]/20 bg-white px-5 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCcw size={15} />
                          Reset
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || detail.length === 0}
                        className="rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                          {existingVerifikasi ? "Update" : "Simpan"}
                        </span>
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
  profileAsesor,
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
    <div className="print-document-content mx-auto w-full max-w-[1000px] bg-white text-[14px] leading-tight text-black">
      <h1 className="print-title mb-6 text-center text-[17px] font-bold underline">
        CEKLIST VERIFIKASI TEMPAT UJI KOMPETENSI
        (TUK)
      </h1>

      <table className="print-info mb-4 w-full">
        <tbody>
          <InfoRow
            label="Nama TUK"
            value={namaTuk}
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
            value={skema}
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
            {detail.length > 0 ? (
              detail.map(
                (item, index) => (
                  <tr
                    key={`${item.id_persyaratan_tuk}-${index}`}
                    className="print-avoid-break"
                  >
                    <td className="border border-black px-2 py-2 text-center align-top font-semibold">
                      {index + 1}.
                    </td>

                    <td className="border border-black px-2 py-2 align-top font-semibold">
                      {item.nama_perlengkapan || "-"}
                    </td>

                    <td className="border border-black px-2 py-2 align-top">
                      <input
                        type="text"
                        value={
                          item.spesifikasi ?? ""
                        }
                        onChange={(e) =>
                          onDetailChange(
                            index,
                            "spesifikasi",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-2 py-1 font-medium outline-none focus:border-[#CC6B27] focus:bg-white"
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
                        className="w-full rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-1 py-1 text-center font-semibold outline-none focus:border-[#CC6B27] focus:bg-white"
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
                        className="w-full rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-1 py-1 text-center font-semibold outline-none focus:border-[#CC6B27] focus:bg-white"
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
                        className="w-full rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-1 py-1 text-center font-semibold outline-none focus:border-[#CC6B27] focus:bg-white"
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
                        className="min-h-[70px] w-full resize-none rounded-md border border-[#071E3D]/10 bg-[#FAFAFA] px-2 py-1 outline-none focus:border-[#CC6B27] focus:bg-white"
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

      <div className="print-decision mt-4 flex flex-col gap-2 rounded-lg border border-black p-3 font-bold sm:flex-row sm:items-center">
        <span>
          Keputusan Verifikasi:
        </span>

        <select
          value={keputusan}
          onChange={(e) =>
            setKeputusan(
              e.target.value
            )
          }
          className="rounded-md border border-black bg-white px-2 py-2 font-bold outline-none print:border-none"
        >
          <option value="sesuai">
            Sesuai persyaratan teknis Tempat Uji
            Kompetensi (TUK)
          </option>

          <option value="tidak_sesuai">
            Tidak sesuai persyaratan teknis Tempat Uji
            Kompetensi (TUK)
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

          <div className="flex h-24 items-center justify-center">
            {ttdUrl ? (
              <img
                src={ttdUrl}
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

function InfoRow({ label, value }) {
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



function JadwalCard({ item, active, onClick }) {
  const jadwal = item?.jadwal || item;
  const title = getJadwalTitle(item);
  const tanggal = getJadwalDate(jadwal);
  const tuk = getJadwalTuk(jadwal);
  const status = item?.status || "aktif";

  const activeClass = active
    ? "border-[#CC6B27] bg-[#CC6B27]/5"
    : "border-[#071E3D]/10 bg-white hover:border-[#CC6B27]/40 hover:bg-[#CC6B27]/5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-all ${activeClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-[#CC6B27]" : "text-[#182D4A]/50"}`}>
            Verifikator TUK
          </p>

          <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-[#071E3D]">
            {title}
          </h3>
        </div>

        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
          status === "aktif"
            ? "border-green-200 bg-green-50 text-green-600"
            : "border-red-200 bg-red-50 text-red-600"
        }`}>
          {status}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <SmallLine icon={<CalendarCheck size={14} />} text={formatTanggal(tanggal)} />
        <SmallLine icon={<MapPin size={14} />} text={tuk} />
      </div>
    </button>
  );
}

function StatusSubmitBadge({ existing }) {
  return (
    <div className={`inline-flex items-center rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${
      existing
        ? "border-green-200 bg-green-50 text-green-600"
        : "border-[#CC6B27]/25 bg-[#CC6B27]/10 text-[#CC6B27]"
    }`}>
      {existing ? "Sudah Mengisi" : "Belum Mengisi"}
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#182D4A]/60">
          {label}
        </p>

        <p className="mt-1 truncate text-[19px] font-black text-[#071E3D]">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-10 text-center">
      <CalendarDays size={38} className="mx-auto mb-3 text-[#071E3D]/20" />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        {description}
      </p>
    </div>
  );
}

function EmptySmall({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-[#071E3D]/15 bg-[#FAFAFA] p-6 text-center">
      <CalendarDays size={30} className="mx-auto mb-3 text-[#071E3D]/20" />

      <p className="text-[13px] font-bold text-[#071E3D]">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#182D4A]/60">
        {description}
      </p>
    </div>
  );
}

function SmallLine({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-[#182D4A]/60">
      <span className="text-[#CC6B27]">
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
      catatan: "",
    })
  );
}

function mergeDetailWithPersyaratan(
  persyaratanList,
  existingDetails
) {
  const existingMap = new Map(
    existingDetails.map(
      (item) => [
        Number(
          item.id_persyaratan_tuk
        ),
        item,
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
          Number(idPersyaratan)
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
          found?.jumlah_total ?? 0,
        jumlah_baik:
          found?.jumlah_baik ?? 0,
        jumlah_rusak:
          found?.jumlah_rusak ?? 0,
        catatan: parseCatatan(
          found?.keterangan ??
            found?.catatan
        ),
      };
    }
  );
}

function parseCatatan(value) {
  if (!value) {
    return "";
  }

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

function isSameJadwal(a, b) {
  if (!a || !b) {
    return false;
  }

  return (
    Number(getJadwalId(a)) ===
    Number(getJadwalId(b))
  );
}

function getJadwalId(item) {
  return (
    item?.id_jadwal ||
    item?.jadwal?.id_jadwal ||
    item?.jadwal?.id
  );
}

function getSkemaText(skema) {
  if (!skema) {
    return "";
  }

  if (typeof skema === "string") {
    return skema;
  }

  if (typeof skema === "object") {
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

function getJadwalTitle(item) {
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

function getJadwalSkema(jadwal) {
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

function getJadwalDate(jadwal) {
  return (
    jadwal?.tgl_awal ||
    jadwal?.tanggal ||
    jadwal?.tanggal_uji ||
    jadwal?.tgl_pelaksanaan ||
    jadwal?.tanggal_pelaksanaan ||
    jadwal?.created_at
  );
}

function getJadwalTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tempat ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.lokasi ||
    "Lokasi / TUK belum tersedia"
  );
}

function getTempatTtd(jadwal) {
  return (
    jadwal?.kecamatan_tuk ||
    jadwal?.kecamatan ||
    jadwal?.tuk?.kecamatan_tuk ||
    jadwal?.tuk?.kecamatan ||
    jadwal?.tuk?.nama_kecamatan ||
    jadwal?.tuk?.kabupaten ||
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

    const user = storedUser
      ? JSON.parse(storedUser)
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

function getTtdUrl(profile) {
  const raw =
    profile?.ttd_path ||
    profile?.ttd ||
    profile?.tanda_tangan ||
    profile?.signature ||
    profile?.user?.ttd_path ||
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

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

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
      year: "numeric",
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
    new Date(end || start);

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
        weekday: "long",
      }
    );

  const tanggalAwal =
    formatTanggal(awal);

  const tanggalAkhir =
    formatTanggal(akhir);

  if (
    !end ||
    tanggalAwal ===
      tanggalAkhir
  ) {
    return `${hari}/ ${tanggalAwal}`;
  }

  return `${hari}/ ${tanggalAwal} s.d ${tanggalAkhir}`;
}

function onlyNumber(value) {
  if (value === "") {
    return "";
  }

  return String(value).replace(
    /[^\d]/g,
    ""
  );
}