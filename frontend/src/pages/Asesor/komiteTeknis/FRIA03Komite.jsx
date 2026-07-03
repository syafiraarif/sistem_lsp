// frontend/src/pages/Asesor/komiteTeknis/FRIA03Komite.jsx

import React, { useEffect, useMemo, useState } from "react";
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

export default function FRIA03Komite() {
  const params = useParams();
  const navigate = useNavigate();

  const idFrIa03 =
    params.id_fr_ia_03 ||
    params.idFrIa03 ||
    params.id ||
    params.id_jadwal ||
    params.idJadwal;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState(null);

  const [form, setForm] = useState({
    id_unit: "",
    pertanyaan: "",
    urutan: "",
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFrIa03]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!idFrIa03) {
        Swal.fire("Gagal", "ID FR.IA.03 tidak ditemukan di URL", "error");
        return;
      }

      const res = await api.get(`/asesor/fr-ia03/komite/${idFrIa03}`);
      const payload = res.data?.data || res.data || null;

      setData(payload);
      setPertanyaanList(normalizePertanyaan(payload));
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal memuat FR.IA.03 Komite Teknis",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const skema = getSkema(data);
  const tuk = getTuk(data);
  const asesor = getAsesor(data);
  const asesi = getAsesi(data);

  const unitOptions = useMemo(() => {
    const list = [];

    pertanyaanList.forEach((item) => {
      const unit = item.unit || {};
      const idUnit = item.id_unit || unit.id_unit;

      if (!idUnit) return;

      const exists = list.some((x) => Number(x.id_unit) === Number(idUnit));

      if (!exists) {
        list.push({
          id_unit: idUnit,
          kode_unit: getUnitKode(unit),
          judul_unit: getUnitJudul(unit),
        });
      }
    });

    return list;
  }, [pertanyaanList]);

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
      id_unit: item.id_unit || item.unit?.id_unit || "",
      pertanyaan: item.pertanyaan || "",
      urutan: item.urutan || "",
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

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const savePertanyaan = async (e) => {
    e.preventDefault();

    if (!form.pertanyaan.trim()) {
      return Swal.fire("Validasi", "Pertanyaan wajib diisi", "warning");
    }

    if (!form.id_unit) {
      return Swal.fire("Validasi", "Unit kompetensi wajib dipilih", "warning");
    }

    try {
      setSaving(true);

      const payload = {
        id_fr_ia_03: idFrIa03,
        id_unit: Number(form.id_unit),
        pertanyaan: form.pertanyaan,
        urutan: Number(form.urutan || pertanyaanList.length + 1),
      };

      if (editingPertanyaan) {
        await api.put(
          `/asesor/fr-ia03/komite/pertanyaan/${editingPertanyaan.id_pertanyaan}`,
          payload
        );
      } else {
        await api.post("/asesor/fr-ia03/komite/pertanyaan", payload);
      }

      closeModal();

      Swal.fire({
        title: "Berhasil",
        text: "Pertanyaan FR.IA.03 berhasil disimpan",
        icon: "success",
        timer: 1200,
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

  const deletePertanyaan = async (item) => {
    const confirm = await Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Pertanyaan akan dihapus dari FR.IA.03.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Hapus",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSaving(true);

      await api.delete(
        `/asesor/fr-ia03/komite/pertanyaan/${item.id_pertanyaan}`
      );

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

  const downloadPdf = () => {
    if (!idFrIa03) return;

    window.open(
      `${api.defaults.baseURL}/asesor/fr-ia03/komite/${idFrIa03}/pdf`,
      "_blank"
    );
  };

  const printPage = () => {
    window.print();
  };

  const kelompokMap = useMemo(() => {
    const groups = {};

    pertanyaanList.forEach((item) => {
      const kelompok =
        item.unit?.kelompok_pekerjaan?.nama_kelompok ||
        item.unit?.kelompok?.nama_kelompok ||
        item.kelompok_pekerjaan ||
        "Kelompok Pekerjaan";

      if (!groups[kelompok]) {
        groups[kelompok] = [];
      }

      groups[kelompok].push(item);
    });

    return groups;
  }, [pertanyaanList]);

  if (loading) {
    return <LoadingScreen title="Memuat FR.IA.03 Komite Teknis..." />;
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

          <button
            type="button"
            onClick={printPage}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cetak
          </button>
        </div>
      </div>

      <main className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:shadow-none print:px-8 print:py-6">
        <h1 className="mb-6 text-[18px] font-bold">
          FR.IA.03. PERTANYAAN UNTUK MENDUKUNG OBSERVASI
        </h1>

        <HeaderTable skema={skema} tuk={tuk} asesor={asesor} asesi={asesi} />

        <section className="mt-5 border border-black">
          <div className="border-b border-black bg-gray-300 px-2 py-1 font-bold">
            PANDUAN BAGI ASESOR
          </div>

          <ul className="list-disc space-y-1 px-8 py-3 text-[13px] leading-relaxed">
            <li>
              Formulir ini diisi oleh asesor kompetensi dapat sebelum, pada saat
              atau setelah melakukan asesmen dengan metode observasi demonstrasi.
            </li>
            <li>
              Pertanyaan dibuat untuk menggali dimensi kompetensi, batasan
              variabel, dan aspek kritis sesuai skenario tugas praktik
              demonstrasi.
            </li>
            <li>
              Tanggapan dan pencapaian Ya/Tdk hanya diisi oleh asesor penguji.
            </li>
          </ul>
        </section>

        <div className="my-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 print:hidden">
          Mode Komite Teknis: Anda hanya dapat menambah, mengubah, dan menghapus
          pertanyaan. Kolom tanggapan dan pencapaian dikunci untuk asesor
          penguji.
        </div>

        {Object.keys(kelompokMap).length === 0 ? (
          <EmptyState text="Belum ada pertanyaan FR.IA.03. Klik Tambah Pertanyaan untuk membuat pertanyaan." />
        ) : (
          Object.entries(kelompokMap).map(([kelompok, list], groupIndex) => (
            <section key={kelompok} className="mb-5">
              <UnitTable kelompok={kelompok} list={list} />

              <table className="mt-4 w-full border-collapse border border-black">
                <thead>
                  <tr>
                    <th className="border border-black px-2 py-2 text-center">
                      Pertanyaan
                    </th>
                    <th
                      colSpan="2"
                      className="w-[120px] border border-black px-2 py-1 text-center"
                    >
                      Pencapaian
                    </th>
                  </tr>

                  <tr>
                    <th className="border border-black px-2 py-1"></th>
                    <th className="w-[60px] border border-black px-2 py-1">
                      Ya
                    </th>
                    <th className="w-[60px] border border-black px-2 py-1">
                      Tdk
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((item, index) => (
                    <React.Fragment key={item.id_pertanyaan || index}>
                      <tr>
                        <td className="border border-black px-2 py-2 align-top">
                          <div className="flex items-start gap-2">
                            <span className="font-bold">
                              {index + 1 + groupIndex}.
                            </span>

                            <span className="flex-1">{item.pertanyaan}</span>

                            <div className="flex gap-2 print:hidden">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deletePertanyaan(item)}
                                className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="border border-black px-2 py-2 text-center">
                          <input type="checkbox" disabled />
                        </td>

                        <td className="border border-black px-2 py-2 text-center">
                          <input type="checkbox" disabled />
                        </td>
                      </tr>

                      <tr>
                        <td
                          colSpan="3"
                          className="h-[70px] border border-black px-2 py-2 align-top"
                        >
                          <b>Tanggapan:</b>
                          <div className="mt-2 text-xs italic text-slate-500 print:hidden">
                            Tanggapan hanya dapat diisi oleh asesor penguji.
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}

        <SignatureBlock
          asesi={asesi}
          asesor={asesor}
          labelAsesor="KOMITE TEKNIS"
        />
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

/* =========================
COMPONENTS
========================= */

function HeaderTable({ skema, tuk, asesor, asesi }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td
            rowSpan="2"
            className="w-[220px] border border-black px-2 py-2 align-middle font-bold leading-tight"
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
          <td className="border border-black px-2 py-1 font-bold">Nomor</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1 font-bold">
            {skema.kode_skema}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            TUK
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{tuk}</td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Nama Asesor
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">
            {getNama(asesor)}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Nama Asesi
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{getNama(asesi)}</td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Tanggal
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{getTodayDate()}</td>
        </tr>
      </tbody>
    </table>
  );
}

function UnitTable({ kelompok, list }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td
            rowSpan={Math.max(list.length + 1, 2)}
            className="w-[170px] border border-black px-2 py-1 align-middle"
          >
            Kelompok Pekerjaan
            <br />
            {kelompok}
          </td>

          <td className="w-[45px] border border-black px-2 py-1 font-bold">
            No.
          </td>

          <td className="w-[170px] border border-black px-2 py-1 font-bold">
            Kode Unit
          </td>

          <td className="border border-black px-2 py-1 font-bold">
            Judul Unit
          </td>
        </tr>

        {list.map((item, index) => (
          <tr key={`${item.id_pertanyaan}-${index}`}>
            <td className="border border-black px-2 py-1">{index + 1}.</td>
            <td className="border border-black px-2 py-1">
              {getUnitKode(item.unit)}
            </td>
            <td className="border border-black px-2 py-1">
              {getUnitJudul(item.unit)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignatureBlock({ asesi, asesor, labelAsesor = "ASESOR" }) {
  return (
    <table className="mt-6 w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td colSpan="3" className="border border-black px-2 py-1 font-bold">
            Umpan balik asesi:
          </td>
        </tr>

        <tr>
          <td colSpan="3" className="h-[80px] border border-black px-2 py-1" />
        </tr>

        <tr>
          <td colSpan="3" className="border border-black px-2 py-1 font-bold">
            ASESI :
          </td>
        </tr>

        <tr>
          <td className="w-[220px] border border-black px-2 py-1 font-bold">
            Nama
          </td>
          <td className="w-[30px] border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="border border-black px-2 py-1">{getNama(asesi)}</td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Tanda tangan dan Tanggal
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="h-[70px] border border-black px-2 py-1"></td>
        </tr>

        <tr>
          <td colSpan="3" className="border border-black px-2 py-1 font-bold">
            {labelAsesor} :
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">Nama</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">{getNama(asesor)}</td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">No. Reg</td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="border border-black px-2 py-1">
            {asesor?.no_reg || asesor?.nomor_registrasi || "-"}
          </td>
        </tr>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
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
              <option value="">Pilih Unit</option>
              {unitOptions.map((unit) => (
                <option key={unit.id_unit} value={unit.id_unit}>
                  {unit.kode_unit} - {unit.judul_unit}
                </option>
              ))}
            </select>

            {unitOptions.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                Unit belum tersedia dari data FR.IA.03. Pastikan backend
                mengirim unit pada pertanyaan.
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
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-orange-300"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingScreen({ title }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600 font-bold">
        <Loader2 className="animate-spin" />
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

/* =========================
HELPERS
========================= */

function normalizePertanyaan(data) {
  const list =
    data?.pertanyaan ||
    data?.Pertanyaan ||
    data?.frIa03Pertanyaan ||
    data?.questions ||
    [];

  return Array.isArray(list)
    ? [...list].sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0))
    : [];
}

function getSkema(data) {
  const skema = data?.skema || data?.Skema || {};

  return {
    id_skema: skema.id_skema || data?.id_skema || "",
    judul_skema:
      skema.judul_skema ||
      skema.nama_skema ||
      data?.judul_skema ||
      data?.nama_skema ||
      "-",
    kode_skema:
      skema.kode_skema ||
      skema.nomor_skema ||
      data?.kode_skema ||
      data?.nomor_skema ||
      "-",
  };
}

function getTuk(data) {
  const tuk = data?.tuk || data?.Tuk || {};

  return tuk.nama_tuk || tuk.nama || data?.nama_tuk || "-";
}

function getAsesor(data) {
  return data?.asesor || data?.komite || data?.penyusun || {};
}

function getAsesi(data) {
  return data?.asesi || {};
}

function getNama(obj) {
  return (
    obj?.nama_lengkap ||
    obj?.nama ||
    obj?.username ||
    obj?.email ||
    "-"
  );
}

function getUnitKode(unit) {
  return (
    unit?.kode_unit ||
    unit?.kode ||
    unit?.kode_unit_kompetensi ||
    "-"
  );
}

function getUnitJudul(unit) {
  return (
    unit?.judul_unit ||
    unit?.nama_unit ||
    unit?.judul ||
    unit?.nama ||
    "-"
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}