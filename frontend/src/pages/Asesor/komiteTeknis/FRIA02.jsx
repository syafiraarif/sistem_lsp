
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

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultKelompok = [
  {
    id_kelompok: null,
    kelompok_pekerjaan: "Kelompok Pekerjaan",
    units: [
      {
        kode_unit: "",
        judul_unit: "",
      },
    ],
    skenario_tugas: "",
    langkah_kerja: "",
    perlengkapan_peralatan: "",
    waktu: "",
  },
];

export default function FRIA02() {
  const { id_skema, idSkema, id } = useParams();
  const navigate = useNavigate();
  const skemaId = id_skema || idSkema || id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skema, setSkema] = useState(null);
  const [listAsesor, setListAsesor] = useState([]);
  const [listUnit, setListUnit] = useState([]);
  const [listKelompok, setListKelompok] = useState([]);

  const [form, setForm] = useState({
    petunjuk: defaultPetunjuk,
    kelompok: defaultKelompok,
    tuk: "Tempat Kerja",
    nama_asesor: "",
    nama_asesi: "",
    tanggal: getLocalDateString(),
    penyusun: [
      {
        id_user: "",
        nama: "",
        nomor_met: "",
        ttd: "",
        tanggal: "",
      },
    ],
    validator: [
      {
        id_user: "",
        nama: "",
        nomor_met: "",
        ttd: "",
        tanggal: "",
      },
    ],
  });

  const localStorageKey = useMemo(
    () => `fria02-skema-${skemaId}`,
    [skemaId]
  );

  useEffect(() => {
    const fetchData = async () => {
      let cachedForm = null;

      try {
        setLoading(true);

        const saved = localStorage.getItem(localStorageKey);

        if (saved) {
          try {
            cachedForm = JSON.parse(saved);

            setForm((prev) => ({
              ...prev,
              ...cachedForm,
              petunjuk:
                Array.isArray(cachedForm?.petunjuk) &&
                cachedForm.petunjuk.length
                  ? cachedForm.petunjuk
                  : prev.petunjuk,
              kelompok:
                Array.isArray(cachedForm?.kelompok) &&
                cachedForm.kelompok.length
                  ? cachedForm.kelompok
                  : prev.kelompok,
            }));
          } catch {
            localStorage.removeItem(localStorageKey);
            cachedForm = null;
          }
        }

        if (!skemaId) {
          throw new Error("ID skema tidak ditemukan.");
        }

        const [masterRes, asesorRes] = await Promise.all([
          api.get(`/asesor/skema/${skemaId}/fr-ia02`),
          api.get("/asesor/list-asesor"),
        ]);

        const responseData =
          masterRes.data?.data || masterRes.data || {};
        const master = responseData.master || null;

        const availableUnits = Array.isArray(responseData.units)
          ? responseData.units
          : [];

        const availableGroups = Array.isArray(responseData.kelompok)
          ? responseData.kelompok
          : [];

        const asesorData =
          asesorRes.data?.data || asesorRes.data || [];

        setSkema(responseData.skema || null);
        setListUnit(availableUnits);
        setListKelompok(availableGroups);
        setListAsesor(Array.isArray(asesorData) ? asesorData : []);

        const detailList = Array.isArray(master?.detail)
          ? master.detail
          : Array.isArray(master?.details)
            ? master.details
            : [];

        if (detailList.length) {
          const kelompokMap = new Map();

          detailList.forEach((item) => {
            const idKelompok =
              item?.id_kelompok ??
              item?.kelompok?.id_kelompok;

            const masterGroup = availableGroups.find(
              (group) =>
                String(group?.id_kelompok) === String(idKelompok)
            );

            if (!kelompokMap.has(idKelompok)) {
              kelompokMap.set(idKelompok, {
                id_kelompok: idKelompok ?? null,
                kelompok_pekerjaan:
                  item?.kelompok?.nama_kelompok ||
                  masterGroup?.nama_kelompok ||
                  item?.nama_kelompok ||
                  "Kelompok Pekerjaan",
                units: [],
                skenario_tugas: item?.skenario || "",
                langkah_kerja: item?.langkah_kerja || "",
                perlengkapan_peralatan: item?.peralatan || "",
                waktu: item?.durasi ?? "",
              });
            }

            const kelompok = kelompokMap.get(idKelompok);

            kelompok.units.push({
              kode_unit:
                item?.kode_unit ||
                item?.unit?.kode_unit ||
                "",
              judul_unit:
                item?.judul_unit ||
                item?.unit?.judul_unit ||
                "",
              urutan:
                item?.urutan ||
                kelompok.units.length + 1,
            });
          });

          const penyusun = [];
          const validator = [];

          const validatorList = Array.isArray(master?.validator)
            ? master.validator
            : [];

          validatorList.forEach((item) => {
            const role =
              item?.peran === "penyusun" ? "penyusun" : "validator";

            const idUser =
              item?.id_asesor ||
              item?.asesor?.id_user ||
              "";

            const cachedRows = Array.isArray(cachedForm?.[role])
              ? cachedForm[role]
              : [];

            const cachedRow = cachedRows.find(
              (row) =>
                String(row?.id_user || "") === String(idUser || "")
            );

            const data = {
              id_user: idUser,
              nama:
                item?.asesor?.nama_lengkap ||
                cachedRow?.nama ||
                "",
              nomor_met:
                item?.asesor?.no_lisensi ||
                item?.asesor?.nomor_met ||
                cachedRow?.nomor_met ||
                "",
              ttd:
                item?.asesor?.ttd_path ||
                cachedRow?.ttd ||
                "",
              tanggal:
                item?.tanggal ||
                cachedRow?.tanggal ||
                master?.tanggal ||
                (idUser ? getLocalDateString() : ""),
            };

            if (item?.peran === "penyusun") {
              penyusun.push(data);
            }

            if (item?.peran === "validator") {
              validator.push(data);
            }
          });

          setForm((prev) => ({
            ...prev,
            kelompok: Array.from(kelompokMap.values()),
            penyusun: penyusun.length ? penyusun : prev.penyusun,
            validator: validator.length ? validator : prev.validator,
            nama_asesor: prev.nama_asesor || penyusun[0]?.nama || "",
            tanggal:
              cachedForm?.tanggal ||
              master?.tanggal ||
              prev.tanggal ||
              getLocalDateString(),
          }));

          const mergedForm = {
            ...(cachedForm || {}),
            penyusun: penyusun.length ? penyusun : cachedForm?.penyusun || [],
            validator: validator.length
              ? validator
              : cachedForm?.validator || [],
          };

          try {
            localStorage.setItem(
              localStorageKey,
              JSON.stringify(mergedForm)
            );
          } catch (error) {
            console.error("CACHE FR.IA.02 SIGNATURE ERROR:", error);
          }
        } else if (
          !cachedForm?.kelompok?.length ||
          !cachedForm.kelompok.some((group) => group.id_kelompok)
        ) {
          const firstGroup = availableGroups[0];

          if (firstGroup) {
            setForm((prev) => ({
              ...prev,
              kelompok: [
                createKelompokFromMaster(firstGroup, availableUnits),
              ],
            }));
          }
        }
      } catch (err) {
        console.error("LOAD FR.IA.02 ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skemaId, localStorageKey]);

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!skemaId) {
        throw new Error("ID skema tidak ditemukan.");
      }

      const details = form.kelompok.flatMap((kelompok) =>
        kelompok.units
          .filter(
            (unit) =>
              unit.kode_unit &&
              Number.isInteger(Number(kelompok.id_kelompok))
          )
          .map((unit, index) => ({
            id_kelompok: Number(kelompok.id_kelompok),
            kode_unit: unit.kode_unit,
            judul_unit:
              unit.judul_unit ||
              getUnitTitle(
                listUnit.find(
                  (item) => getUnitCode(item) === unit.kode_unit
                )
              ) ||
              null,
            urutan: index + 1,
            skenario: kelompok.skenario_tugas,
            langkah_kerja: kelompok.langkah_kerja,
            peralatan: kelompok.perlengkapan_peralatan,
            durasi: kelompok.waktu,
          }))
      );

      const validators = [
        ...form.penyusun
          .filter((item) => item.id_user)
          .map((item, index) => ({
            id_asesor: Number(item.id_user),
            peran: "penyusun",
            urutan: index + 1,
            tanggal: item.tanggal || getLocalDateString(),
          })),
        ...form.validator
          .filter((item) => item.id_user)
          .map((item, index) => ({
            id_asesor: Number(item.id_user),
            peran: "validator",
            urutan: index + 1,
            tanggal: item.tanggal || getLocalDateString(),
          })),
      ];

      const payload = {
        id_skema: Number(skemaId),
        details,
        validators,
      };

      localStorage.setItem(localStorageKey, JSON.stringify(form));

      await api.post(
        `/asesor/skema/${skemaId}/fr-ia02`,
        payload
      );

      window.alert("FR.IA.02 berhasil disimpan.");
    } catch (err) {
      console.error("SAVE FR.IA.02 ERROR:", err);

      window.alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan FR.IA.02."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const updatePetunjuk = (index, value) => {
    setForm((prev) => ({
      ...prev,
      petunjuk: prev.petunjuk.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const addPetunjuk = () => {
    setForm((prev) => ({
      ...prev,
      petunjuk: [...prev.petunjuk, ""],
    }));
  };

  const removePetunjuk = (index) => {
    setForm((prev) => ({
      ...prev,
      petunjuk:
        prev.petunjuk.length > 1
          ? prev.petunjuk.filter(
              (_, itemIndex) => itemIndex !== index
            )
          : [""],
    }));
  };

  const updateHeader = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      try {
        localStorage.setItem(localStorageKey, JSON.stringify(next));
      } catch (error) {
        console.error("SAVE FR.IA.02 HEADER ERROR:", error);
      }

      return next;
    });
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
              units: kelompok.units.filter(
                (_, uIndex) => uIndex !== unitIndex
              ),
            }
          : kelompok
      ),
    }));
  };

  const addKelompok = () => {
    if (
      listKelompok.length <= 1 ||
      form.kelompok.length >= listKelompok.length
    ) {
      return;
    }

    const usedGroupIds = new Set(
      form.kelompok.map((item) => String(item.id_kelompok))
    );

    const nextGroup = listKelompok.find(
      (item) => !usedGroupIds.has(String(item.id_kelompok))
    );

    if (!nextGroup) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      kelompok: [
        ...prev.kelompok,
        createKelompokFromMaster(nextGroup, listUnit),
      ],
    }));
  };

  const removeKelompok = (index) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const handleAsesorSelection = (jenis, index, idUser) => {
    const selected = listAsesor.find(
      (asesor) => String(asesor?.id_user || "") === String(idUser || "")
    );

    const nextData = selected
      ? {
          id_user: selected.id_user,
          nama: selected.nama_lengkap || selected.nama || "",
          nomor_met: selected.no_lisensi || selected.nomor_met || "",
          ttd: selected.ttd_path || selected.tanda_tangan || "",
          tanggal: getLocalDateString(),
        }
      : {
          id_user: "",
          nama: "",
          nomor_met: "",
          ttd: "",
          tanggal: "",
        };

    const nextForm = {
      ...form,
      [jenis]: form[jenis].map((item, itemIndex) =>
        itemIndex === index ? nextData : item
      ),
    };

    if (jenis === "penyusun" && index === 0) {
      nextForm.nama_asesor = nextData.nama;
    }

    setForm(nextForm);

    try {
      localStorage.setItem(localStorageKey, JSON.stringify(nextForm));
    } catch (error) {
      console.error("SAVE FR.IA.02 SIGNATURE DATE ERROR:", error);
    }
  };

  const addPenyusun = () => {
    setForm((prev) => ({
      ...prev,
      penyusun: [
        ...prev.penyusun,
        {
          id_user: "",
          nama: "",
          nomor_met: "",
          ttd: "",
          tanggal: "",
        },
      ],
    }));
  };

  const addValidator = () => {
    setForm((prev) => ({
      ...prev,
      validator: [
        ...prev.validator,
        {
          id_user: "",
          nama: "",
          nomor_met: "",
          ttd: "",
          tanggal: "",
        },
      ],
    }));
  };

  const removePenyusun = (index) => {
    setForm((prev) => ({
      ...prev,
      penyusun: prev.penyusun.filter((_, i) => i !== index),
    }));
  };

  const removeValidator = (index) => {
    setForm((prev) => ({
      ...prev,
      validator: prev.validator.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold">
          <Loader2 size={22} className="animate-spin" />
          Memuat FR.IA.02...
        </div>
      </div>
    );
  }

  const namaSkema = skema?.judul_skema || skema?.nama_skema || "-";
  const kodeSkema = skema?.kode_skema || skema?.nomor_skema || "-";

  const jenisSkemaRaw = String(
    skema?.jenis_skema ||
      skema?.jenis ||
      skema?.tipe_skema ||
      skema?.kategori_skema ||
      "kkni"
  ).toLowerCase();

  const jenisSkema =
    jenisSkemaRaw.includes("klaster") ||
    jenisSkemaRaw.includes("cluster")
      ? "klaster"
      : jenisSkemaRaw.includes("okupasi")
        ? "okupasi"
        : "kkni";

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
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
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
        <div className="mb-8 text-center">
          <h1 className="text-[20px] font-bold">FR.IA.02</h1>
          <p className="mt-1 text-[16px] font-semibold">
            TUGAS PRAKTIK DEMONSTRASI
          </p>
        </div>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td
                rowSpan="6"
                className="w-[230px] border border-black px-2 py-2 align-middle text-[16px] font-bold leading-tight"
              >
                <div>Skema Sertifikasi</div>
                <div className="whitespace-nowrap text-[13px]">
                  (
                  <span
                    className={
                      jenisSkema === "kkni"
                        ? ""
                        : "line-through text-slate-500"
                    }
                  >
                    KKNI
                  </span>
                  {" / "}
                  <span
                    className={
                      jenisSkema === "okupasi"
                        ? ""
                        : "line-through text-slate-500"
                    }
                  >
                    Okupasi
                  </span>
                  {" / "}
                  <span
                    className={
                      jenisSkema === "klaster"
                        ? ""
                        : "line-through text-slate-500"
                    }
                  >
                    Klaster
                  </span>
                  )
                </div>
              </td>

              <td className="w-[90px] border border-black px-2 py-1 font-bold">
                Judul
              </td>
              <td className="w-[20px] border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1 font-bold">
                {namaSkema}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Nomor
              </td>
              <td className="border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1 font-bold">
                {kodeSkema}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                TUK
              </td>
              <td className="border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1">
                <select
                  value={form.tuk || "Tempat Kerja"}
                  onChange={(e) => updateHeader("tuk", e.target.value)}
                  className="w-full bg-transparent outline-none print:hidden"
                >
                  <option value="Tempat Kerja">Tempat Kerja</option>
                  <option value="LSP">LSP</option>
                  <option value="Mandiri">Mandiri</option>
                </select>
                <span className="hidden print:inline">
                  {form.tuk || "Tempat Kerja"}
                </span>
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Nama Asesor
              </td>
              <td className="border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1">
                <select
                  value={form.nama_asesor || ""}
                  onChange={(e) => updateHeader("nama_asesor", e.target.value)}
                  className="w-full bg-transparent outline-none print:hidden"
                >
                  <option value="">Pilih Asesor</option>
                  {listAsesor.map((asesor) => {
                    const nama =
                      asesor?.nama_lengkap || asesor?.nama || "";

                    return (
                      <option
                        key={asesor?.id_user || nama}
                        value={nama}
                      >
                        {nama}
                      </option>
                    );
                  })}
                </select>
                <span className="hidden print:inline">
                  {form.nama_asesor || "-"}
                </span>
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Nama Asesi
              </td>
              <td className="border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1">
                <input
                  value={form.nama_asesi || ""}
                  onChange={(e) => updateHeader("nama_asesi", e.target.value)}
                  placeholder="Masukkan nama asesi"
                  className="w-full bg-transparent outline-none print:hidden"
                />
                <span className="hidden print:inline">
                  {form.nama_asesi || "-"}
                </span>
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Tanggal
              </td>
              <td className="border border-black px-2 py-1 text-center">
                :
              </td>
              <td className="border border-black px-2 py-1">
                <input
                  type="date"
                  value={form.tanggal || ""}
                  onChange={(e) => updateHeader("tanggal", e.target.value)}
                  className="w-full bg-transparent outline-none print:hidden"
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
              <li key={index} className="pl-1">
                <div className="flex items-start gap-2">
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(e) =>
                      updatePetunjuk(index, e.target.value)
                    }
                    aria-label={`Petunjuk ${index + 1}`}
                    className="min-h-[28px] w-full resize-y bg-transparent leading-6 outline-none print:hidden"
                    placeholder="Tulis petunjuk..."
                  />
                  <span className="hidden whitespace-pre-wrap leading-6 print:block">
                    {item || "-"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePetunjuk(index)}
                    title="Hapus petunjuk"
                    aria-label="Hapus petunjuk"
                    className="mt-1 text-red-500 print:hidden"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={addPetunjuk}
            className="ml-[68px] mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 print:hidden"
          >
            <Plus size={14} />
            Tambah Petunjuk
          </button>
        </section>

        <section className="mt-7">
          <div className="flex gap-5">
            <span className="font-bold">B.</span>
            <h2 className="font-bold">
              Skenario Tugas Praktik Demonstrasi
            </h2>
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
                <thead>
                  <tr>
                    <th className="w-[45px] border border-black px-2 py-1">
                      No.
                    </th>
                    <th className="w-[170px] border border-black px-2 py-1">
                      Kode Unit
                    </th>
                    <th className="border border-black px-2 py-1">
                      Judul Unit
                    </th>
                    <th className="w-[50px] border border-black print:hidden"></th>
                  </tr>
                </thead>

                <tbody>
                  {kelompok.units.map((unit, unitIndex) => (
                    <tr key={unitIndex}>
                      {unitIndex === 0 && (
                        <td
                          rowSpan={kelompok.units.length}
                          className="w-[185px] border border-black px-2 py-2 align-top"
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

                      <td className="border border-black px-2 py-1 text-center">
                        {unitIndex + 1}
                      </td>

                      <td className="border border-black px-2 py-1">
                        <div className="print:hidden">
                          <select
                            value={unit.kode_unit}
                            onChange={(e) => {
                              const selected = listUnit.find(
                                (x) =>
                                  String(getUnitCode(x)) === e.target.value
                              );

                              updateUnit(
                                kelompokIndex,
                                unitIndex,
                                "kode_unit",
                                getUnitCode(selected) || ""
                              );

                              updateUnit(
                                kelompokIndex,
                                unitIndex,
                                "judul_unit",
                                getUnitTitle(selected) || ""
                              );
                            }}
                            className="w-full bg-transparent outline-none"
                          >
                            <option value="">Pilih Unit</option>
                            {listUnit.map((item) => (
                              <option
                                key={
                                  item?.id_unit ||
                                  item?.unit?.id_unit ||
                                  getUnitCode(item)
                                }
                                value={getUnitCode(item)}
                              >
                                {getUnitCode(item)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="hidden print:block">
                          {unit.kode_unit || "-"}
                        </p>
                      </td>

                      <td className="border border-black px-2 py-1">
                        <p className="leading-6">
                          {unit.judul_unit || "-"}
                        </p>
                      </td>

                      <td className="border border-black px-2 py-1 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() =>
                            removeUnit(kelompokIndex, unitIndex)
                          }
                          className="text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                    updateKelompok(
                      kelompokIndex,
                      "skenario_tugas",
                      value
                    )
                  }
                  placeholder="Tuliskan skenario tugas praktik demonstrasi..."
                />

                <InputTable
                  title="Perlengkapan dan Peralatan"
                  value={kelompok.perlengkapan_peralatan || ""}
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
                  title="Langkah Kerja"
                  value={kelompok.langkah_kerja || ""}
                  onChange={(value) =>
                    updateKelompok(
                      kelompokIndex,
                      "langkah_kerja",
                      value
                    )
                  }
                  placeholder="Tuliskan langkah kerja..."
                />

                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="w-[260px] border border-black bg-slate-100 px-3 py-3 font-bold">
                        Waktu :
                      </td>
                      <td className="border border-black px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="print:hidden">
                            <input
                              type="number"
                              min="1"
                              value={kelompok.waktu}
                              onChange={(e) =>
                                updateKelompok(
                                  kelompokIndex,
                                  "waktu",
                                  e.target.value
                                )
                              }
                              placeholder="120"
                              className="w-24 bg-transparent outline-none"
                            />
                          </div>

                          <span className="hidden print:inline">
                            {kelompok.waktu || "-"}
                          </span>
                          <span className="ml-2">Menit</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {kelompokIndex < form.kelompok.length - 1 && (
                <div className="my-10 border-t-4 border-black print:break-before-page"></div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addKelompok}
            disabled={
              listKelompok.length <= 1 ||
              form.kelompok.length >= listKelompok.length
            }
            title={
              listKelompok.length <= 1
                ? "Skema ini hanya memiliki satu kelompok pekerjaan"
                : form.kelompok.length >= listKelompok.length
                  ? "Semua kelompok pekerjaan sudah ditambahkan"
                  : "Tambah kelompok pekerjaan"
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
          >
            <Plus size={16} />
            Tambah Kelompok Pekerjaan
          </button>
        </section>

        <section className="mt-10">
          <table className="w-full border-collapse border border-black text-[13px]">
            <thead>
              <tr className="bg-slate-50 text-[13px] font-semibold">
                <th className="w-[90px] border border-black px-2 py-2">
                  STATUS
                </th>
                <th className="w-[45px] border border-black px-2 py-2">
                  NO
                </th>
                <th className="w-[230px] border border-black px-3 py-2 text-left">
                  NAMA
                </th>
                <th className="w-[180px] border border-black px-2 py-2">
                  NOMOR MET
                </th>
                <th className="w-[260px] border border-black px-2 py-2">
                  TANDA TANGAN DAN TANGGAL
                </th>
              </tr>
            </thead>

            <tbody>
              {form.penyusun.map((item, index) => (
                <tr key={`penyusun-${index}`}>
                  {index === 0 && (
                    <td
                      rowSpan={form.penyusun.length}
                      className="border border-black px-2 py-2 font-semibold align-middle"
                    >
                      Penyusun
                    </td>
                  )}

                  <td className="border border-black text-center">
                    {index + 1}
                  </td>

                  <td className="border border-black px-2">
                    <div className="print:hidden">
                      <select
                        value={item.id_user}
                        onChange={(e) =>
                          handleAsesorSelection(
                            "penyusun",
                            index,
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent outline-none"
                      >
                        <option value="">Pilih Asesor</option>
                        {listAsesor.map((asesor) => (
                          <option
                            key={asesor.id_user}
                            value={asesor.id_user}
                          >
                            {asesor.nama_lengkap}
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="hidden print:block whitespace-nowrap">
                      {item.nama || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2">
                    <p className="font-medium">
                      {item.nomor_met || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2">
                    <div className="flex flex-col items-center justify-center py-3">
                      {item.ttd && (
                        <img
                          src={
                            item.ttd.startsWith("http")
                              ? item.ttd
                              : `${(import.meta.env.VITE_API_BASE || "").replace(
                                  "/api",
                                  ""
                                )}/${item.ttd.replace(/^\/+/, "")}`
                          }
                          alt="TTD Penyusun"
                          className="max-h-20 max-w-[220px] object-contain"
                        />
                      )}

                      <div className="mt-2 w-[150px] border-b border-black"></div>

                      <p className="mt-2 text-center text-[12px]">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}

              {form.validator.map((item, index) => (
                <tr key={`validator-${index}`}>
                  {index === 0 && (
                    <td
                      rowSpan={form.validator.length}
                      className="border border-black px-2 py-2 font-semibold align-middle"
                    >
                      Validator
                    </td>
                  )}

                  <td className="border border-black text-center">
                    {index + 1}
                  </td>

                  <td className="border border-black px-2">
                    <div className="print:hidden">
                      <select
                        value={item.id_user}
                        onChange={(e) =>
                          handleAsesorSelection(
                            "validator",
                            index,
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent outline-none"
                      >
                        <option value="">Pilih Asesor</option>
                        {listAsesor.map((asesor) => (
                          <option
                            key={asesor.id_user}
                            value={asesor.id_user}
                          >
                            {asesor.nama_lengkap}
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="hidden print:block whitespace-nowrap">
                      {item.nama || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2">
                    <p className="font-medium">
                      {item.nomor_met || "-"}
                    </p>
                  </td>

                  <td className="border border-black px-2">
                    <div className="flex flex-col items-center justify-center py-3">
                      {item.ttd && (
                        <img
                          src={
                            item.ttd.startsWith("http")
                              ? item.ttd
                              : `${(import.meta.env.VITE_API_BASE || "").replace(
                                  "/api",
                                  ""
                                )}/${item.ttd.replace(/^\/+/, "")}`
                          }
                          alt="TTD Validator"
                          className="max-h-20 max-w-[220px] object-contain"
                        />
                      )}

                      <div className="mt-2 w-[150px] border-b border-black"></div>

                      <p className="mt-2 text-center text-[12px]">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex gap-3 print:hidden">
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
          </div>
        </section>

        <div className="mt-10 print:hidden"></div>
      </main>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          textarea,
          input,
          select {
            border: none !important;
            outline: none !important;
          }

          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function getUnitCode(item) {
  return (
    item?.kode_unit ||
    item?.unit?.kode_unit ||
    item?.unit_kompetensi?.kode_unit ||
    ""
  );
}

function getUnitTitle(item) {
  return (
    item?.judul_unit ||
    item?.unit?.judul_unit ||
    item?.unit?.judul ||
    item?.unit_kompetensi?.judul_unit ||
    item?.unit_kompetensi?.judul ||
    ""
  );
}

function createKelompokFromMaster(group, availableUnits = []) {
  const groupId = group?.id_kelompok ?? null;

  const linked = Array.isArray(group?.skemaUnit)
    ? group.skemaUnit
    : availableUnits.filter((item) => {
        const itemGroupId =
          item?.id_kelompok ?? item?.kelompok?.id_kelompok;

        return String(itemGroupId) === String(groupId);
      });

  const units = linked
    .map((item) => ({
      kode_unit: getUnitCode(item),
      judul_unit: getUnitTitle(item),
    }))
    .filter((item) => item.kode_unit);

  return {
    id_kelompok: groupId,
    kelompok_pekerjaan:
      group?.nama_kelompok ||
      group?.kelompok_pekerjaan ||
      group?.nama ||
      "Kelompok Pekerjaan",
    units: units.length
      ? units
      : [
          {
            kode_unit: "",
            judul_unit: "",
          },
        ],
    skenario_tugas: "",
    langkah_kerja: "",
    perlengkapan_peralatan: "",
    waktu: "",
  };
}

function InputTable({
  title,
  value,
  onChange,
  placeholder,
  small = false,
}) {
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
              className={`w-full resize-none bg-transparent p-2 leading-7 outline-none print:hidden ${
                small ? "min-h-[50px]" : "min-h-[110px]"
              }`}
            />

            <div className="hidden whitespace-pre-wrap p-2 leading-7 print:block">
              {value || "-"}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const parsed = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
