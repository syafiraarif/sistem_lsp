import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Printer, Save } from "lucide-react";
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
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .frak01-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .frak01-no-print {
    display: none !important;
  }
  .frak01-main-table {
    width: 100% !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
  .frak01-main-table tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak01-signature-wrapper {
    display: block !important;
    width: 100% !important;
    margin-top: 14px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak01-signature-table {
    width: 100% !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak01-signature-table thead,
  .frak01-signature-table tbody,
  .frak01-signature-table tr,
  .frak01-signature-table td {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .frak01-signature-table tr {
    page-break-before: auto !important;
    page-break-after: auto !important;
  }
  input,
  textarea,
  select {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
  .print-only {
    display: block !important;
  }
  .screen-only {
    display: none !important;
  }
}
.print-only {
  display: none;
}
`;

const emptyData = {
  id_fr_ak01: null,
  id_jadwal: null,
  id_peserta: null,
  id_asesor: null,
  exists: false,
  tanggal: "",
  skema: {},
  tuk: {},
  asesor: {},
  asesi: {},
  jadwal: {},
  bukti: {
    tl_verifikasi_portofolio: false,
    tl_hasil_reviu_produk: false,
    l_observasi_langsung: false,
    l_hasil_kegiatan_terstruktur: false,
    t_daftar_pertanyaan_tulis: false,
    t_daftar_pertanyaan_lisan: false,
    t_pertanyaan_wawancara: false,
    t_lainnya: false,
    lainnya: ""
  },
  pelaksanaan: {
    hari_tanggal: "",
    waktu: "",
    tuk: ""
  },
  persetujuan: true,
  ttd_asesor: ""
};

export default function FRAK01Asesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    if (id_jadwal && id_peserta) {
      fetchData();
    }
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/asesor/fr-ak01/asesor/${id_jadwal}/${id_peserta}`,
        {
          params: {
            _t: Date.now()
          }
        }
      );
      const payload = response?.data?.data || response?.data || {};
      setData(normalizeResponse(payload));
    } catch (error) {
      console.error("LOAD FR.AK.01 ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "Data FR.AK.01 tidak dapat dimuat"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBukti = (field, value) => {
    setData((prev) => ({
      ...prev,
      bukti: {
        ...prev.bukti,
        [field]: value
      }
    }));
  };

  const updateLainnya = (value) => {
    setData((prev) => ({
      ...prev,
      bukti: {
        ...prev.bukti,
        lainnya: value
      }
    }));
  };

  const updateWaktu = (value) => {
    const numericValue = String(value || "").replace(/\D/g, "");
    setData((prev) => ({
      ...prev,
      pelaksanaan: {
        ...prev.pelaksanaan,
        waktu: numericValue
      }
    }));
  };

  const updatePersetujuan = (value) => {
    setData((prev) => ({
      ...prev,
      persetujuan: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        id_jadwal: Number(id_jadwal),
        id_peserta: Number(id_peserta),
        bukti_portofolio: Boolean(
          data.bukti.tl_verifikasi_portofolio
        ),
        bukti_review_produk: Boolean(
          data.bukti.tl_hasil_reviu_produk
        ),
        bukti_observasi: Boolean(
          data.bukti.l_observasi_langsung
        ),
        bukti_kegiatan_terstruktur: Boolean(
          data.bukti.l_hasil_kegiatan_terstruktur
        ),
        bukti_tertulis: Boolean(
          data.bukti.t_daftar_pertanyaan_tulis
        ),
        bukti_lisan: Boolean(
          data.bukti.t_daftar_pertanyaan_lisan
        ),
        bukti_wawancara: Boolean(
          data.bukti.t_pertanyaan_wawancara
        ),
        t_lainnya: Boolean(data.bukti.t_lainnya),
        bukti_lainnya: data.bukti.lainnya?.trim() || null,
        waktu: data.pelaksanaan?.waktu
          ? Number(data.pelaksanaan.waktu)
          : null,
        persetujuan: Boolean(data.persetujuan),
        ttd_asesor:
          data.ttd_asesor ||
          data.asesor?.ttd_path ||
          null
      };

      let response;

      if (!data.exists || !data.id_fr_ak01) {
        response = await api.post("/asesor/fr-ak01", payload);
      } else {
        response = await api.put(
          `/asesor/fr-ak01/${data.id_fr_ak01}`,
          payload
        );
      }

      const saved = response?.data?.data || null;

      setData((prev) => ({
        ...prev,
        id_fr_ak01:
          saved?.id_fr_ak01 ||
          saved?.id ||
          prev.id_fr_ak01,
        exists: true
      }));

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "FR.AK.01 berhasil disimpan.",
        timer: 1200,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error("SAVE FR.AK.01 ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.01 gagal disimpan."
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
          <Loader2 size={22} className="animate-spin" />
          Memuat FR.AK.01...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="frak01-no-print mx-auto mb-5 flex w-[1000px] max-w-[calc(100%-32px)] items-center justify-between">
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
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving
                ? "Menyimpan..."
                : data.exists
                ? "Update FR.AK.01"
                : "Simpan FR.AK.01"}
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

        <main className="frak01-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-8 py-5 text-[11px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-3 text-center text-[16px] font-black uppercase">
            FR.AK.01. PERSETUJUAN ASESMEN DAN KERAHASIAAN
          </h1>

          <table className="frak01-main-table w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-2"
                >
                  Persetujuan Asesmen ini untuk menjamin bahwa Peserta telah diberi arahan secara rinci tentang perencanaan dan proses asesmen
                </td>
              </tr>

              <tr>
                <td
                  rowSpan="2"
                  className="w-[190px] border border-black px-2 py-2 align-middle font-bold"
                >
                  Skema Sertifikasi
                  <br />
                  (KKNI/Okupasi/Klaster)*
                </td>

                <td className="w-[230px] border border-black px-2 py-2 font-bold">
                  Judul :
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.judul_skema || "-"}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Nomor :
                </td>

                <td className="border border-black px-2 py-2">
                  {data.skema?.kode_skema || "-"}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  TUK :
                </td>

                <td className="border border-black px-2 py-2">
                  <div className="flex items-center gap-8">
                    <TukOption
                      checked={getTukType(data) === "sewaktu"}
                      label="Sewaktu"
                    />
                    <TukOption
                      checked={getTukType(data) === "tempat_kerja"}
                      label="Tempat Kerja"
                    />
                    <TukOption
                      checked={getTukType(data) === "mandiri"}
                      label="Mandiri"
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Nama Asesor :
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
                  Nama Asesi :
                </td>

                <td className="border border-black px-2 py-2">
                  {getNama(data.asesi)}
                </td>
              </tr>

              <tr>
                <td
                  rowSpan="6"
                  className="w-[190px] border border-black px-2 py-2 align-middle font-bold"
                >
                  Bukti yang akan dikumpulkan :
                </td>

                <td className="border border-black px-2 py-2">
                  <EvidenceCheckbox
                    checked={data.bukti.tl_verifikasi_portofolio}
                    label="TL : VERIFIKASI PORTOFOLIO"
                    onChange={(value) =>
                      updateBukti(
                        "tl_verifikasi_portofolio",
                        value
                      )
                    }
                  />
                </td>

                <td className="border border-black px-2 py-2">
                  <EvidenceCheckbox
                    checked={data.bukti.tl_hasil_reviu_produk}
                    label="TL : HASIL REVIU PRODUK"
                    onChange={(value) =>
                      updateBukti(
                        "tl_hasil_reviu_produk",
                        value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2">
                  <EvidenceCheckbox
                    checked={data.bukti.l_observasi_langsung}
                    label="L : OBSERVASI LANGSUNG"
                    onChange={(value) =>
                      updateBukti(
                        "l_observasi_langsung",
                        value
                      )
                    }
                  />
                </td>

                <td className="border border-black px-2 py-2">
                  <EvidenceCheckbox
                    checked={
                      data.bukti.l_hasil_kegiatan_terstruktur
                    }
                    label="L : HASIL KEGIATAN TERSTRUKTUR"
                    onChange={(value) =>
                      updateBukti(
                        "l_hasil_kegiatan_terstruktur",
                        value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <EvidenceCheckbox
                    checked={
                      data.bukti.t_daftar_pertanyaan_tulis
                    }
                    label="T : DAFTAR PERTANYAAN TULIS / PILIHAN GANDA"
                    onChange={(value) =>
                      updateBukti(
                        "t_daftar_pertanyaan_tulis",
                        value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <EvidenceCheckbox
                    checked={
                      data.bukti.t_daftar_pertanyaan_lisan
                    }
                    label="T : DAFTAR PERTANYAAN LISAN"
                    onChange={(value) =>
                      updateBukti(
                        "t_daftar_pertanyaan_lisan",
                        value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <EvidenceCheckbox
                    checked={
                      data.bukti.t_pertanyaan_wawancara
                    }
                    label="T : PERTANYAAN WAWANCARA"
                    onChange={(value) =>
                      updateBukti(
                        "t_pertanyaan_wawancara",
                        value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td
                  colSpan="2"
                  className="border border-black px-2 py-2"
                >
                  <div className="flex items-center gap-2">
                    <EvidenceCheckbox
                      checked={data.bukti.t_lainnya}
                      label="T : LAINNYA"
                      onChange={(value) =>
                        updateBukti("t_lainnya", value)
                      }
                    />

                    {data.bukti.t_lainnya && (
                      <>
                        <input
                          type="text"
                          value={data.bukti.lainnya}
                          onChange={(e) =>
                            updateLainnya(e.target.value)
                          }
                          className="frak01-no-print flex-1 border-0 border-b border-black bg-transparent px-1 py-0.5 text-[10px] outline-none"
                          placeholder="Keterangan lainnya"
                        />

                        <span className="print-only flex-1 border-b border-black px-1 py-0.5 text-[10px]">
                          {data.bukti.lainnya || "-"}
                        </span>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  rowSpan="3"
                  className="border border-black px-2 py-3 align-middle font-bold"
                >
                  Pelaksanaan asesmen disepakati pada :
                </td>

                <td className="border border-black px-2 py-2 font-bold">
                  Hari Tanggal :
                </td>

                <td className="border border-black px-2 py-2">
                  {formatTanggal(
                    data.pelaksanaan?.hari_tanggal ||
                    data.jadwal?.tgl_awal ||
                    data.jadwal?.tgl_akhir ||
                    data.tanggal
                  )}
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Waktu :
                </td>

                <td className="border border-black px-2 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={
                        data.pelaksanaan?.waktu || ""
                      }
                      onChange={(e) =>
                        updateWaktu(e.target.value)
                      }
                      className="frak01-no-print w-[90px] border-b border-black bg-transparent px-1 py-1 text-center text-[11px] outline-none"
                      placeholder="30"
                    />

                    <span className="print-only w-[90px] border-b border-black px-1 py-1 text-center text-[11px]">
                      {data.pelaksanaan?.waktu || "-"}
                    </span>

                    <span className="font-normal">
                      Menit
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  TUK :
                </td>

                <td className="border border-black px-2 py-2">
                  {data.pelaksanaan?.tuk ||
                    data.tuk?.nama_tuk ||
                    "-"}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Asesi:
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-3"
                >
                  Bahwa saya telah mendapatkan penjelasan terkait hak dan prosedur banding asesmen dari asesor.
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Asesor:
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-3"
                >
                  Menyatakan tidak akan membuka hasil pekerjaan yang saya peroleh karena penugasan saya sebagai Asesor dalam pekerjaan Asesmen kepada siapapun atau organisasi apapun selain kepada pihak yang berwenang sehubungan dengan kewajiban saya sebagai Asesor yang ditugaskan oleh LSP.
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Asesi:
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="border border-black px-2 py-3"
                >
                  Saya setuju mengikuti asesmen dengan pemahaman bahwa informasi yang dikumpulkan hanya digunakan untuk pengembangan profesional dan hanya dapat diakses oleh orang tertentu saja.
                </td>
              </tr>
            </tbody>
          </table>

          <div className="frak01-signature-wrapper">
            <table className="frak01-signature-table w-full border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="w-1/3 border border-black px-2 py-2 text-center font-bold">
                    Nama Asesi
                  </td>
                  <td className="w-1/3 border border-black px-2 py-2 text-center font-bold">
                    Tanda tangan Asesi
                  </td>
                  <td className="w-1/3 border border-black px-2 py-2 text-center font-bold">
                    Tanggal:
                  </td>
                </tr>

                <tr>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    {getNama(data.asesi)}
                  </td>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    <Signature
                      path={
                        data.asesi?.ttd_path ||
                        data.asesi?.ttd
                      }
                      label="Tanda tangan Asesi"
                    />
                  </td>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    {formatTanggal(
                      data.asesi?.tanggal ||
                      data.tanggal ||
                      data.pelaksanaan?.hari_tanggal ||
                      data.jadwal?.tgl_awal
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border border-black px-2 py-2 text-center font-bold">
                    Nama Asesor
                  </td>
                  <td className="border border-black px-2 py-2 text-center font-bold">
                    Tanda tangan Asesor
                  </td>
                  <td className="border border-black px-2 py-2 text-center font-bold">
                    Tanggal:
                  </td>
                </tr>

                <tr>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    {getNama(data.asesor)}
                  </td>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    <Signature
                      path={
                        data.asesor?.ttd_path ||
                        data.asesor?.ttd ||
                        data.ttd_asesor
                      }
                      label="Tanda tangan Asesor"
                    />
                  </td>
                  <td className="border border-black px-2 py-5 text-center align-middle">
                    {formatTanggal(
                      data.asesor?.tanggal ||
                      data.tanggal ||
                      data.pelaksanaan?.hari_tanggal ||
                      data.jadwal?.tgl_awal
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="frak01-no-print mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-center gap-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(data.persetujuan)}
                onChange={(e) =>
                  updatePersetujuan(e.target.checked)
                }
                className="h-4 w-4"
              />
              Peserta menyetujui proses asesmen dan kerahasiaan.
            </label>
          </div>
        </main>
      </div>
    </>
  );
}

function EvidenceCheckbox({ checked, label, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 leading-snug">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="frak01-no-print mt-[1px] h-3.5 w-3.5 shrink-0 cursor-pointer"
      />
      <span className="hidden print:inline">
        {checked ? "☑" : "☐"}
      </span>
      <span>{label}</span>
    </label>
  );
}

function TukOption({ checked, label }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="text-[13px] leading-none">
        {checked ? "☒" : "☐"}
      </span>
      <span>{label}</span>
    </span>
  );
}

function Signature({ path, label }) {
  const src = normalizeFileUrl(path);

  if (!src) {
    return (
      <div className="flex h-[70px] items-center justify-center text-[10px] text-slate-400">
        -
      </div>
    );
  }

  return (
    <div className="flex min-h-[70px] items-center justify-center">
      <img
        src={src}
        alt={label}
        className="h-[68px] max-w-[180px] object-contain"
      />
    </div>
  );
}

function normalizeResponse(payload) {
  const source =
    payload?.data ||
    payload?.frAk01 ||
    payload?.fr_ak_01 ||
    payload ||
    {};

  const skema =
    source?.skema ||
    source?.Skema ||
    {};

  const tuk =
    source?.tuk ||
    source?.Tuk ||
    {};

  const asesor =
    source?.asesor ||
    source?.ProfileAsesor ||
    {};

  const asesi =
    source?.asesi ||
    source?.profileAsesi ||
    source?.ProfileAsesi ||
    {};

  const jadwal =
    source?.jadwal ||
    source?.Jadwal ||
    {};

  const rawBukti =
    source?.bukti ||
    source?.bukti_yang_akan_dikumpulkan ||
    source ||
    {};

  const rawPelaksanaan =
    source?.pelaksanaan ||
    source?.pelaksanaan_asesmen ||
    source ||
    {};

  return {
    ...emptyData,
    ...source,
    id_fr_ak01:
      source?.id_fr_ak01 ||
      source?.id_fr_ak_01 ||
      source?.id ||
      null,
    exists: Boolean(
      source?.id_fr_ak01 ||
      source?.id_fr_ak_01 ||
      source?.id
    ),
    skema,
    tuk,
    asesor,
    asesi,
    jadwal,
    bukti: {
      tl_verifikasi_portofolio: toBoolean(
        rawBukti?.tl_verifikasi_portofolio ??
        rawBukti?.bukti_portofolio ??
        source?.bukti_portofolio
      ),
      tl_hasil_reviu_produk: toBoolean(
        rawBukti?.tl_hasil_reviu_produk ??
        rawBukti?.bukti_review_produk ??
        source?.bukti_review_produk
      ),
      l_observasi_langsung: toBoolean(
        rawBukti?.l_observasi_langsung ??
        rawBukti?.bukti_observasi ??
        source?.bukti_observasi
      ),
      l_hasil_kegiatan_terstruktur: toBoolean(
        rawBukti?.l_hasil_kegiatan_terstruktur ??
        rawBukti?.bukti_kegiatan_terstruktur ??
        source?.bukti_kegiatan_terstruktur
      ),
      t_daftar_pertanyaan_tulis: toBoolean(
        rawBukti?.t_daftar_pertanyaan_tulis ??
        rawBukti?.bukti_tertulis ??
        source?.bukti_tertulis
      ),
      t_daftar_pertanyaan_lisan: toBoolean(
        rawBukti?.t_daftar_pertanyaan_lisan ??
        rawBukti?.bukti_lisan ??
        source?.bukti_lisan
      ),
      t_pertanyaan_wawancara: toBoolean(
        rawBukti?.t_pertanyaan_wawancara ??
        rawBukti?.bukti_wawancara ??
        source?.bukti_wawancara
      ),
      t_lainnya: toBoolean(
        rawBukti?.t_lainnya ??
        source?.t_lainnya
      ),
      lainnya:
        rawBukti?.lainnya ??
        rawBukti?.bukti_lainnya ??
        source?.bukti_lainnya ??
        ""
    },
    pelaksanaan: {
      hari_tanggal:
        rawPelaksanaan?.hari_tanggal ||
        rawPelaksanaan?.tanggal ||
        source?.tanggal ||
        jadwal?.tgl_awal ||
        jadwal?.tgl_akhir ||
        "",
      waktu:
        rawPelaksanaan?.waktu ??
        source?.waktu ??
        "",
      tuk:
        rawPelaksanaan?.tuk ||
        source?.tuk_pelaksanaan ||
        tuk?.nama_tuk ||
        ""
    },
    persetujuan:
      source?.persetujuan !== undefined
        ? Boolean(source.persetujuan)
        : true,
    tanggal:
      source?.tanggal ||
      source?.tanggal_persetujuan ||
      source?.tanggal_asesmen ||
      jadwal?.tgl_awal ||
      "",
    ttd_asesor:
      source?.ttd_asesor ||
      asesor?.ttd_path ||
      ""
  };
}

function getTukType(data) {
  const value =
    data?.tuk?.jenis_tuk ||
    data?.tuk?.jenis ||
    data?.jenis_tuk ||
    "";

  const normalized = String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  if (normalized.includes("sewaktu")) {
    return "sewaktu";
  }

  if (normalized.includes("tempat")) {
    return "tempat_kerja";
  }

  if (normalized.includes("mandiri")) {
    return "mandiri";
  }

  return "";
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function getNama(obj) {
  return (
    obj?.nama_lengkap ||
    obj?.nama ||
    obj?.username ||
    obj?.nama_asesor ||
    obj?.nama_asesi ||
    "-"
  );
}

function toBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "ya" ||
    value === "YA" ||
    value === "yes" ||
    value === "checked"
  );
}

function normalizeFileUrl(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

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

  const root = base.replace(/\/api\/?$/, "");

  return `${root}/${stringValue.replace(/^\/+/, "")}`;
}