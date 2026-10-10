
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../services/api";

const PANDUAN_ASESOR = [
  "Formulir ini diisi oleh asesor kompetensi dapat sebelum, pada saat atau setelah melakukan asesmen dengan metode observasi demonstrasi.",
  "Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi, batasan variabel dan aspek kritis yang relevan dengan skenario tugas dan praktik demonstrasi.",
  "Jika pertanyaan disampaikan sebelum asesi melakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan dan perlengkapan.",
  "Jika setelah asesi melakukan praktik demonstrasi terdapat item pertanyaan pendukung observasi telah terpenuhi, maka pertanyaan tersebut tidak perlu ditanyakan lagi dan cukup memberi catatan bahwa sudah terpenuhi pada saat tugas praktik demonstrasi pada kolom tanggapan.",
  "Jika pada saat observasi ada hal yang perlu dikonfirmasi sedangkan di instrumen daftar pertanyaan pendukung observasi tidak ada, maka asesor dapat memberikan pertanyaan dengan syarat pertanyaan harus berkaitan dengan tugas praktik demonstrasi. Jika dilakukan, asesor harus mencatat dalam instrumen pertanyaan pendukung observasi.",
  "Tanggapan asesi ditulis pada kolom tanggapan.",
];

const getToday = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const readStoredObject = (key) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const readStoredString = (key) => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const createAsesorRow = (item = {}) => {
  const asesor = item?.asesor || item;

  return {
    id_asesor: item?.id_asesor || asesor?.id_user || "",
    nama_lengkap:
      item?.nama_lengkap ||
      asesor?.nama_lengkap ||
      asesor?.nama ||
      "",
    no_reg_asesor:
      item?.no_reg_asesor ||
      asesor?.no_reg_asesor ||
      asesor?.no_lisensi ||
      asesor?.nomor_met ||
      item?.no_reg ||
      "",
    ttd_path:
      item?.ttd_path ||
      asesor?.ttd_path ||
      asesor?.tanda_tangan ||
      asesor?.ttd ||
      "",
    tanggal: item?.tanggal || asesor?.tanggal || "",
  };
};

const getImageUrl = (value) => {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(String(value))) {
    return String(value);
  }

  const base = String(import.meta.env.VITE_API_BASE || "").replace(/\/api\/?$/, "");
  const path = String(value).replace(/^\/+/, "");

  return base ? `${base}/${path}` : `/${path}`;
};

