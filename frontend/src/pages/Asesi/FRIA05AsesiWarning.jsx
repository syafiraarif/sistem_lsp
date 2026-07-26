import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  FileWarning,
  ShieldAlert,
  X,
} from "lucide-react";

export default function FRIA05AsesiWarning({
  open,
  duration = 120, // menit
  onClose,
  onConfirm,
}) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) {
      setChecked(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6 text-white">

          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 transition hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <AlertTriangle size={34} />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Peringatan FR.IA.05
              </h2>

              <p className="mt-1 text-sm text-white/90">
                Harap membaca seluruh ketentuan sebelum memulai asesmen.
              </p>
            </div>
          </div>
        </div>

        {/* Isi */}
        <div className="space-y-5 p-8">

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={22}
                className="mt-0.5 text-red-600"
              />

              <div>
                <h3 className="font-black text-red-700">
                  Penting!
                </h3>

                <p className="mt-1 text-sm text-red-600">
                  Setelah Anda menekan tombol
                  <strong> "Mulai Asesmen"</strong>,
                  sistem akan menganggap Anda telah memulai proses
                  pengerjaan FR.IA.05.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">

            <div className="flex items-start gap-3">
              <Clock3
                size={20}
                className="mt-1 text-orange-500"
              />

              <div>
                <p className="font-bold text-[#071E3D]">
                  Waktu Pengerjaan
                </p>

                <p className="text-sm text-slate-500">
                  Anda memiliki waktu maksimal{" "}
                  <strong>{duration} menit</strong>
                  untuk menyelesaikan seluruh asesmen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileWarning
                size={20}
                className="mt-1 text-orange-500"
              />

              <div>
                <p className="font-bold text-[#071E3D]">
                  Ketentuan Pengerjaan
                </p>

                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">

                  <li>
                    FR.IA.05 hanya dapat dikerjakan
                    <strong> satu kali.</strong>
                  </li>

                  <li>
                    Jawaban tidak dapat diubah setelah
                    menekan tombol <strong>Submit</strong>.
                  </li>

                  <li>
                    Apabila Anda keluar dari halaman,
                    menutup browser, atau koneksi terputus
                    sebelum melakukan submit,
                    maka jawaban yang telah diisi
                    tidak dapat dipulihkan.
                  </li>

                  <li>
                    Pastikan koneksi internet stabil
                    sebelum memulai asesmen.
                  </li>

                  <li>
                    Pastikan seluruh jawaban telah diperiksa
                    sebelum melakukan submit.
                  </li>

                </ul>
              </div>
            </div>

          </div>

          {/* Checkbox */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1 h-5 w-5 accent-orange-500"
              />

              <span className="text-sm font-semibold text-slate-700">
                Saya telah membaca, memahami,
                dan menyetujui seluruh ketentuan
                pengerjaan FR.IA.05.
              </span>

            </label>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-8 py-5">

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Batal
          </button>

          <button
            disabled={!checked}
            onClick={onConfirm}
            className={`rounded-2xl px-6 py-3 font-bold text-white transition ${
              checked
                ? "bg-orange-500 hover:bg-[#071E3D]"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            Mulai Asesmen
          </button>

        </div>

      </div>
    </div>
  );
}