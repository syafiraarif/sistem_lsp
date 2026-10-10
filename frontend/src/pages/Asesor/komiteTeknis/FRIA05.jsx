
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Edit,
  Image,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../services/api";

const defaultOpsi = [
  { kode_opsi: "A", jawaban: "", is_benar: false },
  { kode_opsi: "B", jawaban: "", is_benar: false },
  { kode_opsi: "C", jawaban: "", is_benar: false },
  { kode_opsi: "D", jawaban: "", is_benar: false },
  { kode_opsi: "E", jawaban: "", is_benar: false },
];

const createEmptySoal = (urutan = 1) => ({
  pertanyaan: "",
  gambar_file: null,
  gambar_preview: "",
  gambar_lama: "",
  hapus_gambar: false,
  urutan,
  opsi: defaultOpsi.map((item) => ({ ...item })),
});

const createEmptyAsesor = () => ({
  id_asesor: "",
  nama_lengkap: "",
  no_reg_asesor: "",
  ttd_path: "",
  tanggal: "",
});

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultHeader = () => ({
  tuk: "Tempat Kerja",
  nama_asesor: "",
  nama_asesi: "",
  tanggal: getToday(),
});

const getHeaderStorageKey = (idSkema) => `fria05-header-${idSkema}`;
const getSignatureStorageKey = (idSkema) => `fria05-signatures-${idSkema}`;

const getStoredHeader = (idSkema) => {
  try {
    const saved = localStorage.getItem(getHeaderStorageKey(idSkema));

    return {
      ...getDefaultHeader(),
      ...(saved ? JSON.parse(saved) : {}),
    };
  } catch {
    return getDefaultHeader();
  }
};

