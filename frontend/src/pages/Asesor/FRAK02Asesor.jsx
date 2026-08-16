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
  html, body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .frak02-no-print {
    display: none !important;
  }
  .frak02-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .frak02-header-table,
  .frak02-unit-table,
  .frak02-result-table,
  .frak02-signature-table,
  .frak02-attachment-table {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak02-unit-table tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak02-unit-table thead {
    display: table-header-group !important;
  }
  .frak02-print-value {
    display: block !important;
  }
  .frak02-edit-input {
    display: none !important;
  }
  input, textarea {
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
}
.frak02-print-value {
  display: none;
}
`;

const EMPTY_FORM = {
  id_fr_ak02: null,
  exists: false,
  skema: {},
  tuk: {},
  jadwal: {},
  asesi: {},
  asesor: {},
  tanggal_mulai: "",
  tanggal_selesai: "",
  rekomendasi: "",
  tindak_lanjut: "",
  komentar_asesor: "",
  ttd_asesor: "",
  detail: []
};

export default function FRAK02Asesor() {
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
      const response = await api.get("/asesor/fr-ak02", {
        params: {
          id_jadwal,
          id_peserta,
          _t: Date.now()
        }
      });
      const payload =
        response?.data?.data ||
        response?.data ||
        {};
      setData(
        normalizeResponse(payload)
      );
    } catch (error) {
      console.error(
        "LOAD FR.AK.02 ERROR:",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.02 tidak dapat dimuat"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHeader = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateDetail = (
    id_unit,
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,
      detail: prev.detail.map(
        (item) =>
          Number(item.id_unit) ===
          Number(id_unit)
            ? {
                ...item,
                [field]: value
              }
            : item
      )
    }));
  };

  const updateRecommendation = (value) => {
    setData((prev) => ({
        ...prev,
        rekomendasi:
        prev.rekomendasi === value
            ? ""
            : value
    }));
    };

  const handleSave = async () => {
    if (!data.detail.length) {
      Swal.fire({
        icon: "warning",
        title: "Unit belum tersedia",
        text:
          "Unit kompetensi untuk FR.AK.02 belum tersedia."
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id_jadwal:
          Number(id_jadwal),
        id_peserta:
          Number(id_peserta),
        tanggal_mulai:
          data.tanggal_mulai || null,
        tanggal_selesai:
          data.tanggal_selesai || null,
        rekomendasi:
          data.rekomendasi || null,
        tindak_lanjut:
          data.tindak_lanjut || null,
        komentar_asesor:
          data.komentar_asesor || null,
        ttd_asesor:
          data.ttd_asesor ||
          data.asesor?.ttd_path ||
          "",
        detail:
          data.detail.map((item) => ({
            id_unit:
              Number(item.id_unit),
            observasi:
              Boolean(item.observasi),
            portofolio:
              Boolean(item.portofolio),
            pihak_ketiga:
              Boolean(item.pihak_ketiga),
            wawancara:
              Boolean(item.wawancara),
            lisan:
              Boolean(item.lisan),
            tertulis:
              Boolean(item.tertulis),
            proyek:
              Boolean(item.proyek),
            lainnya:
              Boolean(item.lainnya)
          }))
      };

      let response;

      if (
        data.exists &&
        data.id_fr_ak02
      ) {
        response = await api.put(
          `/asesor/fr-ak02/${data.id_fr_ak02}`,
          payload
        );
      } else {
        response = await api.post(
          "/asesor/fr-ak02",
          payload
        );
      }

      const saved =
        response?.data?.data ||
        {};

      setData((prev) => ({
        ...prev,
        id_fr_ak02:
          saved?.id_fr_ak02 ||
          prev.id_fr_ak02,
        exists: true
      }));

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          "FR.AK.02 berhasil disimpan.",
        timer: 1200,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error(
        "SAVE FR.AK.02 ERROR:",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.02 gagal disimpan."
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
          Memuat FR.AK.02...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="frak02-no-print mx-auto mb-5 flex w-[1000px] max-w-[calc(100%-32px)] items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
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
                ? "Update FR.AK.02"
                : "Simpan FR.AK.02"}
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

        <main className="frak02-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-6 py-5 text-[10px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-3 text-center text-[14px] font-black uppercase">
            FR.AK.02. REKAMAN ASESMEN KOMPETENSI
          </h1>

          <table className="frak02-header-table w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td
                  rowSpan="2"
                  className="w-[185px] border border-black px-2 py-2 align-middle font-bold"
                >
                  Skema Sertifikasi
                  <br />
                  (KKNI/Okupasi/Klaster)
                </td>
                <td className="w-[150px] border border-black px-2 py-2 font-bold">
                  Judul :
                </td>
                <td className="border border-black px-2 py-2">
                  {data.skema?.judul_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Nomor :
                </td>
                <td className="border border-black px-2 py-2">
                  {data.skema?.kode_skema ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  TUK :
                </td>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <div className="flex gap-8">
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
                  Nama Asesor :
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
                  Nama Asesi :
                </td>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  {getNama(
                    data.asesi
                  )}
                </td>
              </tr>

              <tr>
                <td
                  rowSpan="2"
                  className="border border-black px-2 py-2 align-middle font-bold"
                >
                  Tanggal Asesmen
                </td>
                <td className="border border-black px-2 py-2 font-bold">
                  Mulai :
                </td>
                <td className="border border-black px-2 py-2">
                  <input
                    type="date"
                    value={
                      data.tanggal_mulai ||
                      ""
                    }
                    onChange={(e) =>
                      updateHeader(
                        "tanggal_mulai",
                        e.target.value
                      )
                    }
                    className="frak02-no-print frak02-edit-input rounded border border-slate-300 px-2 py-1 outline-none"
                  />
                  <span className="frak02-print-value">
                    {formatTanggal(
                      data.tanggal_mulai
                    )}
                  </span>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Selesai :
                </td>
                <td className="border border-black px-2 py-2">
                  <input
                    type="date"
                    value={
                      data.tanggal_selesai ||
                      ""
                    }
                    onChange={(e) =>
                      updateHeader(
                        "tanggal_selesai",
                        e.target.value
                      )
                    }
                    className="frak02-no-print frak02-edit-input rounded border border-slate-300 px-2 py-1 outline-none"
                  />
                  <span className="frak02-print-value">
                    {formatTanggal(
                      data.tanggal_selesai
                    )}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="my-3 text-[9px]">
            Beri tanda centang (✓) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh untuk menentukan Kompetensi Asesi untuk setiap Unit Kompetensi
          </p>

          <table className="frak02-unit-table w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="w-[270px] border border-black px-2 py-2 text-center font-bold">
                  Unit Kompetensi
                </th>
                <EvidenceHeader>
                  Observasi
                  <br />
                  Demonstrasi
                </EvidenceHeader>
                <EvidenceHeader>
                  Portofolio
                </EvidenceHeader>
                <EvidenceHeader>
                  Pernyataan
                  <br />
                  Pihak Ketiga
                </EvidenceHeader>
                <EvidenceHeader>
                  Wawancara
                </EvidenceHeader>
                <EvidenceHeader>
                  Pertanyaan
                  <br />
                  Lisan
                </EvidenceHeader>
                <EvidenceHeader>
                  Pertanyaan
                  <br />
                  Tertulis
                </EvidenceHeader>
                <EvidenceHeader>
                  Proyek
                  <br />
                  Kerja
                </EvidenceHeader>
                <EvidenceHeader>
                  Lainnya
                </EvidenceHeader>
              </tr>
            </thead>
            <tbody>
              {data.detail.length ? (
                data.detail.map(
                  (unit) => (
                    <tr
                      key={
                        unit.id_unit
                      }
                    >
                      <td className="border border-black px-2 py-2">
                        {unit.judul_unit ||
                          "-"}
                      </td>
                      <EvidenceInput
                        checked={
                          unit.observasi
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "observasi",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.portofolio
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "portofolio",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.pihak_ketiga
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "pihak_ketiga",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.wawancara
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "wawancara",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.lisan
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "lisan",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.tertulis
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "tertulis",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.proyek
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "proyek",
                            value
                          )
                        }
                      />
                      <EvidenceInput
                        checked={
                          unit.lainnya
                        }
                        onChange={(value) =>
                          updateDetail(
                            unit.id_unit,
                            "lainnya",
                            value
                          )
                        }
                      />
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="border border-black px-3 py-5 text-center"
                  >
                    Unit kompetensi belum tersedia.
                  </td>
                </tr>
              )}

              <tr>
                <td className="border border-black px-2 py-3 font-bold">
                  Rekomendasi hasil asesmen
                </td>
                <td
                  colSpan="8"
                  className="border border-black px-2 py-3"
                >
                  <div className="flex items-center justify-center gap-16">
                    <RecommendationOption
                        checked={data.rekomendasi === "kompeten"}
                        label="Kompeten"
                        onChange={() =>
                        updateRecommendation("kompeten")
                        }
                    />
                    <RecommendationOption
                        checked={
                        data.rekomendasi === "belum_kompeten"
                        }
                        label="Belum kompeten"
                        onChange={() =>
                        updateRecommendation(
                            "belum_kompeten"
                        )
                        }
                    />
                    </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-3 align-top font-bold">
                  Tindak lanjut yang dibutuhkan
                  <div className="mt-1 font-normal text-[9px]">
                    (Masukkan pekerjaan tambahan dan asesmen yang diperlukan untuk mencapai kompetensi)
                  </div>
                </td>
                <td
                  colSpan="8"
                  className="border border-black p-0"
                >
                  <textarea
                    value={
                      data.tindak_lanjut ||
                      ""
                    }
                    onChange={(e) =>
                      updateHeader(
                        "tindak_lanjut",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="frak02-no-print frak02-edit-input w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />
                  <div className="frak02-print-value whitespace-pre-wrap p-2">
                    {data.tindak_lanjut ||
                      "-"}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-3 align-top font-bold">
                  Komentar / Observasi oleh asesor
                </td>
                <td
                  colSpan="8"
                  className="border border-black p-0"
                >
                  <textarea
                    value={
                      data.komentar_asesor ||
                      ""
                    }
                    onChange={(e) =>
                      updateHeader(
                        "komentar_asesor",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="frak02-no-print frak02-edit-input w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />
                  <div className="frak02-print-value whitespace-pre-wrap p-2">
                    {data.komentar_asesor ||
                      "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <table className="frak02-signature-table w-full border-collapse border border-black">
              <tbody>
                <tr>
                  <td
                    colSpan="3"
                    className="border border-black px-3 py-2 font-bold"
                  >
                    Asesi :
                  </td>
                </tr>
                <tr>
                  <td className="w-[130px] border border-black px-2 py-2">
                    Nama
                  </td>
                  <td className="w-[20px] border border-black px-2 py-2 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-2">
                    {getNama(
                      data.asesi
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-4 align-middle">
                    Tanda tangan dan
                    <br />
                    Tanggal
                  </td>
                  <td className="border border-black px-2 py-4 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-4">
                    <div className="flex items-center justify-between gap-5">
                      <Signature
                        path={
                          data.asesi
                            ?.ttd_path ||
                          data.asesi?.ttd
                        }
                        label="Tanda tangan Asesi"
                      />
                      <span>
                        {formatTanggal(
                          data.asesi
                            ?.tanggal ||
                          data.tanggal_selesai ||
                          data.tanggal_mulai
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="3"
                    className="border border-black px-3 py-2 font-bold"
                  >
                    Asesor :
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-2">
                    Nama
                  </td>
                  <td className="border border-black px-2 py-2 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-2">
                    {getNama(
                      data.asesor
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-2">
                    No. Reg.
                  </td>
                  <td className="border border-black px-2 py-2 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-2">
                    {data.asesor
                      ?.no_reg_asesor ||
                      "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-4 align-middle">
                    Tanda tangan dan
                    <br />
                    Tanggal
                  </td>
                  <td className="border border-black px-2 py-4 text-center">
                    :
                  </td>
                  <td className="border border-black px-2 py-4">
                    <div className="flex items-center justify-between gap-5">
                      <Signature
                        path={
                          data.asesor
                            ?.ttd_path ||
                          data.ttd_asesor
                        }
                        label="Tanda tangan Asesor"
                      />
                      <span>
                        {formatTanggal(
                          data.tanggal_selesai ||
                          data.tanggal_mulai
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="frak02-attachment-table mt-4">
            <div className="font-bold">
              LAMPIRAN DOKUMEN:
            </div>
            <ol className="mt-1 list-decimal pl-5">
              <li>Dokumen APL 01 peserta</li>
              <li>Dokumen APL 02 peserta</li>
              <li>Bukti-bukti berkualitas peserta</li>
              <li>Tinjauan proses asesmen</li>
            </ol>
          </div>
        </main>
      </div>
    </>
  );
}

function EvidenceHeader({ children }) {
  return (
    <th className="h-[105px] w-[58px] border border-black p-0 text-center align-middle font-bold">
      <div
        className="mx-auto flex h-[100px] items-center justify-center px-1 text-[8px] leading-tight"
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)"
        }}
      >
        {children}
      </div>
    </th>
  );
}

function EvidenceInput({
  checked,
  onChange
}) {
  return (
    <td className="w-[58px] border border-black px-1 py-2 text-center align-middle">
      <label className="flex cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={(e) =>
            onChange(
              e.target.checked
            )
          }
          className="frak02-no-print h-4 w-4 cursor-pointer"
        />
        <span className="hidden print:inline text-[12px]">
          {checked ? "☑" : "☐"}
        </span>
      </label>
    </td>
  );
}

function RecommendationOption({
  checked,
  label,
  onChange
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span
        onClick={onChange}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border text-[11px] font-bold ${
          checked
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-500 bg-white text-transparent"
        }`}
      >
        ✓
      </span>
      <span className="text-[12px] font-medium">
        {label}
      </span>
    </label>
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
      <div className="flex h-[55px] w-[160px] items-center justify-center text-[9px] text-slate-400">
        -
      </div>
    );
  }
  return (
    <div className="flex h-[55px] w-[160px] items-center justify-center">
      <img
        src={src}
        alt={label}
        className="max-h-[52px] max-w-[150px] object-contain"
      />
    </div>
  );
}

