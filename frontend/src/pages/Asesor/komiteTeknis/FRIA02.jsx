// frontend/src/pages/asesor/komiteTeknis/FRIA02.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import api from "../../../services/api";

const defaultPetunjuk = [
  "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktek",
  "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
  "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
  "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)",
];

const defaultKelompok = [
  {
    kelompok_pekerjaan: "Kelompok Pekerjaan",
    units: [
      {
        kode_unit: "LOG.OO.09.002.00",
        judul_unit: "Membaca gambar teknik",
      },
      {
        kode_unit: "J.611000.005.02",
        judul_unit: "Menentukan Spesifikasi Perangkat Jaringan",
      },
    ],
    skenario_tugas: "",
    perlengkapan_peralatan: "",
    waktu: "",
  },
  {
    kelompok_pekerjaan: "Kelompok Pekerjaan Instalasi Jaringan",
    units: [
      {
        kode_unit: "J.611000.005.02",
        judul_unit: "Menentukan Spesifikasi Perangkat Jaringan",
      },
      {
        kode_unit: "TIK.MM02.052.01",
        judul_unit: "Membuat rekaman gambar berurutan untuk animasi",
      },
    ],
    skenario_tugas: "",
    perlengkapan_peralatan: "",
    waktu: "",
  },
];

