import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

export default function PesertaJadwalAsesor() {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [loading, setLoading] = useState(false);
  const [checkingPesertaId, setCheckingPesertaId] = useState(null);

  const fetchPeserta = async (showSuccess = false) => {
    try {
      setLoading(true);

      const res = await api.get(`/asesor/jadwal/${id_jadwal}/peserta`);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setPesertaList(data);

      if (showSuccess) {
        await notifikasi.sukses(
          "Berhasil",
          "Data peserta berhasil diperbarui."
        );
      }
    } catch (err) {
      console.error(err);

      const message = err.response?.data?.message || "Gagal mengambil data peserta jadwal.";

      if (showSuccess) {
        await notifikasi.gagal("Gagal", message);
      } else {
        await notifikasi.peringatan("Data Tidak Tersedia", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKelolaAsesmen = async (peserta) => {
    const pesertaId = getPesertaJadwalId(peserta);

    try {
      setCheckingPesertaId(pesertaId);

      const response = await api.get(
        `/asesor/presensi/cek?id_jadwal=${peserta.id_jadwal}`
      );

      if (response.data?.hadir) {
        navigate(
          `/asesor/jadwal-saya/${peserta.id_jadwal}/peserta/${peserta.id_peserta}`
        );
        return;
      }

      const result = await Swal.fire({
        icon: "warning",
        title: "Presensi Diperlukan",
        text: "Anda belum melakukan presensi. Silakan lakukan presensi terlebih dahulu sebelum mengelola asesmen.",
        showCancelButton: true,
        confirmButtonText: "Presensi Sekarang",
        cancelButtonText: "Nanti",
        confirmButtonColor: "#CC6B27",
        cancelButtonColor: "#64748B",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        navigate(`/asesor/presensi/${peserta.id_jadwal}`);
      }
    } catch (err) {
      console.error("CHECK PRESENSI ERROR:", err);

      const status = err.response?.status;
      const message = err.response?.data?.message || "Tidak dapat memeriksa status presensi.";

      if (status === 401) {
        await Swal.fire({
          icon: "warning",
          title: "Sesi Berakhir",
          text: "Sesi login kamu sudah berakhir. Silakan login kembali.",
          confirmButtonColor: "#CC6B27",
        });

        navigate("/login");
        return;
      }

      await notifikasi.gagal(
        "Presensi Tidak Dapat Diperiksa",
        message
      );
    } finally {
      setCheckingPesertaId(null);
    }
  };

  useEffect(() => {
    fetchPeserta(false);
  }, [id_jadwal]);

  const filteredPeserta = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return pesertaList.filter((item) => {
      const user = getUserObject(item);
      const kelengkapan = item?.kelengkapan || {};
      const status = normalizeStatusAsesmen(item?.status_asesmen);

      const text = [
        user?.nama,
        user?.nama_lengkap,
        user?.username,
        user?.email,
        item?.nama_lengkap,
        item?.nama,
        item?.email,
        item?.nik,
        status,
        item?.nilai_akhir,
        item?.keterangan,
        item?.status,
        kelengkapan?.fria05_data?.nilai,
        kelengkapan?.fria05_data?.hasil,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || text.includes(keyword);
      const matchStatus = filterStatus === "semua" || status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [pesertaList, search, filterStatus]);

  const totalPeserta = pesertaList.length;

  const totalKompeten = pesertaList.filter(
    (item) => normalizeStatusAsesmen(item?.status_asesmen) === "kompeten"
  ).length;

  const totalBelumKompeten = pesertaList.filter(
    (item) => normalizeStatusAsesmen(item?.status_asesmen) === "belum_kompeten"
  ).length;

  const totalBelumDinilai = pesertaList.filter(
    (item) => normalizeStatusAsesmen(item?.status_asesmen) === "belum_dinilai"
  ).length;

  const jadwalInfo = pesertaList[0]?.jadwal || pesertaList[0]?.Jadwal || null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Peserta Uji Kompetensi
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Kelola peserta, periksa kelengkapan asesmen, dan tetapkan hasil akhir peserta sebagai asesor penguji.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fetchPeserta(true)}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={15} />
                    )}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4 md:p-6">
              <StatCard
                icon={<Users size={22} />}
                label="Total Peserta"
                value={`${totalPeserta} Peserta`}
                tone="orange"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Kompeten"
                value={`${totalKompeten} Peserta`}
                tone="green"
              />

              <StatCard
                icon={<ShieldCheck size={22} />}
                label="Belum Kompeten"
                value={`${totalBelumKompeten} Peserta`}
                tone="red"
              />

              <StatCard
                icon={<Info size={22} />}
                label="Belum Dinilai"
                value={`${totalBelumDinilai} Peserta`}
                tone="gray"
              />
            </div>
          </section>

          {jadwalInfo && (
            <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
              <SectionHeader
                icon={<CalendarCheck size={18} />}
                title="Informasi Jadwal"
                desc="Informasi jadwal uji kompetensi peserta."
              />

              <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 md:p-6">
                <InfoBox
                  icon={<CalendarCheck size={17} />}
                  label="Jadwal"
                  value={
                    jadwalInfo?.nama_kegiatan ||
                    jadwalInfo?.nama_skema ||
                    "Jadwal Uji Kompetensi"
                  }
                />

                <InfoBox
                  icon={<FileText size={17} />}
                  label="Skema"
                  value={
                    jadwalInfo?.skema?.nama_skema ||
                    jadwalInfo?.skema?.judul_skema ||
                    jadwalInfo?.nama_skema ||
                    "-"
                  }
                />

                <InfoBox
                  icon={<Info size={17} />}
                  label="Status Jadwal"
                  value={jadwalInfo?.status || "-"}
                />
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <SectionHeader
              icon={<Users size={18} />}
              title="Daftar Peserta Uji"
              desc="Cari peserta berdasarkan nama, email, status asesmen, nilai, atau keterangan."
            />

            <div className="border-b border-[#071E3D]/10 p-5 md:p-6">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
                <div className="group relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#182D4A]/45 transition-colors group-focus-within:text-[#CC6B27]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, email, status..."
                    className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] py-2.5 pl-10 pr-3 text-[12px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3 py-2.5 text-[12px] font-bold text-[#071E3D] outline-none transition-all focus:border-[#CC6B27] focus:bg-white sm:w-[180px]"
                >
                  <option value="semua">Semua Status</option>
                  <option value="kompeten">Kompeten</option>
                  <option value="belum_kompeten">Belum Kompeten</option>
                  <option value="belum_dinilai">Belum Dinilai</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {loading && pesertaList.length === 0 ? (
              <LoadingState />
            ) : filteredPeserta.length === 0 ? (
              <EmptyState />
            ) : (
              filteredPeserta.map((peserta, index) => (
                <PesertaCard
                  key={`${getPesertaJadwalId(peserta)}-${index}`}
                  peserta={peserta}
                  index={index}
                  onKelolaAsesmen={handleKelolaAsesmen}
                  checkingPesertaId={checkingPesertaId}
                />
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function PesertaCard({
  peserta,
  index,
  onKelolaAsesmen,
  checkingPesertaId,
}) {
  const nama = getNamaPeserta(peserta);
  const user = getUserObject(peserta);
  const email = peserta?.email || user?.email || "-";
  const nik = peserta?.nik || peserta?.no_identitas || "-";
  const kelengkapan = peserta?.kelengkapan || {};
  const fria05 = peserta?.fria05_penilaian || kelengkapan?.fria05_data || null;
  const keputusan = peserta?.hasil_keputusan || kelengkapan?.keputusan_data || null;

  const daftarForm = [
    "mapa01",
    "mapa02",
    "fria01",
    "fria02",
    "fria03",
    "fria05",
    "frak01",
    "frak02",
    "frak05",
    "frak06",
    "frak07",
  ];

  const totalForm = daftarForm.length;

  const totalSelesai = daftarForm.filter(
    (key) => Boolean(kelengkapan?.[key])
  ).length;

  const pesertaId = getPesertaJadwalId(peserta);
  const checking = Number(checkingPesertaId) === Number(pesertaId);

  return (
    <article className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
      <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
        <div className="flex items-stretch gap-4">
          <div className="flex w-11 shrink-0 items-center justify-center pt-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
              <Users size={21} />
            </div>
          </div>

          <div className="w-px shrink-0 bg-[#071E3D]/10" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#CC6B27]">
                Peserta #{index + 1}
              </span>

              <span className="text-[#071E3D]/20">
                •
              </span>

              <StatusAsesmenBadge
                status={
                  keputusan?.hasil ||
                  peserta?.status_asesmen
                }
              />

              {keputusan && (
                <>
                  <span className="text-[#071E3D]/20">
                    •
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                    Keputusan Tersimpan
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-1.5 line-clamp-2 text-[18px] font-black leading-snug text-[#071E3D] md:text-[20px]">
              {nama}
            </h3>

            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
              {email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6">
        <InfoBox
          icon={<UserCheck size={17} />}
          label="ID Peserta"
          value={pesertaId || "-"}
        />

        <InfoBox
          icon={<Info size={17} />}
          label="NIK"
          value={nik}
        />

        <InfoBox
          icon={<Star size={17} />}
          label="Nilai FR.IA.05"
          value={
            fria05
              ? `${fria05?.nilai || 0} (${formatStatus(fria05?.hasil)})`
              : "Belum Ada"
          }
        />

        <InfoBox
          icon={<ClipboardCheck size={17} />}
          label="Kelengkapan"
          value={`${totalSelesai}/${totalForm}`}
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
            Kelengkapan Formulir
          </p>

          <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
            Status kelengkapan dokumen asesmen peserta.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          <KelengkapanBadge
            label="MAPA01"
            active={kelengkapan?.mapa01}
          />

          <KelengkapanBadge
            label="MAPA02"
            active={kelengkapan?.mapa02}
          />

          <KelengkapanBadge
            label="FR.IA.01"
            active={kelengkapan?.fria01}
          />

          <KelengkapanBadge
            label="FR.IA.02"
            active={kelengkapan?.fria02}
          />

          <KelengkapanBadge
            label="FR.IA.03"
            active={kelengkapan?.fria03}
          />

          <KelengkapanBadge
            label="FR.IA.05"
            active={kelengkapan?.fria05}
          />

          <KelengkapanBadge
            label="FR.AK.01"
            active={kelengkapan?.frak01}
          />

          <KelengkapanBadge
            label="FR.AK.02"
            active={kelengkapan?.frak02}
          />

          <KelengkapanBadge
            label="FR.AK.05"
            active={kelengkapan?.frak05}
          />

          <KelengkapanBadge
            label="FR.AK.06"
            active={kelengkapan?.frak06}
          />

          <KelengkapanBadge
            label="FR.AK.07"
            active={kelengkapan?.frak07}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3 md:p-6">
        <InfoBox
          icon={<BadgeCheck size={17} />}
          label="Hasil Keputusan"
          value={formatStatus(
            keputusan?.hasil ||
              peserta?.status_asesmen
          )}
        />

        <InfoBox
          icon={<Star size={17} />}
          label="Nilai Akhir"
          value={
            keputusan?.nilai_akhir !== null &&
            keputusan?.nilai_akhir !== undefined &&
            keputusan?.nilai_akhir !== ""
              ? keputusan.nilai_akhir
              : peserta?.nilai_akhir || "-"
          }
        />

        <InfoBox
          icon={<FileText size={17} />}
          label="Catatan Asesor"
          value={
            keputusan?.catatan_asesor ||
            peserta?.keterangan ||
            "-"
          }
        />
      </div>

      <div className="border-t border-[#071E3D]/10 bg-[#FAFAFA] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
              Aksi Peserta
            </p>

            <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
              Kelola asesmen peserta dan hasil keputusan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onKelolaAsesmen(peserta)}
            disabled={checking}
            className="w-full rounded-lg border border-[#CC6B27] bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:border-[#A8561F] hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 lg:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              {checking ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <FileText size={15} />
              )}

              {checking
                ? "Memeriksa..."
                : "Kelola Asesmen"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({
  icon,
  title,
  desc,
}) {
  return (
    <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5 md:px-6">
      <div className="flex items-center gap-2.5">
        <div className="text-[#CC6B27]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-white">
            {title}
          </h2>

          <p className="mt-1 text-[10px] font-medium text-white/60">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-[#071E3D]/10 bg-white p-12 text-center shadow-sm">
      <Loader2
        size={32}
        className="mx-auto mb-3 animate-spin text-[#CC6B27]"
      />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        Memuat Peserta
      </h3>

      <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
        Sistem sedang mengambil data peserta uji kompetensi.
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "orange",
}) {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    gray: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
          tones[tone] || tones.orange
        }`}
      >
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

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#CC6B27]">
        {icon}
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
        {label}
      </p>

      <p className="mt-1 line-clamp-2 text-[12px] font-bold leading-snug text-[#071E3D]">
        {value || "-"}
      </p>
    </div>
  );
}

function KelengkapanBadge({
  label,
  active,
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider ${
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-[#071E3D]/10 bg-white text-[#182D4A]/45"
      }`}
    >
      {active ? (
        <CheckCircle2 size={14} />
      ) : (
        <XCircle size={14} />
      )}

      {label}
    </div>
  );
}

function StatusAsesmenBadge({
  status,
}) {
  const normalized = normalizeStatusAsesmen(status);

  if (normalized === "kompeten") {
    return (
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-green-600">
        Kompeten
      </span>
    );
  }

  if (normalized === "belum_kompeten") {
    return (
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-red-500">
        Belum Kompeten
      </span>
    );
  }

  return (
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
      Belum Dinilai
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#071E3D]/15 bg-white p-12 text-center shadow-sm">
      <Users
        size={40}
        className="mx-auto mb-4 text-[#071E3D]/20"
      />

      <h3 className="text-[16px] font-bold text-[#071E3D]">
        Peserta Tidak Ditemukan
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
        Belum ada peserta pada jadwal ini atau data tidak sesuai dengan pencarian dan filter.
      </p>
    </div>
  );
}

function getUserObject(peserta) {
  return (
    peserta?.user ||
    peserta?.User ||
    peserta?.profileAsesi?.user ||
    {}
  );
}

function getPesertaJadwalId(peserta) {
  return (
    peserta?.id_peserta ||
    peserta?.id_peserta_jadwal ||
    peserta?.id ||
    peserta?.id_pendaftaran ||
    null
  );
}

function getNamaPeserta(peserta) {
  const user = getUserObject(peserta);

  const profile =
    peserta?.profileAsesi ||
    peserta?.asesi ||
    {};

  return (
    peserta?.nama_lengkap ||
    peserta?.nama ||
    profile?.nama_lengkap ||
    profile?.nama ||
    user?.nama_lengkap ||
    user?.nama ||
    user?.username ||
    "Nama peserta belum tersedia"
  );
}

function normalizeStatusAsesmen(status) {
  if (!status) {
    return "belum_dinilai";
  }

  const value = String(status)
    .toLowerCase()
    .trim();

  if (value === "kompeten") {
    return "kompeten";
  }

  if (
    value === "belum kompeten" ||
    value === "belum_kompeten"
  ) {
    return "belum_kompeten";
  }

  if (
    value === "terdaftar" ||
    value === "pra_asesmen" ||
    value === "asesmen"
  ) {
    return "belum_dinilai";
  }

  return value;
}

function formatStatus(status) {
  if (!status) {
    return "-";
  }

  const normalized = normalizeStatusAsesmen(status);

  if (normalized === "kompeten") {
    return "Kompeten";
  }

  if (normalized === "belum_kompeten") {
    return "Belum Kompeten";
  }

  return "Belum Dinilai";
}