function normalizeResponse(
  payload
) {
  const source =
    payload?.data ||
    payload ||
    {};
  return {
    ...EMPTY_FORM,
    ...source,
    id_fr_ak02:
      source?.id_fr_ak02 ||
      null,
    exists:
      Boolean(
        source?.exists ||
        source?.id_fr_ak02
      ),
    skema:
      source?.skema || {},
    tuk:
      source?.tuk || {},
    jadwal:
      source?.jadwal || {},
    asesi:
      source?.asesi || {},
    asesor:
      source?.asesor || {},
    tanggal_mulai:
      source?.tanggal_mulai ||
      source?.jadwal?.tgl_awal ||
      "",
    tanggal_selesai:
      source?.tanggal_selesai ||
      source?.jadwal?.tgl_akhir ||
      "",
    rekomendasi:
      source?.rekomendasi ||
      "",
    tindak_lanjut:
      source?.tindak_lanjut ||
      "",
    komentar_asesor:
      source?.komentar_asesor ||
      "",
    ttd_asesor:
      source?.ttd_asesor ||
      source?.asesor?.ttd_path ||
      "",
    detail:
      Array.isArray(
        source?.detail
      )
        ? source.detail.map(
            (item) => ({
              ...item,
              observasi:
                Boolean(
                  item.observasi
                ),
              portofolio:
                Boolean(
                  item.portofolio
                ),
              pihak_ketiga:
                Boolean(
                  item.pihak_ketiga
                ),
              wawancara:
                Boolean(
                  item.wawancara
                ),
              lisan:
                Boolean(
                  item.lisan
                ),
              tertulis:
                Boolean(
                  item.tertulis
                ),
              proyek:
                Boolean(
                  item.proyek
                ),
              lainnya:
                Boolean(
                  item.lainnya
                )
            })
          )
        : []
  };
}

function getTukType(data) {
  const value =
    data?.tuk?.jenis_tuk ||
    data?.tuk?.jenis ||
    data?.jenis_tuk ||
    "";
  const normalized =
    String(value)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_");
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
    import.meta.env.VITE_API_BASE ||
    "http://localhost:3000/api";
  const root =
    base.replace(
      /\/api\/?$/,
      ""
    );
  return `${root}/${stringValue.replace(/^\/+/, "")}`;
}