export default function FRIA03Komite() {
  const { id_skema, idSkema, id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const skemaId = id_skema || idSkema || id;

  const completionStorageKey = useMemo(
    () => `fria03-terpenuhi-${skemaId}`,
    [skemaId]
  );

  const feedbackStorageKey = useMemo(
    () => `fria03-umpan-balik-${skemaId}`,
    [skemaId]
  );

  const headerStorageKey = useMemo(
    () => `fria03-header-${skemaId}`,
    [skemaId]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingValidation, setSavingValidation] = useState(false);
  const [data, setData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [asesorList, setAsesorList] = useState([]);
  const [penyusun, setPenyusun] = useState([createAsesorRow()]);
  const [validator, setValidator] = useState([createAsesorRow()]);
  const [showModal, setShowModal] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState(null);

  const [form, setForm] = useState({
    id_unit: "",
    pertanyaan: "",
    urutan: "",
  });

  const [terpenuhiMap, setTerpenuhiMap] = useState(() =>
    readStoredObject(`fria03-terpenuhi-${skemaId}`)
  );

  const [umpanBalikAsesi, setUmpanBalikAsesi] = useState(() =>
    readStoredString(`fria03-umpan-balik-${skemaId}`)
  );

  const [header, setHeader] = useState(() => ({
    tuk: "Tempat Kerja",
    nama_asesor: "",
    nama_asesi: "",
    tanggal: getToday(),
    ...readStoredObject(`fria03-header-${skemaId}`),
  }));

  useEffect(() => {
    setTerpenuhiMap(readStoredObject(completionStorageKey));
    setUmpanBalikAsesi(readStoredString(feedbackStorageKey));

    setHeader({
      tuk: "Tempat Kerja",
      nama_asesor: "",
      nama_asesi: "",
      tanggal: getToday(),
      ...readStoredObject(headerStorageKey),
    });

    fetchData();
  }, [
    skemaId,
    completionStorageKey,
    feedbackStorageKey,
    headerStorageKey,
  ]);

  const handleTerpenuhiChange = (questionKey, checked) => {
    setTerpenuhiMap((prev) => {
      const next = {
        ...prev,
        [questionKey]: checked,
      };

      try {
        localStorage.setItem(completionStorageKey, JSON.stringify(next));
      } catch (error) {
        console.error("SAVE FR.IA.03 COMPLETION ERROR:", error);
      }

      return next;
    });
  };

  const handleUmpanBalikChange = (value) => {
    setUmpanBalikAsesi(value);

    try {
      localStorage.setItem(feedbackStorageKey, value);
    } catch (error) {
      console.error("SAVE FR.IA.03 FEEDBACK ERROR:", error);
    }
  };

  const handleHeaderChange = (field, value) => {
    setHeader((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      try {
        localStorage.setItem(headerStorageKey, JSON.stringify(next));
      } catch (error) {
        console.error("SAVE FR.IA.03 HEADER ERROR:", error);
      }

      return next;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!skemaId) {
        throw new Error("ID Skema tidak ditemukan di URL.");
      }

      const [fria03Res, asesorRes] = await Promise.all([
        api.get(`/asesor/skema/${skemaId}/fr-ia03`),
        api.get("/asesor/list-asesor"),
      ]);

      const payload = fria03Res.data?.data || fria03Res.data || {};
      const master = payload?.master || null;
      const units = Array.isArray(payload?.units) ? payload.units : [];
      const asesorData = asesorRes.data?.data ?? asesorRes.data;
      const asesors = Array.isArray(asesorData) ? asesorData : [];
      const masterValidators = Array.isArray(master?.validator)
        ? master.validator
        : [];

      const mappedPenyusun = masterValidators
        .filter((item) => item?.peran === "penyusun")
        .map(createAsesorRow);

      const mappedValidator = masterValidators
        .filter((item) => item?.peran === "validator")
        .map(createAsesorRow);

      if (!mappedPenyusun.length && master?.id_asesor) {
        const selected = asesors.find(
          (item) => String(item?.id_user) === String(master.id_asesor)
        );

        if (selected) {
          mappedPenyusun.push(
            createAsesorRow({
              ...selected,
              tanggal: master?.tanggal || getToday(),
            })
          );
        }
      }

      const storedHeader = readStoredObject(headerStorageKey);

      const nextHeader = {
        tuk: "Tempat Kerja",
        nama_asesor: mappedPenyusun[0]?.nama_lengkap || "",
        nama_asesi: "",
        tanggal: master?.tanggal || getToday(),
        ...storedHeader,
      };

      setHeader(nextHeader);
      localStorage.setItem(headerStorageKey, JSON.stringify(nextHeader));

      setData(payload);
      setPertanyaanList(normalizePertanyaan(master));
      setUnitOptions(units);
      setAsesorList(asesors);

      setPenyusun(
        mappedPenyusun.length ? mappedPenyusun : [createAsesorRow()]
      );

      setValidator(
        mappedValidator.length ? mappedValidator : [createAsesorRow()]
      );
    } catch (error) {
      console.error("LOAD FR.IA.03 ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.message ||
          "Gagal memuat FR.IA.03.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const skema = getSkema(data);

  const kelompokMap = useMemo(() => {
    const groups = {};

    unitOptions.forEach((unit) => {
      const name =
        unit?.kelompok?.nama_kelompok ||
        unit?.nama_kelompok ||
        unit?.kelompok_pekerjaan ||
        "Kelompok Pekerjaan";

      if (!groups[name]) {
        groups[name] = [];
      }

      groups[name].push(unit);
    });

    pertanyaanList.forEach((question) => {
      const unit =
        unitOptions.find(
          (item) => String(item?.id_unit) === String(question?.id_unit)
        ) || {};

      const name =
        question?.unit?.skemaUnit?.[0]?.kelompok?.nama_kelompok ||
        unit?.kelompok?.nama_kelompok ||
        unit?.nama_kelompok ||
        unit?.kelompok_pekerjaan ||
        "Kelompok Pekerjaan";

      if (!groups[name]) {
        groups[name] = [];
      }

      const exists = groups[name].some(
        (item) => String(item?.id_unit) === String(question?.id_unit)
      );

      if (!exists && question?.id_unit) {
        groups[name].push({
          id_unit: question.id_unit,
          kode_unit: question?.unit?.kode_unit || question?.kode_unit || "",
          judul_unit: question?.unit?.judul_unit || question?.judul_unit || "",
          nama_kelompok: name,
        });
      }
    });

    return groups;
  }, [unitOptions, pertanyaanList]);

  const openAdd = () => {
    setEditingPertanyaan(null);

    setForm({
      id_unit: unitOptions[0]?.id_unit || "",
      pertanyaan: "",
      urutan: pertanyaanList.length + 1,
    });

    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingPertanyaan(item);

    setForm({
      id_unit: item?.id_unit || item?.unit?.id_unit || "",
      pertanyaan: item?.pertanyaan || "",
      urutan: item?.urutan || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPertanyaan(null);

    setForm({
      id_unit: "",
      pertanyaan: "",
      urutan: "",
    });
  };

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const buildValidatorPayload = (nextPenyusun, nextValidator) => [
    ...nextPenyusun
      .filter((item) => item?.id_asesor)
      .map((item, index) => ({
        id_asesor: Number(item.id_asesor),
        peran: "penyusun",
        urutan: index + 1,
        tanggal: item?.tanggal || getToday(),
      })),
    ...nextValidator
      .filter((item) => item?.id_asesor)
      .map((item, index) => ({
        id_asesor: Number(item.id_asesor),
        peran: "validator",
        urutan: index + 1,
        tanggal: item?.tanggal || getToday(),
      })),
  ];

  const saveValidation = async (
    nextPenyusun = penyusun,
    nextValidator = validator,
    silent = true
  ) => {
    const primaryAsesor =
      nextPenyusun.find((item) => item?.id_asesor)?.id_asesor || "";

    if (!primaryAsesor) {
      if (!silent) {
        await Swal.fire(
          "Validasi",
          "Penyusun asesor wajib dipilih.",
          "warning"
        );
      }

      return false;
    }

    try {
      setSavingValidation(true);

      await api.put(`/asesor/skema/${skemaId}/fr-ia03`, {
        id_asesor: Number(primaryAsesor),
        validators: buildValidatorPayload(nextPenyusun, nextValidator),
      });

      return true;
    } catch (error) {
      console.error("SAVE FR.IA.03 VALIDATION ERROR:", error);

      if (!silent) {
        await Swal.fire(
          "Gagal",
          error.response?.data?.message ||
            "Gagal menyimpan penyusun dan validator.",
          "error"
        );
      }

      return false;
    } finally {
      setSavingValidation(false);
    }
  };

  const handleAsesorChange = async (jenis, index, value) => {
    const selected = asesorList.find(
      (item) => String(item?.id_user) === String(value)
    );

    const nextRow = selected
      ? createAsesorRow({
          ...selected,
          tanggal: getToday(),
        })
      : createAsesorRow();

    let nextPenyusun = penyusun;
    let nextValidator = validator;

    if (jenis === "penyusun") {
      nextPenyusun = penyusun.map((item, itemIndex) =>
        itemIndex === index ? nextRow : item
      );

      setPenyusun(nextPenyusun);

      if (index === 0) {
        handleHeaderChange("nama_asesor", nextRow.nama_lengkap || "");
      }
    } else {
      nextValidator = validator.map((item, itemIndex) =>
        itemIndex === index ? nextRow : item
      );

      setValidator(nextValidator);
    }

    if (nextPenyusun.some((item) => item?.id_asesor)) {
      await saveValidation(nextPenyusun, nextValidator, false);
    }
  };

  const addPenyusun = () => {
    setPenyusun((prev) => [...prev, createAsesorRow()]);
  };

  const addValidator = () => {
    setValidator((prev) => [...prev, createAsesorRow()]);
  };

  const removePenyusun = async (index) => {
    if (penyusun.length === 1) {
      await Swal.fire(
        "Validasi",
        "Minimal satu penyusun harus tersedia.",
        "warning"
      );

      return;
    }

    const next = penyusun.filter((_, itemIndex) => itemIndex !== index);

    setPenyusun(next);
    await saveValidation(next, validator, false);
  };

  const removeValidator = async (index) => {
    const next = validator.filter((_, itemIndex) => itemIndex !== index);
    const normalized = next.length ? next : [createAsesorRow()];

    setValidator(normalized);
    await saveValidation(penyusun, normalized, false);
  };

  const savePertanyaan = async (event) => {
    event.preventDefault();

    if (!form.id_unit) {
      await Swal.fire(
        "Validasi",
        "Unit kompetensi wajib dipilih.",
        "warning"
      );

      return;
    }

    if (!form.pertanyaan.trim()) {
      await Swal.fire(
        "Validasi",
        "Pertanyaan wajib diisi.",
        "warning"
      );

      return;
    }

    const primaryAsesor =
      penyusun.find((item) => item?.id_asesor)?.id_asesor || "";

    if (!primaryAsesor) {
      await Swal.fire(
        "Validasi",
        "Pilih penyusun asesor terlebih dahulu sebelum menyimpan pertanyaan.",
        "warning"
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        id_asesor: Number(primaryAsesor),
        id_unit: Number(form.id_unit),
        pertanyaan: form.pertanyaan.trim(),
        urutan: Number(form.urutan) || pertanyaanList.length + 1,
      };

      if (editingPertanyaan?.id_pertanyaan) {
        await api.put(
          `/asesor/skema/${skemaId}/fr-ia03/pertanyaan/${editingPertanyaan.id_pertanyaan}`,
          payload
        );
      } else {
        await api.post(
          `/asesor/skema/${skemaId}/fr-ia03/pertanyaan`,
          payload
        );
      }

      closeModal();

      await Swal.fire({
        title: "Berhasil",
        text: "Pertanyaan FR.IA.03 berhasil disimpan.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (error) {
      console.error("SAVE FR.IA.03 QUESTION ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Gagal menyimpan pertanyaan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePertanyaan = async (item) => {
    const confirmation = await Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Pertanyaan akan dihapus dari FR.IA.03.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Hapus",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setSaving(true);

      await api.delete(
        `/asesor/skema/${skemaId}/fr-ia03/pertanyaan/${item.id_pertanyaan}`
      );

      await Swal.fire({
        title: "Terhapus",
        text: "Pertanyaan berhasil dihapus.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (error) {
      console.error("DELETE FR.IA.03 QUESTION ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          "Gagal menghapus pertanyaan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `FR-IA-03-${skemaId}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `,
  });

  if (loading) {
    return <LoadingScreen title="Memuat FR.IA.03..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <style>{`
        @media print {
          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          .print-hidden {
            display: none !important;
          }

          textarea,
          input,
          select {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

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
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Pertanyaan
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <main
        ref={printRef}
        className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:shadow-none print:px-0"
      >
        <div className="mb-5 border border-black">
          <div className="border-b border-black py-2 text-center">
            <h1 className="text-[18px] font-bold">FR.IA.03</h1>
            <p className="text-[15px] font-bold uppercase">
              PERTANYAAN UNTUK MENDUKUNG OBSERVASI
            </p>
          </div>
        </div>

        <HeaderTable
          skema={skema}
          header={header}
          asesorList={asesorList}
          onChange={handleHeaderChange}
        />

        <section className="mt-5 border border-black">
          <div className="border-b border-black bg-gray-300 px-2 py-1 font-bold">
            PANDUAN BAGI ASESOR
          </div>

          <ul className="list-disc space-y-1 px-8 py-3 text-[13px] leading-relaxed">
            {PANDUAN_ASESOR.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="my-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 print:hidden">
          Mode Penyusunan Instrumen: Anda dapat menambah, mengubah, dan
          menghapus pertanyaan FR.IA.03. Kolom tanggapan dan pencapaian
          disiapkan untuk digunakan oleh asesor penguji.
        </div>

        {Object.keys(kelompokMap).length === 0 ? (
          <EmptyState text="Belum ada unit kompetensi pada skema ini. Pastikan unit kompetensi sudah tersedia." />
        ) : (
          Object.entries(kelompokMap).map(([kelompok, list], groupIndex) => (
            <section key={`${kelompok}-${groupIndex}`} className="mb-8">
              <UnitTable kelompok={kelompok} list={list} />

              <table className="w-full border-collapse border border-black text-[13px]">
                <thead>
                  <tr className="bg-gray-100 print:bg-white">
                    <th className="border border-black px-3 py-2 text-center font-bold uppercase">
                      Pertanyaan
                    </th>
                    <th
                      colSpan={2}
                      className="w-[120px] border border-black px-3 py-2 text-center font-bold"
                    >
                      Pencapaian
                    </th>
                  </tr>
                  <tr className="bg-gray-100 print:bg-white">
                    <th className="border border-black"></th>
                    <th className="border border-black py-2 text-center font-bold uppercase">
                      Ya
                    </th>
                    <th className="border border-black py-2 text-center font-bold uppercase">
                      Tidak
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pertanyaanList
                    .filter(
                      (item) =>
                        String(getUnitKelompokNama(item, unitOptions)) ===
                        String(kelompok)
                    )
                    .map((item, index) => {
                      const questionKey =
                        item?.id_pertanyaan || `${groupIndex}-${index}`;

                      return (
                        <React.Fragment key={questionKey}>
                          <tr className="hover:bg-gray-50 print:bg-white">
                            <td className="border border-black px-3 py-2">
                              <div className="flex items-start gap-2">
                                <span className="w-8 shrink-0 text-center font-bold">
                                  {index + 1}.
                                </span>
                                <span className="flex-1 leading-6">
                                  {item.pertanyaan}
                                </span>

                                <div className="ml-3 flex gap-2 print:hidden">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                                    aria-label="Edit pertanyaan"
                                  >
                                    <Edit size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deletePertanyaan(item)}
                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                    aria-label="Hapus pertanyaan"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="border border-black py-3 text-center">
                              <div className="mx-auto h-6 w-6 border border-black" />
                            </td>
                            <td className="border border-black py-3 text-center">
                              <div className="mx-auto h-6 w-6 border border-black" />
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={3}
                              className="h-[140px] border border-black px-3 py-2 align-top"
                            >
                              <label className="mb-1 flex items-start gap-2 leading-5">
                                <input
                                  type="checkbox"
                                  checked={Boolean(terpenuhiMap[questionKey])}
                                  onChange={(event) =>
                                    handleTerpenuhiChange(
                                      questionKey,
                                      event.target.checked
                                    )
                                  }
                                  className="mt-1 h-4 w-4 shrink-0"
                                />
                                <span>
                                  bahwa sudah terpenuhi pada saat tugas praktek
                                  demonstrasi
                                </span>
                              </label>

                              <div className="font-bold">Tanggapan:</div>
                              <p className="mt-1 text-xs italic text-slate-500 print:hidden">
                                Diisi oleh asesor penguji.
                              </p>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </section>
          ))
        )}

        <section className="mt-6 border border-black">
          <div className="min-h-[105px] px-3 py-3">
            <label
              htmlFor="fria03-umpan-balik-asesi"
              className="mb-3 block font-normal"
            >
              Umpan balik untuk asesi:
            </label>

            <textarea
              id="fria03-umpan-balik-asesi"
              value={umpanBalikAsesi}
              onChange={(event) =>
                handleUmpanBalikChange(event.target.value)
              }
              rows={3}
              className="min-h-[65px] w-full resize-y bg-transparent leading-5 outline-none print:hidden"
              placeholder="Tuliskan umpan balik untuk asesi..."
            />

            <div className="hidden min-h-[65px] whitespace-pre-wrap leading-5 print:block">
              {umpanBalikAsesi || " "}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <table className="w-full table-fixed border-collapse border border-black text-[12px]">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[7%]" />
              <col className="w-[20%]" />
              <col className="w-[16%]" />
              <col className="w-[37%]" />
            </colgroup>

            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="border border-black bg-slate-50 px-4 py-3 text-[14px] font-bold"
                >
                  PENYUSUNAN DAN VALIDASI INSTRUMEN
                </td>
              </tr>

              <tr>
                <th className="border border-black px-2 py-2 text-left font-bold">
                  Status
                </th>
                <th className="border border-black px-2 py-2 text-center font-bold">
                  No
                </th>
                <th className="border border-black px-2 py-2 text-left font-bold">
                  Nama
                </th>
                <th className="border border-black px-2 py-2 text-left font-bold">
                  Nomor MET
                </th>
                <th className="border border-black px-2 py-2 text-center font-bold">
                  Tanda Tangan dan Tanggal
                </th>
              </tr>

              {penyusun.map((item, index) => (
                <tr key={`penyusun-${index}`}>
                  {index === 0 && (
                    <td
                      rowSpan={penyusun.length}
                      className="border border-black px-2 py-3 align-middle font-semibold"
                    >
                      Penyusun
                    </td>
                  )}

                  <td className="border border-black px-2 py-3 text-center align-middle">
                    {index + 1}
                  </td>

                  <td className="border border-black px-2 py-3 align-middle">
                    <select
                      value={item?.id_asesor || ""}
                      onChange={(event) =>
                        handleAsesorChange(
                          "penyusun",
                          index,
                          event.target.value
                        )
                      }
                      disabled={savingValidation}
                      className="w-full min-w-0 bg-transparent font-semibold outline-none print:hidden"
                    >
                      <option value="">Pilih Asesor</option>
                      {asesorList.map((asesor) => (
                        <option
                          key={asesor.id_user}
                          value={asesor.id_user}
                        >
                          {asesor.nama_lengkap}
                        </option>
                      ))}
                    </select>

                    <p className="hidden break-words print:block">
                      {item?.nama_lengkap || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2 py-3 align-middle break-words">
                    {item?.no_reg_asesor || "-"}
                  </td>

                  <td className="border border-black px-2 py-3 align-middle">
                    <SignatureCell item={item} />
                  </td>
                </tr>
              ))}

              {validator.map((item, index) => (
                <tr key={`validator-${index}`}>
                  {index === 0 && (
                    <td
                      rowSpan={validator.length}
                      className="border border-black px-2 py-3 align-middle font-semibold"
                    >
                      Validator
                    </td>
                  )}

                  <td className="border border-black px-2 py-3 text-center align-middle">
                    {index + 1}
                  </td>

                  <td className="border border-black px-2 py-3 align-middle">
                    <select
                      value={item?.id_asesor || ""}
                      onChange={(event) =>
                        handleAsesorChange(
                          "validator",
                          index,
                          event.target.value
                        )
                      }
                      disabled={savingValidation}
                      className="w-full min-w-0 bg-transparent font-semibold outline-none print:hidden"
                    >
                      <option value="">Pilih Asesor</option>
                      {asesorList.map((asesor) => (
                        <option
                          key={asesor.id_user}
                          value={asesor.id_user}
                        >
                          {asesor.nama_lengkap}
                        </option>
                      ))}
                    </select>

                    <p className="hidden break-words print:block">
                      {item?.nama_lengkap || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2 py-3 align-middle break-words">
                    {item?.no_reg_asesor || "-"}
                  </td>

                  <td className="border border-black px-2 py-3 align-middle">
                    <SignatureCell item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              onClick={addPenyusun}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white hover:bg-slate-900"
            >
              <Plus size={16} />
              Tambah Penyusun
            </button>

            <button
              type="button"
              onClick={addValidator}
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white hover:bg-slate-900"
            >
              <Plus size={16} />
              Tambah Validator
            </button>

            {penyusun.length > 1 && (
              <button
                type="button"
                onClick={() => removePenyusun(penyusun.length - 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                <Trash2 size={16} />
                Hapus Penyusun
              </button>
            )}

            {validator.length > 1 && (
              <button
                type="button"
                onClick={() => removeValidator(validator.length - 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                <Trash2 size={16} />
                Hapus Validator
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] leading-4">
            Diadaptasi dari template yang disediakan di Departemen Pendidikan
            dan Pelatihan, Australia. Merancang instrumen asesmen untuk hasil
            yang berkualitas di VET, 2008 di VET, 200
          </p>
        </section>
      </main>

      {showModal && (
        <QuestionModal
          title={editingPertanyaan ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
          form={form}
          unitOptions={unitOptions}
          saving={saving}
          onChange={handleChange}
          onSubmit={savePertanyaan}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function HeaderTable({ skema, header, asesorList, onChange }) {
  const jenisRaw = String(skema?.jenis_skema || "kkni").toLowerCase();

  const jenis =
    jenisRaw.includes("klaster") || jenisRaw.includes("cluster")
      ? "klaster"
      : jenisRaw.includes("okupasi")
        ? "okupasi"
        : "kkni";

  const struck = (value) =>
    jenis === value ? "" : "line-through text-slate-500";

  return (
    <table className="w-full border-collapse border border-black text-[13px]">
      <tbody>
        <tr>
          <td
            rowSpan={6}
            className="w-[240px] border border-black px-2 py-2 align-middle font-bold leading-tight"
          >
            <div className="text-[15px]">Skema Sertifikasi</div>
            <div className="whitespace-nowrap text-[13px]">
              (
              <span className={struck("kkni")}>KKNI</span>
              {" / "}
              <span className={struck("okupasi")}>Okupasi</span>
              {" / "}
              <span className={struck("klaster")}>Klaster</span>
              )
            </div>
          </td>

          <td className="w-[90px] border border-black px-2 py-1 font-bold">
            Judul
          </td>
          <td className="w-[20px] border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="border border-black px-3 py-1 font-semibold">
            {skema?.judul_skema || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">Nomor</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-3 py-1 font-semibold">
            {skema?.kode_skema || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">TUK</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-3 py-1">
            <select
              value={header.tuk || "Tempat Kerja"}
              onChange={(event) => onChange("tuk", event.target.value)}
              className="w-full bg-transparent outline-none print:hidden"
            >
              <option value="Sewaktu">Sewaktu</option>
              <option value="Tempat Kerja">Tempat Kerja</option>
              <option value="Mandiri">Mandiri</option>
            </select>

            <span className="hidden print:inline">
              {header.tuk || "Tempat Kerja"}
            </span>
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Nama Asesor
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-3 py-1">
            <select
              value={header.nama_asesor || ""}
              onChange={(event) =>
                onChange("nama_asesor", event.target.value)
              }
              className="w-full bg-transparent outline-none print:hidden"
            >
              <option value="">Pilih Asesor</option>
              {asesorList.map((asesor) => (
                <option
                  key={asesor?.id_user || asesor?.nama_lengkap}
                  value={asesor?.nama_lengkap || asesor?.nama || ""}
                >
                  {asesor?.nama_lengkap || asesor?.nama || "Asesor"}
                </option>
              ))}
            </select>

            <span className="hidden print:inline">
              {header.nama_asesor || "-"}
            </span>
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Nama Asesi
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-3 py-1">
            <input
              type="text"
              value={header.nama_asesi || ""}
              onChange={(event) =>
                onChange("nama_asesi", event.target.value)
              }
              placeholder="Masukkan nama asesi"
              className="w-full bg-transparent outline-none placeholder:text-slate-400 print:hidden"
            />

            <span className="hidden print:inline">
              {header.nama_asesi || "-"}
            </span>
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">Tanggal</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-3 py-1">
            <input
              type="date"
              value={header.tanggal || ""}
              onChange={(event) =>
                onChange("tanggal", event.target.value)
              }
              className="w-full bg-transparent outline-none print:hidden"
            />

            <span className="hidden print:inline">
              {formatTanggal(header.tanggal)}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function SignatureCell({ item }) {
  return (
    <div className="flex min-h-[65px] flex-col items-center justify-center py-2">
      {item?.ttd_path ? (
        <img
          src={getImageUrl(item.ttd_path)}
          className="max-h-12 max-w-full object-contain"
          alt={`Tanda tangan ${item.nama_lengkap || "asesor"}`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="text-[10px] text-slate-400 print:hidden">
          TTD belum tersedia di profil
        </span>
      )}

      <div className="mt-2 w-[90%] max-w-[150px] border-b border-black" />

      <span className="mt-1 text-center text-[10px]">
        {formatTanggal(item?.tanggal)}
      </span>
    </div>
  );
}

function UnitTable({ kelompok, list }) {
  return (
    <table className="mb-4 w-full border-collapse border border-black text-[13px]">
      <thead>
        <tr className="bg-gray-100 print:bg-white">
          <th className="w-[220px] border border-black px-2 py-2 text-left">
            Kelompok Pekerjaan
          </th>
          <th className="w-[60px] border border-black px-2 py-2">No.</th>
          <th className="w-[180px] border border-black px-2 py-2">Kode Unit</th>
          <th className="border border-black px-2 py-2">Judul Unit</th>
        </tr>
      </thead>

      <tbody>
        {list.map((unit, index) => (
          <tr key={unit?.id_unit || `${getUnitKode(unit)}-${index}`}>
            <td className="border border-black px-2 py-2">
              {index === 0 ? kelompok : ""}
            </td>
            <td className="border border-black py-2 text-center">{index + 1}</td>
            <td className="border border-black px-2 py-2">{getUnitKode(unit)}</td>
            <td className="border border-black px-2 py-2">{getUnitJudul(unit)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function QuestionModal({
  title,
  form,
  unitOptions,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4 print:hidden">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#071E3D]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Unit Kompetensi
            </label>

            <select
              name="id_unit"
              value={form.id_unit}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500"
            >
              <option value="">Pilih Unit Kompetensi</option>
              {unitOptions.map((unit) => (
                <option key={unit?.id_unit} value={unit?.id_unit}>
                  {getUnitKode(unit)} - {getUnitJudul(unit)}
                </option>
              ))}
            </select>

            {unitOptions.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                Unit kompetensi belum tersedia pada skema.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Urutan
            </label>

            <input
              type="number"
              name="urutan"
              min="1"
              value={form.urutan}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500"
              placeholder="Urutan pertanyaan"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Pertanyaan
            </label>

            <textarea
              name="pertanyaan"
              value={form.pertanyaan}
              onChange={onChange}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500"
              placeholder="Masukkan pertanyaan observasi..."
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingScreen({ title }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex items-center gap-3 font-bold text-slate-600">
        <Loader2 size={22} className="animate-spin" />
        {title}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}

function normalizePertanyaan(data) {
  const list =
    data?.pertanyaan ||
    data?.Pertanyaan ||
    data?.frIa03Pertanyaan ||
    data?.questions ||
    [];

  return Array.isArray(list)
    ? [...list].sort(
        (a, b) => Number(a?.urutan || 0) - Number(b?.urutan || 0)
      )
    : [];
}

function getSkema(data) {
  const skema = data?.skema || data?.Skema || data || {};

  return {
    id_skema: skema?.id_skema || data?.id_skema || "",
    judul_skema:
      skema?.judul_skema ||
      skema?.nama_skema ||
      data?.judul_skema ||
      data?.nama_skema ||
      "-",
    kode_skema:
      skema?.kode_skema ||
      skema?.nomor_skema ||
      data?.kode_skema ||
      data?.nomor_skema ||
      "-",
    jenis_skema:
      skema?.jenis_skema ||
      skema?.jenis ||
      skema?.tipe_skema ||
      skema?.kategori_skema ||
      skema?.bentuk_skema ||
      data?.jenis_skema ||
      "kkni",
  };
}

function getUnitKelompokNama(item, unitOptions) {
  const unit =
    unitOptions.find(
      (option) => String(option?.id_unit) === String(item?.id_unit)
    ) || {};

  return (
    item?.unit?.skemaUnit?.[0]?.kelompok?.nama_kelompok ||
    unit?.kelompok?.nama_kelompok ||
    unit?.nama_kelompok ||
    unit?.kelompok_pekerjaan ||
    "Kelompok Pekerjaan"
  );
}

function getUnitKode(unit) {
  return (
    unit?.kode_unit ||
    unit?.unit?.kode_unit ||
    unit?.kode ||
    unit?.unit?.kode ||
    unit?.kode_unit_kompetensi ||
    unit?.unit?.kode_unit_kompetensi ||
    "-"
  );
}

function getUnitJudul(unit) {
  return (
    unit?.judul_unit ||
    unit?.unit?.judul_unit ||
    unit?.nama_unit ||
    unit?.unit?.nama_unit ||
    unit?.judul ||
    unit?.nama ||
    "-"
  );
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(text);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
