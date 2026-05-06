// frontend/src/pages/admin/Mapa01.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Sparkles,
  ClipboardList,
  Target,
  MapPin,
  BadgeCheck,
  Building2,
} from "lucide-react";

const Mapa01 = () => {
  const { id } = useParams(); // Ambil ID MAPA dari URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterData, setMasterData] = useState(null);

  // State Form sesuai dengan ENUM di database mapa01.model.js
  const [formData, setFormData] = useState({
    profil_asesi: "",
    tujuan_asesmen: "sertifikasi",
    lingkungan: "tempat_kerja_nyata",
    peluang_bukti: "tersedia",
    pelaksana: "lsp",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Ambil data Master MAPA (untuk header nama Skema)
      const masterRes = await api.get(`/admin/mapa/${id}`);
      setMasterData(masterRes.data?.data || masterRes.data);

      // 2. Ambil isi form MAPA-01 jika sebelumnya sudah pernah di-save
      const res = await api.get(`/admin/mapa01/${id}`);
      const m01Data = res.data?.data || res.data;

      // Jika data ditemukan, masukkan ke form
      if (m01Data && Object.keys(m01Data).length > 0) {
        setFormData({
          profil_asesi: m01Data.profil_asesi || "",
          tujuan_asesmen: m01Data.tujuan_asesmen || "sertifikasi",
          lingkungan: m01Data.lingkungan || "tempat_kerja_nyata",
          peluang_bukti: m01Data.peluang_bukti || "tersedia",
          pelaksana: m01Data.pelaksana || "lsp",
        });
      }
    } catch (error) {
      console.error("Gagal memuat MAPA 01", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Pastikan id_mapa dikirim sebagai Integer
      const payload = {
        ...formData,
        id_mapa: parseInt(id),
      };

      // Endpoint sesuai di admin.routes.js (POST /mapa01)
      await api.post(`/admin/mapa01`, payload);

      Swal.fire({
        title: "Berhasil!",
        text: "Dokumen MAPA-01 berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#CC6B27",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        // PERBAIKAN: Kembali ke halaman sebelumnya dengan aman
        navigate(-1);
      });
    } catch (error) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Gagal menyimpan MAPA-01",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="rounded-[32px] border border-slate-100 bg-white p-10 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 animate-spin text-orange-500" size={42} />
          <p className="text-sm font-black uppercase tracking-widest text-[#071E3D]">
            Memuat MAPA-01
          </p>
        </div>
      </div>
    );
  }

  const skemaTitle =
    masterData?.skema?.nama_skema ||
    masterData?.skema?.judul_skema ||
    "Memuat...";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-[430px] w-[430px] rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#071E3D]/5 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 gap-6 p-6 lg:p-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#071E3D] hover:text-white"
              >
                <ArrowLeft size={14} />
                Kembali
              </button>

              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                <FileText size={15} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  MAPA-01
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#071E3D] lg:text-5xl">
                Perencanaan Aktivitas
                <br />
                <span className="text-orange-500">& Proses Asesmen</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-500 lg:text-lg">
                Lengkapi pengaturan awal MAPA-01 mulai dari profil asesi,
                tujuan asesmen, lingkungan, peluang bukti, dan pelaksana
                asesmen.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  form="mapa01Form"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  Simpan Dokumen
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Batal
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                  <Sparkles size={28} />
                </div>

                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                  Skema Sertifikasi
                </p>

                <h2 className="mb-4 text-2xl font-black leading-snug">
                  {skemaTitle}
                </h2>

                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Pastikan data MAPA-01 sesuai dengan karakteristik asesi dan
                  konteks pelaksanaan asesmen.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <HeroPill label="Jenis" value="MAPA-01" />
                  <HeroPill label="Status" value="Form Aktif" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <form
          id="mapa01Form"
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
              <ClipboardList size={15} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                Form Pengisian
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#071E3D]">
              Detail Perencanaan MAPA-01
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-400">
              Isi pilihan berikut sesuai kebutuhan pelaksanaan asesmen.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#071E3D]">
                    1. Profil Asesi
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    Opsional, dapat diisi dengan deskripsi singkat profil asesi.
                  </p>
                </div>
              </div>

              <textarea
                name="profil_asesi"
                value={formData.profil_asesi}
                onChange={handleChange}
                rows="4"
                className="w-full resize-none rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
                placeholder="Deskripsikan profil asesi (misal: Siswa SMK, Pekerja, Fresh Graduate, dll)..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SelectCard
                icon={<Target size={20} />}
                title="2. Tujuan Asesmen"
                name="tujuan_asesmen"
                value={formData.tujuan_asesmen}
                onChange={handleChange}
              >
                <option value="sertifikasi">Sertifikasi</option>
                <option value="sertifikasi_ulang">Sertifikasi Ulang</option>
                <option value="pkt">Pengakuan Kompetensi Terkini (PKT)</option>
                <option value="rpl">Rekognisi Pembelajaran Lampau (RPL)</option>
                <option value="lainnya">Lainnya</option>
              </SelectCard>

              <SelectCard
                icon={<MapPin size={20} />}
                title="3. Lingkungan Asesmen"
                name="lingkungan"
                value={formData.lingkungan}
                onChange={handleChange}
              >
                <option value="tempat_kerja_nyata">Tempat Kerja Nyata</option>
                <option value="tempat_kerja_simulasi">
                  Tempat Kerja Simulasi
                </option>
              </SelectCard>

              <SelectCard
                icon={<BadgeCheck size={20} />}
                title="4. Peluang Pengumpulan Bukti"
                name="peluang_bukti"
                value={formData.peluang_bukti}
                onChange={handleChange}
              >
                <option value="tersedia">Tersedia (Sangat Baik)</option>
                <option value="terbatas">Terbatas</option>
              </SelectCard>

              <SelectCard
                icon={<Building2 size={20} />}
                title="5. Pelaksana Asesmen"
                name="pelaksana"
                value={formData.pelaksana}
                onChange={handleChange}
              >
                <option value="lsp">Lembaga Sertifikasi Profesi (LSP)</option>
                <option value="organisasi_pelatihan">Organisasi Pelatihan</option>
                <option value="asesor_perusahaan">
                  Asesor Perusahaan Internal
                </option>
              </SelectCard>
            </div>
          </div>

          <div className="flex flex-col justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Simpan Dokumen MAPA-01
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function HeroPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function SelectCard({ icon, title, name, value, onChange, children }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          {icon}
        </div>
        <h3 className="text-sm font-black text-[#071E3D]">{title}</h3>
      </div>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-2xl border border-slate-100 bg-white p-4 text-sm font-black text-[#071E3D] outline-none transition-all focus:border-orange-200 focus:ring-4 focus:ring-orange-500/10"
      >
        {children}
      </select>
    </div>
  );
}

export default Mapa01;