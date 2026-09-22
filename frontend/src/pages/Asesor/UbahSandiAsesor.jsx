import React, { useMemo, useState } from "react";
import SidebarAsesor from "../../components/sidebar/SidebarAsesor";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { notifikasi } from "../../components/ui/notifikasi";
import api from "../../services/api";

export default function UbahSandiAsesor() {
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

  const displayName = getDisplayName();

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(
      form.password_baru
    );
  }, [form.password_baru]);

  const passwordMatch = Boolean(
    form.konfirmasi_password &&
      form.password_baru ===
        form.konfirmasi_password
  );

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowPassword = (
    field
  ) => {
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
  };

  const handleRefresh = async () => {
    if (loading) {
      return;
    }

    resetForm();

    await notifikasi.sukses(
      "Berhasil",
      "Form ubah sandi berhasil disegarkan."
    );
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!form.password_lama) {
      await notifikasi.peringatan(
        "Peringatan",
        "Password lama wajib diisi."
      );
      return;
    }

    if (!form.password_baru) {
      await notifikasi.peringatan(
        "Peringatan",
        "Password baru wajib diisi."
      );
      return;
    }

    if (
      form.password_baru.length <
      6
    ) {
      await notifikasi.peringatan(
        "Peringatan",
        "Password baru minimal 6 karakter."
      );
      return;
    }

    if (
      !form.konfirmasi_password
    ) {
      await notifikasi.peringatan(
        "Peringatan",
        "Konfirmasi password wajib diisi."
      );
      return;
    }

    if (
      form.password_baru !==
      form.konfirmasi_password
    ) {
      await notifikasi.peringatan(
        "Peringatan",
        "Konfirmasi password tidak sama dengan password baru."
      );
      return;
    }

    try {
      setLoading(true);

      await api.put(
        "/asesor/change-password",
        {
          password_lama:
            form.password_lama,
          password_baru:
            form.password_baru,
          konfirmasi_password:
            form.konfirmasi_password,
          old_password:
            form.password_lama,
          new_password:
            form.password_baru,
          confirm_password:
            form.konfirmasi_password,
          passwordBaru:
            form.password_baru,
          passwordLama:
            form.password_lama,
        }
      );

      resetForm();

      await notifikasi.sukses(
        "Berhasil",
        "Sandi asesor berhasil diperbarui."
      );
    } catch (err) {
      console.error(err);

      await notifikasi.gagal(
        "Gagal",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal mengubah sandi asesor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <SidebarAsesor
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
            <div className="border-b border-[#071E3D]/10 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[24px] font-black text-[#071E3D] md:text-[28px]">
                    Ubah Sandi Asesor
                  </h1>

                  <p className="mt-1 text-[13px] font-medium text-[#182D4A]/70">
                    Perbarui sandi akun asesor secara berkala untuk menjaga keamanan akun{" "}
                    <span className="font-bold text-[#071E3D]">
                      {displayName}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] shadow-sm transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCcw
                        size={15}
                      />
                    )}
                    Refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6">
              <MiniStat
                icon={
                  <LockKeyhole
                    size={22}
                  />
                }
                label="Role"
                value="Asesor"
              />

              <MiniStat
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                label="Keamanan"
                value="Terproteksi"
                tone="green"
              />

              <MiniStat
                icon={
                  <BadgeCheck
                    size={22}
                  />
                }
                label="Status Form"
                value={
                  form.password_baru
                    ? passwordStrength.label
                    : "Belum Diisi"
                }
              />
            </div>
          </section>

          <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_360px]">
            <form
              id="form-ubah-sandi"
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm"
            >
              <div className="border-b border-[#071E3D]/10 px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#071E3D]">
                      <LockKeyhole
                        size={18}
                        className="text-[#CC6B27]"
                      />
                      Form Ubah Sandi
                    </h2>

                    <p className="mt-1 text-[12px] font-medium text-[#182D4A]/60">
                      Masukkan sandi lama dan sandi baru untuk memperbarui keamanan akun.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="rounded-lg border border-[#071E3D]/20 bg-white px-4 py-2.5 text-[12px] font-bold text-[#071E3D] transition-all hover:border-[#071E3D] hover:bg-[#071E3D] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCcw
                        size={15}
                      />
                      Reset
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <PasswordInput
                  label="Sandi Lama"
                  name="password_lama"
                  value={
                    form.password_lama
                  }
                  show={
                    showPassword.password_lama
                  }
                  onChange={
                    handleChange
                  }
                  onToggle={() =>
                    toggleShowPassword(
                      "password_lama"
                    )
                  }
                  placeholder="Masukkan sandi lama"
                />

                <PasswordInput
                  label="Sandi Baru"
                  name="password_baru"
                  value={
                    form.password_baru
                  }
                  show={
                    showPassword.password_baru
                  }
                  onChange={
                    handleChange
                  }
                  onToggle={() =>
                    toggleShowPassword(
                      "password_baru"
                    )
                  }
                  placeholder="Masukkan sandi baru"
                />

                <PasswordStrength
                  strength={
                    passwordStrength
                  }
                />

                <PasswordInput
                  label="Konfirmasi Sandi Baru"
                  name="konfirmasi_password"
                  value={
                    form.konfirmasi_password
                  }
                  show={
                    showPassword.konfirmasi_password
                  }
                  onChange={
                    handleChange
                  }
                  onToggle={() =>
                    toggleShowPassword(
                      "konfirmasi_password"
                    )
                  }
                  placeholder="Ulangi sandi baru"
                />

                {form.konfirmasi_password && (
                  <div
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-[12px] font-semibold ${
                      passwordMatch
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {passwordMatch ? (
                      <BadgeCheck
                        size={17}
                        className="shrink-0"
                      />
                    ) : (
                      <ShieldCheck
                        size={17}
                        className="shrink-0"
                      />
                    )}

                    <span>
                      {passwordMatch
                        ? "Konfirmasi sandi sudah sesuai"
                        : "Konfirmasi sandi belum sama"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#071E3D]/10 bg-[#FAFAFA] p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                    Keamanan Akun
                  </p>

                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#182D4A]/60">
                    Pastikan sandi baru sudah benar sebelum menyimpan perubahan.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#CC6B27] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={15} />
                    )}
                    Simpan Sandi
                  </span>
                </button>
              </div>
            </form>

            <aside className="space-y-5">
              <section className="overflow-hidden rounded-xl border border-[#071E3D]/10 bg-white shadow-sm">
                <div className="border-b-4 border-[#CC6B27] bg-[#071E3D] px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white">
                    <ShieldCheck
                      size={17}
                      className="text-[#CC6B27]"
                    />
                    Tips Keamanan
                  </h2>
                </div>

                <div className="space-y-3 p-5">
                  <SecurityTip text="Gunakan minimal 6 karakter." />

                  <SecurityTip text="Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol." />

                  <SecurityTip text="Hindari menggunakan nama, tanggal lahir, atau informasi pribadi." />

                  <SecurityTip text="Jangan membagikan sandi kepada pihak lain." />
                </div>
              </section>

              <section className="rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                    <KeyRound
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                      Kekuatan Sandi
                    </p>

                    <h3 className="mt-0.5 text-[16px] font-black text-[#071E3D]">
                      {passwordStrength.label}
                    </h3>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#182D4A]/50">
                      Tingkat keamanan
                    </span>

                    <span className="text-[10px] font-bold text-[#071E3D]">
                      {passwordStrength.score}/4
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className={`h-full transition-all ${passwordStrength.colorClass}`}
                      style={{
                        width: `${passwordStrength.percent}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#182D4A]/60">
                  Semakin beragam karakter yang digunakan, semakin kuat tingkat keamanan sandi.
                </p>
              </section>

              <section className="rounded-xl border border-[#071E3D]/10 bg-[#FAFAFA] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
                    <UserIcon />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
                      Akun Asesor
                    </p>

                    <p className="mt-1 text-[13px] font-bold text-[#071E3D]">
                      {displayName}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#182D4A]/60">
                  Setelah perubahan berhasil, gunakan sandi baru saat login berikutnya.
                </p>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function PasswordInput({ label, name, value, show, onChange, onToggle, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/60">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#071E3D]/20 bg-[#FAFAFA] px-3.5 py-3 pr-12 text-[13px] font-medium text-[#071E3D] outline-none transition-all placeholder:text-[#182D4A]/40 focus:border-[#CC6B27] focus:bg-white focus:ring-2 focus:ring-[#CC6B27]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#182D4A]/50 transition-all hover:bg-[#CC6B27]/10 hover:text-[#CC6B27]"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ strength }) {
  return (
    <div className="rounded-lg border border-[#071E3D]/10 bg-[#FAFAFA] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#182D4A]/50">
            Kekuatan Sandi
          </p>

          <p className="mt-1 text-[12px] font-bold text-[#071E3D]">
            {strength.label}
          </p>
        </div>

        <span className="text-[11px] font-bold text-[#182D4A]/60">
          {strength.score}/4
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-lg bg-white">
        <div
          className={`h-full transition-all ${strength.colorClass}`}
          style={{
            width: `${strength.percent}%`,
          }}
        />
      </div>
    </div>
  );
}

function SecurityTip({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#CC6B27]/10 text-[#CC6B27]">
        <BadgeCheck size={15} />
      </div>

      <p className="text-[12px] font-medium leading-relaxed text-[#182D4A]/70">
        {text}
      </p>
    </div>
  );
}

function MiniStat({ icon, label, value, tone = "orange" }) {
  const tones = {
    orange: "bg-[#CC6B27]/10 text-[#CC6B27]",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#071E3D]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.orange}`}>
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

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 6) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

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

    return user?.nama || user?.nama_lengkap || user?.username || user?.name || "Asesor";
  } catch {
    return "Asesor";
  }
}