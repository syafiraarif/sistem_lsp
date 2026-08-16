import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";

const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 10mm;
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
  .frak05-no-print {
    display: none !important;
  }
  .frak05-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .frak05-table,
  .frak05-signature-table {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak05-table tr,
  .frak05-signature-table tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak05-print-value {
    display: block !important;
  }
  .frak05-edit-input {
    display: none !important;
  }
  textarea {
    border: 0 !important;
    background: transparent !important;
    resize: none !important;
  }
}
.frak05-print-value {
  display: none;
}
`;

const EMPTY_FORM = {
  id_fr_ak05: null,
  id_jadwal: null,
  id_peserta: null,
  id_asesor: null,
  exists: false,
  skema: {},
  tuk: {},
  jadwal: {},
  asesi: {},
  asesor: {},
  tanggal: "",
  rekomendasi: "",
  keterangan: "",
  aspek_positif_negatif: "",
  penolakan_hasil: "",
  saran_perbaikan: "",
  catatan: "",
  ttd_asesor: ""
};

export default function FRAK05Asesor() {
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

      const response = await api.get(
        "/asesor/fr-ak05",
        {
          params: {
            id_jadwal,
            id_peserta,
            _t: Date.now()
          }
        }
      );

      const payload =
        response?.data?.data ||
        response?.data ||
        {};

      setData(
        normalizeResponse(payload)
      );
    } catch (error) {
      console.error(
        "LOAD FR.AK.05 ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.05 tidak dapat dimuat."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateRecommendation = (
    value
  ) => {
    setData((prev) => ({
      ...prev,
      rekomendasi: value
    }));
  };

  const handleSave = async () => {
    if (!data.rekomendasi) {
      Swal.fire({
        icon: "warning",
        title: "Rekomendasi belum dipilih",
        text:
          "Silakan pilih Kompeten atau Belum Kompeten."
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id_jadwal: Number(id_jadwal),
        id_peserta: Number(id_peserta),
        rekomendasi:
          data.rekomendasi,
        keterangan:
          data.keterangan?.trim() ||
          null,
        aspek_positif_negatif:
          data.aspek_positif_negatif?.trim() ||
          null,
        penolakan_hasil:
          data.penolakan_hasil?.trim() ||
          null,
        saran_perbaikan:
          data.saran_perbaikan?.trim() ||
          null,
        catatan:
          data.catatan?.trim() ||
          null,
        ttd_asesor:
          data.ttd_asesor ||
          data.asesor?.ttd_path ||
          ""
      };

      let response;

      if (
        data.exists &&
        data.id_fr_ak05
      ) {
        response = await api.put(
          `/asesor/fr-ak05/${data.id_fr_ak05}`,
          payload
        );
      } else {
        response = await api.post(
          "/asesor/fr-ak05",
          payload
        );
      }

      const saved =
        response?.data?.data ||
        {};

      setData((prev) => ({
        ...prev,
        id_fr_ak05:
          saved?.id_fr_ak05 ||
          prev.id_fr_ak05,
        id_jadwal:
          saved?.id_jadwal ||
          prev.id_jadwal,
        id_peserta:
          saved?.id_peserta ||
          prev.id_peserta,
        id_asesor:
          saved?.id_asesor ||
          prev.id_asesor,
        exists: true
      }));

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          "FR.AK.05 berhasil disimpan.",
        timer: 1200,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error(
        "SAVE FR.AK.05 ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.05 gagal disimpan."
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
          Memuat FR.AK.05...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="frak05-no-print mx-auto mb-5 flex w-[1000px] max-w-[calc(100%-32px)] items-center justify-between">
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
                ? "Update FR.AK.05"
                : "Simpan FR.AK.05"}
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

        <main className="frak05-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-8 py-5 text-[10px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-3 text-center text-[16px] font-black uppercase">
            FR.AK.05. LAPORAN ASESMEN
          </h1>

          <table className="frak05-table w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td
                  rowSpan="2"
                  className="w-[190px] border border-black px-2 py-2 align-middle font-bold"
                >
                  Skema Sertifikasi
                  <br />
                  (KKNI/Okupasi/Klaster)
                </td>

                <td className="w-[80px] border border-black px-2 py-2 text-center font-bold">
                  Judul
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.judul_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 text-center font-bold">
                  Nomor
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.kode_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  TUK
                </td>

                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <div className="flex items-center gap-7">
                    <TukOption
                      checked={
                        getTukType(data) ===
                        "sewaktu"
                      }
                      label="Sewaktu"
                    />

                    <TukOption
                      checked={
                        getTukType(data) ===
                        "tempat_kerja"
                      }
                      label="Tempat Kerja"
                    />

                    <TukOption
                      checked={
                        getTukType(data) ===
                        "mandiri"
                      }
                      label="Mandiri"
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Nama Asesor
                </td>

                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  {getNama(
                    data.asesor
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  No. Reg. Asesor
                </td>

                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  {data.asesor
                    ?.no_reg_asesor ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Tanggal
                </td>

                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  {formatTanggal(
                    data.tanggal
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="frak05-table mt-4 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="w-[45px] border border-black px-2 py-2 text-center">
                  No.
                </th>

                <th className="w-[290px] border border-black px-2 py-2 text-center">
                  Nama Asesi
                </th>

                <th className="w-[65px] border border-black px-2 py-2 text-center">
                  K
                </th>

                <th className="w-[65px] border border-black px-2 py-2 text-center">
                  BK
                </th>

                <th className="border border-black px-2 py-2 text-center">
                  Keterangan**
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border border-black px-2 py-5 text-center">
                  1.
                </td>

                <td className="border border-black px-2 py-5">
                  {getNama(
                    data.asesi
                  )}
                </td>

                <td className="border border-black px-2 py-5 text-center">
                <RecommendationBox
                    checked={data.rekomendasi === "kompeten"}
                    label="Kompeten"
                    onChange={() =>
                    updateRecommendation("kompeten")
                    }
                />
                </td>

                <td className="border border-black px-2 py-5 text-center">
                <RecommendationBox
                    checked={data.rekomendasi === "belum_kompeten"}
                    label="Belum Kompeten"
                    onChange={() =>
                    updateRecommendation("belum_kompeten")
                    }
                />
                </td>

                <td className="border border-black p-0 align-top">
                  <textarea
                    value={
                      data.keterangan ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "keterangan",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="frak05-no-print w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />

                  <div className="frak05-print-value min-h-[65px] whitespace-pre-wrap p-2">
                    {data.keterangan ||
                      "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 text-[9px]">
            ** tuliskan Kode dan Judul Unit Kompetensi yang dinyatakan BK bila mengases satu skema
          </div>

          <table className="frak05-table mt-4 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="w-[300px] border border-black px-2 py-4 align-middle">
                  Aspek Negatif dan Positif dalam Asesmen
                </td>

                <td className="border border-black p-0">
                  <textarea
                    value={
                      data.aspek_positif_negatif ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "aspek_positif_negatif",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="frak05-no-print w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />

                  <div className="frak05-print-value min-h-[85px] whitespace-pre-wrap p-2">
                    {data.aspek_positif_negatif ||
                      "-"}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-4 align-middle">
                  Pencatatan Penolakan Hasil Asesmen
                </td>

                <td className="border border-black p-0">
                  <textarea
                    value={
                      data.penolakan_hasil ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "penolakan_hasil",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="frak05-no-print w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />

                  <div className="frak05-print-value min-h-[85px] whitespace-pre-wrap p-2">
                    {data.penolakan_hasil ||
                      "-"}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-4 align-middle">
                  Saran Perbaikan : (Asesor/Personil Terkait)
                </td>

                <td className="border border-black p-0">
                  <textarea
                    value={
                      data.saran_perbaikan ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "saran_perbaikan",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="frak05-no-print w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />

                  <div className="frak05-print-value min-h-[85px] whitespace-pre-wrap p-2">
                    {data.saran_perbaikan ||
                      "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="frak05-signature-table mt-4 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td
                  rowSpan="4"
                  className="w-[52%] border border-black p-0 align-top"
                >
                  <div className="border-b border-black px-2 py-2 font-bold">
                    Catatan :
                  </div>

                  <textarea
                    value={
                      data.catatan ||
                      ""
                    }
                    onChange={(e) =>
                      updateField(
                        "catatan",
                        e.target.value
                      )
                    }
                    rows={12}
                    className="frak05-no-print h-[265px] w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />

                  <div className="frak05-print-value min-h-[265px] whitespace-pre-wrap p-2">
                    {data.catatan ||
                      "-"}
                  </div>
                </td>

                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Asesor :
                </td>
              </tr>

              <tr>
                <td className="w-[110px] border border-black px-2 py-2">
                  Nama
                </td>

                <td className="border border-black px-2 py-2">
                  {getNama(
                    data.asesor
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2">
                  No. Reg
                </td>

                <td className="border border-black px-2 py-2">
                  {data.asesor
                    ?.no_reg_asesor ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 align-middle">
                  Tanda tangan/
                  <br />
                  Tanggal
                </td>

                <td className="border border-black px-2 py-2">
                  <div className="flex min-h-[125px] flex-col items-center justify-between">
                    <Signature
                      path={
                        data.asesor?.ttd_path ||
                        data.ttd_asesor
                      }
                      label="Tanda tangan Asesor"
                    />

                    <span>
                      {formatTanggal(
                        data.tanggal
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

function RecommendationBox({ checked, label, onChange }) {
  return (
    <>
      <button
        type="button"
        onClick={onChange}
        className="frak05-no-print mx-auto flex cursor-pointer items-center justify-center gap-2"
      >
        <span className="flex h-5 w-5 items-center justify-center border border-black text-[12px] leading-none">
          {checked ? "✓" : ""}
        </span>
        <span className="text-[10px] font-medium">
          {label}
        </span>
      </button>

      <span className="hidden print:inline">
        {checked ? "☑" : "☐"}
      </span>
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
      <div className="flex h-[70px] w-[160px] items-center justify-center text-[9px] text-slate-400">
        -
      </div>
    );
  }

  return (
    <div className="flex h-[70px] w-[160px] items-center justify-center">
      <img
        src={src}
        alt={label}
        className="max-h-[65px] max-w-[150px] object-contain"
      />
    </div>
  );
}

function normalizeResponse(payload) {
  const source =
    payload?.data ||
    payload ||
    {};

  const profileAsesi =
    source?.asesi ||
    source?.profileAsesi ||
    source?.peserta?.profileAsesi ||
    {};

  const profileAsesor =
    source?.asesor ||
    {};

  return {
    ...EMPTY_FORM,
    ...source,
    id_fr_ak05:
      source?.id_fr_ak05 ||
      null,
    id_jadwal:
      source?.id_jadwal ||
      null,
    id_peserta:
      source?.id_peserta ||
      null,
    id_asesor:
      source?.id_asesor ||
      null,
    exists:
      Boolean(
        source?.exists ||
        source?.id_fr_ak05
      ),
    skema:
      source?.skema ||
      source?.jadwal?.skema ||
      {},
    tuk:
      source?.tuk ||
      source?.jadwal?.tuk ||
      {},
    jadwal:
      source?.jadwal ||
      {},
    asesi: {
      ...profileAsesi,
      nama_lengkap:
        profileAsesi?.nama_lengkap ||
        source?.peserta?.user?.nama_lengkap ||
        source?.peserta?.user?.nama ||
        source?.peserta?.user?.username ||
        "-",
      ttd_path:
        profileAsesi?.ttd_path ||
        ""
    },
    asesor: {
      ...profileAsesor,
      nama_lengkap:
        profileAsesor?.nama_lengkap ||
        "",
      no_reg_asesor:
        profileAsesor?.no_reg_asesor ||
        "",
      ttd_path:
        profileAsesor?.ttd_path ||
        ""
    },
    tanggal:
      source?.tanggal ||
      source?.created_at ||
      source?.jadwal?.tgl_awal ||
      "",
    rekomendasi:
      source?.rekomendasi ||
      "",
    keterangan:
      source?.keterangan ||
      "",
    aspek_positif_negatif:
      source?.aspek_positif_negatif ||
      "",
    penolakan_hasil:
      source?.penolakan_hasil ||
      "",
    saran_perbaikan:
      source?.saran_perbaikan ||
      "",
    catatan:
      source?.catatan ||
      "",
    ttd_asesor:
      source?.ttd_asesor ||
      profileAsesor?.ttd_path ||
      ""
  };
}

function getTukType(data) {
  const value =
    data?.tuk?.jenis_tuk ||
    data?.tuk?.jenis ||
    "";

  const normalized =
    String(value)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");

  if (
    normalized.includes("sewaktu")
  ) {
    return "sewaktu";
  }

  if (
    normalized.includes("tempat")
  ) {
    return "tempat_kerja";
  }

  if (
    normalized.includes("mandiri")
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
    return value;
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
    stringValue.startsWith("http://") ||
    stringValue.startsWith("https://") ||
    stringValue.startsWith("data:image")
  ) {
    return stringValue;
  }

  const base =
    import.meta.env.VITE_API_BASE ||
    "http://localhost:3000/api";

  const root =
    base.replace(
      /\/api\/?$/,
      ""
    );

  return `${root}/${stringValue.replace(/^\/+/, "")}`;
}