// frontend/src/pages/Asesor/komiteTeknis/FRIA05.jsx

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

  const idJadwal = params.id_jadwal || params.idJadwal || params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [jadwal, setJadwal] = useState(null);
  const [asesor, setAsesor] = useState(null);
  const [penyusun, setPenyusun] = useState(null);
  const [validator, setValidator] = useState(null);
  const [paket, setPaket] = useState(null);

  const [formPaket, setFormPaket] = useState({
    kode_paket: "",
    judul_paket: "Paket Soal FR.IA.05",
    passing_grade: 70,
    nama_asesi: "",
    tanggal: getTodayDate(),
    waktu: "",
  });

  const [showSoalModal, setShowSoalModal] = useState(false);
  const [editingSoal, setEditingSoal] = useState(null);

  const [formSoal, setFormSoal] = useState({
    pertanyaan: "",
    gambar_file: null,
    gambar_preview: "",
    gambar_lama: "",
    hapus_gambar: false,
    urutan: "",
    opsi: defaultOpsi.map((item) => ({ ...item })),
  });

  useEffect(() => {
    fetchData();
  }, [idJadwal]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/asesor/fr-ia05/komite/jadwal/${idJadwal}`);
      const data = res.data?.data || {};

      setJadwal(data.jadwal || null);
      setAsesor(data.asesor || null);
      setPenyusun(data.penyusun || data.asesor || null);
      setValidator(data.validator || null);
      setPaket(data.paket || null);

      if (data.paket) {
        setFormPaket((prev) => ({
          ...prev,
          kode_paket: data.paket.kode_paket || `FRIA05-${idJadwal}`,
          judul_paket: data.paket.judul_paket || "Paket Soal FR.IA.05",
          passing_grade: data.paket.passing_grade || 70,
        }));
      } else {
        setFormPaket((prev) => ({
          ...prev,
          kode_paket: `FRIA05-${idJadwal}`,
        }));
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal memuat data FR.IA.05",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const skema = getSkema(jadwal, paket);
  const tuk = getTuk(jadwal);
  const namaAsesor = getNamaAsesor(penyusun || asesor);
  const soalList = Array.isArray(paket?.soal) ? paket.soal : [];

  const handlePaketChange = (e) => {
    setFormPaket((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const savePaket = async () => {
    try {
      setSaving(true);

      const res = await api.post("/asesor/fr-ia05/komite", {
        id_jadwal: idJadwal,
        id_skema: skema.id_skema,
        kode_paket: formPaket.kode_paket || `FRIA05-${idJadwal}`,
        judul_paket: formPaket.judul_paket || "Paket Soal FR.IA.05",
        passing_grade: formPaket.passing_grade || 70,
      });

      setPaket(res.data?.data || null);

      Swal.fire({
        title: "Berhasil",
        text: "Paket FR.IA.05 berhasil disimpan",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal menyimpan paket",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const ensurePaket = async () => {
    if (paket?.id_fr_ia_05) return paket;

    const res = await api.post("/asesor/fr-ia05/komite", {
      id_jadwal: idJadwal,
      id_skema: skema.id_skema,
      kode_paket: formPaket.kode_paket || `FRIA05-${idJadwal}`,
      judul_paket: formPaket.judul_paket || "Paket Soal FR.IA.05",
      passing_grade: formPaket.passing_grade || 70,
    });

    const created = res.data?.data;
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
        urutan: soalList.length + 1,
        opsi: defaultOpsi.map((item) => ({ ...item })),
      });

      setShowSoalModal(true);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal membuat paket soal",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditSoal = (soal) => {
    const opsi =
      Array.isArray(soal.opsi) && soal.opsi.length
        ? soal.opsi.map((item) => ({
            kode_opsi: item.kode_opsi,
            jawaban: item.jawaban || "",
            is_benar: Boolean(item.is_benar),
          }))
        : defaultOpsi.map((item) => ({ ...item }));

    setEditingSoal(soal);
    setFormSoal({
      pertanyaan: soal.pertanyaan || "",
      gambar_file: null,
      gambar_preview: soal.gambar ? normalizeImageUrl(soal.gambar) : "",
      gambar_lama: soal.gambar || "",
      hapus_gambar: false,
      urutan: soal.urutan || "",
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
    setFormSoal({
      pertanyaan: "",
      gambar_file: null,
      gambar_preview: "",
      gambar_lama: "",
      hapus_gambar: false,
      urutan: "",
      opsi: defaultOpsi.map((item) => ({ ...item })),
    });
  };

  const handleSoalChange = (e) => {
    setFormSoal((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGambarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      Swal.fire("Format Salah", "Gambar harus JPG, PNG, atau WEBP", "warning");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Ukuran Terlalu Besar", "Maksimal gambar 2 MB", "warning");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormSoal((prev) => ({
      ...prev,
      gambar_file: file,
      gambar_preview: previewUrl,
      hapus_gambar: false,
    }));
  };

  const hapusGambarSoal = () => {
    setFormSoal((prev) => ({
      ...prev,
      gambar_file: null,
      gambar_preview: "",
      gambar_lama: "",
      hapus_gambar: true,
    }));
  };

  const handleOpsiChange = (index, field, value) => {
    setFormSoal((prev) => ({
      ...prev,
      opsi: prev.opsi.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const setJawabanBenar = (index) => {
    setFormSoal((prev) => ({
      ...prev,
      opsi: prev.opsi.map((item, itemIndex) => ({
        ...item,
        is_benar: itemIndex === index,
      })),
    }));
  };

  const saveSoal = async (e) => {
    e.preventDefault();

    if (!formSoal.pertanyaan.trim()) {
      return Swal.fire("Validasi", "Pertanyaan wajib diisi", "warning");
    }

    const opsiKosong = formSoal.opsi.some((item) => !item.jawaban.trim());

    if (opsiKosong) {
      return Swal.fire("Validasi", "Semua opsi jawaban wajib diisi", "warning");
    }

    const adaBenar = formSoal.opsi.some((item) => item.is_benar);

    if (!adaBenar) {
      return Swal.fire("Validasi", "Pilih satu jawaban benar", "warning");
    }

    try {
      setSaving(true);

      const currentPaket = await ensurePaket();

      const formData = new FormData();
      formData.append("id_fr_ia_05", currentPaket.id_fr_ia_05);
      formData.append("pertanyaan", formSoal.pertanyaan);
      formData.append("urutan", formSoal.urutan || soalList.length + 1);
      formData.append("opsi", JSON.stringify(formSoal.opsi));
      formData.append("gambar_lama", formSoal.gambar_lama || "");
      formData.append("hapus_gambar", formSoal.hapus_gambar ? "true" : "false");

      if (formSoal.gambar_file) {
        formData.append("gambar_file", formSoal.gambar_file);
      }

      let res;

      if (editingSoal) {
        res = await api.put(
          `/asesor/fr-ia05/komite/soal/${editingSoal.id_soal}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await api.post("/asesor/fr-ia05/komite/soal", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setPaket(res.data?.data || null);
      closeSoalModal();

      Swal.fire({
        title: "Berhasil",
        text: "Pertanyaan berhasil disimpan",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal menyimpan pertanyaan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSoal = async (soal) => {
    const confirm = await Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Pertanyaan dan opsi jawaban akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Hapus",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSaving(true);

      const res = await api.delete(`/asesor/fr-ia05/komite/soal/${soal.id_soal}`);

      setPaket(res.data?.data || null);

      Swal.fire({
        title: "Terhapus",
        text: "Pertanyaan berhasil dihapus",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal menghapus pertanyaan",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (!paket?.id_fr_ia_05) {
      await savePaket();
      return;
    }

    window.open(
      `${api.defaults.baseURL}/asesor/fr-ia05/komite/${paket.id_fr_ia_05}/pdf`,
      "_blank"
    );
  };

  const printPage = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold">
          <Loader2 className="animate-spin" />
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
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
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

          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            PDF Backend
          </button>
        </div>
      </div>

      <main className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:shadow-none print:px-8 print:py-6">
        <h1 className="mb-6 text-[18px] font-bold">
          FR.IA.05A. DPT - PERTANYAAN TERTULIS PILIHAN GANDA
        </h1>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td
                rowSpan="2"
                className="w-[240px] border border-black px-2 py-1 align-middle text-[16px] font-bold leading-tight"
              >
                Skema Sertifikasi
                <br />
                (KKNI/Okupasi/Klaster)
              </td>

              <td className="w-[90px] border border-black px-2 py-1 font-bold">
                Judul
              </td>

              <td className="w-[20px] border border-black px-2 py-1 text-center">
                :
              </td>

              <td className="border border-black px-2 py-1 font-bold">
                {skema.judul_skema}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-2 py-1 font-bold">
                Nomor
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1 font-bold">
                {skema.kode_skema}
              </td>
            </tr>

            <InfoRow label="TUK" value={tuk || "Mandiri/Sewaktu/Tempat Kerja"} />
            <InfoRow label="Nama Asesor" value={namaAsesor} />

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Nama Asesi
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  name="nama_asesi"
                  value={formPaket.nama_asesi}
                  onChange={handlePaketChange}
                  className="w-full bg-transparent outline-none print:hidden"
                />

                <span className="hidden print:inline">{formPaket.nama_asesi}</span>
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Tanggal
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  type="date"
                  name="tanggal"
                  value={formPaket.tanggal}
                  onChange={handlePaketChange}
                  className="bg-transparent outline-none print:hidden"
                />

                <span className="hidden print:inline">
                  {formatTanggal(formPaket.tanggal)}
                </span>
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Waktu
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <input
                  name="waktu"
                  value={formPaket.waktu}
                  onChange={handlePaketChange}
                  placeholder="Contoh: 60 menit"
                  className="w-full bg-transparent outline-none print:hidden"
                />

                <span className="hidden print:inline">{formPaket.waktu}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 flex items-center justify-between print:block">
          <p>Jawab semua pertanyaan berikut:</p>

          <button
            type="button"
            onClick={openAddSoal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#071E3D] px-4 py-2 text-xs font-bold text-white print:hidden"
          >
            <Plus size={15} />
            Tambah Pertanyaan
          </button>
        </div>

        <table className="mt-2 w-full border-collapse border border-black">
          <tbody>
            {soalList.length === 0 ? (
              <tr>
                <td className="border border-black px-3 py-10 text-center text-slate-500">
                  Belum ada pertanyaan. Klik tombol Tambah Pertanyaan.
                </td>
              </tr>
            ) : (
              soalList.map((soal, soalIndex) => (
                <tr key={soal.id_soal}>
                  <td className="w-[45px] border border-black px-2 py-2 align-top">
                    {soalIndex + 1}
                  </td>

                  <td className="border border-black px-2 py-2 align-top">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium">{soal.pertanyaan}</p>

                      <div className="flex gap-2 print:hidden">
                        <button
                          type="button"
                          onClick={() => openEditSoal(soal)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSoal(soal)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {soal.gambar && (
                      <div className="my-3">
                        <img
                          src={normalizeImageUrl(soal.gambar)}
                          alt="Gambar soal"
                          className="max-h-[180px] max-w-[320px] border border-slate-300 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="mt-2 space-y-1">
                      {(soal.opsi || []).map((opsi) => (
                        <div
                          key={opsi.id_opsi || opsi.kode_opsi}
                          className="flex"
                        >
                          <span className="w-[35px]">
                            {String(opsi.kode_opsi).toLowerCase()}.
                          </span>

                          <span>{opsi.jawaban}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <section className="mt-14 flex justify-end">
          <div className="w-[280px] text-center">
            <SignatureBlock title="Penyusun / Komite Teknis" person={penyusun} />
            <div className="h-12" />
            <SignatureBlock title="Validator / Asesor Penguji" person={validator} />
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
                {editingSoal ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
              </h3>

              <button
                type="button"
                onClick={closeSoalModal}
                className="rounded-xl border p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Nomor / Urutan
                </label>

                <input
                  type="number"
                  name="urutan"
                  value={formSoal.urutan}
                  onChange={handleSoalChange}
                  className="w-full rounded-xl border px-4 py-3 font-bold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Pertanyaan
                </label>

                <textarea
                  name="pertanyaan"
                  value={formSoal.pertanyaan}
                  onChange={handleSoalChange}
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
                  onChange={handleGambarChange}
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
                        onClick={hapusGambarSoal}
                        className="text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        Hapus Gambar
                      </button>
                    </div>

                    <img
                      src={formSoal.gambar_preview}
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
                  {formSoal.opsi.map((opsi, index) => (
                    <div
                      key={opsi.kode_opsi}
                      className="grid grid-cols-[45px_1fr_120px] gap-3 items-center"
                    >
                      <div className="font-black text-[#071E3D]">
                        {opsi.kode_opsi}.
                      </div>

                      <input
                        value={opsi.jawaban}
                        onChange={(e) =>
                          handleOpsiChange(index, "jawaban", e.target.value)
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
                          onChange={() => setJawabanBenar(index)}
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
                onClick={closeSoalModal}
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
                  <Loader2 size={16} className="animate-spin" />
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
        }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td colSpan="2" className="border border-black px-2 py-1 font-bold">
        {label}
      </td>

      <td className="border border-black px-2 py-1 text-center">:</td>

      <td className="border border-black px-2 py-1">{value || ""}</td>
    </tr>
  );
}

function SignatureBlock({ title, person }) {
  return (
    <div className="text-center">
      <p className="text-sm font-medium">{title}</p>

      <div className="my-3 flex h-[70px] items-center justify-center">
        {getTtd(person) ? (
          <img
            src={normalizeImageUrl(getTtd(person))}
            alt="Tanda tangan"
            className="max-h-[65px] max-w-[150px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="h-[60px]" />
        )}
      </div>

      <p className="font-semibold">
        {getNamaAsesor(person) || "____________________"}
      </p>
    </div>
  );
}

function ModalWrapper({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
      {children}
    </div>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatTanggal(value) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function normalizeImageUrl(value) {
  if (!value) return "";

  if (String(value).startsWith("http")) {
    return value;
  }

  const base = api.defaults.baseURL || "";
  const rootBase = base.replace(/\/api\/?$/, "");

  if (String(value).startsWith("/")) {
    return `${rootBase}${value}`;
  }

  return `${rootBase}/${value}`;
}

function getSkema(jadwal, paket) {
  const skema = paket?.skema || jadwal?.skema;

  if (skema && typeof skema === "object") {
    return {
      id_skema: skema.id_skema || jadwal?.id_skema || paket?.id_skema,
      judul_skema:
        skema.judul_skema ||
        skema.nama_skema ||
        jadwal?.nama_skema ||
        "-",
      kode_skema:
        skema.kode_skema ||
        skema.nomor_skema ||
        jadwal?.kode_skema ||
        "-",
    };
  }

  return {
    id_skema: jadwal?.id_skema || paket?.id_skema || null,
    judul_skema: jadwal?.judul_skema || jadwal?.nama_skema || skema || "-",
    kode_skema: jadwal?.kode_skema || jadwal?.nomor_skema || "-",
  };
}

function getTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    "Mandiri/Sewaktu/Tempat Kerja"
  );
}

function getNamaAsesor(asesor) {
  return (
    asesor?.nama_lengkap ||
    asesor?.nama_asesor ||
    asesor?.user?.nama_lengkap ||
    asesor?.user?.nama ||
    asesor?.user?.username ||
    ""
  );
}

function getTtd(asesor) {
  return (
    asesor?.ttd_path ||
    asesor?.tanda_tangan ||
    asesor?.ttd ||
    asesor?.signature ||
    ""
  );
}