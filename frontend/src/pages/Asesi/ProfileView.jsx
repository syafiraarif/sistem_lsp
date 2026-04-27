// frontend/src/pages/asesi/ProfileView.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import {
  User,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  Upload,
  Pencil,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Hash,
  Calendar,
  Globe,
  Building2,
  Phone,
  Mail,
  BadgeCheck,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/asesi/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data?.data);
    } catch (err) {
      console.error("Gagal ambil profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const imageBase = BASE_URL.replace("/api", "");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-5" size={44} />
          <p className="text-[#071E3D] font-black text-lg">
            Memuat Profile
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mohon tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-[28px] bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={38} />
          </div>

          <h2 className="text-2xl font-black text-[#071E3D] mb-2">
            Profile Tidak Ditemukan
          </h2>

          <p className="text-slate-500 font-medium mb-6">
            Data profile belum tersedia atau gagal dimuat.
          </p>

          <button
            onClick={() => navigate("/asesi/profile/edit")}
            className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2"
          >
            Lengkapi Profile
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesi isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="relative overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 mb-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#071E3D]/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                  <ShieldCheck size={15} className="text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">
                    Profile Asesi
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-[#071E3D] leading-tight">
                  Profile Saya
                </h1>

                <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">
                  Lihat ringkasan data diri, alamat, pendidikan, pekerjaan, dan
                  dokumen pendukung Anda.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/asesi/profile/edit")}
                  className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>

                <button
                  onClick={() => navigate("/asesi/profile/dokumen")}
                  className="px-6 py-4 rounded-2xl bg-[#071E3D] hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={17} />
                  Upload Dokumen
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <aside className="xl:col-span-1">
              <div className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden sticky top-6">
                <div className="relative bg-[#071E3D] p-8 text-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                  <div className="relative z-10">
                    <div className="mx-auto w-36 h-36 rounded-[36px] bg-white/10 border border-white/10 flex items-center justify-center p-2 mb-5">
                      {profile.foto_profil ? (
                        <img
                          src={`${imageBase}/${profile.foto_profil}`}
                          alt="Foto Profil"
                          className="w-full h-full rounded-[30px] object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[30px] bg-white/10 text-white/50 flex items-center justify-center">
                          <User size={50} />
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-black text-white leading-tight">
                      {profile.nama_lengkap || "Nama Asesi"}
                    </h2>

                    <p className="text-white/50 text-xs font-black uppercase tracking-widest mt-2">
                      Asesi
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <ReadonlyBox
                    label="NIK"
                    value={profile.nik || "-"}
                    icon={<Hash size={18} />}
                  />
                  <ReadonlyBox
                    label="Jenis Kelamin"
                    value={profile.jenis_kelamin || "-"}
                    icon={<User size={18} />}
                  />
                  <ReadonlyBox
                    label="Tempat / Tanggal Lahir"
                    value={`${profile.tempat_lahir || "-"} / ${
                      profile.tanggal_lahir
                        ? new Date(profile.tanggal_lahir).toLocaleDateString("id-ID")
                        : "-"
                    }`}
                    icon={<Calendar size={18} />}
                  />
                  <ReadonlyBox
                    label="Kebangsaan"
                    value={profile.kebangsaan || "-"}
                    icon={<Globe size={18} />}
                  />
                </div>
              </div>
            </aside>

            {/* Details */}
            <section className="xl:col-span-2 space-y-6">
              <Card title="Alamat" icon={<MapPin size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox label="Alamat Lengkap" className="md:col-span-2">
                    {profile.alamat || "-"}
                  </InfoBox>
                  <InfoBox label="RT / RW">
                    {(profile.rt || "-") + " / " + (profile.rw || "-")}
                  </InfoBox>
                  <InfoBox label="Kode Pos">
                    {profile.kode_pos || "-"}
                  </InfoBox>
                  <InfoBox label="Provinsi">
                    {profile.provinsi || "-"}
                  </InfoBox>
                  <InfoBox label="Kota/Kabupaten">
                    {profile.kota || "-"}
                  </InfoBox>
                  <InfoBox label="Kecamatan">
                    {profile.kecamatan || "-"}
                  </InfoBox>
                  <InfoBox label="Kelurahan">
                    {profile.kelurahan || "-"}
                  </InfoBox>
                </div>
              </Card>

              <Card title="Pendidikan" icon={<GraduationCap size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox label="Pendidikan Terakhir">
                    {profile.pendidikan_terakhir || "-"}
                  </InfoBox>
                  <InfoBox label="Universitas">
                    {profile.universitas || "-"}
                  </InfoBox>
                  <InfoBox label="Jurusan">
                    {profile.jurusan || "-"}
                  </InfoBox>
                  <InfoBox label="Tahun Lulus">
                    {profile.tahun_lulus || "-"}
                  </InfoBox>
                </div>
              </Card>

              <Card title="Pekerjaan" icon={<BriefcaseBusiness size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox label="Pekerjaan">
                    {profile.pekerjaan || "-"}
                  </InfoBox>
                  <InfoBox label="Jabatan">
                    {profile.jabatan || "-"}
                  </InfoBox>
                  <InfoBox label="Nama Perusahaan">
                    {profile.nama_perusahaan || "-"}
                  </InfoBox>
                  <InfoBox label="Telepon Perusahaan">
                    <span className="inline-flex items-center gap-2">
                      <Phone size={15} className="text-orange-500" />
                      {profile.telp_perusahaan || "-"}
                    </span>
                  </InfoBox>
                  <InfoBox label="Fax Perusahaan">
                    {profile.fax_perusahaan || "-"}
                  </InfoBox>
                  <InfoBox label="Email Perusahaan">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={15} className="text-orange-500" />
                      {profile.email_perusahaan || "-"}
                    </span>
                  </InfoBox>
                  <InfoBox label="Alamat Perusahaan" className="md:col-span-2">
                    {profile.alamat_perusahaan || "-"}
                  </InfoBox>
                </div>
              </Card>

              <Card title="Dokumen" icon={<FileText size={22} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox label="Status Dokumen">
                    <span className="inline-flex items-center gap-2 text-emerald-600">
                      <BadgeCheck size={16} />
                      Dapat diperbarui di menu Upload Dokumen
                    </span>
                  </InfoBox>

                  <button
                    onClick={() => navigate("/asesi/profile/dokumen")}
                    className="px-6 py-4 rounded-2xl bg-orange-500 hover:bg-[#071E3D] text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={17} />
                    Kelola Dokumen
                    <ChevronRight size={16} />
                  </button>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

const Card = ({ title, icon, children }) => {
  return (
    <section className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Detail Profile
          </p>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
};

const InfoBox = ({ label, children, className = "" }) => {
  return (
    <div className={`rounded-2xl bg-slate-50 border border-slate-100 p-4 ${className}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-sm font-black text-[#071E3D] leading-relaxed">
        {children}
      </p>
    </div>
  );
};

const ReadonlyBox = ({ label, value, icon }) => {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>

      <p className="font-black text-[#071E3D] text-sm leading-relaxed">
        {value}
      </p>
    </div>
  );
};