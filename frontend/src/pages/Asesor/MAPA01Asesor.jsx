import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

const jenisAsesiOptions = [
  "Hasil pelatihan dan / atau pendidikan, dimana Kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi",
  "Hasil pelatihan dan / atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang pengalaman operasionalnya mampu telusur dengan standar kompetensi",
  "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
  "Pelatihan / belajar mandiri atau otodidak."
];

const tujuanOptions = [
  { value: "sertifikasi", label: "Sertifikasi" },
  { value: "pkt", label: "Pengakuan Kompetensi Terkini (PKT)" },
  { value: "rpl", label: "Rekognisi Pembelajaran Lampau (RPL)" },
  { value: "lainnya", label: "Lainnya" }
];

const hubunganOptions = [
  { value: "bukti", label: "Bukti untuk mendukung asesmen" },
  { value: "aktivitas", label: "Aktivitas kerja di tempat kerja Asesi" },
  { value: "pembelajaran", label: "Kegiatan Pembelajaran" }
];

const pelakuAsesmenOptions = [
  { value: "lembaga_sertifikasi", label: "Lembaga Sertifikasi" },
  { value: "organisasi_pelatihan", label: "Organisasi Pelatihan" },
  { value: "asesor_perusahaan", label: "Asesor Perusahaan" }
];


const konfirmasiOptions = [
  "Manajer sertifikasi LSP",
  "Master Asesor / Master Trainer / Lead Asesor Kompetensi",
  "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar",
  "Manajer atau supervisor ditempat kerja"
];

const standarOptions = [
  {
    value: "skkni",
    label: "SKKNI / SKK / SKKI: 236 tahun 2019 tentang Penetapan Standar Kompetensi Kerja Nasional Indonesia Kategori Kesenian, Hiburan dan Rekreasi Golongan Pokok Perpustakaan, Arsip, Museum dan Kegiatan Kebudayaan Lainnya Bidang Perpustakaan"
  },
  {
    value: "kurikulum",
    label: "Kriteria asesmen dari kurikulum pelatihan"
  },
  {
    value: "industri",
    label: "Spesifikasi kinerja suatu perusahaan atau industri: SOP Penerapan IT untuk Artikel Ilmiah"
  },
  {
    value: "produk",
    label: "Spesifikasi Produk"
  },
  {
    value: "khusus",
    label: "Pedoman khusus"
  }
];

const metodeOptions = [
  {
    key: "CL",
    title: "CL",
    description: "Ceklis Observasi",
    detail: "Observasi langsung (kerja nyata / aktivitas waktu nyata di tempat kerja atau lingkungan tempat kerja yang disimulasikan)"
  },
  {
    key: "DPT",
    title: "DPT",
    description: "Daftar Pertanyaan Terstruktur",
    detail: "Kegiatan terstruktur (tanya jawab terstruktur)"
  },
  {
    key: "VPK",
    title: "VPK",
    description: "Verifikasi Pihak Ketiga",
    detail: "Wawancara pihak ketiga untuk memperoleh informasi yang mendukung bukti asesmen"
  },
  {
    key: "CVP",
    title: "CVP",
    description: "Ceklis Verifikasi Portofolio",
    detail: "Verifikasi portofolio dan bukti pendukung yang relevan dengan kompetensi"
  },
  {
    key: "CRP",
    title: "CRP",
    description: "Ceklis Review Produk",
    detail: "Review produk yang dihasilkan oleh asesi berdasarkan kriteria yang ditetapkan"
  },
  {
    key: "PW",
    title: "PW",
    description: "Pertanyaan Wawancara",
    detail: "Pertanyaan wawancara untuk memperoleh dan mengklarifikasi bukti kompetensi"
  }
];


const defaultForm = {
  jenis_asesi: "",
  tujuan_asesmen: "",
  lingkungan: "",
  peluang_bukti: "",
  hubungan_standar: [],
  siapa_melakukan_asesmen: "",
  konfirmasi_orang_relevan: "",
  standar_kompetensi: "",
  potensi_asesi: "",
  detail: [],
  modifikasi: {
    karakteristik_kandidat: "",
    kebutuhan_kontekstualisasi: "",
    saran_pelatihan: "",
    penyesuaian_perangkat: "",
    peluang_integrasi: ""
  },
  penyusun: [
    {
      id_user: "",
      nama: "",
      nomor_met: "",
      ttd: "",
      tanggal: ""
    }
  ],
  validator: [
    {
      id_user: "",
      nama: "",
      nomor_met: "",
      ttd: "",
      tanggal: ""
    }
  ]
};