const getStoredSignatureDates = (idSkema) => {
  try {
    const saved = localStorage.getItem(getSignatureStorageKey(idSkema));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const storeSignatureDates = (idSkema, signatureDates) => {
  try {
    localStorage.setItem(
      getSignatureStorageKey(idSkema),
      JSON.stringify(signatureDates)
    );
  } catch (error) {
    console.error("SAVE FR.IA.05 SIGNATURE DATES ERROR:", error);
  }
};

const saveStoredHeader = (idSkema, header) => {
  try {
    localStorage.setItem(
      getHeaderStorageKey(idSkema),
      JSON.stringify(header)
    );
  } catch (error) {
    console.error("SAVE FR.IA.05 HEADER ERROR:", error);
  }
};

const getAsesorData = (item = {}) => {
  const profile = item?.asesor || item;

  return {
    id_asesor: item?.id_asesor || profile?.id_user || "",
    nama_lengkap:
      profile?.nama_lengkap ||
      profile?.nama_asesor ||
      profile?.nama ||
      "",
    no_reg_asesor:
      profile?.no_reg_asesor ||
      profile?.no_lisensi ||
      profile?.nomor_met ||
      "",
    ttd_path:
      profile?.ttd_path ||
      profile?.tanda_tangan ||
      profile?.ttd ||
      "",
    tanggal: item?.tanggal || "",
  };
};

const getSignatureDateKey = (jenis, idAsesor) =>
  `${jenis}-${idAsesor}`;

export default function FRIA05() {
  const params = useParams();
  const navigate = useNavigate();
  const idSkema = params.id_skema || params.idSkema || params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skema, setSkema] = useState(null);
  const [asesorList, setAsesorList] = useState([]);
  const [penyusun, setPenyusun] = useState([createEmptyAsesor()]);
  const [validator, setValidator] = useState([createEmptyAsesor()]);
  const [paket, setPaket] = useState(null);
  const [header, setHeader] = useState(() => getStoredHeader(idSkema));
  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState(null);
  const [formSoal, setFormSoal] = useState(createEmptySoal());

  const soalList = Array.isArray(paket?.soal)
    ? [...paket.soal].sort(
        (a, b) => Number(a?.urutan || 0) - Number(b?.urutan || 0)
      )
    : [];

  useEffect(() => {
    setHeader(getStoredHeader(idSkema));
    fetchData(true);
  }, [idSkema]);

  const updateHeader = (field, value) => {
    setHeader((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      saveStoredHeader(idSkema, next);
      return next;
    });
  };

  const rememberSignatureDates = (nextPenyusun, nextValidator) => {
    const dates = getStoredSignatureDates(idSkema);

    nextPenyusun.forEach((item) => {
      if (item?.id_asesor && item?.tanggal) {
        dates[getSignatureDateKey("penyusun", item.id_asesor)] =
          item.tanggal;
      }
    });

    nextValidator.forEach((item) => {
      if (item?.id_asesor && item?.tanggal) {
        dates[getSignatureDateKey("validator", item.id_asesor)] =
          item.tanggal;
      }
    });

    storeSignatureDates(idSkema, dates);
  };

  const mapSignatureRows = (items, jenis, masterTanggal = "") => {
    const savedDates = getStoredSignatureDates(idSkema);

    return items.map((item) => {
      const asesor = getAsesorData(item);
      const dateKey = getSignatureDateKey(jenis, asesor.id_asesor);

      return {
        ...asesor,
        tanggal:
          item?.tanggal ||
          savedDates[dateKey] ||
          masterTanggal ||
          (asesor.id_asesor ? getToday() : ""),
      };
    });
  };

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      if (!idSkema) {
        throw new Error("ID Skema tidak ditemukan di URL.");
      }

      const [paketResult, asesorResult] = await Promise.all([
        api.get(`/asesor/skema/${idSkema}/fr-ia05`),
        api.get("/asesor/fr-ia05/komite/asesor"),
      ]);

      const responseData =
        paketResult.data?.data || paketResult.data || {};
      const master = responseData.master || responseData.paket || null;
      const asesorResponse =
        asesorResult.data?.data ?? asesorResult.data;

      const profiles = Array.isArray(asesorResponse)
        ? asesorResponse
        : [];

      const validators = Array.isArray(master?.validator)
        ? master.validator
        : [];

      const penyusunRows = validators.filter(
        (item) => item?.peran === "penyusun"
      );

      const validatorRows = validators.filter(
        (item) => item?.peran === "validator"
      );

      const mappedPenyusun = mapSignatureRows(
        penyusunRows,
        "penyusun",
        master?.tanggal
      );

      const mappedValidator = mapSignatureRows(
        validatorRows,
        "validator",
        master?.tanggal
      );

      setSkema(responseData.skema || master?.skema || null);
      setPaket(master);
      setAsesorList(profiles);
      setPenyusun(
        mappedPenyusun.length ? mappedPenyusun : [createEmptyAsesor()]
      );
      setValidator(
        mappedValidator.length ? mappedValidator : [createEmptyAsesor()]
      );

      const storedHeader = getStoredHeader(idSkema);

      if (!storedHeader.nama_asesor && mappedPenyusun[0]?.nama_lengkap) {
        storedHeader.nama_asesor = mappedPenyusun[0].nama_lengkap;
      }

      setHeader(storedHeader);
      saveStoredHeader(idSkema, storedHeader);
      rememberSignatureDates(mappedPenyusun, mappedValidator);
    } catch (error) {
      console.error("LOAD FR.IA.05 ERROR:", error);

      if (showLoader) {
        await Swal.fire(
          "Gagal",
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Gagal memuat data FR.IA.05.",
          "error"
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const skemaData = getSkema(skema, paket);

  const buildValidators = () => [
    ...penyusun
      .filter((item) => item?.id_asesor)
      .map((item, index) => ({
        id_asesor: Number(item.id_asesor),
        peran: "penyusun",
        urutan: index + 1,
      })),
    ...validator
      .filter((item) => item?.id_asesor)
      .map((item, index) => ({
        id_asesor: Number(item.id_asesor),
        peran: "validator",
        urutan: index + 1,
      })),
  ];

  const buildPaketPayload = () => ({
    id_skema: Number(idSkema),
    kode_paket: paket?.kode_paket || `FRIA05-${idSkema}`,
    judul_paket: paket?.judul_paket || "Paket Soal FR.IA.05",
    validators: buildValidators(),
  });

  const handleAsesorChange = (jenis, index, id) => {
    const selected = asesorList.find(
      (item) => String(item?.id_user) === String(id)
    );

    const nextData = selected
      ? {
          ...getAsesorData(selected),
          tanggal: getToday(),
        }
      : createEmptyAsesor();

    const currentRows = jenis === "penyusun" ? penyusun : validator;
    const setRows = jenis === "penyusun" ? setPenyusun : setValidator;

    const nextRows = currentRows.map((item, itemIndex) =>
      itemIndex === index ? nextData : item
    );

    setRows(nextRows);
    rememberSignatureDates(
      jenis === "penyusun" ? nextRows : penyusun,
      jenis === "validator" ? nextRows : validator
    );

    if (jenis === "penyusun" && index === 0) {
      updateHeader("nama_asesor", selected?.nama_lengkap || "");
    }
  };

  const tambahPenyusun = () => {
    setPenyusun((previous) => [...previous, createEmptyAsesor()]);
  };

  const tambahValidator = () => {
    setValidator((previous) => [...previous, createEmptyAsesor()]);
  };

  const hapusPenyusun = (index) => {
    setPenyusun((previous) => {
      const next = previous.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [createEmptyAsesor()];
    });
  };

  const hapusValidator = (index) => {
    setValidator((previous) => {
      const next = previous.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [createEmptyAsesor()];
    });
  };

  const savePaket = async () => {
    try {
      setSaving(true);

      if (!idSkema) {
        throw new Error("ID Skema tidak ditemukan.");
      }

      saveStoredHeader(idSkema, header);
      rememberSignatureDates(penyusun, validator);

      const response = await api.post(
        `/asesor/skema/${idSkema}/fr-ia05`,
        buildPaketPayload()
      );

      const result = response.data?.data || {};
      const savedMaster = result.master || result;

      if (savedMaster?.id_fr_ia_05) {
        setPaket(savedMaster);
      }

      await Swal.fire({
        title: "Berhasil",
        text: "Instrumen FR.IA.05 berhasil disimpan.",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchData(false);
    } catch (error) {
      console.error("SAVE FR.IA.05 ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Gagal menyimpan FR.IA.05.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const ensurePaket = async () => {
    if (paket?.id_fr_ia_05) {
      return paket;
    }

    if (!idSkema) {
      throw new Error("ID Skema tidak ditemukan.");
    }

    const response = await api.post(
      `/asesor/skema/${idSkema}/fr-ia05`,
      buildPaketPayload()
    );

    const result = response.data?.data || {};
    const created = result.master || result;

    if (!created?.id_fr_ia_05) {
      throw new Error("Paket FR.IA.05 belum berhasil dibuat.");
    }

    setPaket(created);
    return created;
  };

  const openAddSoal = async () => {
    try {
      setSaving(true);
      await ensurePaket();

      setEditingSoal(null);
      setFormSoal(createEmptySoal(soalList.length + 1));
      setShowSoalModal(true);
    } catch (error) {
      console.error("CREATE FR.IA.05 PACKAGE ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Gagal menyiapkan paket soal.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditSoal = (soal) => {
    const opsi =
      Array.isArray(soal?.opsi) && soal.opsi.length
        ? soal.opsi.map((item) => ({
            kode_opsi: item?.kode_opsi,
            jawaban: item?.jawaban || "",
            is_benar:
              item?.is_benar === true ||
              item?.is_benar === 1 ||
              item?.is_benar === "1",
          }))
        : defaultOpsi.map((item) => ({ ...item }));

    setEditingSoal(soal);

    setFormSoal({
      pertanyaan: soal?.pertanyaan || "",
      gambar_file: null,
      gambar_preview: soal?.gambar
        ? normalizeImageUrl(soal.gambar)
        : "",
      gambar_lama: soal?.gambar || "",
      hapus_gambar: false,
      urutan: soal?.urutan || soalList.length + 1,
      opsi,
    });

    setShowSoalModal(true);
  };

  const closeSoalModal = () => {
    if (formSoal.gambar_preview && formSoal.gambar_file) {
      URL.revokeObjectURL(formSoal.gambar_preview);
    }

    setShowSoalModal(false);
    setEditingSoal(null);
    setFormSoal(createEmptySoal());
  };

  const handleSoalChange = (event) => {
    const { name, value } = event.target;

    setFormSoal((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleGambarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      Swal.fire(
        "Format Salah",
        "Gambar harus berformat JPG, PNG, atau WEBP.",
        "warning"
      );
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire(
        "Ukuran Terlalu Besar",
        "Ukuran gambar maksimal 2 MB.",
        "warning"
      );
      event.target.value = "";
      return;
    }

    if (formSoal.gambar_preview && formSoal.gambar_file) {
      URL.revokeObjectURL(formSoal.gambar_preview);
    }

    setFormSoal((previous) => ({
      ...previous,
      gambar_file: file,
      gambar_preview: URL.createObjectURL(file),
      hapus_gambar: false,
    }));
  };

  const hapusGambarSoal = () => {
    if (formSoal.gambar_preview && formSoal.gambar_file) {
      URL.revokeObjectURL(formSoal.gambar_preview);
    }

    setFormSoal((previous) => ({
      ...previous,
      gambar_file: null,
      gambar_preview: "",
      gambar_lama: "",
      hapus_gambar: true,
    }));
  };

  const handleOpsiChange = (index, value) => {
    setFormSoal((previous) => ({
      ...previous,
      opsi: previous.opsi.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, jawaban: value }
          : item
      ),
    }));
  };

  const setJawabanBenar = (index) => {
    setFormSoal((previous) => ({
      ...previous,
      opsi: previous.opsi.map((item, itemIndex) => ({
        ...item,
        is_benar: itemIndex === index,
      })),
    }));
  };

  const saveSoal = async (event) => {
    event.preventDefault();

    if (!formSoal.pertanyaan.trim()) {
      await Swal.fire(
        "Validasi",
        "Pertanyaan wajib diisi.",
        "warning"
      );
      return;
    }

    if (formSoal.opsi.some((item) => !item.jawaban.trim())) {
      await Swal.fire(
        "Validasi",
        "Semua opsi jawaban wajib diisi.",
        "warning"
      );
      return;
    }

    if (!formSoal.opsi.some((item) => item.is_benar)) {
      await Swal.fire(
        "Validasi",
        "Pilih satu jawaban benar.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);

      const currentPaket = await ensurePaket();
      const formData = new FormData();

      formData.append(
        "id_fr_ia_05",
        String(currentPaket.id_fr_ia_05)
      );
      formData.append("pertanyaan", formSoal.pertanyaan.trim());
      formData.append(
        "urutan",
        String(formSoal.urutan || soalList.length + 1)
      );
      formData.append("opsi", JSON.stringify(formSoal.opsi));
      formData.append("gambar_lama", formSoal.gambar_lama || "");
      formData.append(
        "hapus_gambar",
        formSoal.hapus_gambar ? "true" : "false"
      );

      if (formSoal.gambar_file) {
        formData.append("gambar_file", formSoal.gambar_file);
      }

      if (editingSoal?.id_soal) {
        await api.put(
          `/asesor/fr-ia05/komite/soal/${editingSoal.id_soal}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post(
          "/asesor/fr-ia05/komite/soal",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      closeSoalModal();

      await Swal.fire({
        title: "Berhasil",
        text: "Pertanyaan berhasil disimpan.",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchData(false);
    } catch (error) {
      console.error("SAVE FR.IA.05 QUESTION ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Gagal menyimpan pertanyaan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSoal = async (soal) => {
    const confirmation = await Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Pertanyaan dan opsi jawaban akan dihapus.",
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
        `/asesor/fr-ia05/komite/soal/${soal.id_soal}`
      );

      await Swal.fire({
        title: "Terhapus",
        text: "Pertanyaan berhasil dihapus.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData(false);
    } catch (error) {
      console.error("DELETE FR.IA.05 QUESTION ERROR:", error);

      await Swal.fire(
        "Gagal",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Gagal menghapus pertanyaan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          <Loader2 size={22} className="animate-spin" />
          Memuat FR.IA.05...
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
            onClick={savePaket}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Simpan Formulir
          </button>

          <button
            type="button"
            onClick={openAddSoal}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Tambah Pertanyaan
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download size={18} />
            Cetak
          </button>
        </div>
      </div>

      <main className="mx-auto w-[794px] bg-white px-6 py-6 text-[11px] text-black shadow-lg print:w-full print:shadow-none print:px-0 print:py-0">
        <div className="mb-5 border border-black px-3 py-2 text-center">
          <h1 className="text-[18px] font-bold leading-6">
            FR.IA.05A. DPT
          </h1>
          <p className="mt-1 text-[15px] font-semibold leading-5">
            PERTANYAAN TERTULIS PILIHAN GANDA
          </p>
        </div>

        <HeaderTable
          skema={skemaData}
          header={header}
          asesorList={asesorList}
          onChange={updateHeader}
        />

        <p className="mt-1 text-[11px] italic">
          *Coret yang tidak perlu
        </p>

        <div className="mb-2 mt-5 flex items-center justify-between gap-3">
          <p>Jawab semua pertanyaan berikut:</p>

          <button
            type="button"
            onClick={openAddSoal}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60 print:hidden"
          >
            <Plus size={15} />
            Tambah Pertanyaan
          </button>
        </div>

        <table className="w-full border-collapse border border-black text-[12px]">
          <tbody>
            {soalList.length === 0 ? (
              <tr>
                <td className="border border-black px-3 py-10 text-center text-slate-500">
                  Belum ada pertanyaan. Klik tombol Tambah Pertanyaan untuk
                  membuat soal pertama.
                </td>
              </tr>
            ) : (
              soalList.map((soal, soalIndex) => (
                <React.Fragment key={soal.id_soal || soalIndex}>
                  <tr className="break-inside-avoid">
                    <td className="border border-black px-2 py-1 align-top">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0">
                          {soalIndex + 1}.
                        </span>

                        <div className="min-w-0 flex-1 whitespace-pre-wrap leading-[18px]">
                          {soal.pertanyaan}
                        </div>

                        <div className="ml-2 flex shrink-0 gap-2 print:hidden">
                          <button
                            type="button"
                            onClick={() => openEditSoal(soal)}
                            title="Edit pertanyaan"
                            aria-label="Edit pertanyaan"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSoal(soal)}
                            title="Hapus pertanyaan"
                            aria-label="Hapus pertanyaan"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {soal.gambar && (
                        <div className="my-2 flex justify-center">
                          <img
                            src={normalizeImageUrl(soal.gambar)}
                            alt={`Gambar pertanyaan ${soalIndex + 1}`}
                            className="max-h-[220px] max-w-full object-contain"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>

                  <tr className="break-inside-avoid">
                    <td className="border border-black px-2 py-1">
                      <div className="space-y-0 pl-5">
                        {[...(soal.opsi || [])]
                          .sort((a, b) =>
                            String(a.kode_opsi || "").localeCompare(
                              String(b.kode_opsi || "")
                            )
                          )
                          .map((opsi, opsiIndex) => (
                            <div
                              key={
                                opsi.id_opsi ||
                                opsi.kode_opsi ||
                                opsiIndex
                              }
                              className="flex min-h-[18px] gap-2 leading-[18px]"
                            >
                              <span className="w-5 shrink-0">
                                {String(
                                  opsi.kode_opsi ||
                                    String.fromCharCode(65 + opsiIndex)
                                ).toLowerCase()}
                                .
                              </span>

                              <span className="whitespace-pre-wrap">
                                {opsi.jawaban}
                              </span>
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        <SignatureTable
          penyusun={penyusun}
          validator={validator}
          asesorList={asesorList}
          onAsesorChange={handleAsesorChange}
          onAddPenyusun={tambahPenyusun}
          onAddValidator={tambahValidator}
          onRemovePenyusun={hapusPenyusun}
          onRemoveValidator={hapusValidator}
        />
      </main>

      {showSoalModal && (
        <QuestionModal
          editing={Boolean(editingSoal)}
          form={formSoal}
          saving={saving}
          onChange={handleSoalChange}
          onImageChange={handleGambarChange}
          onRemoveImage={hapusGambarSoal}
          onOptionChange={handleOpsiChange}
          onSetCorrect={setJawabanBenar}
          onSubmit={saveSoal}
          onClose={closeSoalModal}
        />
      )}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: #fff !important;
          }

          input,
          textarea,
          select {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }

          button,
          .print\\:hidden {
            display: none !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
          }

          img {
            max-width: 100% !important;
          }
        }
      `}</style>
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

  const labelJenis = (nilai) =>
    jenis === nilai ? "" : "line-through text-slate-500";

  return (
    <table className="w-full border-collapse border border-black text-[12px]">
      <tbody>
        <tr>
          <td
            rowSpan={6}
            className="w-[185px] border border-black px-2 py-1 align-middle font-bold leading-tight"
          >
            <div className="text-[14px]">Skema Sertifikasi</div>
            <div className="whitespace-nowrap text-[12px]">
              (
              <span className={labelJenis("kkni")}>KKNI</span>
              {" / "}
              <span className={labelJenis("okupasi")}>Okupasi</span>
              {" / "}
              <span className={labelJenis("klaster")}>Klaster</span>
              )
            </div>
          </td>

          <td className="w-[80px] border border-black px-2 py-1 font-bold">
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
              {header.nama_asesor || ""}
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
              {header.nama_asesi || ""}
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
              onChange={(event) => onChange("tanggal", event.target.value)}
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

function SignatureTable({
  penyusun,
  validator,
  asesorList,
  onAsesorChange,
  onAddPenyusun,
  onAddValidator,
  onRemovePenyusun,
  onRemoveValidator,
}) {
  return (
    <section className="mt-8">
      <p className="mb-2 text-center text-[11px] font-bold uppercase">
        Penyusun dan Validator
      </p>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1">STATUS</th>
            <th className="w-[45px] border border-black px-2 py-1">NO</th>
            <th className="border border-black px-2 py-1">NAMA</th>
            <th className="w-[140px] border border-black px-2 py-1">
              NOMOR MET
            </th>
            <th className="w-[180px] border border-black px-2 py-1">
              TANDA TANGAN DAN TANGGAL
            </th>
          </tr>
        </thead>

        <tbody>
          {penyusun.map((item, index) => (
            <tr key={`penyusun-${index}`}>
              {index === 0 && (
                <td
                  rowSpan={penyusun.length}
                  className="border border-black px-2 py-2 text-center align-middle"
                >
                  Penyusun
                </td>
              )}

              <td className="border border-black px-2 py-2 text-center">
                {index + 1}
              </td>

              <td className="border border-black px-2 py-2">
                <select
                  value={item?.id_asesor || ""}
                  onChange={(event) =>
                    onAsesorChange("penyusun", index, event.target.value)
                  }
                  className="w-full bg-transparent outline-none print:hidden"
                >
                  <option value="">Pilih Asesor</option>
                  {asesorList.map((asesor) => (
                    <option key={asesor.id_user} value={asesor.id_user}>
                      {asesor.nama_lengkap || asesor.nama}
                    </option>
                  ))}
                </select>

                <span className="hidden print:inline">
                  {item?.nama_lengkap || ""}
                </span>
              </td>

              <td className="border border-black px-2 py-2">
                {item?.no_reg_asesor || "-"}
              </td>

              <td className="border border-black px-2 py-2">
                <SignatureCell item={item} />
              </td>
            </tr>
          ))}

          {validator.map((item, index) => (
            <tr key={`validator-${index}`}>
              {index === 0 && (
                <td
                  rowSpan={validator.length}
                  className="border border-black px-2 py-2 text-center align-middle"
                >
                  Validator
                </td>
              )}

              <td className="border border-black px-2 py-2 text-center">
                {index + 1}
              </td>

              <td className="border border-black px-2 py-2">
                <select
                  value={item?.id_asesor || ""}
                  onChange={(event) =>
                    onAsesorChange("validator", index, event.target.value)
                  }
                  className="w-full bg-transparent outline-none print:hidden"
                >
                  <option value="">Pilih Asesor</option>
                  {asesorList.map((asesor) => (
                    <option key={asesor.id_user} value={asesor.id_user}>
                      {asesor.nama_lengkap || asesor.nama}
                    </option>
                  ))}
                </select>

                <span className="hidden print:inline">
                  {item?.nama_lengkap || ""}
                </span>
              </td>

              <td className="border border-black px-2 py-2">
                {item?.no_reg_asesor || "-"}
              </td>

              <td className="border border-black px-2 py-2">
                <SignatureCell item={item} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={onAddPenyusun}
          className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-xs font-bold text-white"
        >
          <Plus size={14} />
          Tambah Penyusun
        </button>

        <button
          type="button"
          onClick={onAddValidator}
          className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-xs font-bold text-white"
        >
          <Plus size={14} />
          Tambah Validator
        </button>

        {penyusun.length > 1 && (
          <button
            type="button"
            onClick={() => onRemovePenyusun(penyusun.length - 1)}
            className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
          >
            <Trash2 size={14} />
            Hapus Penyusun Terakhir
          </button>
        )}

        {validator.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveValidator(validator.length - 1)}
            className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
          >
            <Trash2 size={14} />
            Hapus Validator Terakhir
          </button>
        )}
      </div>
    </section>
  );
}

function SignatureCell({ item }) {
  return (
    <div className="flex min-h-[65px] flex-col items-center justify-center py-2">
      {item?.ttd_path ? (
        <img
          src={normalizeImageUrl(item.ttd_path)}
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

      <div className="mt-2 w-[120px] border-b border-black" />

      <span className="mt-1 text-[10px]">
        {formatTanggal(item?.tanggal)}
      </span>
    </div>
  );
}

function QuestionModal({
  editing,
  form,
  saving,
  onChange,
  onImageChange,
  onRemoveImage,
  onOptionChange,
  onSetCorrect,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h3 className="text-lg font-black text-[#071E3D]">
            {editing ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Tutup formulir"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-6">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Nomor / Urutan
            </label>

            <input
              type="number"
              min="1"
              name="urutan"
              value={form.urutan}
              onChange={onChange}
              className="w-full rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
              required
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
              rows={4}
              className="w-full resize-y rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
              placeholder="Tuliskan pertanyaan..."
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Image size={15} />
              Gambar Soal
            </label>

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onImageChange}
              className="w-full rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
            />

            <p className="mt-1 text-xs text-slate-500">
              Format JPG, PNG, atau WEBP. Maksimal 2 MB.
            </p>

            {form.gambar_preview && (
              <div className="mt-3 rounded-xl border bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">
                    Preview Gambar
                  </p>

                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Hapus Gambar
                  </button>
                </div>

                <img
                  src={form.gambar_preview}
                  alt="Preview gambar soal"
                  className="max-h-[180px] max-w-full rounded-lg border object-contain"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
              Opsi Jawaban
            </p>

            <div className="space-y-3">
              {form.opsi.map((opsi, index) => (
                <div
                  key={opsi.kode_opsi}
                  className="grid grid-cols-[30px_minmax(0,1fr)_90px] items-center gap-3"
                >
                  <div className="font-black text-[#071E3D]">
                    {opsi.kode_opsi}.
                  </div>

                  <input
                    value={opsi.jawaban}
                    onChange={(event) =>
                      onOptionChange(index, event.target.value)
                    }
                    className="w-full rounded-xl border bg-white px-4 py-3 font-bold outline-none focus:border-orange-500"
                    placeholder={`Jawaban ${opsi.kode_opsi}`}
                    required
                  />

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="radio"
                      name="jawaban_benar"
                      checked={Boolean(opsi.is_benar)}
                      onChange={() => onSetCorrect(index)}
                    />
                    Benar
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-[#071E3D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Pertanyaan
          </button>
        </div>
      </form>
    </div>
  );
}

function getSkema(skema, paket) {
  const source = skema || paket?.skema || {};

  return {
    id_skema: source?.id_skema || paket?.id_skema || null,
    judul_skema:
      source?.judul_skema ||
      source?.nama_skema ||
      paket?.judul_skema ||
      "-",
    kode_skema:
      source?.kode_skema ||
      source?.nomor_skema ||
      paket?.kode_skema ||
      "-",
    jenis_skema:
      source?.jenis_skema ||
      source?.jenis ||
      source?.tipe_skema ||
      source?.kategori_skema ||
      source?.bentuk_skema ||
      paket?.jenis_skema ||
      "kkni",
  };
}

function normalizeImageUrl(value) {
  if (!value) {
    return "";
  }

  const clean = String(value).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  const baseUrl = api.defaults.baseURL || "http://localhost:3000/api";
  const rootUrl = baseUrl.replace(/\/api\/?$/, "");
  const uploadsMatch = clean.match(/(?:^|\/)(uploads\/.*)$/i);
  const relativePath = uploadsMatch
    ? uploadsMatch[1]
    : clean.replace(/^\/+/, "");

  return `${rootUrl}/${relativePath}`;
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    const [year, month, day] = stringValue.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return stringValue;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
