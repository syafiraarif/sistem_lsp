import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/api";
const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 9mm;
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
  .frak06-no-print {
    display: none !important;
  }
  .frak06-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .frak06-table,
  .frak06-signature {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  .frak06-table tr,
  .frak06-table td,
  .frak06-table th,
  .frak06-signature tr,
  .frak06-signature td,
  .frak06-signature th {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  textarea,
  input {
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  .frak06-print-value {
    display: block !important;
  }
  .frak06-edit-value {
    display: none !important;
  }
}
.frak06-print-value {
  display: none;
}
`;
const EMPTY_FORM = {
  id: null,
  id_jadwal: null,
  id_asesor: null,
  exists: false,
  skema: {},
  tuk: {},
  jadwal: {},
  asesor: {},
  tanggal: "",
  rekomendasi_1: "",
  rekomendasi_2: "",
  komentar: "",
  ttd_asesor: "",
  details: []
};
const createDefaultDetails = () => [
  {
    id: null,
    aspek: "Rencana asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  },
  {
    id: null,
    aspek: "Persiapan asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  },
  {
    id: null,
    aspek: "Implementasi asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  },
  {
    id: null,
    aspek: "Keputusan asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  },
  {
    id: null,
    aspek: "Umpan balik asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  },
  {
    id: null,
    aspek: "Konsistensi keputusan asesmen",
    validitas: false,
    reliabel: false,
    fleksibel: false,
    adil: false,
    task_skills: false,
    task_management: false,
    contingency_management: false,
    job_role: false,
    transfer_skills: false,
    bukti: ""
  }
];
export default function FRAK06Asesor() {
  const navigate = useNavigate();
  const { id_jadwal } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(EMPTY_FORM);
  useEffect(() => {
    if (id_jadwal) {
      fetchData();
    }
  }, [id_jadwal]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/asesor/fr-ak06", {
        params: {
          id_jadwal: Number(id_jadwal),
          _t: Date.now()
        }
      });
      const payload = response?.data?.data || response?.data || {};
      let profile = {};
      try {
        const profileResponse = await api.get("/asesor/profile", {
          params: {
            _t: Date.now()
          }
        });
        profile = profileResponse?.data?.data || profileResponse?.data || {};
      } catch (profileError) {
        profile = {};
      }
      setData(
        normalizeResponse({
          ...payload,
          asesor: payload?.asesor || profile,
          skema: payload?.skema || payload?.jadwal?.skema || {},
          tuk: payload?.tuk || payload?.jadwal?.tuk || {},
          jadwal: payload?.jadwal || {}
        })
      );
    } catch (error) {
      console.error("LOAD FR.AK.06 ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.06 tidak dapat dimuat"
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
  const toggleDetail = (index, field) => {
    setData((prev) => ({
      ...prev,
      details: prev.details.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: !item[field]
            }
          : item
      )
    }));
  };
  const handleSave = async () => {
    if (!data.details.length) {
      Swal.fire({
        icon: "warning",
        title: "Detail belum tersedia",
        text: "Minimal harus terdapat satu detail asesmen."
      });
      return;
    }
    const ttd = data.ttd_asesor || data.asesor?.ttd_path || "";
    if (!ttd) {
      Swal.fire({
        icon: "warning",
        title: "Tanda tangan belum tersedia",
        text: "Tanda tangan asesor belum tersedia pada profil."
      });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id_jadwal: Number(id_jadwal),
        rekomendasi_1: data.rekomendasi_1 || null,
        rekomendasi_2: data.rekomendasi_2 || null,
        komentar: data.komentar || null,
        ttd_asesor: ttd,
        detail: data.details.map((item) => ({
          aspek: item.aspek || null,
          validitas: Boolean(item.validitas),
          reliabel: Boolean(item.reliabel),
          fleksibel: Boolean(item.fleksibel),
          adil: Boolean(item.adil),
          task_skills: Boolean(item.task_skills),
          task_management: Boolean(item.task_management),
          contingency_management: Boolean(item.contingency_management),
          job_role: Boolean(item.job_role),
          transfer_skills: Boolean(item.transfer_skills),
          bukti: item.bukti || null
        }))
      };
      let response;
      if (data.exists && data.id) {
        response = await api.put(
          `/asesor/fr-ak06/${data.id}`,
          payload
        );
      } else {
        response = await api.post(
          "/asesor/fr-ak06",
          payload
        );
      }
      const saved = response?.data?.data || {};
      setData((prev) => ({
        ...prev,
        id: saved?.id || prev.id,
        id_jadwal: saved?.id_jadwal || prev.id_jadwal,
        id_asesor: saved?.id_asesor || prev.id_asesor,
        exists: true
      }));
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "FR.AK.06 berhasil disimpan.",
        timer: 1200,
        showConfirmButton: false
      });
      await fetchData();
    } catch (error) {
      console.error("SAVE FR.AK.06 ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error?.response?.data?.message ||
          "FR.AK.06 gagal disimpan."
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
          Memuat FR.AK.06...
        </div>
      </div>
    );
  }
  return (
    <>
      <style>{PRINT_CSS}</style>
      <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
        <div className="frak06-no-print mx-auto mb-5 flex w-[1000px] max-w-[calc(100%-32px)] items-center justify-between">
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
                ? "Update FR.AK.06"
                : "Simpan FR.AK.06"}
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
        <main className="frak06-sheet mx-auto w-[1000px] max-w-[1000px] bg-white px-8 py-5 text-[10px] leading-tight text-black shadow-lg print:w-full print:max-w-none print:px-0 print:py-0 print:shadow-none">
          <h1 className="mb-3 text-center text-[15px] font-black uppercase">
            FR.AK.06. MENINJAU PROSES ASESMEN
          </h1>
          <table className="frak06-table w-full border-collapse border border-black">
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
                <td className="w-[75px] border border-black px-2 py-2 text-center font-bold">
                  Judul
                </td>
                <td className="w-[18px] border border-black px-2 py-2 text-center">
                  :
                </td>
                <td className="border border-black px-2 py-2">
                  {data.skema?.judul_skema ||
                    data.jadwal?.skema?.judul_skema ||
                    "-"}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-2 text-center font-bold">
                  Nomor
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>
                <td className="border border-black px-2 py-2">
                  {data.skema?.kode_skema ||
                    data.jadwal?.skema?.kode_skema ||
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
                  <div className="flex items-center gap-7">
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
                  Tanggal
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  :
                </td>
                <td className="border border-black px-2 py-2">
                  {formatTanggal(
                    data.tanggal ||
                    data.jadwal?.tgl_awal ||
                    new Date()
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <table className="frak06-table mt-4 w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-2 font-bold">
                  Penjelasan:
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-2 leading-relaxed">
                  1. Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.
                  <br />
                  2. Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan/atau peserta kelompok yang homogen.
                  <br />
                  3. Isilah pemenuhan dimensi kompetensi dengan menuliskan jenis bukti dan instrumen yang digunakan pada saat asesmen sebagai bukti terpenuhinya dimensi kompetensi.
                </td>
              </tr>
            </tbody>
          </table>
          <table className="frak06-table mt-4 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th
                  rowSpan="2"
                  className="w-[300px] border border-black px-2 py-2 text-left font-bold"
                >
                  Aspek yang ditinjau
                </th>
                <th
                  colSpan="4"
                  className="border border-black px-2 py-2 text-center font-bold"
                >
                  Kesesuaian dengan prinsip asesmen
                </th>
              </tr>
              <tr>
                <th className="w-[90px] border border-black px-2 py-2 text-center font-bold">
                  Validitas
                </th>
                <th className="w-[90px] border border-black px-2 py-2 text-center font-bold">
                  Reliabel
                </th>
                <th className="w-[90px] border border-black px-2 py-2 text-center font-bold">
                  Fleksibel
                </th>
                <th className="w-[90px] border border-black px-2 py-2 text-center font-bold">
                  Adil
                </th>
              </tr>
            </thead>
            <tbody>
              {data.details.slice(0, 5).map((item, index) => (
                <tr key={`${item.id || item.aspek}-${index}`}>
                  <td className="border border-black px-2 py-2">
                    • {item.aspek}
                  </td>
                  <CheckCell
                    checked={item.validitas}
                    onChange={() =>
                      toggleDetail(index, "validitas")
                    }
                  />
                  <CheckCell
                    checked={item.reliabel}
                    onChange={() =>
                      toggleDetail(index, "reliabel")
                    }
                  />
                  <CheckCell
                    checked={item.fleksibel}
                    onChange={() =>
                      toggleDetail(index, "fleksibel")
                    }
                  />
                  <CheckCell
                    checked={item.adil}
                    onChange={() =>
                      toggleDetail(index, "adil")
                    }
                  />
                </tr>
              ))}
              <tr>
                <td
                  colSpan="5"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Rekomendasi untuk peningkatan
                </td>
              </tr>
              <tr>
                <td
                  colSpan="5"
                  className="border border-black p-0"
                >
                  <textarea
                    value={data.rekomendasi_1}
                    onChange={(e) =>
                      updateHeader(
                        "rekomendasi_1",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="frak06-no-print frak06-edit-value w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />
                  <div className="frak06-print-value min-h-[70px] whitespace-pre-wrap p-2">
                    {data.rekomendasi_1 || "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="frak06-table mt-4 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th
                  rowSpan="2"
                  className="w-[230px] border border-black px-2 py-2 text-left font-bold"
                >
                  Aspek yang ditinjau
                </th>
                <th
                  colSpan="5"
                  className="border border-black px-2 py-2 text-center font-bold"
                >
                  Pemenuhan dimensi kompetensi
                </th>
              </tr>
              <tr>
                <th className="w-[95px] border border-black px-2 py-2 text-center italic">
                  Task Skills
                </th>
                <th className="w-[95px] border border-black px-2 py-2 text-center italic">
                  Task Management Skills
                </th>
                <th className="w-[95px] border border-black px-2 py-2 text-center italic">
                  Contingency Management Skills
                </th>
                <th className="w-[95px] border border-black px-2 py-2 text-center italic">
                  Job Role / Environment Skills
                </th>
                <th className="w-[95px] border border-black px-2 py-2 text-center italic">
                  Transfer Skills
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-2 align-top">
                  <div className="font-bold">
                    Konsistensi keputusan asesmen
                  </div>
                  <div className="mt-1 leading-relaxed">
                    Bukti dari berbagai asesmen diperkirakan untuk konsistensi dimensi kompetensi
                  </div>
                </td>
                <CheckCell
                  checked={data.details[5]?.task_skills}
                  onChange={() =>
                    toggleDetail(5, "task_skills")
                  }
                />
                <CheckCell
                  checked={data.details[5]?.task_management}
                  onChange={() =>
                    toggleDetail(5, "task_management")
                  }
                />
                <CheckCell
                  checked={data.details[5]?.contingency_management}
                  onChange={() =>
                    toggleDetail(5, "contingency_management")
                  }
                />
                <CheckCell
                  checked={data.details[5]?.job_role}
                  onChange={() =>
                    toggleDetail(5, "job_role")
                  }
                />
                <CheckCell
                  checked={data.details[5]?.transfer_skills}
                  onChange={() =>
                    toggleDetail(5, "transfer_skills")
                  }
                />
              </tr>
              <tr>
                <td
                  colSpan="6"
                  className="border border-black px-2 py-2 font-bold"
                >
                  Rekomendasi untuk peningkatan:
                </td>
              </tr>
              <tr>
                <td
                  colSpan="6"
                  className="border border-black p-0"
                >
                  <textarea
                    value={data.rekomendasi_2}
                    onChange={(e) =>
                      updateHeader(
                        "rekomendasi_2",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="frak06-no-print frak06-edit-value w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />
                  <div className="frak06-print-value min-h-[70px] whitespace-pre-wrap p-2">
                    {data.rekomendasi_2 || "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="frak06-signature mt-6 w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="w-[30%] border border-black px-2 py-2 text-center font-bold">
                  Nama Lead Asesor/Asesor
                </th>
                <th className="w-[30%] border border-black px-2 py-2 text-center font-bold">
                  Tanggal dan Tanda Tangan
                </th>
                <th className="w-[40%] border border-black px-2 py-2 text-center font-bold">
                  Komentar
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-4 align-middle">
                  <div className="font-medium">
                    {getNama(data.asesor)}
                  </div>
                  <div className="mt-1 text-[9px]">
                    {data.asesor?.no_reg_asesor || ""}
                  </div>
                </td>
                <td className="border border-black px-2 py-4 align-middle">
                  <div className="flex min-h-[80px] flex-col items-center justify-between">
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
                        data.jadwal?.tgl_awal ||
                        new Date()
                      )}
                    </span>
                  </div>
                </td>
                <td className="border border-black p-0 align-top">
                  <textarea
                    value={data.komentar}
                    onChange={(e) =>
                      updateHeader(
                        "komentar",
                        e.target.value
                      )
                    }
                    rows={7}
                    className="frak06-no-print frak06-edit-value h-[125px] w-full resize-none border-0 bg-transparent p-2 outline-none"
                  />
                  <div className="frak06-print-value min-h-[125px] whitespace-pre-wrap p-2">
                    {data.komentar || "-"}
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
function CheckCell({ checked, onChange }) {
  return (
    <td className="border border-black px-2 py-2 text-center align-middle">
      <button
        type="button"
        onClick={onChange}
        className={`frak06-no-print inline-flex h-4 w-4 items-center justify-center border border-black text-[11px] font-bold leading-none ${checked ? "bg-black text-white" : "bg-white text-black"}`}
      >
        {checked ? "✓" : ""}
      </button>
      <span className="hidden print:inline">
        {checked ? "☑" : "☐"}
      </span>
    </td>
  );
}
function TukOption({ checked, label }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="text-[12px] leading-none">
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
      <div className="flex h-[65px] w-[160px] items-center justify-center text-[9px] text-slate-400">
        -
      </div>
    );
  }
  return (
    <div className="flex h-[65px] w-[160px] items-center justify-center">
      <img
        src={src}
        alt={label}
        className="max-h-[60px] max-w-[150px] object-contain"
      />
    </div>
  );
}
function normalizeResponse(payload) {
  const source = payload?.data || payload || {};
  const savedDetails =
    Array.isArray(source?.details)
      ? source.details
      : Array.isArray(source?.detail)
      ? source.detail
      : [];
  const defaults = createDefaultDetails();
  const details = defaults.map((item, index) => {
    const saved = savedDetails[index];
    if (!saved) {
      return item;
    }
    return {
      ...item,
      ...saved,
      validitas: Boolean(saved.validitas),
      reliabel: Boolean(saved.reliabel),
      fleksibel: Boolean(saved.fleksibel),
      adil: Boolean(saved.adil),
      task_skills: Boolean(saved.task_skills),
      task_management: Boolean(saved.task_management),
      contingency_management: Boolean(saved.contingency_management),
      job_role: Boolean(saved.job_role),
      transfer_skills: Boolean(saved.transfer_skills)
    };
  });
  const jadwal = source?.jadwal || {};
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
  return {
    ...EMPTY_FORM,
    ...source,
    id:
      source?.id ||
      source?.id_fr_ak06 ||
      null,
    id_jadwal:
      source?.id_jadwal ||
      Number(id_jadwalSafe(source?.jadwal?.id_jadwal)),
    id_asesor:
      source?.id_asesor ||
      asesor?.id_user ||
      null,
    exists:
      Boolean(
        source?.exists ||
        source?.id ||
        source?.id_fr_ak06
      ),
    skema,
    tuk,
    jadwal,
    asesor,
    tanggal:
      source?.tanggal ||
      source?.created_at ||
      jadwal?.tgl_awal ||
      "",
    rekomendasi_1:
      source?.rekomendasi_1 ||
      "",
    rekomendasi_2:
      source?.rekomendasi_2 ||
      "",
    komentar:
      source?.komentar ||
      "",
    ttd_asesor:
      source?.ttd_asesor ||
      asesor?.ttd_path ||
      "",
    details
  };
}
function id_jadwalSafe(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
function getTukType(data) {
  const value =
    data?.tuk?.jenis_tuk ||
    data?.tuk?.jenis ||
    data?.jadwal?.tuk?.jenis_tuk ||
    data?.jadwal?.tuk?.jenis ||
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
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