export default function MAPA01Asesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapaId, setMapaId] = useState(null);
  const [peserta, setPeserta] = useState(null);
  const [jadwal, setJadwal] = useState(null);
  const [skema, setSkema] = useState(null);
  const [unitKompetensiList, setUnitKompetensiList] = useState([]);
  const [asesorList, setAsesorList] = useState([]);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchData();
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // =========================================================
    // REQUEST UTAMA
    // =========================================================
    const responses = await Promise.allSettled([
      // Peserta
      api.get(
        `/asesor/peserta/${id_peserta}`,
        config
      ),

      // Unit kompetensi berdasarkan jadwal
      api.get(
        `/asesor/fr-ia02/unit/${id_jadwal}`,
        config
      ),

      // MAPA.01 yang sudah tersimpan
      api.get(
        `/asesor/fr-mapa01`,
        {
          ...config,
          params: {
            id_jadwal,
            id_peserta
          }
        }
      ),

      // Daftar asesor
      api.get(
        `/asesor/list-asesor`,
        config
      )
    ]);

    // =========================================================
    // PESERTA
    // =========================================================
    const pesertaResponse =
      responses[0].status === "fulfilled"
        ? getResponseData(responses[0].value)
        : {};

    const pesertaData =
      pesertaResponse?.peserta ||
      pesertaResponse?.profile ||
      pesertaResponse ||
      {};

    // =========================================================
    // UNIT KOMPETENSI
    // =========================================================
    const unitResponse =
      responses[1].status === "fulfilled"
        ? getResponseData(responses[1].value)
        : [];

    const rawUnits = Array.isArray(unitResponse)
      ? unitResponse
      : (
          unitResponse?.data ||
          unitResponse?.units ||
          unitResponse?.unitKompetensi ||
          unitResponse?.unit_kompetensi ||
          []
        );

    const normalizedUnits = deduplicateUnits(
      rawUnits
        .map(normalizeUnitKompetensi)
        .filter((item) => item.id_unit)
    );

    // =========================================================
    // MAPA.01
    // =========================================================
    const mapaResponse =
      responses[2].status === "fulfilled"
        ? getResponseData(responses[2].value)
        : {};

    const mapaData =
      mapaResponse?.data ||
      mapaResponse ||
      {};

    // =========================================================
    // ASESOR
    // =========================================================
    const asesorResponse =
      responses[3].status === "fulfilled"
        ? getResponseData(responses[3].value)
        : [];

    const daftarAsesor = Array.isArray(asesorResponse)
      ? asesorResponse
      : (
          asesorResponse?.data ||
          asesorResponse?.rows ||
          asesorResponse?.asesor ||
          []
        );

    // =========================================================
    // JADWAL
    // =========================================================
    //
    // Karena /jadwal-saya/:id memang tidak tersedia,
    // ambil informasi jadwal dari response MAPA jika tersedia.
    //
    const jadwalData =
      mapaData?.jadwal ||
      mapaResponse?.jadwal ||
      pesertaData?.jadwal ||
      {
        id_jadwal
      };

    // =========================================================
    // SKEMA
    // =========================================================
    const skemaData =
      mapaData?.skema ||
      mapaResponse?.skema ||
      pesertaData?.skema ||
      {};

    // =========================================================
    // GABUNG UNIT DENGAN DATA MAPA LAMA
    // =========================================================
    const detailData =
      Array.isArray(mapaData?.detail)
        ? mapaData.detail
        : Array.isArray(mapaData?.details)
          ? mapaData.details
          : [];

    const savedDetailMap = new Map(
      detailData
        .map((item) => {
          const normalized = normalizeDetail(item);

          if (!normalized.id_unit) {
            return null;
          }

          return [
            String(normalized.id_unit),
            normalized
          ];
        })
        .filter(Boolean)
    );

    const detailFromSkema = normalizedUnits.map((unit) => ({
      ...normalizeDetail(unit),

      ...(savedDetailMap.get(
        String(unit.id_unit)
      ) || {}),

      id_unit: unit.id_unit,
      kode_unit: unit.kode_unit,
      judul_unit: unit.judul_unit,
      kelompok: unit.kelompok,

      // pastikan field metode tetap ada
      metode_observasi:
        savedDetailMap.get(String(unit.id_unit))
          ?.metode_observasi || "",

      metode_portofolio:
        savedDetailMap.get(String(unit.id_unit))
          ?.metode_portofolio || "",

      metode_tanya:
        savedDetailMap.get(String(unit.id_unit))
          ?.metode_tanya || "",

      metode_verifikasi:
        savedDetailMap.get(String(unit.id_unit))
          ?.metode_verifikasi || "",

      bukti:
        savedDetailMap.get(String(unit.id_unit))
          ?.bukti || "",

      l:
        savedDetailMap.get(String(unit.id_unit))
          ?.l || "",

      tl:
        savedDetailMap.get(String(unit.id_unit))
          ?.tl || "",

      t:
        savedDetailMap.get(String(unit.id_unit))
          ?.t || ""
    }));

    // =========================================================
    // SET STATE
    // =========================================================
    setPeserta(pesertaData);

    setJadwal(jadwalData);

    setSkema(skemaData);

    setUnitKompetensiList(normalizedUnits);

    setAsesorList(daftarAsesor);

    window.__asesorList = daftarAsesor;

    // =========================================================
    // ID MAPA
    // =========================================================
    setMapaId(
      mapaData?.id_mapa01 ||
      mapaData?.id ||
      null
    );

    // =========================================================
    // FORM
    // =========================================================
    const konfirmasiValue =
        mapaData?.konfirmasi_orang_relevan ||
        mapaData?.konfirmasi ||
        "";

        const standarValue =
        mapaData?.standar_kompetensi
            ? "skkni"
            : mapaData?.kurikulum_pelatihan
            ? "kurikulum"
            : mapaData?.spesifikasi_kinerja
                ? "industri"
                : mapaData?.spesifikasi_produk
                ? "produk"
                : mapaData?.pedoman_khusus
                    ? "khusus"
                    : "";

        const penyusunData =
        Array.isArray(mapaData?.penyusun) &&
        mapaData.penyusun.length
            ? mapaData.penyusun
            : defaultForm.penyusun;

    const validatorData =
      Array.isArray(mapaData?.validator) &&
      mapaData.validator.length
        ? mapaData.validator
        : defaultForm.validator;

    setForm({
      ...defaultForm,

      jenis_asesi:
        mapaData?.jenis_asesi || "",

      tujuan_asesmen:
        mapaData?.tujuan_asesmen || "",

      lingkungan:
        mapaData?.lingkungan || "",

      peluang_bukti:
        mapaData?.peluang_bukti || "",

      hubungan_standar:
        Array.isArray(mapaData?.hubungan_standar)
          ? mapaData.hubungan_standar
          : [],

      siapa_melakukan_asesmen:
        mapaData?.siapa_melakukan_asesmen || "",

      konfirmasi_orang_relevan:
        konfirmasiValue,

      standar_kompetensi:
        standarValue,

      potensi_asesi:
        mapaData?.potensi_asesi || "",

      detail:
        detailFromSkema,

      modifikasi: {
        karakteristik_kandidat:
            mapaData?.karakteristik_asesi ||
            mapaData?.karakteristik_kandidat ||
            "",

        kebutuhan_kontekstualisasi:
            mapaData?.kebutuhan_kontekstual ||
            mapaData?.kebutuhan_kontekstualisasi ||
            "",

        saran_pelatihan:
            mapaData?.saran_pelatihan || "",

        penyesuaian_perangkat:
            mapaData?.penyesuaian_perangkat || "",

        peluang_integrasi:
            mapaData?.peluang_integrasi || ""
        },

      penyusun:
        normalizePeople(penyusunData),

      validator:
        normalizePeople(validatorData)
    });

  } catch (error) {

    console.error(
      "❌ Fetch MAPA01 Error:",
      error
    );

    Swal.fire({
      icon: "error",
      title: "Gagal memuat MAPA.01",
      text:
        error.response?.data?.message ||
        "Data MAPA.01 gagal dimuat.",
      confirmButtonColor: "#071E3D"
    });

  } finally {

    setLoading(false);

  }
};

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateDetail = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      detail: prev.detail.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    }));
  };

  const toggleHubungan = (value) => {
    setForm((prev) => ({
      ...prev,
      hubungan_standar: prev.hubungan_standar.includes(value)
        ? prev.hubungan_standar.filter((item) => item !== value)
        : [...prev.hubungan_standar, value]
    }));
  };

  const toggleMetode = (index, key) => {
    setForm((prev) => ({
      ...prev,
      detail: prev.detail.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const metode = Array.isArray(item.metode) ? item.metode : [];
        const updated = metode.includes(key)
          ? metode.filter((item) => item !== key)
          : [...metode, key];

        return {
          ...item,
          metode: updated
        };
      })
    }));
  };

  const selectPerson = (type, index, idUser) => {
    const person = findPerson(idUser);

    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              id_user: idUser,
              nama: person?.nama_lengkap || person?.nama || "",
              nomor_met:
                person?.nomor_met ||
                person?.no_reg_asesor ||
                person?.no_reg ||
                "",
              ttd:
                person?.ttd_path ||
                person?.ttd ||
                person?.tanda_tangan ||
                "",
              tanggal: person ? getTodayDate() : ""
            }
          : item
      )
    }));
  };

  const addPerson = (type) => {
    setForm((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          id_user: "",
          nama: "",
          nomor_met: "",
          ttd: "",
          tanggal: ""
        }
      ]
    }));
  };

  const removePerson = (type, index) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const updateModifikasi = (field, value) => {
    setForm((prev) => ({
      ...prev,
      modifikasi: {
        ...prev.modifikasi,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const idSkema = Number(
        skema?.id_skema ||
        jadwal?.id_skema ||
        peserta?.id_skema ||
        0
      );

      const header = {
        id_peserta: Number(id_peserta),

        // =========================
        // PENDEKATAN
        // =========================
        jenis_asesi: form.jenis_asesi,
        tujuan_asesmen: form.tujuan_asesmen,

        // =========================
        // KONTEKS
        // =========================
        lingkungan: form.lingkungan,
        peluang_bukti: form.peluang_bukti,

        // =========================
        // HUBUNGAN STANDAR
        // =========================
        hubungan_standar: form.hubungan_standar,

        siapa_melakukan_asesmen:
            form.siapa_melakukan_asesmen,

        // =========================
        // KONFIRMASI
        // =========================
        manajer_lsp:
            form.konfirmasi_orang_relevan ===
            "Manajer sertifikasi LSP",

        master_asesor:
            form.konfirmasi_orang_relevan ===
            "Master Asesor / Master Trainer / Lead Asesor Kompetensi",

        manajer_pelatihan:
            form.konfirmasi_orang_relevan ===
            "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar",

        supervisor:
            form.konfirmasi_orang_relevan ===
            "Manajer atau supervisor ditempat kerja",

        // =========================
        // STANDAR KOMPETENSI
        // =========================
        standar_kompetensi:
            form.standar_kompetensi === "skkni",

        kurikulum_pelatihan:
            form.standar_kompetensi === "kurikulum",

        spesifikasi_kinerja:
            form.standar_kompetensi === "industri",

        spesifikasi_produk:
            form.standar_kompetensi === "produk",

        pedoman_khusus:
            form.standar_kompetensi === "khusus",

        // =========================
        // POTENSI ASESI
        // =========================
        potensi_asesi:
            form.potensi_asesi,

        // =========================
        // MODIFIKASI
        // =========================
        karakteristik_asesi:
            form.modifikasi?.karakteristik_kandidat || "",

        kebutuhan_kontekstual:
            form.modifikasi?.kebutuhan_kontekstualisasi || "",

        saran_pelatihan:
            form.modifikasi?.saran_pelatihan || "",

        penyesuaian_perangkat:
            form.modifikasi?.penyesuaian_perangkat || "",

        peluang_integrasi:
            form.modifikasi?.peluang_integrasi || ""
        };

      const detail = form.detail
        .filter((item) => item?.id_unit)
        .map((item) => {
            const metode = Array.isArray(item.metode)
            ? item.metode
            : [];

            return {
            id_unit: Number(item.id_unit),

            bukti: item.bukti || "",

            l: Boolean(item.l),
            tl: Boolean(item.t),

            // =========================
            // METODE ASESMEN
            // =========================

            metode_observasi:
                metode.includes("CL")
                ? "CL"
                : null,

            metode_portofolio:
                metode.includes("CVP")
                ? "CVP"
                : null,

            metode_tanya:
                metode.includes("DPT")
                ? "DPT"
                : metode.includes("PW")
                    ? "PW"
                    : null,

            metode_verifikasi:
                metode.includes("VPK")
                ? "VPK"
                : metode.includes("CRP")
                    ? "CRP"
                    : null
            };
        });

      const payload = {
        id_jadwal: Number(id_jadwal),
        id_skema: idSkema,
        header,
        detail
      };

      let response;

      if (mapaId) {
        response = await api.put(
          `/asesor/fr-mapa01/${mapaId}`,
          payload
        );
      } else {
        response = await api.post(
          "/asesor/fr-mapa01",
          payload
        );

        setMapaId(
          response.data?.data?.id_mapa01 ||
          response.data?.id_mapa01 ||
          null
        );
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          response.data?.message ||
          "MAPA.01 berhasil disimpan.",
        confirmButtonColor: "#071E3D"
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text:
          error.response?.data?.message ||
          "MAPA.01 gagal disimpan.",
        confirmButtonColor: "#071E3D"
      });
    } finally {
      setSaving(false);
    }
  };

  const namaAsesi =
    peserta?.nama_lengkap ||
    peserta?.nama ||
    peserta?.nama_asesi ||
    "-";

  const profilAsesi =
    peserta?.profil_asesi ||
    peserta?.profil ||
    namaAsesi;

  const judulSkema =
    skema?.judul_skema ||
    skema?.nama_skema ||
    skema?.judul ||
    skema?.nama ||
    jadwal?.judul_skema ||
    jadwal?.nama_skema ||
    "-";

  const nomorSkema =
    skema?.nomor_skema ||
    skema?.kode_skema ||
    skema?.nomor ||
    skema?.kode ||
    jadwal?.nomor_skema ||
    jadwal?.kode_skema ||
    "-";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-5 font-bold text-[#071E3D] shadow">
          <Loader2 size={20} className="animate-spin" />
          Memuat MAPA.01...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <style>{`
        @page { size: A4 portrait; margin: 7mm; }
        * { box-sizing: border-box; }
        .mapa-page { width: 194mm; min-height: 279mm; }
        .mapa-table { width: 100%; border-collapse: collapse; }
        .mapa-table th, .mapa-table td { border: 1px solid #000; }
        input[type="checkbox"] { accent-color: #087CF5; }
        input[type="radio"] { accent-color: #087CF5; }
        @media print {
          body { background: white !important; }
          .print-hide { display: none !important; }
          .mapa-page { margin: 0 !important; box-shadow: none !important; break-after: page; }
          .mapa-page:last-child { break-after: auto; }
          select { appearance: none; }
          textarea { resize: none; }
        }
      `}</style>

      <div className="print-hide mx-auto mb-5 flex w-[210mm] justify-between">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/asesor/jadwal-saya/${id_jadwal}/peserta/${id_peserta}`
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#071E3D]"
        >
          <ArrowLeft size={17} />
          Kembali
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#071E3D]"
          >
            <Download size={17} />
            Cetak / PDF
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Menyimpan..." : "Simpan MAPA.01"}
          </button>
        </div>
      </div>

      <div className="mx-auto w-[210mm]">
        <section className="mapa-page bg-white px-[7mm] py-[6mm] shadow-md">
          <h1 className="mb-4 text-center text-[13px] font-black">
            FR.MAPA.01. MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN
          </h1>

          <table className="mapa-table mb-3 text-[9px]">
            <tbody>
              <tr>
                <td
                  rowSpan="2"
                  className="w-[43mm] p-2 align-middle font-bold"
                >
                  Skema Sertifikasi
                  <br />
                  (KKNI/Okupasi/Klaster)
                </td>
                <td className="w-[20mm] p-2 font-bold">Judul</td>
                <td className="w-[7mm] p-2 text-center">:</td>
                <td className="p-2 font-semibold">{judulSkema}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">Nomor</td>
                <td className="p-2 text-center">:</td>
                <td className="p-2 font-semibold">{nomorSkema}</td>
              </tr>
            </tbody>
          </table>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="border border-slate-300 px-4 py-3">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Profil Asesi
              </div>
              <div className="text-[12px] font-bold text-[#071E3D]">
                {profilAsesi}
              </div>
            </div>

            <div className="border border-slate-300 px-4 py-3">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Potensi Asesi
              </div>
              <input
                type="text"
                value={form.potensi_asesi}
                onChange={(e) =>
                  updateField("potensi_asesi", e.target.value)
                }
                className="w-full border-0 bg-transparent p-0 text-[12px] font-bold text-[#071E3D] outline-none"
                placeholder="Potensi asesi"
              />
            </div>
          </div>

          <SectionTitle>
            1. Menentukan Pendekatan Asesmen
          </SectionTitle>

          <table className="mapa-table text-[8px]">
            <tbody>
              <tr>
                <td className="w-[25mm] p-2 text-center font-bold">
                  Asesi
                </td>
                <td className="p-0">
                  {jenisAsesiOptions.map((item) => (
                    <CheckLine
                      key={item}
                      checked={form.jenis_asesi === item}
                      onChange={() =>
                        updateField("jenis_asesi", item)
                      }
                      text={item}
                    />
                  ))}
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  Tujuan
                  <br />
                  Asesmen
                </td>
                <td className="p-0">
                  {tujuanOptions.map((item) => (
                    <CheckLine
                      key={item.value}
                      checked={form.tujuan_asesmen === item.value}
                      onChange={() =>
                        updateField("tujuan_asesmen", item.value)
                      }
                      text={item.label}
                    />
                  ))}
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center align-middle font-bold">
                  Konteks
                  <br />
                  Asesmen
                </td>

                <td className="p-0">
                  <table className="mapa-table">
                    <tbody>
                      <tr>
                        <td className="w-[40mm] p-2 text-[11px] font-bold">
                          Lingkungan
                        </td>
                        <td className="w-[10mm] p-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              form.lingkungan ===
                              "tempat_kerja_nyata"
                            }
                            onChange={() =>
                              updateField(
                                "lingkungan",
                                "tempat_kerja_nyata"
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          Tempat kerja nyata
                        </td>
                        <td className="w-[10mm] p-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              form.lingkungan ===
                              "tempat_kerja_simulasi"
                            }
                            onChange={() =>
                              updateField(
                                "lingkungan",
                                "tempat_kerja_simulasi"
                              )
                            }
                          />
                        </td>
                        <td className="p-2">
                          Tempat kerja simulasi
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2 text-[11px] font-bold">
                          Peluang untuk mengumpulkan bukti dalam sejumlah situasi
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              form.peluang_bukti === "tersedia"
                            }
                            onChange={() =>
                              updateField(
                                "peluang_bukti",
                                "tersedia"
                              )
                            }
                          />
                        </td>
                        <td className="p-2">Tersedia</td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              form.peluang_bukti === "terbatas"
                            }
                            onChange={() =>
                              updateField(
                                "peluang_bukti",
                                "terbatas"
                              )
                            }
                          />
                        </td>
                        <td className="p-2">Terbatas</td>
                      </tr>

                      <tr>
                        <td className="p-2 text-[11px] font-bold">
                          Hubungan antara standar kompetensi dan:
                        </td>
                        <td colSpan="4" className="p-0">
                          {hubunganOptions.map((item) => (
                            <div
                              key={item.value}
                              className="grid grid-cols-[10mm_1fr] border-b border-black last:border-b-0"
                            >
                              <div className="flex items-center justify-center p-1">
                                <input
                                  type="checkbox"
                                  checked={form.hubungan_standar.includes(
                                    item.value
                                  )}
                                  onChange={() =>
                                    toggleHubungan(item.value)
                                  }
                                />
                              </div>
                              <div className="p-1.5">
                                {item.label}
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2 text-[11px] font-bold">
                          Siapa yang melakukan asesmen
                        </td>
                        <td colSpan="4" className="p-0">
                          {pelakuAsesmenOptions.map((item) => (
                            <div
                              key={item.value}
                              className="grid grid-cols-[10mm_1fr] border-b border-black last:border-b-0"
                            >
                              <div className="flex items-center justify-center p-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    form.siapa_melakukan_asesmen ===
                                    item.value
                                  }
                                  onChange={() =>
                                    updateField(
                                      "siapa_melakukan_asesmen",
                                      item.value
                                    )
                                  }
                                />
                              </div>
                              <div className="p-1.5">
                                {item.label}
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2 text-[11px] font-bold">
                          Konfirmasi dengan orang yang relevan
                        </td>
                        <td colSpan="4" className="p-0">
                          {konfirmasiOptions.map((item) => (
                            <label
                              key={item}
                              className="grid cursor-pointer grid-cols-[10mm_1fr] border-b border-black last:border-b-0"
                            >
                              <span className="flex items-center justify-center p-1">
                                <input
                                  type="checkbox"
                                  checked={form.konfirmasi_orang_relevan === item}
                                  onChange={() =>
                                    updateField(
                                      "konfirmasi_orang_relevan",
                                      form.konfirmasi_orang_relevan === item ? "" : item
                                    )
                                  }
                                />
                              </span>
                              <span className="p-1.5">{item}</span>
                            </label>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  1.2.
                  <br />
                  Standar Industri
                  <br />
                  atau Tempat Kerja
                </td>

                <td className="p-0">
                  {standarOptions.map((item) => (
                    <div
                      key={item.value}
                      className="grid grid-cols-[10mm_1fr] border-b border-black last:border-b-0"
                    >
                      <div className="flex items-center justify-center p-2">
                        <input
                          type="checkbox"
                          checked={
                            form.standar_kompetensi === item.value
                          }
                          onChange={() =>
                            updateField(
                              "standar_kompetensi",
                              item.value
                            )
                          }
                        />
                      </div>

                      <div className="p-2">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mapa-page mt-5 bg-white px-[7mm] py-[6mm] shadow-md">
          <SectionTitle>
            2. Mempersiapkan Rencana Asesmen
          </SectionTitle>
          <table className="mapa-table mb-4 text-[8px]">
            <thead>
              <tr>
                <th className="w-[72mm] p-2">Kelompok Pekerjaan</th>
                <th className="w-[12mm] p-2">No.</th>
                <th className="w-[45mm] p-2">Kode Unit</th>
                <th className="p-2">Judul Unit</th>
              </tr>
            </thead>
            <tbody>
              {renderUnitSummaryRows(form.detail)}
            </tbody>
          </table>
          <div className="w-full overflow-hidden">
            <table className="mapa-table w-full table-fixed text-[6px]">
              <thead>
                <tr>
                  <th rowSpan="2" className="w-[28mm] p-2 align-middle text-center">
                    Unit
                    <br />
                    Kompetensi
                  </th>
                  <th rowSpan="2" className="w-[43mm] p-2 align-middle text-center leading-tight">
                    Bukti-Bukti
                    <br />
                    (Kinerja, Produk,
                    <br />
                    Portofolio, dan atau
                    <br />
                    Pengetahuan) diidentifikasi
                    <br />
                    berdasarkan Kriteria
                    <br />
                    Unjuk Kerja dan
                    <br />
                    Pendekatan Asesmen.
                  </th>
                  <th colSpan="3" className="w-[21mm] p-2 text-center">
                    Jenis Bukti
                  </th>
                  <th colSpan="6" className="p-2 text-center leading-tight">
                    <div className="text-[7px] font-bold">
                      Metode dan Perangkat Asesmen
                    </div>
                    <div className="mt-1 text-[5.5px] font-normal leading-tight">
                      CL (Ceklis Observasi), DIT (Daftar Instruksi Terstruktur),
                      <br />
                      DPL (Daftar Pertanyaan Lisan), DPT (Daftar Pertanyaan Tertulis),
                      <br />
                      VPK (Verifikasi Pihak Ketiga), CVP (Ceklis Verifikasi Portofolio),
                      <br />
                      CRP (Ceklis Reviu Produk), PW (Pertanyaan Wawancara)
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className="w-[7mm] p-1 text-center">L</th>
                  <th className="w-[7mm] p-1 text-center">TL</th>
                  <th className="w-[7mm] p-1 text-center">T</th>
                  {metodeOptions.map((item) => (
                    <th key={item.key} className="h-[48mm] w-[15mm] p-1 align-middle text-center">
                      <div className="mx-auto flex h-[45mm] items-center justify-center">
                        <div className="rotate-180 [writing-mode:vertical-rl] text-[6px] font-normal leading-tight">
                          <strong>{item.title}</strong>
                          {" — "}
                          {item.detail}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.detail.length > 0 ? (
                  form.detail.map((item, index) => (
                    <tr key={`${item.id_unit}-detail-${index}`} className="h-[34mm]">
                      <td className="p-2 align-top font-bold leading-tight">
                        {index + 1}. {item.judul_unit || "-"}
                        <div className="mt-1 font-normal">{item.kode_unit || ""}</div>
                      </td>

                      <td className="p-1 align-top">
                        <textarea
                          value={item.bukti || ""}
                          onChange={(e) => updateDetail(index, "bukti", e.target.value)}
                          className="h-[32mm] w-full resize-none bg-transparent p-1 text-[7px] leading-tight outline-none"
                          placeholder="Hasil observasi langsung dan tanya jawab tentang unit kompetensi"
                        />
                      </td>

                      <td className="p-1 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={Boolean(item.l)}
                          onChange={(e) =>
                            updateDetail(index, "l", e.target.checked)
                          }
                        />
                      </td>

                      <td className="p-1 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={Boolean(item.tl)}
                          onChange={(e) =>
                            updateDetail(index, "tl", e.target.checked)
                          }
                        />
                      </td>

                      <td className="p-1 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={Boolean(item.t)}
                          onChange={(e) =>
                            updateDetail(index, "t", e.target.checked)
                          }
                        />
                      </td>

                      {metodeOptions.map((metode) => (
                        <td
                          key={metode.key}
                          className="p-1 text-center align-middle"
                        >
                          <input
                            type="checkbox"
                            checked={item.metode?.includes(metode.key)}
                            onChange={() =>
                              toggleMetode(index, metode.key)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="p-6 text-center text-[8px] text-slate-500"
                    >
                      Unit Kompetensi belum tersedia pada skema ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mapa-page mt-5 bg-white px-[7mm] py-[6mm] shadow-md">
          <SectionTitle>
            3. Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi:
          </SectionTitle>

          <table className="mapa-table text-[8px]">
            <tbody>
              <tr>
                <td
                  rowSpan="2"
                  className="w-[13mm] p-2 text-center align-middle font-bold"
                >
                  3.1.
                </td>

                <td className="w-[7mm] p-2 text-center font-bold">
                  a.
                </td>

                <td className="w-[58mm] p-2 font-semibold">
                  Karakteristik Kandidat
                </td>

                <td className="p-1">
                  <textarea
                    value={
                      form.modifikasi
                        .karakteristik_kandidat
                    }
                    onChange={(e) =>
                      updateModifikasi(
                        "karakteristik_kandidat",
                        e.target.value
                      )
                    }
                    className="min-h-[45px] w-full resize-none bg-transparent p-1 outline-none"
                    placeholder="Ada / tidak ada karakteristik khusus Kandidat. Jika Ada, tuliskan"
                  />
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  b.
                </td>

                <td className="p-2 font-semibold">
                  Kebutuhan kontekstualisasi terkait tempat kerja
                </td>

                <td className="p-1">
                  <textarea
                    value={
                      form.modifikasi
                        .kebutuhan_kontekstualisasi
                    }
                    onChange={(e) =>
                      updateModifikasi(
                        "kebutuhan_kontekstualisasi",
                        e.target.value
                      )
                    }
                    className="min-h-[45px] w-full resize-none bg-transparent p-1 outline-none"
                    placeholder="Ada / tidak ada kebutuhan kontekstualisasi. Jika Ada, tuliskan"
                  />
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  3.2.
                </td>

                <td
                  colSpan="2"
                  className="p-2 font-semibold"
                >
                  Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan
                </td>

                <td className="p-1">
                  <textarea
                    value={
                      form.modifikasi.saran_pelatihan
                    }
                    onChange={(e) =>
                      updateModifikasi(
                        "saran_pelatihan",
                        e.target.value
                      )
                    }
                    className="min-h-[45px] w-full resize-none bg-transparent p-1 outline-none"
                    placeholder="Ada / tidak ada saran. Jika Ada, tuliskan"
                  />
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  3.3.
                </td>

                <td
                  colSpan="2"
                  className="p-2 font-semibold"
                >
                  Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi
                </td>

                <td className="p-1">
                  <textarea
                    value={
                      form.modifikasi
                        .penyesuaian_perangkat
                    }
                    onChange={(e) =>
                      updateModifikasi(
                        "penyesuaian_perangkat",
                        e.target.value
                      )
                    }
                    className="min-h-[45px] w-full resize-none bg-transparent p-1 outline-none"
                    placeholder="Ada / tidak ada penyesuaian perangkat. Jika Ada, tuliskan"
                  />
                </td>
              </tr>

              <tr>
                <td className="p-2 text-center font-bold">
                  3.4.
                </td>

                <td
                  colSpan="2"
                  className="p-2 font-semibold"
                >
                  Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan untuk alat
                </td>

                <td className="p-1">
                  <textarea
                    value={
                      form.modifikasi.peluang_integrasi
                    }
                    onChange={(e) =>
                      updateModifikasi(
                        "peluang_integrasi",
                        e.target.value
                      )
                    }
                    className="min-h-[45px] w-full resize-none bg-transparent p-1 outline-none"
                    placeholder="Ada / tidak ada peluang. Jika Ada, tuliskan"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-2 text-[7px] italic">
            *Coret yang tidak perlu
          </div>

          <h3 className="mb-2 mt-7 text-[10px] font-bold text-[#071E3D]">
            PENYUSUN DAN VALIDATOR
          </h3>

          <table className="mapa-table text-[8px]">
            <thead>
              <tr>
                <th className="w-[24mm] p-2">
                  STATUS
                </th>

                <th className="w-[12mm] p-2">
                  NO
                </th>

                <th className="p-2">
                  NAMA
                </th>

                <th className="w-[38mm] p-2">
                  NOMOR MET
                </th>

                <th className="w-[65mm] p-2">
                  TANDA TANGAN DAN TANGGAL
                </th>

                <th className="print-hide w-[14mm] p-2">
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {form.penyusun.map((item, index) => (
                <PersonRow
                  key={`penyusun-${index}`}
                  type="Penyusun"
                  index={index}
                  item={item}
                  options={asesorList}
                  onSelect={selectPerson}
                  onRemove={removePerson}
                />
              ))}

              {form.validator.map((item, index) => (
                <PersonRow
                  key={`validator-${index}`}
                  type="Validator"
                  index={index}
                  item={item}
                  options={asesorList}
                  onSelect={selectPerson}
                  onRemove={removePerson}
                />
              ))}
            </tbody>
          </table>

          <div className="print-hide mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => addPerson("penyusun")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-[9px] font-bold text-white"
            >
              <Plus size={14} />
              Tambah Penyusun
            </button>

            <button
              type="button"
              onClick={() => addPerson("validator")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-[9px] font-bold text-white"
            >
              <Plus size={14} />
              Tambah Validator
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="mb-2 border border-black bg-slate-50 px-3 py-2 text-[10px] font-black">
      {children}
    </div>
  );
}

function CheckLine({ checked, onChange, text }) {
  return (
    <label className="grid cursor-pointer grid-cols-[10mm_1fr] border-b border-black last:border-b-0">
      <span className="flex items-center justify-center border-r border-black p-1">
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={onChange}
        />
      </span>

      <span className="p-1.5">
        {text}
      </span>
    </label>
  );
}

function PersonRow({
  type,
  index,
  item,
  options,
  onSelect,
  onRemove
}) {
  return (
    <tr>
      <td className="p-2 text-center font-semibold">
        {type}
      </td>

      <td className="p-2 text-center">
        {index + 1}
      </td>

      <td className="p-1">
        <select
          value={item.id_user || ""}
          onChange={(e) =>
            onSelect(
              type.toLowerCase(),
              index,
              e.target.value
            )
          }
          className="w-full bg-transparent p-2 outline-none"
        >
          <option value="">
            Pilih {type.toLowerCase()}
          </option>

          {options.map((person, personIndex) => (
            <option
              key={
                person.id_user ||
                person.id_asesor ||
                personIndex
              }
              value={
                person.id_user ||
                person.id_asesor ||
                ""
              }
            >
              {person.nama_lengkap ||
                person.nama ||
                "-"}
            </option>
          ))}
        </select>
      </td>

      <td className="p-2">
        {item.nomor_met || "-"}
      </td>

      <td className="p-1">
        <div className="flex min-h-[65px] items-center justify-between gap-3">
          <div className="flex flex-1 justify-center">
            {item.ttd ? (
              <img
                src={normalizeImageUrl(item.ttd)}
                alt="TTD"
                className="h-[50px] max-w-[130px] object-contain"
              />
            ) : (
              <span className="text-[7px] text-slate-400">
                TTD belum tersedia
              </span>
            )}
          </div>

          <span className="text-[8px]">
            {formatTanggal(item.tanggal)}
          </span>
        </div>
      </td>

      <td className="print-hide p-1 text-center">
        <button
          type="button"
          onClick={() =>
            onRemove(type.toLowerCase(), index)
          }
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function extractUnitKompetensi(source) {
  if (!source || typeof source !== "object") {
    return [];
  }

  const result = [];

  const pushArray = (value) => {
    if (Array.isArray(value) && value.length > 0) {
      result.push(...value);
    }
  };

  pushArray(source.unitKompetensiList);
  pushArray(source.unitKompetensi);
  pushArray(source.units);
  pushArray(source.unit_kompetensi);
  pushArray(source.UnitKompetensi);
  pushArray(source.skemaUnit);
  pushArray(source.skema_unit);
  pushArray(source.SkemaUnit);

  if (Array.isArray(source.kelompokPekerjaan)) {
    source.kelompokPekerjaan.forEach((group) => {
      const groupUnits =
        group?.unitKompetensi ||
        group?.unitKompetensiList ||
        group?.units ||
        group?.unit_kompetensi ||
        group?.SkemaUnit ||
        group?.skemaUnit ||
        [];

      if (Array.isArray(groupUnits)) {
        groupUnits.forEach((item) => {
          result.push({
            ...item,
            kelompok:
              item?.kelompok ||
              item?.KelompokPekerjaan ||
              group
          });
        });
      }
    });
  }

  if (Array.isArray(source.kelompok_pekerjaan)) {
    source.kelompok_pekerjaan.forEach((group) => {
      const groupUnits =
        group?.unitKompetensi ||
        group?.unitKompetensiList ||
        group?.units ||
        group?.unit_kompetensi ||
        group?.SkemaUnit ||
        group?.skemaUnit ||
        [];

      if (Array.isArray(groupUnits)) {
        groupUnits.forEach((item) => {
          result.push({
            ...item,
            kelompok:
              item?.kelompok ||
              item?.KelompokPekerjaan ||
              group
          });
        });
      }
    });
  }

  return result;
}

function normalizeUnitKompetensi(item) {
  const unit =
    item?.unit ||
    item?.UnitKompetensi ||
    item?.unitKompetensi ||
    item ||
    {};

  const pivot =
    item?.SkemaUnit ||
    item?.skemaUnit ||
    item?.skema_unit ||
    item?.pivot ||
    {};

  const kelompok =
    item?.kelompok ||
    item?.KelompokPekerjaan ||
    pivot?.kelompok ||
    pivot?.KelompokPekerjaan ||
    {};

  return {
    id_unit:
      unit?.id_unit ||
      item?.id_unit ||
      pivot?.id_unit ||
      "",

    kode_unit:
      unit?.kode_unit ||
      unit?.kode ||
      unit?.kode_unit_kompetensi ||
      item?.kode_unit ||
      item?.kode ||
      "",

    judul_unit:
      unit?.judul_unit ||
      unit?.nama_unit ||
      unit?.judul ||
      unit?.nama ||
      item?.judul_unit ||
      item?.nama_unit ||
      item?.judul ||
      item?.nama ||
      "",

    kelompok:
      kelompok?.nama_kelompok ||
      kelompok?.nama_kelompok_pekerjaan ||
      kelompok?.nama ||
      kelompok?.judul ||
      item?.nama_kelompok ||
      item?.nama_kelompok_pekerjaan ||
      item?.kelompok_pekerjaan ||
      "Kelompok Pekerjaan 1",

    urutan:
      pivot?.urutan ||
      item?.urutan ||
      unit?.urutan ||
      999999
  };
}

function deduplicateUnits(units) {
  const map = new Map();

  units
    .sort((a, b) => {
      const groupCompare = String(a.kelompok || "").localeCompare(
        String(b.kelompok || ""),
        "id"
      );

      if (groupCompare !== 0) {
        return groupCompare;
      }

      return Number(a.urutan || 999999) - Number(b.urutan || 999999);
    })
    .forEach((unit) => {
      const key = String(unit.id_unit);

      if (!map.has(key)) {
        map.set(key, unit);
      }
    });

  return Array.from(map.values());
}

function getKelompokName(item) {
  return (
    item?.kelompok ||
    item?.nama_kelompok ||
    item?.nama_kelompok_pekerjaan ||
    "Kelompok Pekerjaan 1"
  );
}

function renderUnitSummaryRows(details) {
  if (!Array.isArray(details) || details.length === 0) {
    return (
      <tr>
        <td
          colSpan="4"
          className="p-4 text-center text-[8px] text-slate-500"
        >
          Unit Kompetensi belum tersedia pada skema ini.
        </td>
      </tr>
    );
  }

  const groups = [];

  details.forEach((item, index) => {
    const groupName = getKelompokName(item);
    let group = groups.find(
      (itemGroup) => itemGroup.name === groupName
    );

    if (!group) {
      group = {
        name: groupName,
        items: []
      };
      groups.push(group);
    }

    group.items.push({
      item,
      originalIndex: index
    });
  });

  let nomor = 0;

  return groups.flatMap((group) =>
    group.items.map(({ item }) => {
      nomor += 1;

      return (
        <tr key={`${item.id_unit || "unit"}-${nomor}`}>
          {group.items[0].item === item && (
            <td
              rowSpan={group.items.length}
              className="p-2 text-center align-middle font-medium"
            >
              {group.name}
            </td>
          )}

          <td className="p-2 text-center">{nomor}</td>
          <td className="p-2">{item.kode_unit || "-"}</td>
          <td className="p-2">{item.judul_unit || "-"}</td>
        </tr>
      );
    })
  );
}

function normalizeDetail(item) {
  const metode = [];

  if (
    item?.metode_observasi === true ||
    item?.metode_observasi === 1 ||
    item?.metode_observasi === "1"
  ) {
    metode.push("CL");
  }

  if (
  item?.metode_portofolio === true ||
  item?.metode_portofolio === 1 ||
  item?.metode_portofolio === "1"
    ) {
    metode.push("CVP");
    } else if (
    typeof item?.metode_portofolio === "string" &&
    item.metode_portofolio
    ) {
    metode.push(
        item.metode_portofolio === "CVP"
        ? "CVP"
        : item.metode_portofolio
    );
    }

  if (
    item?.metode_tanya === true ||
    item?.metode_tanya === 1 ||
    item?.metode_tanya === "1"
  ) {
    metode.push("DPT");
  }

  if (
    item?.metode_verifikasi === true ||
    item?.metode_verifikasi === 1 ||
    item?.metode_verifikasi === "1"
  ) {
    metode.push("VPK");
  }

  if (Array.isArray(item?.metode)) {
    item.metode.forEach((value) => {
      if (!metode.includes(value)) {
        metode.push(value);
      }
    });
  }

  const unit =
    item?.unit ||
    item?.UnitKompetensi ||
    {};

  const kelompok =
    item?.kelompok ||
    item?.KelompokPekerjaan ||
    item?.skemaUnit?.kelompok ||
    item?.SkemaUnit?.kelompok ||
    unit?.kelompok ||
    "";

  return {
    id_unit:
      item?.id_unit ||
      unit?.id_unit ||
      "",

    kode_unit:
      item?.kode_unit ||
      unit?.kode_unit ||
      unit?.kode ||
      "",

    judul_unit:
      item?.judul_unit ||
      unit?.judul_unit ||
      unit?.nama_unit ||
      unit?.judul ||
      unit?.nama ||
      "",

    bukti: item?.bukti || "",

    l:
      Boolean(item?.l),

    tl:
      Boolean(item?.tl),

    t:
      Boolean(item?.t),

    metode,

    metode_observasi: Boolean(item?.metode_observasi),
    metode_portofolio: Boolean(item?.metode_portofolio),
    metode_tanya: Boolean(item?.metode_tanya),
    metode_verifikasi: Boolean(item?.metode_verifikasi),

    kelompok
  };
}

function normalizePeople(data) {
  if (!Array.isArray(data) || !data.length) {
    return [
      {
        id_user: "",
        nama: "",
        nomor_met: "",
        ttd: "",
        tanggal: ""
      }
    ];
  }

  return data.map((item) => ({
    id_user:
      item?.id_user ||
      item?.id_asesor ||
      "",

    nama:
      item?.nama ||
      item?.nama_lengkap ||
      "",

    nomor_met:
      item?.nomor_met ||
      item?.no_reg_asesor ||
      item?.no_reg ||
      "",

    ttd:
      item?.ttd ||
      item?.ttd_path ||
      item?.tanda_tangan ||
      "",

    tanggal:
      item?.tanggal ||
      ""
  }));
}

function findPerson(idUser) {
  return window.__asesorList?.find(
    (item) =>
      String(item?.id_user || item?.id_asesor) ===
      String(idUser)
  );
}

function normalizeImageUrl(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.startsWith("data:image") ||
    stringValue.startsWith("http://") ||
    stringValue.startsWith("https://")
  ) {
    return stringValue;
  }

  const baseURL = api.defaults?.baseURL || "";
  const rootBase = baseURL.replace(/\/api\/?$/, "");

  if (stringValue.startsWith("/")) {
    return `${rootBase}${stringValue}`;
  }

  return `${rootBase}/${stringValue}`;
}

function getResponseData(response) {
  return (
    response?.data?.data ||
    response?.data ||
    {}
  );
}

function getTodayDate() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatTanggal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}