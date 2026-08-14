import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Save } from "lucide-react";
import api from "../../services/api";

const defaultPetunjuk = [
  "Baca dan pelajari setiap instruksi kerja di bawah ini dengan cermat sebelum melaksanakan praktek",
  "Klarifikasi kepada asesor kompetensi apabila ada hal-hal yang belum jelas",
  "Laksanakan pekerjaan sesuai dengan urutan proses yang sudah ditetapkan",
  "Seluruh proses kerja mengacu kepada SOP/WI yang dipersyaratkan (Jika Ada)"
];

export default function FRIA02Asesor() {
  const navigate = useNavigate();
  const { id_jadwal, id_peserta } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [frIa02Id, setFrIa02Id] = useState(null);
  const [data, setData] = useState({
    skema: {},
    tuk: "",
    nama_asesor: "",
    no_reg_asesor: "",
    ttd_asesor: "",
    nama_asesi: "",
    ttd_asesi: "",
    tanggal: "",
    petunjuk: defaultPetunjuk,
    kelompok: [],
    penyusun: [],
    validator: []
  });

  useEffect(() => {
    fetchData();
  }, [id_jadwal, id_peserta]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/asesor/fr-ia02/penguji/${id_jadwal}/${id_peserta}`);
      setFrIa02Id(res.data.id_fr_ia_02 || null);
      setApproved(Boolean(res.data.approved));
      setData({
        skema: res.data.skema || {},
        tuk: res.data.tuk || "",
        nama_asesor: res.data.nama_asesor || "",
        no_reg_asesor: res.data.no_reg_asesor || "",
        ttd_asesor: res.data.ttd_asesor || "",
        nama_asesi: res.data.nama_asesi || "",
        ttd_asesi: res.data.ttd_asesi || "",
        tanggal: res.data.tanggal || "",
        petunjuk: Array.isArray(res.data.petunjuk) && res.data.petunjuk.length ? res.data.petunjuk : defaultPetunjuk,
        kelompok: Array.isArray(res.data.kelompok) ? res.data.kelompok : [],
        penyusun: Array.isArray(res.data.penyusun) ? res.data.penyusun : [],
        validator: Array.isArray(res.data.validator) ? res.data.validator : []
      });
    } catch (error) {
      window.alert(error.response?.data?.message || "Gagal memuat FR.IA.02");
    } finally {
      setLoading(false);
    }
  };

  const handleAcc = async () => {
    try {
      setSaving(true);
      await api.post(`/asesor/fr-ia02/penguji/${id_jadwal}/${id_peserta}/acc`);
      await fetchData();
      window.alert("FR.IA.02 berhasil di-ACC");
    } catch (error) {
      window.alert(error.response?.data?.message || "Gagal melakukan ACC FR.IA.02");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 font-bold text-slate-600">
          <Loader2 className="animate-spin" />
          Memuat FR.IA.02...
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
            onClick={handleAcc}
            disabled={saving || approved}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm ${approved ? "bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"} disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <Save size={18} />
            {approved ? "Sudah ACC" : saving ? "Menyimpan..." : "ACC FR.IA.02"}
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
          <p className="mt-1 text-[16px] font-semibold">TUGAS PRAKTIK DEMONSTRASI</p>
        </div>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td rowSpan="2" className="w-[230px] border border-black px-2 py-2 align-middle text-[16px] font-bold leading-tight">
                Skema Sertifikasi
                <br />
                (KKNI/Okupasi/Klaster)
              </td>
              <td className="w-[90px] border border-black px-2 py-1 font-bold">Judul</td>
              <td className="w-[20px] border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1 font-bold">{data.skema.judul_skema || "-"}</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 font-bold">Nomor</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1 font-bold">{data.skema.kode_skema || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">TUK</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">{data.tuk || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">Nama Asesor</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">{data.nama_asesor || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">Nama Asesi</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">{data.nama_asesi || "-"}</td>
            </tr>
            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">Tanggal</td>
              <td className="border border-black px-2 py-1 text-center">:</td>
              <td className="border border-black px-2 py-1">{formatTanggal(data.tanggal) || "-"}</td>
            </tr>
          </tbody>
        </table>

        <section className="mt-6">
          <div className="flex gap-5">
            <span className="font-bold">A.</span>
            <h2 className="font-bold">Petunjuk</h2>
          </div>
          <ol className="ml-[68px] mt-2 list-decimal space-y-1">
            {data.petunjuk.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <div className="flex gap-5">
            <span className="font-bold">B.</span>
            <h2 className="font-bold">Skenario Tugas Praktik Demonstrasi</h2>
          </div>

          {data.kelompok.map((kelompok, kelompokIndex) => (
            <div key={`${kelompok.id_kelompok}-${kelompokIndex}`} className="mt-5">
              <table className="w-full border-collapse border border-black">
                <thead>
                  <tr>
                    <th className="w-[185px] border border-black px-2 py-1">Kelompok Pekerjaan</th>
                    <th className="w-[45px] border border-black px-2 py-1">No.</th>
                    <th className="w-[170px] border border-black px-2 py-1">Kode Unit</th>
                    <th className="border border-black px-2 py-1">Judul Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {kelompok.units.map((unit, unitIndex) => (
                    <tr key={`${unit.kode_unit}-${unitIndex}`}>
                      {unitIndex === 0 && (
                        <td rowSpan={kelompok.units.length} className="w-[185px] border border-black px-2 py-2 align-top font-bold">
                          {kelompok.kelompok_pekerjaan || "-"}
                        </td>
                      )}
                      <td className="border border-black px-2 py-1 text-center">{unitIndex + 1}</td>
                      <td className="border border-black px-2 py-1">{unit.kode_unit || "-"}</td>
                      <td className="border border-black px-2 py-1">{unit.judul_unit || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-7 space-y-5">
                <ReadOnlyTable title="Skenario Tugas Praktik Demonstrasi" value={kelompok.skenario_tugas} />
                <ReadOnlyTable title="Langkah Kerja" value={kelompok.langkah_kerja} />
                <ReadOnlyTable title="Perlengkapan dan Peralatan" value={kelompok.perlengkapan_peralatan} />
                <table className="w-full border-collapse border border-black">
                  <tbody>
                    <tr>
                      <td className="w-[260px] border border-black bg-slate-100 px-3 py-3 font-bold print:bg-white">Waktu :</td>
                      <td className="border border-black px-3 py-2">{kelompok.waktu || "-"} Menit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {kelompokIndex < data.kelompok.length - 1 && (
                <div className="my-10 border-t-4 border-black print:break-before-page"></div>
              )}
            </div>
          ))}
        </section>

        <section className="mt-10">
          <table className="w-full border-collapse border border-black text-[13px]">
            <tbody>
              <tr>
                <td colSpan={3} className="border border-black bg-slate-50 px-4 py-3 text-[15px] font-semibold tracking-wide">ASESI</td>
              </tr>
              <tr>
                <td className="w-[170px] border border-black px-2 py-1">Nama</td>
                <td className="w-[20px] border border-black text-center">:</td>
                <td className="border border-black px-2 py-1">{data.nama_asesi || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-4 align-middle">Tanda tangan dan Tanggal</td>
                <td className="border border-black text-center">:</td>
                <td className="border border-black px-4 py-4 align-middle">
                  <Signature path={data.ttd_asesi} label="TTD Asesi" />
                  <p className="mt-2 text-center text-[13px]">{formatTanggal(data.tanggal)}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="mt-4 w-full border-collapse border border-black text-[13px]">
            <tbody>
              <tr>
                <td colSpan={3} className="border border-black bg-slate-50 px-4 py-3 text-[15px] font-semibold tracking-wide">ASESOR</td>
              </tr>
              <tr>
                <td className="w-[170px] border border-black px-2 py-1">Nama</td>
                <td className="w-[20px] border border-black text-center">:</td>
                <td className="border border-black px-2 py-1">{data.nama_asesor || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1">No. Reg</td>
                <td className="border border-black text-center">:</td>
                <td className="border border-black px-2 py-1">{data.no_reg_asesor || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-4 py-4 align-middle">Tanda tangan dan Tanggal</td>
                <td className="border border-black text-center">:</td>
                <td className="border border-black px-4 py-4 align-middle">
                  <Signature path={data.ttd_asesor} label="TTD Asesor" />
                  <p className="mt-2 text-center text-[13px]">{formatTanggal(data.tanggal)}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <table className="mt-8 w-full border-collapse border border-black text-[13px]">
          <thead>
            <tr className="bg-slate-50 text-[13px] font-semibold">
              <th className="border border-black px-2 py-2 w-[90px]">STATUS</th>
              <th className="border border-black px-2 py-2 w-[45px]">NO</th>
              <th className="border border-black px-3 py-2 text-left w-[230px]">NAMA</th>
              <th className="border border-black px-2 py-2 w-[180px]">NOMOR MET</th>
              <th className="border border-black px-2 py-2 w-[260px]">TANDA TANGAN DAN TANGGAL</th>
            </tr>
          </thead>
          <tbody>
            <ReviewerRows title="Penyusun" items={data.penyusun} />
            <ReviewerRows title="Validator" items={data.validator} />
          </tbody>
        </table>
      </main>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }
        }
      `}</style>
    </div>
  );
}

