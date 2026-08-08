// frontend/src/pages/Asesor/FRIA05Asesor.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function FRIA05Asesor() {
  const params = useParams();
  const navigate = useNavigate();

  const idFrIa05 =
    params.id_fr_ia_05 ||
    params.idFrIa05 ||
    params.id ||
    params.id_jadwal ||
    params.idJadwal;

  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [data, setData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [jawabanForm, setJawabanForm] = useState({});
  const [umpanBalik, setUmpanBalik] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFrIa05]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!id_jadwal) {
        Swal.fire("Gagal", "ID Jadwal tidak ditemukan di URL", "error");
        return;
      }

      const res = await api.get(`/asesor/fr-ia05/asesor/${idFrIa05}`);
      const payload = res.data?.data || res.data || null;

      const list = normalizePertanyaan(payload);

      setData(payload);
      setPertanyaanList(list);
      setJawabanForm(createInitialJawabanForm(list));
      setUmpanBalik(getFirstUmpanBalik(list));
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal memuat FR.IA.05 Asesor Penguji",
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

  const handleJawabanChange = (idPertanyaan, field, value) => {
    setJawabanForm((prev) => ({
      ...prev,
      [idPertanyaan]: {
        ...prev[idPertanyaan],
        [field]: value,
      },
    }));
  };

  const saveJawaban = async (pertanyaan) => {
    const idPertanyaan = pertanyaan.id_pertanyaan;
    const form = jawabanForm[idPertanyaan] || {};

    if (!idPertanyaan) {
      return Swal.fire("Gagal", "ID pertanyaan tidak ditemukan", "error");
    }

    if (!form.tanggapan?.trim()) {
      return Swal.fire("Validasi", "Tanggapan wajib diisi", "warning");
    }

    if (!form.rekomendasi) {
      return Swal.fire("Validasi", "Pilih pencapaian Ya atau Tdk", "warning");
    }

    try {
      setSavingId(idPertanyaan);

      await api.post("/asesor/fr-ia05/asesor/jawaban", {
        id_pertanyaan: idPertanyaan,
        tanggapan: form.tanggapan,
        rekomendasi: form.rekomendasi,
        umpan_balik: umpanBalik || "",
        ttd_asesor: asesor?.ttd_path || asesor?.ttd || "",
      });

      Swal.fire({
        title: "Berhasil",
        text: "Jawaban berhasil disimpan",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal menyimpan jawaban",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const saveSemua = async () => {
    try {
      setSavingAll(true);

      for (const pertanyaan of pertanyaanList) {
        const idPertanyaan = pertanyaan.id_pertanyaan;
        const form = jawabanForm[idPertanyaan] || {};

        if (!idPertanyaan) continue;

        await api.post("/asesor/fr-ia05/asesor/jawaban", {
          id_pertanyaan: idPertanyaan,
          tanggapan: form.tanggapan || "",
          rekomendasi: form.rekomendasi || null,
          umpan_balik: umpanBalik || "",
          ttd_asesor: asesor?.ttd_path || asesor?.ttd || "",
        });
      }

      Swal.fire({
        title: "Berhasil",
        text: "Semua jawaban berhasil disimpan",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal menyimpan semua jawaban",
        "error"
      );
    } finally {
      setSavingAll(false);
    }
  };

  const downloadPdf = () => {
    if (!idFrIa05) return;

    window.open(
      `${api.defaults.baseURL}/asesor/fr-ia05/asesor/${idFrIa05}/pdf`,
      "_blank"
    );
  };

  const printPage = () => {
    window.print();
  };

  if (loading) {
    return <LoadingScreen title="Memuat FR.IA.05 Asesor Penguji..." />;
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
            onClick={saveSemua}
            disabled={savingAll}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 disabled:bg-orange-300"
          >
            {savingAll ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Semua
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
          FR.IA.05. PERTANYAAN UNTUK MENDUKUNG OBSERVASI
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
              Tanggapan asesi ditulis pada kolom tanggapan.
            </li>
            <li>
              Pencapaian diisi oleh asesor penguji dengan pilihan Ya atau Tdk.
            </li>
          </ul>
        </section>

        <div className="my-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 print:hidden">
          Mode Asesor Penguji: Pertanyaan tidak bisa diubah. Anda hanya mengisi
          tanggapan, pencapaian Ya/Tdk, dan umpan balik.
        </div>

        {Object.keys(kelompokMap).length === 0 ? (
          <EmptyState text="Belum ada pertanyaan FR.IA.05 dari Komite Teknis." />
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
                  {list.map((item, index) => {
                    const idPertanyaan = item.id_pertanyaan;
                    const form = jawabanForm[idPertanyaan] || {};
                    const isSaving = savingId === idPertanyaan;

                    return (
                      <React.Fragment key={idPertanyaan || index}>
                        <tr>
                          <td className="border border-black px-2 py-2 align-top">
                            <div className="flex gap-2">
                              <span className="font-bold">
                                {index + 1 + groupIndex}.
                              </span>
                              <span>{item.pertanyaan}</span>
                            </div>
                          </td>

                          <td className="border border-black px-2 py-2 text-center">
                            <input
                              type="radio"
                              name={`rekomendasi-${idPertanyaan}`}
                              checked={form.rekomendasi === "kompeten"}
                              onChange={() =>
                                handleJawabanChange(
                                  idPertanyaan,
                                  "rekomendasi",
                                  "kompeten"
                                )
                              }
                            />
                          </td>

                          <td className="border border-black px-2 py-2 text-center">
                            <input
                              type="radio"
                              name={`rekomendasi-${idPertanyaan}`}
                              checked={form.rekomendasi === "belum_kompeten"}
                              onChange={() =>
                                handleJawabanChange(
                                  idPertanyaan,
                                  "rekomendasi",
                                  "belum_kompeten"
                                )
                              }
                            />
                          </td>
                        </tr>

                        <tr>
                          <td
                            colSpan="3"
                            className="border border-black px-2 py-2 align-top"
                          >
                            <b>Tanggapan:</b>

                            <textarea
                              value={form.tanggapan || ""}
                              onChange={(e) =>
                                handleJawabanChange(
                                  idPertanyaan,
                                  "tanggapan",
                                  e.target.value
                                )
                              }
                              rows={3}
                              placeholder="Masukkan tanggapan asesi..."
                              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 print:border-0 print:p-0"
                            />

                            <div className="mt-3 flex justify-end print:hidden">
                              <button
                                type="button"
                                onClick={() => saveJawaban(item)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:bg-orange-300"
                              >
                                {isSaving ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Save size={15} />
                                )}
                                Simpan Jawaban
                              </button>
                            </div>
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

        <section className="mt-6">
          <label className="mb-2 block font-bold">Umpan balik asesi:</label>
          <textarea
            value={umpanBalik}
            onChange={(e) => setUmpanBalik(e.target.value)}
            rows={4}
            className="w-full border border-black px-2 py-2 text-sm outline-none"
            placeholder="Masukkan umpan balik asesi..."
          />
        </section>

        <SignatureBlock
          asesi={asesi}
          asesor={asesor}
          labelAsesor="ASESOR"
        />
      </main>
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
  const ttdUrl = normalizeFileUrl(asesor?.ttd_path || asesor?.ttd);

  return (
    <table className="mt-6 w-full border-collapse border border-black">
      <tbody>
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

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Tanda tangan dan Tanggal
          </td>
          <td className="border border-black px-2 py-1 text-center">:</td>
          <td className="h-[90px] border border-black px-2 py-1 align-middle">
            {ttdUrl ? (
              <img src={ttdUrl} alt="TTD Asesor" className="h-16 object-contain" />
            ) : (
              "-"
            )}
          </td>
        </tr>
      </tbody>
    </table>
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
    data?.frIa05Pertanyaan ||
    data?.questions ||
    [];

  return Array.isArray(list)
    ? [...list].sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0))
    : [];
}

function createInitialJawabanForm(list) {
  const result = {};

  list.forEach((item) => {
    const jawaban = item.jawaban || {};

    result[item.id_pertanyaan] = {
      tanggapan: jawaban.tanggapan || "",
      rekomendasi: jawaban.rekomendasi || "",
    };
  });

  return result;
}

function getFirstUmpanBalik(list) {
  for (const item of list) {
    if (item.jawaban?.umpan_balik) {
      return item.jawaban.umpan_balik;
    }
  }

  return "";
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
  return data?.asesor || {};
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

function normalizeFileUrl(path) {
  if (!path) return "";

  if (String(path).startsWith("http")) return path;

  const base = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
  const root = base.replace("/api", "");

  return `${root}/${String(path).replace(/^\/+/, "")}`;
}