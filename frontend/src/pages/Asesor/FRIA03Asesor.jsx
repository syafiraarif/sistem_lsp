import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Printer, Save } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function FRIA03Asesor() {
  const { id_jadwal, id_peserta } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [data, setData] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [jawabanForm, setJawabanForm] = useState({});
  const [umpanBalik, setUmpanBalik] = useState("");

  useEffect(() => {
    fetchData();
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
    if (!id_jadwal || !id_peserta) {
      setLoading(false);
      Swal.fire("Gagal", "ID jadwal atau ID peserta tidak ditemukan", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/asesor/fr-ia03/asesor/${id_jadwal}/${id_peserta}`
      );

      const payload = response?.data?.data || response?.data || null;

      if (!payload) {
        throw new Error("Data FR.IA.03 tidak ditemukan");
      }

      const list = normalizePertanyaan(payload);
      const initialForm = createInitialJawabanForm(list);

      setData(payload);
      setPertanyaanList(list);
      setJawabanForm(initialForm);
      setUmpanBalik(getFirstUmpanBalik(list));
    } catch (error) {
      console.error(error);

      setData(null);
      setPertanyaanList([]);
      setJawabanForm({});
      setUmpanBalik("");

      Swal.fire(
        "Gagal",
        error?.response?.data?.message || "Gagal memuat FR.IA.03",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const kelompokMap = useMemo(() => {
    const groups = {};

    pertanyaanList.forEach((item) => {
      const kelompok =
        item?.unit?.kelompok_pekerjaan?.nama_kelompok ||
        item?.unit?.kelompok?.nama_kelompok ||
        item?.kelompok_pekerjaan ||
        "Kelompok Pekerjaan";

      if (!groups[kelompok]) {
        groups[kelompok] = [];
      }

      groups[kelompok].push(item);
    });

    return groups;
  }, [pertanyaanList]);

  const skema = getSkema(data);
  const tuk = getTuk(data);
  const asesor = getAsesor(data);
  const asesi = getAsesi(data);

  const handleJawabanChange = (idPertanyaan, field, value) => {
    setJawabanForm((prev) => ({
      ...prev,
      [idPertanyaan]: {
        ...(prev[idPertanyaan] || {}),
        [field]: value
      }
    }));
  };

  const saveJawaban = async (item) => {
    const idPertanyaan = item?.id_pertanyaan;
    const form = jawabanForm[idPertanyaan] || {};

    if (!idPertanyaan) {
      Swal.fire("Gagal", "ID pertanyaan tidak ditemukan", "error");
      return;
    }

    if (!form.tanggapan?.trim()) {
      Swal.fire("Validasi", "Tanggapan wajib diisi", "warning");
      return;
    }

    if (!form.rekomendasi) {
      Swal.fire("Validasi", "Pilih pencapaian Ya atau Tdk", "warning");
      return;
    }

    try {
      setSavingId(idPertanyaan);

      await api.post("/asesor/fr-ia03/asesor/jawaban", {
        id_pertanyaan: idPertanyaan,
        tanggapan: form.tanggapan.trim(),
        rekomendasi: form.rekomendasi
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Jawaban dan pencapaian berhasil disimpan",
        timer: 1100,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Gagal",
        error?.response?.data?.message || "Gagal menyimpan jawaban",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const saveUmpanBalik = async () => {
    if (!pertanyaanList.length) {
      Swal.fire("Gagal", "Belum ada pertanyaan FR.IA.03", "warning");
      return;
    }

    if (!umpanBalik.trim()) {
      Swal.fire("Validasi", "Umpan balik untuk asesi wajib diisi", "warning");
      return;
    }

    try {
      setSavingFeedback(true);

      for (const item of pertanyaanList) {
        const idPertanyaan = item.id_pertanyaan;
        const form = jawabanForm[idPertanyaan] || {};

        await api.post("/asesor/fr-ia03/asesor/jawaban", {
          id_pertanyaan: idPertanyaan,
          tanggapan: form.tanggapan || "",
          rekomendasi: form.rekomendasi || null,
          umpan_balik: umpanBalik.trim(),
          ttd_asesor: asesor?.ttd_path || null
        });
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Umpan balik berhasil disimpan",
        timer: 1100,
        showConfirmButton: false
      });

      await fetchData();
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Gagal",
        error?.response?.data?.message || "Gagal menyimpan umpan balik",
        "error"
      );
    } finally {
      setSavingFeedback(false);
    }
  };

const saveSemua = async () => {
  try {
    const belumLengkap = pertanyaanList.find((item) => {
      const form = jawabanForm[item.id_pertanyaan] || {};
      return !form.tanggapan?.trim() || !form.rekomendasi;
    });

    if (belumLengkap) {
      Swal.fire(
        "Belum lengkap",
        "Semua pertanyaan harus memiliki tanggapan dan pencapaian Ya/Tdk",
        "warning"
      );
      return;
    }

    if (!umpanBalik.trim()) {
      Swal.fire(
        "Belum lengkap",
        "Umpan balik untuk asesi wajib diisi",
        "warning"
      );
      return;
    }

    setSavingFeedback(true);

    for (const item of pertanyaanList) {
      const idPertanyaan = item.id_pertanyaan;
      const form = jawabanForm[idPertanyaan] || {};

      await api.post("/asesor/fr-ia03/asesor/jawaban", {
        id_pertanyaan: idPertanyaan,
        tanggapan: form.tanggapan.trim(),
        rekomendasi: form.rekomendasi,
        umpan_balik: umpanBalik.trim(),
        ttd_asesor: asesor?.ttd_path || null
      });
    }

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "FR.IA.03 berhasil disimpan",
      timer: 1200,
      showConfirmButton: false
    });

    await fetchData();
  } catch (error) {
    console.error(error);

    Swal.fire(
      "Gagal",
      error?.response?.data?.message || "Gagal menyimpan FR.IA.03",
      "error"
    );
  } finally {
    setSavingFeedback(false);
  }
};

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          <Loader2 className="animate-spin" />
          Memuat FR.IA.03...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-6 py-5 text-center shadow">
          <p className="font-semibold text-slate-800">
            Data FR.IA.03 tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Kembali
          </button>
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
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveSemua}
            disabled={savingFeedback}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white disabled:bg-orange-300"
          >
            {savingFeedback ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Simpan Semua
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white"
          >
            <Printer size={18} />
            Cetak
          </button>
        </div>
      </div>

      <main className="mx-auto w-[900px] bg-white px-10 py-8 text-[14px] text-black shadow-lg print:w-full print:px-8 print:py-6 print:shadow-none">
        <h1 className="mb-6 text-[18px] font-bold">
          FR.IA.03. PERTANYAAN UNTUK MENDUKUNG OBSERVASI
        </h1>

        <HeaderTable
          skema={skema}
          tuk={tuk}
          asesor={asesor}
          asesi={asesi}
        />

        <section className="mt-5 border border-black">
          <div className="border-b border-black bg-gray-300 px-2 py-1 font-bold">
            PANDUAN BAGI ASESOR
          </div>
          <ul className="list-disc space-y-1 px-8 py-3 text-[13px] leading-relaxed">
            <li>
              Pertanyaan pada formulir dibuat oleh Komite Teknis dan tidak dapat
              diubah oleh Asesor Penguji.
            </li>
            <li>
              Tanggapan diisi berdasarkan jawaban asesi pada saat interview.
            </li>
            <li>
              Pencapaian Ya atau Tdk ditentukan oleh Asesor Penguji berdasarkan
              hasil interview.
            </li>
            <li>
              Umpan balik untuk asesi diisi oleh Asesor Penguji setelah proses
              asesmen.
            </li>
          </ul>
        </section>

        {Object.entries(kelompokMap).map(([kelompok, list]) => (
          <section key={kelompok} className="mt-5">
            <UnitTable kelompok={kelompok} list={list} />

            <table className="mt-4 w-full border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black px-2 py-2 text-center">
                    Pertanyaan
                  </th>
                  <th
                    colSpan="2"
                    className="w-[120px] border border-black px-2 py-2 text-center"
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
                    <React.Fragment key={idPertanyaan}>
                      <tr>
                        <td className="border border-black px-3 py-3 align-top">
                          <div className="flex gap-2">
                            <span className="font-bold">
                              {index + 1}.
                            </span>
                            <span>{item.pertanyaan}</span>
                          </div>
                        </td>

                        <td className="border border-black px-2 py-3 text-center align-top">
                          <input
                            type="radio"
                            name={`pencapaian-${idPertanyaan}`}
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

                        <td className="border border-black px-2 py-3 text-center align-top">
                          <input
                            type="radio"
                            name={`pencapaian-${idPertanyaan}`}
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
                        <td colSpan="3" className="border border-black px-3 py-3">
                          <div className="font-bold">Tanggapan:</div>

                          <textarea
                            value={form.tanggapan || ""}
                            onChange={(event) =>
                              handleJawabanChange(
                                idPertanyaan,
                                "tanggapan",
                                event.target.value
                              )
                            }
                            rows={4}
                            placeholder="Catat jawaban asesi saat interview..."
                            className="mt-2 w-full border border-black px-3 py-2 text-sm outline-none"
                          />

                          <div className="mt-3 flex justify-end print:hidden">
                            <button
                              type="button"
                              onClick={() => saveJawaban(item)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white disabled:bg-orange-300"
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
        ))}

        <section className="mt-6">
          <label className="mb-2 block font-bold">
            Umpan balik untuk asesi:
          </label>

          <textarea
            value={umpanBalik}
            onChange={(event) => setUmpanBalik(event.target.value)}
            rows={5}
            placeholder="Masukkan umpan balik untuk asesi..."
            className="w-full border border-black px-3 py-2 text-sm outline-none"
          />

          <div className="mt-3 flex justify-end print:hidden">
            <button
              type="button"
              onClick={saveUmpanBalik}
              disabled={savingFeedback}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white disabled:bg-orange-300"
            >
              {savingFeedback ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Simpan Umpan Balik
            </button>
          </div>
        </section>

        <SignatureBlock
          asesi={asesi}
          asesor={asesor}
          tanggal={data?.tanggal}
        />
      </main>
    </div>
  );
}

function HeaderTable({ skema, tuk, asesor, asesi }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td
            rowSpan="2"
            className="w-[220px] border border-black px-2 py-2 align-middle font-bold"
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
          <td className="border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="border border-black px-2 py-1 font-bold">
            {skema.kode_skema}
          </td>
        </tr>

        <tr>
          <td colSpan="2" className="border border-black px-2 py-1 font-bold">
            TUK
          </td>
          <td className="border border-black px-2 py-1 text-center">
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
          <td className="border border-black px-2 py-1 text-center">
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
          <td className="border border-black px-2 py-1 text-center">
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
          <td className="border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="border border-black px-2 py-1">
            {dataTanggal(asesi)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function UnitTable({ kelompok, list }) {
  const namaKelompok =
    kelompok?.trim() || "Kelompok Pekerjaan";

  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td
            rowSpan={list.length + 1}
            className="w-[170px] border border-black px-2 py-1 align-middle font-medium"
          >
            {namaKelompok}
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
          <tr key={item.id_pertanyaan || index}>
            <td className="border border-black px-2 py-1">
              {index + 1}.
            </td>

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

function SignatureBlock({ asesi, asesor, tanggal }) {
  const ttdAsesiUrl = normalizeFileUrl(
    asesi?.ttd_path ||
    asesi?.ttd ||
    asesi?.signature
  );

  const ttdAsesorUrl = normalizeFileUrl(
    asesor?.ttd_path ||
    asesor?.ttd ||
    asesor?.signature
  );

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
          <td className="border border-black px-2 py-1">
            {getNama(asesi)}
          </td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Tanda tangan dan Tanggal
          </td>
          <td className="border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="h-[100px] border border-black px-2 py-1 align-middle">
            {ttdAsesiUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={ttdAsesiUrl}
                  alt="TTD Asesi"
                  className="h-16 max-w-[200px] object-contain"
                />
                <span>{tanggal || "-"}</span>
              </div>
            ) : (
              <span>Tanda tangan belum tersedia</span>
            )}
          </td>
        </tr>
        <tr>
          <td colSpan="3" className="border border-black px-2 py-1 font-bold">
            ASESOR :
          </td>
        </tr>
        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Nama
          </td>
          <td className="border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="border border-black px-2 py-1">
            {getNama(asesor)}
          </td>
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
          <td className="border border-black px-2 py-1 text-center">
            :
          </td>
          <td className="h-[100px] border border-black px-2 py-1 align-middle">
            {ttdAsesorUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={ttdAsesorUrl}
                  alt="TTD Asesor"
                  className="h-16 max-w-[200px] object-contain"
                />
                <span>{tanggal || "-"}</span>
              </div>
            ) : (
              <span>Tanda tangan belum tersedia</span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function normalizePertanyaan(data) {
  const list =
    data?.pertanyaan ||
    data?.Pertanyaan ||
    data?.frIa03Pertanyaan ||
    [];

  return Array.isArray(list)
    ? [...list].sort(
        (a, b) =>
          Number(a?.urutan || 0) - Number(b?.urutan || 0)
      )
    : [];
}

function getJawaban(item) {
  if (Array.isArray(item?.jawaban)) {
    return item.jawaban[0] || {};
  }

  return item?.jawaban || {};
}

function createInitialJawabanForm(list) {
  const result = {};

  list.forEach((item) => {
    const jawaban = getJawaban(item);

    result[item.id_pertanyaan] = {
      tanggapan: jawaban?.tanggapan || "",
      rekomendasi: jawaban?.rekomendasi || ""
    };
  });

  return result;
}

function getFirstUmpanBalik(list) {
  for (const item of list) {
    const jawaban = getJawaban(item);

    if (jawaban?.umpan_balik) {
      return jawaban.umpan_balik;
    }
  }

  return "";
}

function getSkema(data) {
  const skema = data?.skema || {};

  return {
    judul_skema:
      skema?.judul_skema ||
      skema?.nama_skema ||
      data?.judul_skema ||
      "-",
    kode_skema:
      skema?.kode_skema ||
      skema?.nomor_skema ||
      data?.kode_skema ||
      "-"
  };
}

function getTuk(data) {
  const tuk = data?.tuk || {};

  return (
    tuk?.nama_tuk ||
    tuk?.nama ||
    data?.nama_tuk ||
    "-"
  );
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
    "-"
  );
}

function getUnitKode(unit) {
  return (
    unit?.kode_unit ||
    unit?.kode ||
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

function dataTanggal(data) {
  return (
    data?.tanggal ||
    data?.created_at ||
    getTodayDate()
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeFileUrl(path) {
  if (!path) {
    return "";
  }

  const value = String(path).replace(/\\/g, "/");

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const clean = value.replace(/^\/+/, "");

  if (clean.startsWith("uploads/")) {
    return `http://localhost:3000/${clean}`;
  }

  return `http://localhost:3000/uploads/${clean}`;
}