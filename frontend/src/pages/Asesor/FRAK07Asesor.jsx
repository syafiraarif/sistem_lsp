import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 8mm;
}
@media print {
  html,
  body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .frak07-no-print {
    display: none !important;
  }
  .frak07-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .frak07-table,
  .frak07-signature-table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  .frak07-table tr,
  .frak07-table td,
  .frak07-table th,
  .frak07-signature-table tr,
  .frak07-signature-table td,
  .frak07-signature-table th {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  input,
  textarea {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
  .frak07-edit {
    display: none !important;
  }
  .frak07-print {
    display: block !important;
  }
}
.frak07-print {
  display: none;
}
`;

const DEFAULT_ROWS = [
  {
    nomor: "1",
    aspek: "Keterbatasan asesi terhadap persyaratan bahasa, literasi, numerasi.",
    options: [
      "Memerlukan dukungan pembaca, penerjemah, pelayan, penulis, untuk merekam jawaban asesi.",
      "Melakukan asesmen verbal (gunakan pertanyaan lisan/pertanyaan wawancara) dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan hasil produksi.",
      "Menggunakan ceklis observasi/demonstrasi.",
      "Menggunakan daftar instruksi terstruktur.",
      ""
    ]
  },
  {
    nomor: "2",
    aspek: "Penyediaan dukungan pembaca, penerjemah, pelayan, penulis.",
    options: [
      "Menggunakan pertanyaan lisan dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      "Menggunakan pertanyaan wawancara dengan dilengkapi gambar diagram dan bentuk-bentuk visual.",
      ""
    ]
  },
  {
    nomor: "3",
    aspek: "Penggunaan teknologi adaptif atau peralatan khusus. (Tidak dapat menggunakan teknologi adaptif)",
    options: [
      "Ceklis observasi/demonstrasi.",
      "Pertanyaan lisan.",
      "Pertanyaan tertulis.",
      "Pertanyaan wawancara.",
      "Daftar instruksi terstruktur.",
      "Menggunakan ceklis verifikasi portofolio.",
      "Menggunakan dukungan operator komputer.",
      ""
    ]
  },
  {
    nomor: "4",
    aspek: "Pelaksanaan asesmen secara fleksibel karena alasan keletihan atau keperluan pengobatan.",
    options: [
      "Menggunakan juru tulis.",
      "Menggunakan kameramen perekam video/audio.",
      "Memperbolehkan periode waktu yang lebih panjang untuk menyelesaikan tugas pekerjaan dalam asesmen.",
      "Melakukan tugas pekerjaan dalam asesmen dengan waktu lebih pendek.",
      "Menggunakan instruksi-instruksi spesifik pada proyek yang dapat dilakukan pada berbagai tingkatan.",
      ""
    ]
  },
  {
    nomor: "5",
    aspek: "Penyediaan peralatan asesmen berupa braille, audio/video-tape.",
    options: [
      "Menggunakan pertanyaan lisan.",
      "Menggunakan pertanyaan wawancara.",
      ""
    ]
  },
  {
    nomor: "6",
    aspek: "Penyediaan tempat fisik/lingkungan asesmen",
    options: [
      "Pertanyaan lisan.",
      "Pertanyaan tulis.",
      "Pertanyaan wawancara.",
      "Ceklis verifikasi portofolio.",
      "Ceklis reviu produk.",
      "Daftar instruksi terstruktur.",
      ""
    ]
  },
  {
    nomor: "7",
    aspek: "Pertimbangan umur/usia lanjut/gender asesi. (Adanya perbedaan usia dengan asesor yang lebih muda).",
    options: [
      "Menggunakan studi kasus/daftar instruksi terstruktur.",
      "Menggunakan instrumen asesmen dengan huruf normal, jangan terlalu kecil.",
      "Menggunakan asesor dengan jenis kelamin yang sama dengan asesi.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda jenis kelamin (tidak boleh memberi tanda tambahan pada instrumen asesmen yang digunakan dengan tujuan untuk membedakan jenis kelamin).",
      ""
    ]
  },
  {
    nomor: "8",
    aspek: "Pertimbangan budaya/tradisi/agama.",
    options: [
      "Menggunakan studi kasus daftar instruksi terstruktur.",
      "Menggunakan asesor tanpa pertimbangan budaya/tradisi/agama.",
      "Menggunakan instrumen asesmen yang sama walaupun berbeda budaya/tradisi/agama.",
      ""
    ]
  }
];

const POTENSI_OPTIONS = [
  "Hasil pelatihan dan / atau pendidikan, dimana Kurikulum dan fasilitas praktik mampu telusur terhadap standar kompetensi.",
  "Hasil pelatihan dan / atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
  "Pelatihan / belajar mandiri atau otodidak."
];

const EMPTY_FORM = {
  id_fr_ak07: null,
  id_jadwal: null,
  id_asesor: null,
  id_asesi: null,
  exists: false,
  potensi_asesi: [],
  ttd_asesor: "",
  skema: {},
  tuk: {},
  jadwal: {},
  asesi: {},
  asesor: {},
  tanggal: "",
  detailsA: DEFAULT_ROWS.map((row) => ({
    ...row,
    butuh_penyesuaian: "",
    keterangan: []
  })),
  detailsB: [],
  results: [
    {
      bagian: "Acuan Pembanding",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    },
    {
      bagian: "Metode Asesmen",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    },
    {
      bagian: "Instrumen Asesmen",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    }
  ]
};

export default function FRAK07Asesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (id_jadwal && id_peserta) {
      fetchData();
    }
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await api.get("/asesor/fr-ak07", {
        params: {
          id_jadwal: Number(id_jadwal),
          id_asesi: Number(id_peserta),
          _t: Date.now()
        }
      });

      const payload =
        response?.data?.data ||
        response?.data ||
        {};

      setData(normalizeResponse(payload));
    } catch (error) {
      console.error("LOAD FR.AK.07 ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.07 tidak dapat dimuat"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePotensi = (index) => {
    setData((prev) => {
      const current = Array.isArray(prev.potensi_asesi)
        ? prev.potensi_asesi
        : [];

      const exists = current.includes(String(index));

      return {
        ...prev,
        potensi_asesi: exists
          ? current.filter(
              (item) => item !== String(index)
            )
          : [
              ...current,
              String(index)
            ]
      };
    });
  };

  const updateDetailA = (index, field, value) => {
    setData((prev) => ({
      ...prev,
      detailsA: prev.detailsA.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value
              }
            : item
      )
    }));
  };

  const toggleDetailOption = (
    rowIndex,
    option
  ) => {
    setData((prev) => ({
      ...prev,
      detailsA: prev.detailsA.map(
        (item, itemIndex) => {
          if (itemIndex !== rowIndex) {
            return item;
          }

          const current =
            Array.isArray(item.keterangan)
              ? item.keterangan
              : [];

          const exists =
            current.includes(option);

          return {
            ...item,
            keterangan: exists
              ? current.filter(
                  (value) => value !== option
                )
              : [
                  ...current,
                  option
                ]
          };
        }
      )
    }));
  };

  const updateManualOption = (
    rowIndex,
    optionIndex,
    value
  ) => {
    const prefix =
      `__manual_${optionIndex}__`;

    setData((prev) => ({
      ...prev,
      detailsA: prev.detailsA.map(
        (item, itemIndex) => {
          if (itemIndex !== rowIndex) {
            return item;
          }

          const current =
            Array.isArray(item.keterangan)
              ? item.keterangan
              : [];

          const filtered =
            current.filter(
              (entry) =>
                !String(entry).startsWith(prefix)
            );

          const nextValue =
            String(value ?? "");

          return {
            ...item,
            keterangan: nextValue.trim()
              ? [
                  ...filtered,
                  `${prefix}${nextValue}`
                ]
              : filtered
          };
        }
      )
    }));
  };

  const toggleManualOption = (
    rowIndex,
    optionIndex
  ) => {
    const prefix =
      `__manual_${optionIndex}__`;

    setData((prev) => ({
      ...prev,
      detailsA: prev.detailsA.map(
        (item, itemIndex) => {
          if (itemIndex !== rowIndex) {
            return item;
          }

          const current =
            Array.isArray(item.keterangan)
              ? item.keterangan
              : [];

          const existing =
            current.find((entry) =>
              String(entry).startsWith(prefix)
            );

          if (existing) {
            return {
              ...item,
              keterangan: current.filter(
                (entry) =>
                  !String(entry).startsWith(prefix)
              )
            };
          }

          return {
            ...item,
            keterangan: [
              ...current,
              prefix
            ]
          };
        }
      )
    }));
  };

  const updateResult = (
    index,
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,
      results: prev.results.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value
              }
            : item
      )
    }));
  };

  const handleSave = async () => {
    const ttd =
      data.ttd_asesor ||
      data.asesor?.ttd_path ||
      "";

    if (!ttd) {
      Swal.fire({
        icon: "warning",
        title: "Tanda tangan belum tersedia",
        text:
          "Tanda tangan asesor belum tersedia pada profil."
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        id_jadwal: Number(id_jadwal),
        id_asesi: Number(id_peserta),
        potensi_asesi:
          data.potensi_asesi,
        ttd_asesor: ttd,
        detailsA:
          data.detailsA.map((item) => ({
            nomor: item.nomor,
            aspek: item.aspek,
            butuh_penyesuaian:
              item.butuh_penyesuaian ||
              null,
            keterangan:
              Array.isArray(item.keterangan)
                ? item.keterangan
                : []
          })),
        detailsB: [],
        results:
          data.results.map((item) => ({
            bagian: item.bagian,
            acuan_pembanding:
              item.acuan_pembanding ||
              null,
            metode_asesmen:
              item.metode_asesmen ||
              null,
            instrumen_asesmen:
              item.instrumen_asesmen ||
              null
          }))
      };

      let response;

      if (
        data.exists &&
        data.id_fr_ak07
      ) {
        response = await api.put(
          `/asesor/fr-ak07/${data.id_fr_ak07}`,
          payload
        );
      } else {
        response = await api.post(
          "/asesor/fr-ak07",
          payload
        );
      }

      const saved =
        response?.data?.data ||
        {};

      setData((prev) => ({
        ...prev,
        id_fr_ak07:
          saved?.id_fr_ak07 ||
          prev.id_fr_ak07,
        exists: true
      }));

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          "FR.AK.07 berhasil disimpan.",
        timer: 1200,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error(
        "SAVE FR.AK.07 ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.07 gagal disimpan."
      });
    } finally {
      setSaving(false);
    }
  };

  const printPage = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Memuat FR.AK.07...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="frak07-no-print mx-auto mb-5 flex w-[1000px] max-w-[calc(100%-32px)] items-center justify-between">
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Menyimpan..."
                : data.exists
                ? "Update FR.AK.07"
                : "Simpan FR.AK.07"}
            </button>

            <button
              type="button"
              onClick={printPage}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900"
            >
              <Printer size={18} />
              Cetak / PDF
            </button>
          </div>
        </div>

        <main className="frak07-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-8 py-5 text-[9.5px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-3 text-center text-[15px] font-black uppercase">
            FR.AK.07. CEKLIS PENYESUAIAN YANG WAJAR DAN BERALASAN
          </h1>

          <table className="frak07-table w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td
                  rowSpan="2"
                  className="w-[190px] border border-black px-2 py-2 align-middle"
                >
                  Skema Sertifikasi
                  <br />
                  (KKNI/Okupasi/Klaster)
                </td>

                <td className="w-[70px] border border-black px-2 py-2 font-bold">
                  Judul
                </td>

                <td className="w-[18px] border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.judul_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Nomor
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.kode_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  TUK
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  <TukOption
                    checked={
                      getTukType(data) ===
                      "sewaktu"
                    }
                    label="Sewaktu"
                  />

                  <span className="ml-8">
                    <TukOption
                      checked={
                        getTukType(data) ===
                        "tempat_kerja"
                      }
                      label="Tempat Kerja"
                    />
                  </span>

                  <span className="ml-8">
                    <TukOption
                      checked={
                        getTukType(data) ===
                        "mandiri"
                      }
                      label="Mandiri"
                    />
                  </span>
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Nama Asesor
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  {getNama(data.asesor)}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Nama Asesi
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  {getNama(data.asesi)}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Tanggal
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>

                <td className="border border-black px-2 py-2">
                  {formatTanggal(
                    data.tanggal ||
                    data.jadwal?.tgl_awal
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-1 text-[8px]">
            *Coret yang tidak perlu
          </div>

          <table className="frak07-table mt-4 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  PANDUAN BAGI ASESOR
                </td>
              </tr>

              <tr>
                <td className="border border-black px-3 py-2 leading-relaxed">
                  <div className="flex gap-2">
                    <span>•</span>
                    <span>
                      Formulir ini dapat digunakan (sebelum pra asesmen, saat pelaksanaan pra asesmen, setelah pra asesmen)* jika ada asesi yang mempunyai keterbatasan sesuai karakteristik yang dimilikinya sehingga diperlukan penyesuaian yang wajar dan beralasan, jika rencana asesmen dan perangkat asesmen tidak sesuai dengan acuan pembanding, potensi asesi dan konteks asesmen.
                    </span>
                  </div>

                  <div className="mt-1 flex gap-2">
                    <span>•</span>
                    <span>
                      Coretlah pada tanda (*) yang tidak sesuai.
                    </span>
                  </div>

                  <div className="mt-1 flex gap-2">
                    <span>•</span>
                    <span>
                      Berilah tanda ✓ pada kotak □ pada kolom potensi asesi.
                    </span>
                  </div>

                  <div className="mt-1 flex gap-2">
                    <span>•</span>
                    <span>
                      Berilah tanda ✓ Ya atau Tidak pada * sesuai pilihan, jika jawaban Ya selanjutnya pada kolom keterangan berilah tanda ✓ di kotak □ yang tersedia, pilihlah lebih dari satu.
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="frak07-table mt-3 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="w-[250px] border border-black px-2 py-2 text-center font-bold">
                  Potensi Asesi
                </td>

                <td className="border border-black p-0">
                  {POTENSI_OPTIONS.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex min-h-[28px] items-center border-b border-black last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            togglePotensi(
                              index
                            )
                          }
                          className={`frak07-no-print ml-2 mr-2 flex h-4 w-4 shrink-0 items-center justify-center border border-black text-[10px] font-bold leading-none ${
                            data.potensi_asesi.includes(
                              String(index)
                            )
                              ? "bg-black text-white"
                              : "bg-white"
                          }`}
                        >
                          {data.potensi_asesi.includes(
                            String(index)
                          )
                            ? "✓"
                            : ""}
                        </button>

                        <span className="frak07-print mr-2">
                          {data.potensi_asesi.includes(
                            String(index)
                          )
                            ? "☑"
                            : "☐"}
                        </span>

                        <span className="pr-2">
                          {option}
                        </span>
                      </div>
                    )
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="frak07-table mt-3 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="w-[45px] border border-black px-1 py-2 text-center">
                  No
                </th>

                <th className="w-[290px] border border-black px-2 py-2 text-center">
                  Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi
                  <br />
                  (karakteristik asesi)
                </th>

                <th
                  colSpan="2"
                  className="w-[85px] border border-black px-1 py-2 text-center"
                >
                  Diperlukan penyesuaian
                  <br />
                  Ya / Tidak
                </th>

                <th className="border border-black px-2 py-2 text-center">
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody>
              {data.detailsA.map(
                (item, rowIndex) => (
                  <tr key={item.nomor}>
                    <td className="border border-black px-1 py-2 text-center align-top">
                      {item.nomor}
                    </td>

                    <td className="border border-black px-2 py-2 align-top">
                      {item.aspek}
                    </td>

                    <td className="w-[42px] border border-black px-1 py-2 text-center align-top">
                      <button
                        type="button"
                        onClick={() =>
                          updateDetailA(
                            rowIndex,
                            "butuh_penyesuaian",
                            item.butuh_penyesuaian ===
                              "ya"
                              ? ""
                              : "ya"
                          )
                        }
                        className={`frak07-no-print mx-auto flex h-4 w-4 items-center justify-center border border-black text-[10px] font-bold ${
                          item.butuh_penyesuaian ===
                          "ya"
                            ? "bg-black text-white"
                            : "bg-white"
                        }`}
                      >
                        {item.butuh_penyesuaian ===
                        "ya"
                          ? "✓"
                          : ""}
                      </button>

                      <span className="frak07-print">
                        {item.butuh_penyesuaian ===
                        "ya"
                          ? "☑"
                          : "☐"}
                      </span>
                    </td>

                    <td className="w-[42px] border border-black px-1 py-2 text-center align-top">
                      <button
                        type="button"
                        onClick={() =>
                          updateDetailA(
                            rowIndex,
                            "butuh_penyesuaian",
                            item.butuh_penyesuaian ===
                              "tidak"
                              ? ""
                              : "tidak"
                          )
                        }
                        className={`frak07-no-print mx-auto flex h-4 w-4 items-center justify-center border border-black text-[10px] font-bold ${
                          item.butuh_penyesuaian ===
                          "tidak"
                            ? "bg-black text-white"
                            : "bg-white"
                        }`}
                      >
                        {item.butuh_penyesuaian ===
                        "tidak"
                          ? "✓"
                          : ""}
                      </button>

                      <span className="frak07-print">
                        {item.butuh_penyesuaian ===
                        "tidak"
                          ? "☑"
                          : "☐"}
                      </span>
                    </td>

                    <td className="border border-black p-0 align-top">
                      {item.options.map(
                        (
                          option,
                          optionIndex
                        ) => {
                          const isManual =
                            option === "";

                          const manualPrefix =
                            `__manual_${optionIndex}__`;

                          const manualEntry =
                            Array.isArray(
                              item.keterangan
                            )
                              ? item.keterangan.find(
                                  (entry) =>
                                    String(
                                      entry
                                    ).startsWith(
                                      manualPrefix
                                    )
                                )
                              : null;

                          const manualValue =
                            manualEntry
                              ? String(
                                  manualEntry
                                ).replace(
                                  manualPrefix,
                                  ""
                                )
                              : "";

                          const checked =
                            isManual
                              ? manualEntry !==
                                undefined
                              : Array.isArray(
                                  item.keterangan
                                ) &&
                                item.keterangan.includes(
                                  option
                                );

                          return (
                            <div
                              key={
                                optionIndex
                              }
                              className="flex min-h-[24px] items-start border-b border-black last:border-b-0"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  isManual
                                    ? toggleManualOption(
                                        rowIndex,
                                        optionIndex
                                      )
                                    : toggleDetailOption(
                                        rowIndex,
                                        option
                                      )
                                }
                                className={`frak07-no-print ml-2 mt-1 mr-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-black text-[9px] font-bold leading-none ${
                                  checked
                                    ? "bg-black text-white"
                                    : "bg-white"
                                }`}
                              >
                                {checked
                                  ? "✓"
                                  : ""}
                              </button>

                              <span className="frak07-print mr-2 mt-1">
                                {checked
                                  ? "☑"
                                  : "☐"}
                              </span>

                              {isManual ? (
                                <>
                                  <input
                                    type="text"
                                    value={
                                      manualValue
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateManualOption(
                                        rowIndex,
                                        optionIndex,
                                        e.target
                                          .value
                                      )
                                    }
                                    className="frak07-no-print mt-0.5 w-full border-0 border-b border-black bg-transparent px-1 py-0.5 outline-none"
                                    placeholder="Tulis keterangan lain..."
                                  />

                                  <span className="frak07-print pr-2">
                                    {manualValue ||
                                      "............................................................"}
                                  </span>
                                </>
                              ) : (
                                <span className="pr-2">
                                  {option}
                                </span>
                              )}
                            </div>
                          );
                        }
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <table className="frak07-table mt-3 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Hasil Penyesuaian yang wajar dan beralasan disepakati menggunakan:
                </td>
              </tr>

              <tr>
                <td className="border border-black p-0">
                  <div className="border-b border-black px-2 py-2">
                    <span className="mr-3">
                      1)
                    </span>

                    <span className="mr-2">
                      Acuan Pembanding:
                    </span>

                    <input
                      type="text"
                      value={
                        data.results[0]
                          ?.acuan_pembanding ||
                        ""
                      }
                      onChange={(e) =>
                        updateResult(
                          0,
                          "acuan_pembanding",
                          e.target.value
                        )
                      }
                      className="frak07-edit w-[70%] border-0 border-b border-black bg-transparent px-1 py-0.5 outline-none"
                      placeholder="tuliskan nama acuan pembanding"
                    />

                    <span className="frak07-print">
                      {data.results[0]
                        ?.acuan_pembanding ||
                        "-"}
                    </span>
                  </div>

                  <div className="border-b border-black px-2 py-2">
                    <span className="mr-3">
                      2)
                    </span>

                    <span className="mr-2">
                      Metode Asesmen:
                    </span>

                    <input
                      type="text"
                      value={
                        data.results[1]
                          ?.metode_asesmen ||
                        ""
                      }
                      onChange={(e) =>
                        updateResult(
                          1,
                          "metode_asesmen",
                          e.target.value
                        )
                      }
                      className="frak07-edit w-[70%] border-0 border-b border-black bg-transparent px-1 py-0.5 outline-none"
                      placeholder="tuliskan macam metode asesmen"
                    />

                    <span className="frak07-print">
                      {data.results[1]
                        ?.metode_asesmen ||
                        "-"}
                    </span>
                  </div>

                  <div className="px-2 py-2">
                    <span className="mr-3">
                      3)
                    </span>

                    <span className="mr-2">
                      Instrumen Asesmen:
                    </span>

                    <input
                      type="text"
                      value={
                        data.results[2]
                          ?.instrumen_asesmen ||
                        ""
                      }
                      onChange={(e) =>
                        updateResult(
                          2,
                          "instrumen_asesmen",
                          e.target.value
                        )
                      }
                      className="frak07-edit w-[70%] border-0 border-b border-black bg-transparent px-1 py-0.5 outline-none"
                      placeholder="tuliskan nama formulir instrumen asesmen"
                    />

                    <span className="frak07-print">
                      {data.results[2]
                        ?.instrumen_asesmen ||
                        "-"}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="frak07-signature-table mt-3 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="w-1/2 border border-black px-2 py-2 text-left font-normal">
                  Nama Asesi:
                </th>

                <th className="w-1/2 border border-black px-2 py-2 text-center font-normal">
                  Tanggal dan tandatangan asesi
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="h-[90px] border border-black px-2 py-2 align-top">
                  {getNama(data.asesi)}
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <div className="flex h-full flex-col items-center justify-center gap-1">
                    <Signature
                      path={
                        data.asesi?.ttd_path
                      }
                      label="Tanda tangan asesi"
                    />

                    <span>
                      {formatTanggal(
                        data.asesi?.tanggal ||
                        data.tanggal ||
                        data.jadwal?.tgl_awal
                      )}
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-normal">
                  Nama Asesor:
                  <span className="ml-2">
                    {getNama(data.asesor)}
                  </span>
                </td>

                <td className="border border-black px-2 py-2 text-center font-normal">
                  Tanggal dan tandatangan asesor
                </td>
              </tr>

              <tr>
                <td className="h-[90px] border border-black px-2 py-2 align-top">
                  {getNama(data.asesor)}
                </td>

                <td className="border border-black px-2 py-2 align-top">
                  <div className="flex h-full flex-col items-center justify-center gap-1">
                    <Signature
                      path={
                        data.asesor?.ttd_path ||
                        data.ttd_asesor
                      }
                      label="Tanda tangan asesor"
                    />

                    <span>
                      {formatTanggal(
                        data.tanggal ||
                        data.jadwal?.tgl_awal
                      )}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </>
  );
}

function TukOption({
  checked,
  label
}) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="text-[12px] leading-none">
        {checked ? "☒" : "☐"}
      </span>

      <span>{label}</span>
    </span>
  );
}

function Signature({
  path,
  label
}) {
  const src =
    normalizeFileUrl(path);

  if (!src) {
    return (
      <div className="flex h-[55px] w-[150px] items-center justify-center text-[9px] text-slate-400">
        -
      </div>
    );
  }

  return (
    <div className="flex h-[55px] w-[150px] items-center justify-center">
      <img
        src={src}
        alt={label}
        className="max-h-[52px] max-w-[145px] object-contain"
      />
    </div>
  );
}

function normalizeResponse(payload) {
  const source =
    payload?.data ||
    payload ||
    {};

  const jadwal =
    source?.jadwal ||
    {};

  const skema =
    source?.skema ||
    jadwal?.skema ||
    {};

  const tuk =
    source?.tuk ||
    jadwal?.tuk ||
    {};

  const asesor =
    source?.asesor ||
    {};

  const asesi =
    source?.asesi ||
    {};

  const savedDetailsA =
    Array.isArray(
      source?.detailsA
    )
      ? source.detailsA
      : [];

  const detailsA =
    DEFAULT_ROWS.map(
      (row) => {
        const saved =
          savedDetailsA.find(
            (item) =>
              String(item.nomor) ===
              String(row.nomor)
          );

        if (!saved) {
          return {
            ...row,
            butuh_penyesuaian: "",
            keterangan: []
          };
        }

        let keterangan = [];

        if (
          Array.isArray(
            saved.keterangan
          )
        ) {
          keterangan =
            saved.keterangan;
        } else if (
          typeof saved.keterangan ===
          "string"
        ) {
          try {
            const parsed =
              JSON.parse(
                saved.keterangan
              );

            keterangan =
              Array.isArray(parsed)
                ? parsed
                : saved.keterangan
                    .split(",")
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(Boolean);
          } catch (error) {
            keterangan =
              saved.keterangan
                .split(",")
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(Boolean);
          }
        }

        return {
          ...row,
          ...saved,
          keterangan
        };
      }
    );

  const results = [
    {
      bagian:
        "Acuan Pembanding",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    },
    {
      bagian:
        "Metode Asesmen",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    },
    {
      bagian:
        "Instrumen Asesmen",
      acuan_pembanding: "",
      metode_asesmen: "",
      instrumen_asesmen: ""
    }
  ];

  if (
    Array.isArray(
      source?.results
    )
  ) {
    source.results.forEach(
      (item) => {
        const index =
          item.bagian ===
          "Acuan Pembanding"
            ? 0
            : item.bagian ===
              "Metode Asesmen"
            ? 1
            : item.bagian ===
              "Instrumen Asesmen"
            ? 2
            : -1;

        if (index >= 0) {
          results[index] = {
            ...results[index],
            ...item
          };
        }
      }
    );
  }

  let potensi = [];

  if (
    Array.isArray(
      source?.potensi_asesi
    )
  ) {
    potensi =
      source.potensi_asesi.map(
        String
      );
  } else if (
    typeof source?.potensi_asesi ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(
          source.potensi_asesi
        );

      potensi =
        Array.isArray(parsed)
          ? parsed.map(String)
          : [];
    } catch (error) {
      potensi =
        source.potensi_asesi
          .split(",")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);
    }
  }

  return {
    ...EMPTY_FORM,
    ...source,

    id_fr_ak07:
      source?.id_fr_ak07 ||
      source?.id ||
      null,

    id_jadwal:
      source?.id_jadwal ||
      Number(
        idSafe(
          source?.jadwal
            ?.id_jadwal
        )
      ),

    id_asesor:
      source?.id_asesor ||
      asesor?.id_user ||
      null,

    id_asesi:
      source?.id_asesi ||
      asesi?.id_peserta ||
      null,

    exists: Boolean(
      source?.exists ||
      source?.id_fr_ak07 ||
      source?.id
    ),

    skema,
    tuk,
    jadwal,
    asesor,
    asesi,

    tanggal:
      source?.tanggal ||
      jadwal?.tgl_awal ||
      source?.createdAt ||
      source?.created_at ||
      "",

    ttd_asesor:
      source?.ttd_asesor ||
      asesor?.ttd_path ||
      "",

    potensi_asesi:
      potensi,

    detailsA,

    detailsB:
      Array.isArray(
        source?.detailsB
      )
        ? source.detailsB
        : [],

    results
  };
}

function idSafe(value) {
  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : null;
}

function getTukType(data) {
  const value =
    data?.tuk?.jenis_tuk ||
    data?.jadwal?.tuk
      ?.jenis_tuk ||
    "";

  const normalized =
    String(value)
      .toLowerCase()
      .trim()
      .replace(
        /\s+/g,
        "_"
      );

  if (
    normalized.includes(
      "sewaktu"
    )
  ) {
    return "sewaktu";
  }

  if (
    normalized.includes(
      "tempat"
    )
  ) {
    return "tempat_kerja";
  }

  if (
    normalized.includes(
      "mandiri"
    )
  ) {
    return "mandiri";
  }

  return "";
}

function getNama(obj) {
  return (
    obj?.nama_lengkap ||
    obj?.nama ||
    obj?.username ||
    "-"
  );
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );
}

function normalizeFileUrl(value) {
  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  if (
    stringValue.startsWith(
      "http://"
    ) ||
    stringValue.startsWith(
      "https://"
    ) ||
    stringValue.startsWith(
      "data:image"
    )
  ) {
    return stringValue;
  }

  const base =
    import.meta.env
      .VITE_API_BASE ||
    "http://localhost:3000/api";

  const root =
    base.replace(
      /\/api\/?$/,
      ""
    );

  return `${root}/${stringValue.replace(
    /^\/+/,
    ""
  )}`;
}