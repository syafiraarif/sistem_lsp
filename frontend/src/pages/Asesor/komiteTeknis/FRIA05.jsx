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

export default function FRIA05() {
  const params = useParams();
  const navigate = useNavigate();

  const idSkema =
    params.id_skema ||
    params.idSkema ||
    params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [skema, setSkema] = useState(null);
  const [asesorList, setAsesorList] = useState([]);
  const [penyusun, setPenyusun] = useState([]);
  const [validator, setValidator] = useState([]);
  const [paket, setPaket] = useState(null);

  const [formPaket, setFormPaket] = useState({
    kode_paket: "",
    judul_paket: "Paket Soal FR.IA.05",
    passing_grade: 70,
    waktu: "",
  });

  const [showSoalModal, setShowSoalModal] =
    useState(false);

  const [editingSoal, setEditingSoal] =
    useState(null);

  const [formSoal, setFormSoal] = useState({
    pertanyaan: "",
    gambar_file: null,
    gambar_preview: "",
    gambar_lama: "",
    hapus_gambar: false,
    urutan: "",
    opsi: defaultOpsi.map((item) => ({
      ...item,
    })),
  });

  useEffect(() => {
    fetchData();
  }, [idSkema]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!idSkema) {
        throw new Error(
          "ID Skema tidak ditemukan di URL."
        );
      }

      const [skemaRes, paketRes, asesorRes] =
        await Promise.all([
          api.get("/asesor/skema"),
          api.get(
            `/asesor/fr-ia05/komite/skema/${idSkema}`
          ),
          api.get("/asesor/fr-ia05/komite/asesor"),
        ]);

      const daftarSkema =
        Array.isArray(
          skemaRes.data?.data
        )
          ? skemaRes.data.data
          : Array.isArray(
              skemaRes.data
            )
            ? skemaRes.data
            : [];

      const foundSkema =
        daftarSkema.find(
          (item) =>
            String(
              item?.id_skema ||
                item?.skema?.id_skema ||
                item?.Skema?.id_skema ||
                item?.id
            ) ===
            String(idSkema)
        );

      setSkema(
        foundSkema?.skema ||
          foundSkema?.Skema ||
          foundSkema ||
          null
      );

      const paketData =
        paketRes.data?.data ||
        paketRes.data ||
        {};

      setPaket(
        paketData?.paket ||
          paketData ||
          null
      );

      setPenyusun(
        paketData?.penyusun?.length
          ? paketData.penyusun
          : paketData?.validator?.filter(
              (item) =>
                item?.peran ===
                "penyusun"
            ) || []
      );

      setValidator(
        paketData?.validator?.filter(
          (item) =>
            item?.peran ===
            "validator"
        ) || []
      );

      setAsesorList(
        Array.isArray(
          asesorRes.data?.data
        )
          ? asesorRes.data.data
          : Array.isArray(
              asesorRes.data
            )
            ? asesorRes.data
            : []
      );

      const paket =
        paketData?.paket ||
        paketData ||
        null;

      if (paket) {
        setFormPaket((prev) => ({
          ...prev,
          kode_paket:
            paket?.kode_paket ||
            `FRIA05-${idSkema}`,
          judul_paket:
            paket?.judul_paket ||
            "Paket Soal FR.IA.05",
          passing_grade:
            paket?.passing_grade ??
            70,
          waktu:
            paket?.waktu ||
            "",
        }));
      } else {
        setFormPaket((prev) => ({
          ...prev,
          kode_paket:
            `FRIA05-${idSkema}`,
        }));
      }
    } catch (err) {
      console.error(
        "LOAD FR.IA.05 ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Gagal memuat data FR.IA.05.";

      await Swal.fire(
        "Gagal",
        message,
        "error"
      );

      try {
        const asesorRes =
          await api.get(
            "/asesor/fr-ia05/komite/asesor"
          );

        setAsesorList(
          Array.isArray(
            asesorRes.data?.data
          )
            ? asesorRes.data.data
            : []
        );
      } catch {
        setAsesorList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const skemaData =
    getSkema(skema, paket);

  const soalList =
    Array.isArray(
      paket?.soal
    )
      ? paket.soal
      : [];

  const tambahPenyusun = () => {
    setPenyusun((prev) => [
      ...prev,
      {
        id_asesor: "",
        nama_lengkap: "",
        no_reg_asesor: "",
        ttd_path: "",
      },
    ]);
  };

  const tambahValidator = () => {
    setValidator((prev) => [
      ...prev,
      {
        id_asesor: "",
        nama_lengkap: "",
        no_reg_asesor: "",
        ttd_path: "",
      },
    ]);
  };

  const hapusPenyusun = (index) => {
    setPenyusun((prev) =>
      prev.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const hapusValidator = (index) => {
    setValidator((prev) =>
      prev.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const handleAsesorChange = (
    jenis,
    index,
    id
  ) => {
    const selected =
      asesorList.find(
        (item) =>
          String(
            item?.id_user
          ) === String(id)
      );

    if (!selected) {
      return;
    }

    const nextData = {
      id_asesor:
        selected.id_user,
      nama_lengkap:
        selected.nama_lengkap ||
        "",
      no_reg_asesor:
        selected.no_reg_asesor ||
        "",
      ttd_path:
        selected.ttd_path ||
        "",
    };

    if (jenis === "penyusun") {
      setPenyusun((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index
            ? nextData
            : item
        )
      );
    } else {
      setValidator((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index
            ? nextData
            : item
        )
      );
    }
  };

  const handlePaketChange = (e) => {
    setFormPaket((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const savePaket = async () => {
    try {
      setSaving(true);

      if (!idSkema) {
        throw new Error(
          "ID Skema tidak ditemukan."
        );
      }

      const payload = {
        id_skema:
          Number(idSkema),
        kode_paket:
          formPaket.kode_paket,
        judul_paket:
          formPaket.judul_paket,
        passing_grade:
          Number(
            formPaket.passing_grade
          ) || 70,
        waktu:
          formPaket.waktu
            ? Number(
                formPaket.waktu
              )
            : null,
        validators: [
          ...penyusun
            .filter(
              (item) =>
                item?.id_asesor
            )
            .map(
              (
                item,
                index
              ) => ({
                id_asesor:
                  Number(
                    item.id_asesor
                  ),
                peran:
                  "penyusun",
                urutan:
                  index + 1,
              })
            ),

          ...validator
            .filter(
              (item) =>
                item?.id_asesor
            )
            .map(
              (
                item,
                index
              ) => ({
                id_asesor:
                  Number(
                    item.id_asesor
                  ),
                peran:
                  "validator",
                urutan:
                  index + 1,
              })
            ),
        ],
      };

      const res = await api.post(
        "/asesor/fr-ia05/komite",
        payload
      );

      setPaket(
        res.data?.data ||
          null
      );

      await Swal.fire({
        title: "Berhasil",
        text: "Paket FR.IA.05 berhasil disimpan.",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(
        "SAVE FR.IA.05 ERROR:",
        err
      );

      await Swal.fire(
        "Gagal",
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan paket.",
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

    const res = await api.post(
      "/asesor/fr-ia05/komite",
      {
        id_skema:
          Number(idSkema),
        kode_paket:
          formPaket.kode_paket ||
          `FRIA05-${idSkema}`,
        judul_paket:
          formPaket.judul_paket ||
          "Paket Soal FR.IA.05",
        passing_grade:
          Number(
            formPaket.passing_grade
          ) || 70,
        waktu:
          formPaket.waktu
            ? Number(
                formPaket.waktu
              )
            : null,
      }
    );

    const created =
      res.data?.data;

    setPaket(created);

    return created;
  };

  const openAddSoal = async () => {
    try {
      setSaving(true);

      await ensurePaket();

      setEditingSoal(null);

      setFormSoal({
        pertanyaan: "",
        gambar_file: null,
        gambar_preview: "",
        gambar_lama: "",
        hapus_gambar: false,
        urutan:
          soalList.length + 1,
        opsi: defaultOpsi.map(
          (item) => ({
            ...item,
          })
        ),
      });

      setShowSoalModal(true);
    } catch (err) {
      console.error(
        "CREATE PACKAGE ERROR:",
        err
      );

      await Swal.fire(
        "Gagal",
        err.response?.data?.message ||
          err.message ||
          "Gagal membuat paket soal.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditSoal = (
    soal
  ) => {
    const opsi =
      Array.isArray(
        soal?.opsi
      ) &&
      soal.opsi.length
        ? soal.opsi.map(
            (item) => ({
              kode_opsi:
                item?.kode_opsi,
              jawaban:
                item?.jawaban ||
                "",
              is_benar:
                Boolean(
                  item?.is_benar
                ),
            })
          )
        : defaultOpsi.map(
            (item) => ({
              ...item,
            })
          );

    setEditingSoal(soal);

    setFormSoal({
      pertanyaan:
        soal?.pertanyaan ||
        "",
      gambar_file:
        null,
      gambar_preview:
        soal?.gambar
          ? normalizeImageUrl(
              soal.gambar
            )
          : "",
      gambar_lama:
        soal?.gambar ||
        "",
      hapus_gambar:
        false,
      urutan:
        soal?.urutan ||
        "",
      opsi,
    });

    setShowSoalModal(true);
  };

  const closeSoalModal =
    () => {
      if (
        formSoal.gambar_preview &&
        formSoal.gambar_file
      ) {
        URL.revokeObjectURL(
          formSoal.gambar_preview
        );
      }

      setShowSoalModal(false);
      setEditingSoal(null);

      setFormSoal({
        pertanyaan: "",
        gambar_file: null,
        gambar_preview: "",
        gambar_lama: "",
        hapus_gambar: false,
        urutan: "",
        opsi: defaultOpsi.map(
          (item) => ({
            ...item,
          })
        ),
      });
    };

  const handleSoalChange = (
    e
  ) => {
    setFormSoal((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleGambarChange =
    (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowed.includes(
          file.type
        )
      ) {
        Swal.fire(
          "Format Salah",
          "Gambar harus JPG, PNG, atau WEBP.",
          "warning"
        );

        e.target.value = "";
        return;
      }

      if (
        file.size >
        2 * 1024 * 1024
      ) {
        Swal.fire(
          "Ukuran Terlalu Besar",
          "Maksimal gambar 2 MB.",
          "warning"
        );

        e.target.value = "";
        return;
      }

      const previewUrl =
        URL.createObjectURL(
          file
        );

      setFormSoal((prev) => ({
        ...prev,
        gambar_file:
          file,
        gambar_preview:
          previewUrl,
        hapus_gambar:
          false,
      }));
    };

  const hapusGambarSoal =
    () => {
      if (
        formSoal.gambar_preview &&
        formSoal.gambar_file
      ) {
        URL.revokeObjectURL(
          formSoal.gambar_preview
        );
      }

      setFormSoal((prev) => ({
        ...prev,
        gambar_file: null,
        gambar_preview: "",
        gambar_lama: "",
        hapus_gambar: true,
      }));
    };

  const handleOpsiChange = (
    index,
    field,
    value
  ) => {
    setFormSoal((prev) => ({
      ...prev,
      opsi: prev.opsi.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                [field]:
                  value,
              }
            : item
      ),
    }));
  };

  const setJawabanBenar = (
    index
  ) => {
    setFormSoal((prev) => ({
      ...prev,
      opsi: prev.opsi.map(
        (
          item,
          itemIndex
        ) => ({
          ...item,
          is_benar:
            itemIndex ===
            index,
        })
      ),
    }));
  };

  const saveSoal = async (
    e
  ) => {
    e.preventDefault();

    if (
      !formSoal.pertanyaan.trim()
    ) {
      await Swal.fire(
        "Validasi",
        "Pertanyaan wajib diisi.",
        "warning"
      );
      return;
    }

    const opsiKosong =
      formSoal.opsi.some(
        (item) =>
          !item.jawaban.trim()
      );

    if (opsiKosong) {
      await Swal.fire(
        "Validasi",
        "Semua opsi jawaban wajib diisi.",
        "warning"
      );
      return;
    }

    const adaBenar =
      formSoal.opsi.some(
        (item) =>
          item.is_benar
      );

    if (!adaBenar) {
      await Swal.fire(
        "Validasi",
        "Pilih satu jawaban benar.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);

      const currentPaket =
        await ensurePaket();

      const formData =
        new FormData();

      formData.append(
        "id_fr_ia_05",
        currentPaket.id_fr_ia_05
      );

      formData.append(
        "pertanyaan",
        formSoal.pertanyaan
      );

      formData.append(
        "urutan",
        formSoal.urutan ||
          soalList.length + 1
      );

      formData.append(
        "opsi",
        JSON.stringify(
          formSoal.opsi
        )
      );

      formData.append(
        "gambar_lama",
        formSoal.gambar_lama ||
          ""
      );

      formData.append(
        "hapus_gambar",
        formSoal.hapus_gambar
          ? "true"
          : "false"
      );

      if (
        formSoal.gambar_file
      ) {
        formData.append(
          "gambar_file",
          formSoal.gambar_file
        );
      }

      let res;

      if (editingSoal) {
        res =
          await api.put(
            `/asesor/fr-ia05/komite/soal/${editingSoal.id_soal}`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
      } else {
        res =
          await api.post(
            "/asesor/fr-ia05/komite/soal",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
      }

      if (
        res.data?.data
      ) {
        setPaket(
          res.data.data
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

      await fetchData();
    } catch (err) {
      console.error(
        "SAVE QUESTION ERROR:",
        err
      );

      await Swal.fire(
        "Gagal",
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan pertanyaan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSoal =
    async (soal) => {
      const confirm =
        await Swal.fire({
          title:
            "Hapus Pertanyaan?",
          text:
            "Pertanyaan dan opsi jawaban akan dihapus.",
          icon: "warning",
          showCancelButton:
            true,
          confirmButtonColor:
            "#d33",
          cancelButtonText:
            "Batal",
          confirmButtonText:
            "Hapus",
        });

      if (
        !confirm.isConfirmed
      ) {
        return;
      }

      try {
        setSaving(true);

        const res =
          await api.delete(
            `/asesor/fr-ia05/komite/soal/${soal.id_soal}`
          );

        if (
          res.data?.data
        ) {
          setPaket(
            res.data.data
          );
        }

        await Swal.fire({
          title: "Terhapus",
          text: "Pertanyaan berhasil dihapus.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });

        await fetchData();
      } catch (err) {
        console.error(
          "DELETE QUESTION ERROR:",
          err
        );

        await Swal.fire(
          "Gagal",
          err.response?.data?.message ||
            err.message ||
            "Gagal menghapus pertanyaan.",
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  const printPage =
    () => {
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
            onClick={savePaket}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}
            Simpan Paket
          </button>

          <button
            type="button"
            onClick={openAddSoal}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
          >
            <Plus size={18} />
            Tambah Pertanyaan
          </button>

          <button
            type="button"
            onClick={printPage}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download size={18} />
            Cetak
          </button>
        </div>
      </div>

      <main className="mx-auto w-[794px] bg-white px-6 py-6 text-[11px] text-black shadow-lg print:w-full print:shadow-none print:px-4 print:py-4">
        <div className="mb-6 text-center">
          <h1 className="text-[18px] font-bold">
            FR.IA.05A. DPT
          </h1>

          <p className="text-[15px] font-semibold">
            PERTANYAAN TERTULIS PILIHAN GANDA
          </p>
        </div>

        <table className="w-full border-collapse border border-black text-[11px]">
          <tbody>
            <tr>
              <td
                rowSpan="2"
                className="w-[240px] border border-black px-1 py-[2px] align-middle text-[16px] font-bold leading-tight"
              >
                Skema Sertifikasi
                <br />
                (KKNI/Okupasi/Klaster)
              </td>

              <td className="w-[90px] border border-black px-1 py-[2px] font-bold">
                Judul
              </td>

              <td className="w-[20px] border border-black px-1 py-[2px] text-center">
                :
              </td>

              <td className="border border-black px-1 py-[2px] font-bold">
                {
                  skemaData.judul_skema
                }
              </td>
            </tr>

            <tr>
              <td className="border border-black px-1 py-[2px] font-bold">
                Nomor
              </td>

              <td className="border border-black px-1 py-[2px] text-center">
                :
              </td>

              <td className="border border-black px-1 py-[2px] font-bold">
                {
                  skemaData.kode_skema
                }
              </td>
            </tr>

            <InfoRow
              label="Kode Paket"
              value={
                formPaket.kode_paket
              }
            />

            <InfoRow
              label="Judul Paket"
              value={
                formPaket.judul_paket
              }
            />

            <tr>
              <td
                colSpan="2"
                className="border border-black px-1 py-[2px] font-bold"
              >
                Passing Grade
              </td>

              <td className="border border-black px-1 py-[2px] text-center">
                :
              </td>

              <td className="border border-black px-1 py-[2px]">
                <input
                  type="number"
                  name="passing_grade"
                  value={
                    formPaket.passing_grade
                  }
                  onChange={
                    handlePaketChange
                  }
                  className="w-20 border-none bg-transparent outline-none print:hidden"
                />

                <span className="hidden print:inline">
                  {
                    formPaket.passing_grade
                  }
                </span>
              </td>
            </tr>

            <tr>
              <td
                colSpan="2"
                className="border border-black px-1 py-[2px] font-bold"
              >
                Waktu
              </td>

              <td className="border border-black px-1 py-[2px] text-center">
                :
              </td>

              <td className="border border-black px-2 py-[2px]">
                <div className="flex items-center gap-1 print:hidden">
                  <input
                    type="number"
                    min="1"
                    name="waktu"
                    value={
                      formPaket.waktu
                    }
                    onChange={
                      handlePaketChange
                    }
                    className="w-14 border-none bg-transparent outline-none"
                  />

                  <span className="font-medium">
                    menit
                  </span>
                </div>

                <span className="hidden print:inline">
                  {
                    formPaket.waktu ||
                    "-"
                  }{" "}
                  menit
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-3">
          <p className="italic text-[11px]">
            *Coret yang tidak perlu
          </p>

          <div className="mt-2 flex items-center justify-between">
            <p>
              Jawab semua pertanyaan berikut:
            </p>

            <button
              type="button"
              onClick={openAddSoal}
              className="inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-4 py-2 text-xs font-bold text-white print:hidden"
            >
              <Plus size={15} />
              Tambah Pertanyaan
            </button>
          </div>
        </div>

        <table className="mt-2 w-full border-collapse border border-black text-[13px]">
          <tbody>
            {soalList.length ===
            0 ? (
              <tr>
                <td className="border border-black px-3 py-10 text-center text-slate-500">
                  Belum ada pertanyaan.
                  Klik tombol Tambah
                  Pertanyaan.
                </td>
              </tr>
            ) : (
              soalList.map(
                (
                  soal,
                  soalIndex
                ) => (
                  <tr
                    key={
                      soal.id_soal
                    }
                  >
                    <td className="w-[45px] border border-black px-2 py-2 align-top">
                      {soalIndex +
                        1}
                    </td>

                    <td className="border border-black px-2 py-2 align-top">
                      <div className="flex justify-between gap-3">
                        <p className="font-semibold leading-6">
                          {
                            soal.pertanyaan
                          }
                        </p>

                        <div className="flex gap-2 print:hidden">
                          <button
                            type="button"
                            onClick={() =>
                              openEditSoal(
                                soal
                              )
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit
                              size={
                                16
                              }
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSoal(
                                soal
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2
                              size={
                                16
                              }
                            />
                          </button>
                        </div>
                      </div>

                      {soal.gambar && (
                        <div className="my-3 flex justify-center">
                          <img
                            src={normalizeImageUrl(
                              soal.gambar
                            )}
                            alt="Gambar soal"
                            className="max-h-[220px] max-w-full border object-contain"
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-3 space-y-2 pl-5">
                        {(
                          soal.opsi ||
                          []
                        ).map(
                          (
                            opsi
                          ) => (
                            <div
                              key={
                                opsi.id_opsi ||
                                opsi.kode_opsi
                              }
                              className="flex"
                            >
                              <span className="inline-block w-6 font-semibold">
                                {String(
                                  opsi.kode_opsi
                                ).toLowerCase()}
                                .
                              </span>

                              <span>
                                {
                                  opsi.jawaban
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>

        <section className="mt-8">
          <p className="mb-2 text-center text-[11px] font-bold uppercase">
            Penyusun dan Validator
          </p>

          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr>
                <th className="border border-black py-1">
                  STATUS
                </th>

                <th className="w-[45px] border border-black py-1">
                  NO
                </th>

                <th className="border border-black py-1">
                  NAMA
                </th>

                <th className="w-[140px] border border-black py-1">
                  NOMOR MET
                </th>

                <th className="w-[180px] border border-black py-1">
                  TANDA TANGAN DAN TANGGAL
                </th>
              </tr>
            </thead>

            <tbody>
              {penyusun.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={`penyusun-${index}`}
                  >
                    {index ===
                      0 && (
                      <td
                        rowSpan={
                          penyusun.length
                        }
                        className="border border-black text-center align-middle"
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
                          value={
                            item?.id_asesor ||
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            handleAsesorChange(
                              "penyusun",
                              index,
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent outline-none"
                        >
                          <option value="">
                            Pilih Asesor
                          </option>

                          {asesorList.map(
                            (
                              asesor
                            ) => (
                              <option
                                key={
                                  asesor.id_user
                                }
                                value={
                                  asesor.id_user
                                }
                              >
                                {
                                  asesor.nama_lengkap
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <p className="hidden print:block">
                        {
                          item?.nama_lengkap ||
                          "-"
                        }
                      </p>
                    </td>

                    <td className="border border-black px-2">
                      {
                        item?.no_reg_asesor ||
                        "-"
                      }
                    </td>

                    <td className="border border-black">
                      <div className="flex flex-col items-center justify-center py-2">
                        {item?.ttd_path && (
                          <img
                            src={normalizeImageUrl(
                              item.ttd_path
                            )}
                            className="max-h-16 object-contain"
                            alt="TTD Penyusun"
                          />
                        )}

                        <div className="mt-2 w-[140px] border-b border-black"></div>

                        <p className="mt-2">
                          -
                        </p>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {validator.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={`validator-${index}`}
                  >
                    {index ===
                      0 && (
                      <td
                        rowSpan={
                          validator.length
                        }
                        className="border border-black text-center align-middle"
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
                          value={
                            item?.id_asesor ||
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            handleAsesorChange(
                              "validator",
                              index,
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent outline-none"
                        >
                          <option value="">
                            Pilih Asesor
                          </option>

                          {asesorList.map(
                            (
                              asesor
                            ) => (
                              <option
                                key={
                                  asesor.id_user
                                }
                                value={
                                  asesor.id_user
                                }
                              >
                                {
                                  asesor.nama_lengkap
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <p className="hidden print:block">
                        {
                          item?.nama_lengkap ||
                          "-"
                        }
                      </p>
                    </td>

                    <td className="border border-black px-2">
                      {
                        item?.no_reg_asesor ||
                        "-"
                      }
                    </td>

                    <td className="border border-black">
                      <div className="flex flex-col items-center justify-center py-2">
                        {item?.ttd_path && (
                          <img
                            src={normalizeImageUrl(
                              item.ttd_path
                            )}
                            className="max-h-16 object-contain"
                            alt="TTD Validator"
                          />
                        )}

                        <div className="mt-2 w-[140px] border-b border-black"></div>

                        <p className="mt-2">
                          -
                        </p>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div className="mt-3 flex gap-3 print:hidden">
            <button
              type="button"
              onClick={
                tambahPenyusun
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white"
            >
              <Plus size={16} />
              Tambah Penyusun
            </button>

            <button
              type="button"
              onClick={
                tambahValidator
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white"
            >
              <Plus size={16} />
              Tambah Validator
            </button>
          </div>

          <div className="mt-2 flex gap-3 print:hidden">
            {penyusun.length >
              1 && (
              <button
                type="button"
                onClick={() =>
                  hapusPenyusun(
                    penyusun.length -
                      1
                  )
                }
                className="text-xs font-bold text-red-600"
              >
                Hapus Penyusun Terakhir
              </button>
            )}

            {validator.length >
              1 && (
              <button
                type="button"
                onClick={() =>
                  hapusValidator(
                    validator.length -
                      1
                  )
                }
                className="text-xs font-bold text-red-600"
              >
                Hapus Validator Terakhir
              </button>
            )}
          </div>
        </section>
      </main>

      {showSoalModal && (
        <ModalWrapper>
          <form
            onSubmit={saveSoal}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h3 className="text-lg font-black text-[#071E3D]">
                {editingSoal
                  ? "Edit Pertanyaan"
                  : "Tambah Pertanyaan"}
              </h3>

              <button
                type="button"
                onClick={
                  closeSoalModal
                }
                className="rounded-xl border p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
                  value={
                    formSoal.urutan
                  }
                  onChange={
                    handleSoalChange
                  }
                  className="w-full rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Pertanyaan
                </label>

                <textarea
                  name="pertanyaan"
                  value={
                    formSoal.pertanyaan
                  }
                  onChange={
                    handleSoalChange
                  }
                  rows="4"
                  className="w-full resize-none rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
                  placeholder="Tuliskan pertanyaan..."
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Image size={15} />
                  Gambar Soal dari Komputer
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={
                    handleGambarChange
                  }
                  className="w-full rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
                />

                {formSoal.gambar_preview && (
                  <div className="mt-3 rounded-xl border bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500">
                        Preview Gambar
                      </p>

                      <button
                        type="button"
                        onClick={
                          hapusGambarSoal
                        }
                        className="text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        Hapus Gambar
                      </button>
                    </div>

                    <img
                      src={
                        formSoal.gambar_preview
                      }
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
                  {formSoal.opsi.map(
                    (
                      opsi,
                      index
                    ) => (
                      <div
                        key={
                          opsi.kode_opsi
                        }
                        className="grid grid-cols-[45px_1fr_120px] items-center gap-3"
                      >
                        <div className="font-black text-[#071E3D]">
                          {
                            opsi.kode_opsi
                          }
                          .
                        </div>

                        <input
                          value={
                            opsi.jawaban
                          }
                          onChange={(
                            e
                          ) =>
                            handleOpsiChange(
                              index,
                              "jawaban",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border bg-white px-4 py-3 font-bold outline-none focus:border-orange-500"
                          placeholder={`Jawaban ${opsi.kode_opsi}`}
                          required
                        />

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <input
                            type="radio"
                            name="jawaban_benar"
                            checked={Boolean(
                              opsi.is_benar
                            )}
                            onChange={() =>
                              setJawabanBenar(
                                index
                              )
                            }
                          />
                          Benar
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-5">
              <button
                type="button"
                onClick={
                  closeSoalModal
                }
                className="rounded-xl border px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-[#071E3D] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}
                Simpan Pertanyaan
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          input,
          textarea,
          select {
            border: none !important;
            outline: none !important;
          }

          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <tr>
      <td
        colSpan="2"
        className="border border-black px-1 py-[2px] font-bold"
      >
        {label}
      </td>

      <td className="border border-black px-1 py-[2px] text-center">
        :
      </td>

      <td className="border border-black px-1 py-[2px]">
        {value || ""}
      </td>
    </tr>
  );
}

function ModalWrapper({
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      {children}
    </div>
  );
}

function getSkema(
  skema,
  paket
) {
  const source =
    skema ||
    paket?.skema ||
    {};

  return {
    id_skema:
      source?.id_skema ||
      paket?.id_skema ||
      null,

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
  };
}

function normalizeImageUrl(
  value
) {
  if (!value) {
    return "";
  }

  if (
    String(value).startsWith(
      "http"
    )
  ) {
    return value;
  }

  const base =
    api.defaults.baseURL ||
    "";

  const rootBase =
    base.replace(
      /\/api\/?$/,
      ""
    );

  if (
    String(value).startsWith(
      "/"
    )
  ) {
    return `${rootBase}${value}`;
  }

  return `${rootBase}/${value}`;
}