export default function FRIA02() {
  const { id_jadwal, idJadwal, id } = useParams();
  const navigate = useNavigate();

  const jadwalId = id_jadwal || idJadwal || id;

  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState(null);

  const [form, setForm] = useState({
    nama_asesor: getDisplayName(),
    nama_asesi: "",
    tanggal: "",
    petunjuk: defaultPetunjuk,
    kelompok: defaultKelompok,
  });

  const localStorageKey = useMemo(
    () => `fria02-komite-teknis-${jadwalId}`,
    [jadwalId]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const saved = localStorage.getItem(localStorageKey);

        if (saved) {
          try {
            setForm((prev) => ({
              ...prev,
              ...JSON.parse(saved),
            }));
          } catch {
            // biarkan default kalau localStorage rusak
          }
        }

        const res = await api.get("/asesor/jadwal-komite-teknis");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const found = list.find((item) => {
          const j = item.jadwal || {};
          return (
            String(item.id_jadwal) === String(jadwalId) ||
            String(j.id_jadwal) === String(jadwalId) ||
            String(j.id) === String(jadwalId)
          );
        });

        setJadwal(found?.jadwal || found || null);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data FR.IA.02");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jadwalId, localStorageKey]);

  const skema = getSkema(jadwal);
  const tuk = getTuk(jadwal);

  const handleSave = () => {
    localStorage.setItem(localStorageKey, JSON.stringify(form));
    alert("FR.IA.02 berhasil disimpan sementara di browser");
  };

  const handlePrint = () => {
    window.print();
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePetunjuk = (index, value) => {
    setForm((prev) => ({
      ...prev,
      petunjuk: prev.petunjuk.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const updateKelompok = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const updateUnit = (kelompokIndex, unitIndex, field, value) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.map((kelompok, kIndex) =>
        kIndex === kelompokIndex
          ? {
              ...kelompok,
              units: kelompok.units.map((unit, uIndex) =>
                uIndex === unitIndex
                  ? {
                      ...unit,
                      [field]: value,
                    }
                  : unit
              ),
            }
          : kelompok
      ),
    }));
  };

  const addUnit = (kelompokIndex) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.map((kelompok, kIndex) =>
        kIndex === kelompokIndex
          ? {
              ...kelompok,
              units: [
                ...kelompok.units,
                {
                  kode_unit: "",
                  judul_unit: "",
                },
              ],
            }
          : kelompok
      ),
    }));
  };

  const removeUnit = (kelompokIndex, unitIndex) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.map((kelompok, kIndex) =>
        kIndex === kelompokIndex
          ? {
              ...kelompok,
              units: kelompok.units.filter((_, uIndex) => uIndex !== unitIndex),
            }
          : kelompok
      ),
    }));
  };

  const addKelompok = () => {
    setForm((prev) => ({
      ...prev,
      kelompok: [
        ...prev.kelompok,
        {
          kelompok_pekerjaan: "Kelompok Pekerjaan",
          units: [
            {
              kode_unit: "",
              judul_unit: "",
            },
          ],
          skenario_tugas: "",
          perlengkapan_peralatan: "",
          waktu: "",
        },
      ],
    }));
  };

  const removeKelompok = (index) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold">
          <Loader2 className="animate-spin" />
          Memuat FR.IA.02...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex w-[900px] justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Save size={18} />
            Simpan
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900"
          >
            <Download size={18} />
            Cetak / PDF
          </button>
        </div>
      </div>

      <main className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:shadow-none print:px-8 print:py-6">
        <h1 className="mb-6 text-[18px] font-bold">
          FR.IA.02. TPD - TUGAS PRAKTIK DEMONSTRASI
        </h1>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td
                rowSpan="2"
                className="w-[230px] border border-black px-2 py-2 align-middle text-[16px] font-bold leading-tight"
              >
                Skema Sertifikasi
                <br />
                (KKNI/Okupasi/Klaster)
              </td>

              <td className="w-[90px] border border-black px-2 py-1 font-bold">
                Judul
              </td>

              <td className="w-[20px] border border-black px-2 py-1 text-center">
                :
              </td>

              <td className="border border-black px-2 py-1 font-bold">
                {skema.judul_skema}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Nomor
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1 font-bold">
                {skema.kode_skema}
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                TUK
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                {tuk || "-"}
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Nama Asesor
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  value={form.nama_asesor}
                  onChange={(e) => updateField("nama_asesor", e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Nama Asesi
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  value={form.nama_asesi}
                  onChange={(e) => updateField("nama_asesi", e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Tanggal
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => updateField("tanggal", e.target.value)}
                  className="bg-transparent outline-none print:hidden"
                />
                <span className="hidden print:inline">
                  {formatTanggal(form.tanggal)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <section className="mt-6">
          <div className="flex gap-5">
            <span className="font-bold">A.</span>
            <h2 className="font-bold">Petunjuk</h2>
          </div>

          <ol className="ml-[68px] mt-2 list-decimal space-y-1">
            {form.petunjuk.map((item, index) => (
              <li key={index}>
                <input
                  value={item}
                  onChange={(e) => updatePetunjuk(index, e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <div className="flex gap-5">
            <span className="font-bold">B.</span>
            <h2 className="font-bold">Skenario Tugas Praktik Demonstrasi</h2>
          </div>

          {form.kelompok.map((kelompok, kelompokIndex) => (
            <div
              key={kelompokIndex}
              className="mt-5 rounded-none border-0 border-black"
            >
              <div className="mb-2 flex justify-between print:hidden">
                <p className="font-bold text-slate-700">
                  Kelompok {kelompokIndex + 1}
                </p>

                {form.kelompok.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKelompok(kelompokIndex)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-600"
                  >
                    <Trash2 size={14} />
                    Hapus Kelompok
                  </button>
                )}
              </div>

              <table className="w-full border-collapse border border-black">
                <tbody>
                  {kelompok.units.map((unit, unitIndex) => (
                    <tr key={unitIndex}>
                      {unitIndex === 0 && (
                        <td
                          rowSpan={kelompok.units.length}
                          className="w-[185px] border border-black px-2 py-2 align-middle"
                        >
                          <textarea
                            value={kelompok.kelompok_pekerjaan}
                            onChange={(e) =>
                              updateKelompok(
                                kelompokIndex,
                                "kelompok_pekerjaan",
                                e.target.value
                              )
                            }
                            className="h-[70px] w-full resize-none bg-transparent outline-none"
                          />
                        </td>
                      )}

                      <td className="w-[45px] border border-black px-2 py-1 text-center font-bold">
                        {unitIndex === 0 ? "No." : `${unitIndex + 1}.`}
                      </td>

                      <td className="w-[170px] border border-black px-2 py-1 font-bold">
                        {unitIndex === 0 ? (
                          "Kode Unit"
                        ) : (
                          <input
                            value={unit.kode_unit}
                            onChange={(e) =>
                              updateUnit(
                                kelompokIndex,
                                unitIndex,
                                "kode_unit",
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent outline-none"
                          />
                        )}
                      </td>

                      <td className="border border-black px-2 py-1 font-bold">
                        {unitIndex === 0 ? (
                          "Judul Unit"
                        ) : (
                          <input
                            value={unit.judul_unit}
                            onChange={(e) =>
                              updateUnit(
                                kelompokIndex,
                                unitIndex,
                                "judul_unit",
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent outline-none"
                          />
                        )}
                      </td>

                      <td className="w-[50px] border border-black px-1 py-1 text-center print:hidden">
                        {unitIndex !== 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeUnit(kelompokIndex, unitIndex)
                            }
                            className="text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {kelompok.units.length === 1 && (
                    <tr>
                      <td className="border border-black px-2 py-1 text-center">
                        1.
                      </td>
                      <td className="border border-black px-2 py-1">
                        <input
                          value=""
                          onChange={() => {}}
                          className="w-full bg-transparent outline-none"
                        />
                      </td>
                      <td className="border border-black px-2 py-1">
                        <input
                          value=""
                          onChange={() => {}}
                          className="w-full bg-transparent outline-none"
                        />
                      </td>
                      <td className="border border-black px-1 py-1 print:hidden"></td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button
                type="button"
                onClick={() => addUnit(kelompokIndex)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 print:hidden"
              >
                <Plus size={14} />
                Tambah Unit
              </button>

              <div className="mt-7 space-y-5">
                <InputTable
                  title="Skenario Tugas Praktik Demonstrasi"
                  value={kelompok.skenario_tugas}
                  onChange={(value) =>
                    updateKelompok(kelompokIndex, "skenario_tugas", value)
                  }
                  placeholder="Tuliskan skenario tugas praktik demonstrasi..."
                />

                <InputTable
                  title="Perlengkapan dan Peralatan"
                  value={kelompok.perlengkapan_peralatan}
                  onChange={(value) =>
                    updateKelompok(
                      kelompokIndex,
                      "perlengkapan_peralatan",
                      value
                    )
                  }
                  placeholder="Tuliskan perlengkapan dan peralatan yang digunakan..."
                />

                <InputTable
                  title="Waktu"
                  value={kelompok.waktu}
                  onChange={(value) =>
                    updateKelompok(kelompokIndex, "waktu", value)
                  }
                  placeholder="Contoh: 120 menit"
                  small
                />
              </div>

              {kelompokIndex < form.kelompok.length - 1 && (
                <div className="my-10 border-t-4 border-black print:break-before-page"></div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addKelompok}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white print:hidden"
          >
            <Plus size={16} />
            Tambah Kelompok Pekerjaan
          </button>
        </section>

        <div className="mt-10 text-center text-[11px] italic">
          Hal. 1 dari 2
        </div>
      </main>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          input[type="date"] {
            display: none;
          }

          textarea,
          input {
            border: none !important;
            outline: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InputTable({ title, value, onChange, placeholder, small = false }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td className="w-[260px] border border-black bg-slate-100 px-3 py-3 align-top font-bold print:bg-white">
            {title} :
          </td>

          <td className="border border-black px-3 py-2">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full resize-none bg-transparent outline-none ${
                small ? "min-h-[45px]" : "min-h-[95px]"
              }`}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
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
  } catch {
    return "Asesor";
  }
}

function getSkema(jadwal) {
  const skema = jadwal?.skema;

  if (skema && typeof skema === "object") {
    return {
      judul_skema:
        skema.judul_skema ||
        skema.nama_skema ||
        jadwal?.nama_skema ||
        "KKNI Level II Pada Kompetensi Keahlian Teknik Komputer dan Jaringan",
      kode_skema:
        skema.kode_skema ||
        skema.nomor_skema ||
        jadwal?.kode_skema ||
        "LEVEL II TKJ",
    };
  }

  return {
    judul_skema:
      jadwal?.judul_skema ||
      jadwal?.nama_skema ||
      skema ||
      "KKNI Level II Pada Kompetensi Keahlian Teknik Komputer dan Jaringan",
    kode_skema: jadwal?.kode_skema || jadwal?.nomor_skema || "LEVEL II TKJ",
  };
}

function getTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    ""
  );
}

function formatTanggal(value) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}