function ReadOnlyTable({ title, value }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td className="w-[260px] border border-black bg-slate-100 px-3 py-3 align-top font-bold print:bg-white">{title} :</td>
          <td className="border border-black px-3 py-2 whitespace-pre-wrap leading-7">{value || "-"}</td>
        </tr>
      </tbody>
    </table>
  );
}

function Signature({ path, label }) {
  if (!path) {
    return <div className="h-24"></div>;
  }

  const src = path.startsWith("http")
    ? path
    : `${import.meta.env.VITE_API_BASE.replace("/api", "")}/${path.replace(/^\/+/, "")}`;

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <img src={src} alt={label} className="max-h-24 max-w-[250px] object-contain" />
      <div className="mt-2 w-[220px] border-b border-black"></div>
    </div>
  );
}

function ReviewerRows({ title, items }) {
  if (!items.length) {
    return (
      <tr>
        <td rowSpan="1" className="border border-black px-2 py-2 align-middle font-semibold">{title}</td>
        <td className="border border-black text-center">1</td>
        <td className="border border-black px-2">-</td>
        <td className="border border-black px-2">-</td>
        <td className="border border-black px-2">-</td>
      </tr>
    );
  }

  return items.map((item, index) => (
    <tr key={`${title}-${index}`}>
      {index === 0 && (
        <td rowSpan={items.length} className="border border-black px-2 py-2 font-semibold align-middle">{title}</td>
      )}
      <td className="border border-black text-center">{index + 1}</td>
      <td className="border border-black px-2">{item.nama || "-"}</td>
      <td className="border border-black px-2">{item.nomor_met || "-"}</td>
      <td className="border border-black px-2">
        <div className="flex flex-col items-center justify-center py-3">
          <Signature path={item.ttd} label={title} />
          <p className="mt-2 text-center text-[12px]">{formatTanggal(item.tanggal)}</p>
        </div>
      </td>
    </tr>
  ));
}

function formatTanggal(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
