import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function FRIA05Asesor() {
  const { id_jadwal, id_peserta } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
    if (!id_peserta) {
      setLoading(false);
      Swal.fire(
        "Gagal",
        "ID peserta tidak ditemukan",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/asesor/fr-ia05/asesor/hasil/${id_peserta}`
      );

      const payload =
        response?.data?.data || null;

      if (!payload) {
        throw new Error(
          "Data FR.IA.05 tidak ditemukan"
        );
      }

      setData(payload);
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Gagal",
        error?.response?.data?.message ||
          "Gagal mengambil data FR.IA.05",
        "error"
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow">
          <Loader2
            className="h-5 w-5 animate-spin"
          />
          <span className="font-semibold text-slate-700">
            Memuat FR.IA.05...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-6 py-6 text-center shadow">
          <p className="font-semibold text-slate-800">
            Data FR.IA.05 tidak ditemukan.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const soalList = Array.isArray(data.soal)
    ? data.soal
    : [];

  const statistik = data.statistik || {};

  const tanggal =
    data.tanggal ||
    new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex w-[1000px] justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-900"
        >
          <Printer size={18} />
          Cetak
        </button>
      </div>

      <main className="mx-auto w-[1000px] bg-white px-8 py-7 text-[12px] text-black shadow-lg print:w-full print:px-6 print:py-5 print:shadow-none">
        <h1 className="mb-4 text-[16px] font-bold uppercase">
          FR.IA.05A. DPT - PERTANYAAN TERTULIS PILIHAN GANDA
        </h1>

        <HeaderTable
          data={data}
          tanggal={tanggal}
        />

        <p className="mb-3 mt-5 font-bold">
          Jawab semua pertanyaan berikut:
        </p>

        <div className="mb-5 grid grid-cols-4 border border-black">
          <div className="border-r border-black px-3 py-2">
            <div className="font-bold">
              Jumlah Soal
            </div>
            <div className="mt-1">
              {statistik.total || 0}
            </div>
          </div>

          <div className="border-r border-black px-3 py-2">
            <div className="font-bold">
              Sudah Dijawab
            </div>
            <div className="mt-1">
              {statistik.sudah_dijawab || 0}
            </div>
          </div>

          <div className="border-r border-black px-3 py-2">
            <div className="font-bold">
              Belum Dijawab
            </div>
            <div className="mt-1">
              {statistik.belum_dijawab || 0}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="font-bold">
              Nilai
            </div>
            <div className="mt-1">
              {data.penilaian?.nilai ??
                statistik.nilai ??
                0}
            </div>
          </div>
        </div>

        {soalList.length === 0 ? (
          <div className="border border-black px-5 py-10 text-center font-bold">
            Belum ada soal FR.IA.05 dari Komite
            Teknis.
          </div>
        ) : (
          <div>
            {soalList.map((item, index) => {
              const jawabanAsesi =
                item.jawaban_asesi;

              const kunci =
                item.kunci_jawaban;

              return (
                <section
                  key={item.id_soal}
                  className="mb-4 overflow-hidden border border-black"
                >
                  <div className="border-b border-black px-3 py-2 font-bold">
                    {index + 1}.{" "}
                    {item.pertanyaan || "-"}
                  </div>

                  {item.gambar && (
                    <div className="border-b border-black px-3 py-3">
                      <img
                        src={normalizeFileUrl(
                          item.gambar
                        )}
                        alt={`Soal ${index + 1}`}
                        className="max-h-[250px] max-w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="px-3 py-2">
                    {Array.isArray(item.opsi) &&
                      item.opsi.map((option) => {
                        const isJawabanAsesi =
                          jawabanAsesi?.id_opsi ===
                          option.id_opsi;

                        const isKunci =
                          option.is_benar === true;

                        return (
                          <div
                            key={
                              option.id_opsi
                            }
                            className="flex items-start gap-2 py-1"
                          >
                            <span className="w-[22px] font-semibold">
                              {option.kode_opsi}.
                            </span>

                            <span className="flex-1">
                              {option.jawaban}
                            </span>

                            {isJawabanAsesi && (
                              <span className="font-bold text-orange-600">
                                Jawaban Asesi
                              </span>
                            )}

                            {isKunci && (
                              <span className="font-bold text-blue-600">
                                Kunci
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  <div className="grid grid-cols-2 border-t border-black">
                    <div className="border-r border-black px-3 py-2">
                      <span className="font-bold">
                        Jawaban Asesi:
                      </span>{" "}
                      {jawabanAsesi
                        ? getKodeJawaban(
                            item.opsi,
                            jawabanAsesi.id_opsi
                          )
                        : "Belum dijawab"}
                    </div>

                    <div className="px-3 py-2">
                      <span className="font-bold">
                        Kunci Jawaban:
                      </span>{" "}
                      {kunci
                        ? `${kunci.kode_opsi}. ${kunci.jawaban}`
                        : "-"}
                    </div>
                  </div>

                  <div className="border-t border-black px-3 py-2">
                    <span className="font-bold">
                      Hasil:
                    </span>{" "}
                    {!jawabanAsesi
                      ? "Belum dijawab"
                      : jawabanAsesi.is_benar
                      ? "BENAR"
                      : "SALAH"}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <PenyusunValidator
          penyusun={data.penyusun || []}
          validator={data.validator || []}
        />
      </main>
    </div>
  );
}

function HeaderTable({ data, tanggal }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td
            rowSpan="2"
            className="w-[210px] border border-black px-2 py-2 font-bold leading-4"
          >
            Skema Sertifikasi
            <br />
            (KKNI/Okupasi/Klaster)
          </td>

          <td className="w-[75px] border border-black px-2 py-1 font-bold">
            Judul
          </td>

          <td className="w-[20px] border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {data.skema?.judul_skema ||
              data.judul_paket ||
              "-"}
          </td>
        </tr>

        <tr>
          <td className="border border-black px-2 py-1 font-bold">
            Nomor
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {data.skema?.kode_skema ||
              data.kode_paket ||
              "-"}
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border border-black px-2 py-1 font-bold"
          >
            TUK
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {data.tuk?.nama_tuk || "-"}
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border border-black px-2 py-1 font-bold"
          >
            Nama Asesor
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {data.asesor?.nama_lengkap || "-"}
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border border-black px-2 py-1 font-bold"
          >
            Nama Asesi
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {data.asesi?.nama_lengkap || "-"}
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border border-black px-2 py-1 font-bold"
          >
            Tanggal
          </td>

          <td className="border border-black px-2 py-1 text-center">
            :
          </td>

          <td className="border border-black px-2 py-1">
            {tanggal}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function PenyusunValidator({
  penyusun,
  validator
}) {
  const jumlahPenyusun = Math.max(
    penyusun.length,
    1
  );

  const jumlahValidator = Math.max(
    validator.length,
    1
  );

  return (
    <table className="mt-6 w-full border-collapse border border-black">
      <thead>
        <tr>
          <th
            colSpan="5"
            className="border border-black px-3 py-2 text-left font-bold"
          >
            PENYUSUN DAN VALIDATOR
          </th>
        </tr>

        <tr>
          <th className="w-[130px] border border-black px-2 py-2 text-center font-bold">
            STATUS
          </th>

          <th className="w-[45px] border border-black px-2 py-2 text-center font-bold">
            NO
          </th>

          <th className="border border-black px-2 py-2 text-left font-bold">
            NAMA
          </th>

          <th className="w-[150px] border border-black px-2 py-2 text-center font-bold">
            NOMOR MET
          </th>

          <th className="w-[230px] border border-black px-2 py-2 text-center font-bold">
            TANDA TANGAN DAN TANGGAL
          </th>
        </tr>
      </thead>

      <tbody>
        {Array.from({
          length: jumlahPenyusun
        }).map((_, index) => {
          const item = penyusun[index];

          return (
            <tr
              key={`penyusun-${index}`}
            >
              {index === 0 && (
                <td
                  rowSpan={jumlahPenyusun}
                  className="border border-black px-2 py-3 text-center align-middle font-bold"
                >
                  PENYUSUN
                </td>
              )}

              <td className="border border-black px-2 py-3 text-center">
                {index + 1}
              </td>

              <td className="border border-black px-2 py-3">
                {item?.nama_lengkap || "-"}
              </td>

              <td className="border border-black px-2 py-3 text-center">
                {item?.no_reg_asesor || "-"}
              </td>

              <td className="border border-black px-2 py-3">
                <SignatureCell
                  data={item}
                />
              </td>
            </tr>
          );
        })}

        {Array.from({
          length: jumlahValidator
        }).map((_, index) => {
          const item = validator[index];

          return (
            <tr
              key={`validator-${index}`}
            >
              {index === 0 && (
                <td
                  rowSpan={jumlahValidator}
                  className="border border-black px-2 py-3 text-center align-middle font-bold"
                >
                  VALIDATOR
                </td>
              )}

              <td className="border border-black px-2 py-3 text-center">
                {index + 1}
              </td>

              <td className="border border-black px-2 py-3">
                {item?.nama_lengkap || "-"}
              </td>

              <td className="border border-black px-2 py-3 text-center">
                {item?.no_reg_asesor || "-"}
              </td>

              <td className="border border-black px-2 py-3">
                <SignatureCell
                  data={item}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SignatureCell({ data }) {
  const ttdUrl = normalizeFileUrl(
    data?.ttd_path
  );

  return (
    <div className="flex min-h-[58px] items-center justify-center gap-3">
      {ttdUrl ? (
        <img
          src={ttdUrl}
          alt="Tanda tangan"
          className="h-12 max-w-[110px] object-contain"
        />
      ) : (
        <span>-</span>
      )}

      <span>
        {data?.tanggal || "-"}
      </span>
    </div>
  );
}

function getKodeJawaban(
  opsi,
  idOpsi
) {
  const item = Array.isArray(opsi)
    ? opsi.find(
        (option) =>
          option.id_opsi === idOpsi
      )
    : null;

  if (!item) {
    return "Belum dijawab";
  }

  return `${item.kode_opsi}. ${item.jawaban}`;
}

function normalizeFileUrl(path) {
  if (!path) {
    return "";
  }

  const value = String(path).replace(
    /\\/g,
    "/"
  );

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `http://localhost:3000/${value.replace(
    /^\/+/,
    ""
  )}`;
}