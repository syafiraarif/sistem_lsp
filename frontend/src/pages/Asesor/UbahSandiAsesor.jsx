// frontend/src/pages/asesor/UbahSandiAsesor.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

export default function UbahSandiAsesor() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });

  const [showPassword, setShowPassword] = useState({
    password_lama: false,
    password_baru: false,
    konfirmasi_password: false,
  });

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const displayName = getDisplayName();

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(form.password_baru);
  }, [form.password_baru]);

  const passwordMatch =
    form.konfirmasi_password &&
    form.password_baru === form.konfirmasi_password;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (pesan) setPesan("");
    if (error) setError("");
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setForm({
      password_lama: "",
      password_baru: "",
      konfirmasi_password: "",
    });

    setShowPassword({
      password_lama: false,
      password_baru: false,
      konfirmasi_password: false,
    });

    setPesan("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password_lama) {
      setError("Password lama wajib diisi");
      return;
    }

    if (!form.password_baru) {
      setError("Password baru wajib diisi");
      return;
    }

    if (form.password_baru.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (!form.konfirmasi_password) {
      setError("Konfirmasi password wajib diisi");
      return;
    }

    if (form.password_baru !== form.konfirmasi_password) {
      setError("Konfirmasi password tidak sama dengan password baru");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPesan("");

      await api.put("/asesor/change-password", {
        password_lama: form.password_lama,
        password_baru: form.password_baru,
        konfirmasi_password: form.konfirmasi_password,

        old_password: form.password_lama,
        new_password: form.password_baru,
        confirm_password: form.konfirmasi_password,
        passwordBaru: form.password_baru,
        passwordLama: form.password_lama,
      });

      setPesan("Sandi asesor berhasil diperbarui");
      setForm({
        password_lama: "",
        password_baru: "",
        konfirmasi_password: "",
      });

      setShowPassword({
        password_lama: false,
        password_baru: false,
        konfirmasi_password: false,
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengubah sandi asesor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <SidebarAsesor isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-[1500px] mx-auto space-y-6">
          <section className="relative overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm">
            <div className="absolute top-0 right-0 w-[430px] h-[430px] bg-orange-500/10 rounded-full blur-[110px]" />
            <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-[#071E3D]/5 rounded-full blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 p-6 lg:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                  <KeyRound size={15} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                    Ubah Sandi
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#071E3D]">
                  Perbarui Sandi
                  <br />
                  <span className="text-orange-500">{displayName}</span>
                </h1>

                <p className="mt-5 max-w-2xl text-base lg:text-lg font-medium leading-relaxed text-slate-500">
                  Jaga keamanan akun asesor dengan mengganti sandi secara
                  berkala. Gunakan kombinasi karakter yang kuat dan mudah Anda
                  ingat.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("form-ubah-sandi")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D]"
                  >
                    Ubah Sekarang
                    <ChevronRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/asesor/dashboard")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-7 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                  >
                    Dashboard
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-[#071E3D] p-6 text-white shadow-2xl shadow-[#071E3D]/15">
                <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-400">
                    <Sparkles size={28} />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Keamanan Akun
                  </p>

                  <h2 className="text-2xl font-black leading-tight">
                    Akun Terproteksi
                  </h2>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/60">
                    Setelah sandi diperbarui, gunakan sandi baru saat login
                    berikutnya. Jangan bagikan sandi kepada siapapun.
                  </p>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                    <HeroPill label="Role" value="Asesor" />
                    <HeroPill label="Status" value="Aman" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {pesan && (
            <AlertBox
              type="success"
              icon={<BadgeCheck size={20} />}
              message={pesan}
            />
          )}

          {error && (
            <AlertBox
              type="error"
              icon={<XCircle size={20} />}
              message={error}
            />
          )}

          {loading && (
            <AlertBox
              type="loading"
              icon={<Loader2 size={20} className="animate-spin" />}
              message="Memproses perubahan sandi..."
            />
          )}

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6 items-start">
            <form
              id="form-ubah-sandi"
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
                    <LockKeyhole size={15} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      Form Keamanan
                    </span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-black text-[#071E3D]">
                    Ubah Sandi Asesor
                  </h2>

                  <p className="mt-2 text-sm font-medium text-slate-400">
                    Masukkan sandi lama, sandi baru, dan konfirmasi sandi baru.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-xs font-black uppercase tracking-widest text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  <RefreshCcw size={16} />
                  Reset
                </button>
              </div>

              <div className="p-6 lg:p-8 space-y-5">
                <PasswordInput
                  label="Sandi Lama"
                  name="password_lama"
                  value={form.password_lama}
                  show={showPassword.password_lama}
                  onChange={handleChange}
                  onToggle={() => toggleShowPassword("password_lama")}
                  placeholder="Masukkan sandi lama"
                />

                <PasswordInput
                  label="Sandi Baru"
                  name="password_baru"
                  value={form.password_baru}
                  show={showPassword.password_baru}
                  onChange={handleChange}
                  onToggle={() => toggleShowPassword("password_baru")}
                  placeholder="Masukkan sandi baru"
                />

                <PasswordStrength strength={passwordStrength} />

                <PasswordInput
                  label="Konfirmasi Sandi Baru"
                  name="konfirmasi_password"
                  value={form.konfirmasi_password}
                  show={showPassword.konfirmasi_password}
                  onChange={handleChange}
                  onToggle={() => toggleShowPassword("konfirmasi_password")}
                  placeholder="Ulangi sandi baru"
                />

                {form.konfirmasi_password && (
                  <div
                    className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
                      passwordMatch
                        ? "border-green-100 bg-green-50 text-green-700"
                        : "border-red-100 bg-red-50 text-red-600"
                    }`}
                  >
                    {passwordMatch ? (
                      <BadgeCheck size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                    <span>
                      {passwordMatch
                        ? "Konfirmasi sandi sudah sesuai"
                        : "Konfirmasi sandi belum sama"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
                <p className="text-sm font-medium text-slate-500">
                  Pastikan sandi baru sudah benar sebelum menyimpan perubahan.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Simpan Sandi
                </button>
              </div>
            </form>

            <aside className="space-y-5">
              <InfoCard
                icon={<ShieldCheck size={22} />}
                title="Tips Sandi Aman"
                items={[
                  "Gunakan minimal 6 karakter.",
                  "Campurkan huruf besar, huruf kecil, angka, dan simbol.",
                  "Jangan gunakan tanggal lahir atau nama sendiri.",
                  "Jangan bagikan sandi kepada pihak lain.",
                ]}
              />

              <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <KeyRound size={22} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status Form
                </p>

                <h3 className="mt-2 text-2xl font-black text-[#071E3D]">
                  {passwordStrength.label}
                </h3>

                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  Kekuatan sandi akan meningkat jika memakai kombinasi karakter
                  yang lebih beragam.
                </p>

                <div className="mt-5">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.colorClass}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  show,
  onChange,
  onToggle,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 pr-14 text-sm font-semibold text-[#071E3D] outline-none transition-all placeholder:text-slate-300 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-500"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ strength }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-slate-50/60 p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kekuatan Sandi
          </p>
          <p className="mt-1 text-sm font-black text-[#071E3D]">
            {strength.label}
          </p>
        </div>

        <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          {strength.score}/4
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full transition-all ${strength.colorClass}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        {icon}
      </div>

      <h3 className="text-2xl font-black text-[#071E3D]">{title}</h3>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <BadgeCheck size={13} />
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function AlertBox({ type, icon, message }) {
  const styles = {
    success: "border-green-100 bg-green-50 text-green-700",
    error: "border-red-100 bg-red-50 text-red-600",
    loading: "border-blue-100 bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 text-sm font-semibold flex items-center gap-3 ${
        styles[type] || styles.loading
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{message}</span>
    </div>
  );
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return {
      score: 0,
      label: "Belum Diisi",
      percent: 0,
      colorClass: "bg-slate-300",
    };
  }

  if (score <= 1) {
    return {
      score,
      label: "Lemah",
      percent: 25,
      colorClass: "bg-red-500",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Cukup",
      percent: 50,
      colorClass: "bg-yellow-500",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Baik",
      percent: 75,
      colorClass: "bg-blue-500",
    };
  }

  return {
    score,
    label: "Kuat",
    percent: 100,
    colorClass: "bg-green-500",
  };
}

function getDisplayName() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      user?.name ||
      "Asesor"
    );
  } catch (err) {
    return "Asesor";
  }
}