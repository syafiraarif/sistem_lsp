// frontend/src/pages/Asesor/komiteTeknis/FRIA03Komite.jsx

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

export default function FRIA03Komite() {
  const params = useParams();
  const navigate = useNavigate();

  const { id_jadwal } = useParams();
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState(null);

  const [form, setForm] = useState({
    id_unit: "",
    pertanyaan: "",
    urutan: "",
  });

  useEffect(() => {
    fetchData();
}, [id_jadwal]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!id_jadwal) {
        Swal.fire("Gagal", "ID Jadwal tidak ditemukan di URL", "error");
        return;
      }

      const res = await api.get(`/asesor/fr-ia03/komite/${id_jadwal}`);
      const payload = res.data?.data || res.data || null;
      setData(payload);
      setPertanyaanList(normalizePertanyaan(payload));
      const unitRes = await api.get(`/asesor/fr-ia02/unit/${id_jadwal}`);
      console.log(unitRes.data);
      setUnitOptions(unitRes.data || []);
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


  const openAdd = () => {
    setEditingPertanyaan(null);
    setForm({
      id_unit: unitOptions.length ? unitOptions[0].id_unit : "",
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
        id_jadwal,
        id_unit: Number(form.id_unit),
        pertanyaan: form.pertanyaan,
        urutan: Number(form.urutan)
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

const downloadPdf = useReactToPrint({
  contentRef: printRef,
  documentTitle: `FR-IA-03-${id_jadwal}`,
  pageStyle: `
    @page {
      size:A4;
      margin:10mm;
    }

    body{
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `,
});


const kelompokMap = useMemo(() => {
  const groups = {};

  unitOptions.forEach((unit) => {
    const namaKelompok = unit.nama_kelompok || "Kelompok Pekerjaan";

    if (!groups[namaKelompok]) {
      groups[namaKelompok] = [];
    }

    groups[namaKelompok].push(unit);
  });

  return groups;
}, [unitOptions]);

  if (loading) {
    return <LoadingScreen title="Memuat FR.IA.03 Komite Teknis..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <style>{`
        @media print {
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          section { page-break-inside: avoid; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
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
      className="mx-auto w-[900px] bg-white px-10 py-8 shadow-lg text-[14px] text-black"
      >
        <div className="mb-5 border border-black">
        <div className="border-b border-black py-2 text-center">
          <h1 className="text-[18px] font-bold">
            FR.IA.03
          </h1>

          <p className="text-[15px] font-bold uppercase">
            PERTANYAAN UNTUK MENDUKUNG OBSERVASI
          </p>
        </div>
      </div>

        <HeaderTable
          skema={skema}
          tuk={tuk}
          asesor={asesor}
          asesi={asesi}
          tanggal={data?.tanggal}
        />

        <section className="mt-5 border border-black">
          <div className="border-b border-black bg-gray-300 px-2 py-1 font-bold">
            PANDUAN BAGI ASESOR
          </div>

          <ul className="list-disc space-y-1 px-8 py-3 text-[13px] leading-relaxed">
            <li>Formulir ini diisi oleh asesor kompetensi dapat sebelum, pada saat atau setelah melakukan asesmen dengan metode observasi demonstrasi.</li>

            <li>Pertanyaan dibuat dengan tujuan untuk menggali, dapat berisi pertanyaan yang berkaitan dengan dimensi kompetensi, batasan variabel dan aspek kritis yang relevan dengan skenario tugas dan praktik demonstrasi.</li>

            <li>Jika pertanyaan disampaikan sebelum asesmen dilakukan praktik demonstrasi, maka pertanyaan dibuat berkaitan dengan aspek K3L, SOP, penggunaan peralatan dan perlengkapan.</li>

            <li>Jika setelah asesi melakukan praktik demonstrasi terdapat item pertanyaan pendukung observasi telah terpenuhi, maka pertanyaan tersebut tidak perlu ditanyakan lagi dan cukup memberi catatan bahwa sudah terpenuhi pada saat tugas praktik demonstrasi pada kolom tanggapan.</li>

            <li>Jika pada saat observasi ada hal yang perlu dikonfirmasi sedang dalam instrumen daftar pertanyaan pendukung observasi tidak ada, maka asesor dapat memberikan pertanyaan dengan syarat pertanyaan harus berkaitan dengan tugas praktik demonstrasi. Jika dilakukan, asesor harus mencatat dalam instrumen pertanyaan pendukung observasi.</li>

            <li>Tanggapan asesi ditulis pada kolom tanggapan.</li>
          </ul>
        </section>

        <div className="my-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
          Mode Komite Teknis: Anda hanya dapat menambah, mengubah, dan menghapus pertanyaan. Kolom tanggapan dan pencapaian dikunci untuk asesor penguji.
        </div>

        {unitOptions.length === 0 ? (
          <EmptyState text="Belum ada pertanyaan FR.IA.03. Klik Tambah Pertanyaan untuk membuat pertanyaan." />
        ) : (
          Object.entries(kelompokMap).map(([kelompok, list], groupIndex) => (
            <section key={kelompok} className="mb-8">
              <UnitTable
                kelompok={kelompok}
                list={list}
              />

              <table className="w-full border-collapse border border-black text-[13px]">
                <thead>
                  <tr className="bg-gray-100 print:bg-white">
                    <th className="border border-black px-3 py-2 text-center font-bold uppercase">
                      Pertanyaan
                    </th>

                    <th colSpan="2" className="w-[120px] border border-black px-3 py-2 text-center font-bold">
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
                        item.unit?.skemaUnit?.[0]?.kelompok?.nama_kelompok === kelompok ||
                        unitOptions.find(x => x.id_unit === item.id_unit)?.nama_kelompok === kelompok
                    )
                    .map((item, index) => (
                    <React.Fragment key={item.id_pertanyaan || index}>
                      <tr className="print:bg-white hover:bg-gray-50">
                        <td className="border border-black px-3 py-2">
                          <div className="flex items-start gap-2">
                            <span className="w-8 text-center font-bold">
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

                        <td className="border border-black py-3 text-center">
                          <div className="mx-auto h-6 w-6 border border-black"></div>
                        </td>

                        <td className="border border-black py-3 text-center">
                          <div className="mx-auto h-6 w-6 border border-black"></div>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan="3" className="h-[140px] border border-black px-3 py-3 align-top">
                        <div className="font-bold">Tanggapan :</div>

                        <p className="mt-2 text-xs italic text-slate-500 print:hidden">
                          Diisi oleh asesor penguji.
                        </p>
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

function HeaderTable({ skema, tuk, asesor, asesi, tanggal }) {
  return (
    <table className="w-full border-collapse border border-black text-[13px]">
      <tbody>
        <tr>
          <td rowSpan="2" className="w-[240px] border border-black px-2 py-2 align-middle font-bold">
            Skema Sertifikasi
            <br />
            (KKNI/Okupasi/Klaster)
          </td>

          <td className="w-[90px] border border-black px-2 py-1 font-bold">
            Judul
          </td>

          <td className="w-[20px] border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {skema.judul_skema}
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Nomor
          </td>

          <td className="border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {skema.kode_skema}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            TUK
          </td>

          <td className="border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {tuk}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Nama Asesor
          </td>

          <td className="border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {getNama(asesor)}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Nama Asesi
          </td>

          <td className="border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {getNama(asesi)}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            Tanggal
          </td>

          <td className="border border-black text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {formatTanggal(tanggal)}
          </td>
        </tr>
      </tbody>
    </table>
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

          <th className="w-[60px] border border-black px-2 py-2">
            No.
          </th>

          <th className="w-[180px] border border-black px-2 py-2">
            Kode Unit
          </th>

          <th className="border border-black px-2 py-2">
            Judul Unit
          </th>
        </tr>
      </thead>

      <tbody>
        {list.map((unit, index) => (
          <tr key={unit.id_unit}>
            <td className="border border-black px-2 py-2">
              {index === 0 ? kelompok : ""}
            </td>

            <td className="border border-black py-2 text-center">
              {index + 1}
            </td>

            <td className="border border-black px-2 py-2">
              {unit.kode_unit}
            </td>

            <td className="border border-black px-2 py-2">
              {unit.judul_unit}
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
            No. Reg
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {asesor?.no_reg_asesor || "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Tanda tangan dan Tanggal
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="h-[90px] border border-black px-2 py-1 text-center">
          {asesi?.ttd_path ? (
            <>
              <img
                src={`${import.meta.env.VITE_API_BASE.replace("/api","")}/${asesi.ttd_path}`}
                alt="TTD Asesi"
                className="mx-auto h-16 object-contain"
              />
              <p className="mt-1 text-xs">
                {formatTanggal(new Date())}
              </p>
            </>
          ) : null}
        </td>
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
          <td className="border border-black px-2 py-1 font-bold">
            Tanda tangan dan Tanggal
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="h-[90px] border border-black px-2 py-1 text-center">
            {asesor?.ttd_path ? (
              <>
                <img
                  src={`${import.meta.env.VITE_API_BASE.replace("/api","")}/${asesor.ttd_path}`}
                  alt="TTD Asesor"
                  className="mx-auto h-16 object-contain"
                />
                <p className="mt-1 text-xs">
                  {formatTanggal(new Date())}
                </p>
              </>
            ) : null}
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
              {unitOptions.map((unit) => (
                <option
                  key={unit.id_unit}
                  value={unit.id_unit}
                >
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

function formatTanggal(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}