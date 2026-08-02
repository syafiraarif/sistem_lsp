// frontend/src/pages/asesor/komiteTeknis/FRIA02.jsx

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

const defaultKelompok = [
  {
    id_kelompok:null,
    kelompok_pekerjaan: "Kelompok Pekerjaan",
    units: [
      {
        kode_unit: "LOG.OO.09.002.00",
        judul_unit: "Membaca gambar teknik",
      },
      {
        kode_unit: "J.611000.005.02",
        judul_unit: "Menentukan Spesifikasi Perangkat Jaringan",
      },
    ],
    skenario_tugas: "",
    langkah_kerja:"",
    perlengkapan_peralatan: "",
    waktu: "",
  },
  {
    id_kelompok:null,
    kelompok_pekerjaan: "Kelompok Pekerjaan Instalasi Jaringan",
    units: [
      {
        kode_unit: "J.611000.005.02",
        judul_unit: "Menentukan Spesifikasi Perangkat Jaringan",
      },
      {
        kode_unit: "TIK.MM02.052.01",
        judul_unit: "Membuat rekaman gambar berurutan untuk animasi",
      },
    ],
    skenario_tugas: "",
    langkah_kerja:"",
    perlengkapan_peralatan: "",
    waktu: "",
  },
];

export default function FRIA02() {
  const { id_jadwal, idJadwal, id } = useParams();
  const navigate = useNavigate();

  const jadwalId = id_jadwal || idJadwal || id;

  const [loading, setLoading] = useState(true);
const [idFrIa02, setIdFrIa02] = useState(null);
  const [jadwal, setJadwal] = useState(null);
  const [listAsesor, setListAsesor] = useState([]);
  const [listAsesi, setListAsesi] = useState([]);
  const [listUnit, setListUnit] = useState([]);


  const [form, setForm] = useState({
  nama_asesor: getDisplayName(),
  nama_asesi: "",
  id_asesi: null,
  tanggal: "",

  petunjuk: defaultPetunjuk,
  kelompok: defaultKelompok,

  asesi: {
  nama: "",
  ttd: "",
  tanggal: "",
},

asesor: {
  id_user: "",
  nama: "",
  no_reg: "",
  ttd: "",
  tanggal: "",
},

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
    () => `fria02-komite-teknis-${jadwalId}`,
    [jadwalId]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const saved = localStorage.getItem(localStorageKey);

        if (saved) {
          try {
            setForm((prev) => ({
              ...prev,
              ...JSON.parse(saved),
            }));
          } catch {
            // biarkan default kalau localStorage rusak
          }
        }

        const res = await api.get("/asesor/jadwal-komite-teknis");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        const found = list.find((item) => {
          const j = item.jadwal || {};
          return (
            String(item.id_jadwal) === String(jadwalId) ||
            String(j.id_jadwal) === String(jadwalId) ||
            String(j.id) === String(jadwalId)
          );
        });

        setJadwal(found?.jadwal || found || null);

const asesorRes = await api.get("/asesor/list-asesor");

setListAsesor(
  Array.isArray(asesorRes.data?.data)
    ? asesorRes.data.data
    : []
);

console.log("ASESOR", asesorRes.data);

const asesiRes = await api.get(`/asesor/jadwal/${jadwalId}/peserta`);

setListAsesi(
  Array.isArray(asesiRes.data?.data)
    ? asesiRes.data.data
    : []
);

console.log("ASESI", asesiRes.data);

const unitRes = await api.get(`/asesor/fr-ia02/unit/${jadwalId}`);

setListUnit(
  Array.isArray(unitRes.data)
    ? unitRes.data
    : []
);

console.log("UNIT", unitRes.data);

// =============================
// Ambil data FR.IA.02
// =============================
const fria02Res = await api.get("/asesor/fr-ia02", {
  params: {
    id_jadwal: jadwalId,
  },
});

setIdFrIa02(fria02Res.data.id_fr_ia_02 || null);

console.log(
  "FRIA02 JSON",
  JSON.stringify(fria02Res.data, null, 2)
);

console.log(
  "DETAIL BACKEND JSON",
  JSON.stringify(fria02Res.data.detail, null, 2)
);

if (fria02Res.data.detail) {

    const kelompok = fria02Res.data.detail.map((item)=>({

        id_kelompok:
            item.id_kelompok ??
            item.kelompok?.id_kelompok,

        kelompok_pekerjaan:
            item.kelompok?.nama_kelompok ??
            item.nama_kelompok,

        units: [
            {
              kode_unit: item.kode_unit ?? "",
              judul_unit: item.judul_unit ?? "",
              urutan: item.urutan ?? 1,
            },
          ],

        skenario_tugas:item.skenario || "",

        langkah_kerja:item.langkah_kerja || "",

        perlengkapan_peralatan:item.peralatan || "",

        waktu:item.durasi || ""

    }));

    const penyusun = [];
const validator = [];

(fria02Res.data.validator || []).forEach((item) => {
  const data = {
    id_user: item.id_asesor,
    nama: item.asesor?.nama_lengkap || "",
    nomor_met: item.asesor?.no_lisensi || "",
    ttd: item.asesor?.ttd_path || "",
    tanggal: fria02Res.data.tanggal || "",
  };

  if (item.peran === "penyusun") {
    penyusun.push(data);
  } else {
    validator.push(data);
  }
});

setForm((prev) => ({
  ...prev,

  kelompok,

  penyusun: penyusun.length
    ? penyusun
    : prev.penyusun,

  validator: validator.length
    ? validator
    : prev.validator,

  id_asesi: fria02Res.data.id_asesi ?? "",

  nama_asesi: fria02Res.data.nama_asesi ?? "",

  tanggal: fria02Res.data.tanggal ?? "",

  asesor: {
    id_user: fria02Res.data.id_asesor ?? "",
    nama: fria02Res.data.nama_asesor ?? "",
    no_reg: fria02Res.data.no_reg_asesor ?? "",
    ttd: fria02Res.data.ttd_asesor ?? "",
    tanggal: fria02Res.data.tanggal ?? "",
  },

  asesi: {
    nama: fria02Res.data.nama_asesi ?? "",
    ttd: fria02Res.data.ttd_asesi ?? "",
    tanggal: fria02Res.data.tanggal ?? "",
  },
}));

}

      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data FR.IA.02");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jadwalId, localStorageKey]);

  const skema = getSkema(jadwal);
  const tuk = getTuk(jadwal);

  const handleSave = async () => {
  try {
    console.log("FORM KELOMPOK", JSON.stringify(form.kelompok, null, 2));
    const payload = {
      id_jadwal: Number(jadwalId),
      id_asesi: form.id_asesi,
      tanggal: form.tanggal,
      details: form.kelompok.flatMap((kelompok) =>
  kelompok.units.map((unit, index) => ({
    id_kelompok: kelompok.id_kelompok,

    kode_unit: unit.kode_unit,

    judul_unit: unit.judul_unit,

    urutan: index + 1,

    skenario: kelompok.skenario_tugas,

    langkah_kerja: kelompok.langkah_kerja,

    peralatan: kelompok.perlengkapan_peralatan,

    durasi: kelompok.waktu,
  }))
),
      validators: [
    ...form.penyusun.map((item, index) => ({
        id_asesor: item.id_user,
        peran: "penyusun",
        urutan: index + 1,
    })),

    ...form.validator.map((item, index) => ({
        id_asesor: item.id_user,
        peran: "validator",
        urutan: index + 1,
    })),
],
    };

    console.log(payload);
    console.log("PAYLOAD", payload);
    if (idFrIa02) {
  await api.put(`/asesor/fr-ia02/${idFrIa02}`, payload);
} else {
  await api.post("/asesor/fr-ia02", payload);
}

    alert("FR.IA.02 berhasil disimpan");
  } catch (err) {
  console.error(err);

  console.log("ERROR BACKEND", err.response?.data);

  alert(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Gagal menyimpan"
  );
}
};

  const handlePrint = () => {
    window.print();
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePetunjuk = (index, value) => {
    setForm((prev) => ({
      ...prev,
      petunjuk: prev.petunjuk.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
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
              units: kelompok.units.filter((_, uIndex) => uIndex !== unitIndex),
            }
          : kelompok
      ),
    }));
  };

  const addKelompok = () => {
    setForm((prev) => ({
      ...prev,
      kelompok: [
        ...prev.kelompok,
        {
          id_kelompok:null,
          kelompok_pekerjaan: "Kelompok Pekerjaan",
          units: [
            {
              kode_unit: "",
              judul_unit: "",
            },
          ],
          skenario_tugas: "",
          langkah_kerja:"",
          perlengkapan_peralatan: "",
          waktu: "",
        },
      ],
    }));
  };

  const removeKelompok = (index) => {
    setForm((prev) => ({
      ...prev,
      kelompok: prev.kelompok.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updatePenyusun = (index, field, value) => {
  setForm((prev) => ({
    ...prev,
    penyusun: prev.penyusun.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: value,
          }
        : item
    ),
  }));
};

const updateValidator = (index, field, value) => {
  setForm((prev) => ({
    ...prev,
    validator: prev.validator.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: value,
          }
        : item
    ),
  }));
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
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Save size={18} />
            Simpan
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
        <h1 className="text-[20px] font-bold">
          FR.IA.02
        </h1>

        <p className="mt-1 text-[16px] font-semibold">
          TUGAS PRAKTIK DEMONSTRASI
        </p>
      </div>

        <table className="w-full border-collapse border border-black">
          <tbody>
            <tr>
              <td
                rowSpan="2"
                className="w-[230px] border border-black px-2 py-2 align-middle text-[16px] font-bold leading-tight"
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

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                TUK
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                {tuk || "-"}
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Nama Asesor
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
                <p className="font-medium">
                  {form.asesor.nama || "-"}
                </p>
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="border border-black px-2 py-1 font-bold">
                Nama Asesi
              </td>

              <td className="border border-black px-2 py-1 text-center">:</td>

              <td className="border border-black px-2 py-1">
              <div className="print:hidden">
              <select
                value={form.id_asesi || ""}
                onChange={(e) => {
                  const asesi = listAsesi.find(
                    (x) => String(x.id_user) === e.target.value
                  );

                  setForm((prev) => ({
                    ...prev,
                    id_asesi: asesi?.id_user || null,
                    nama_asesi: asesi?.nama_lengkap || "",
                    asesi: {
                      nama: asesi?.nama_lengkap || "",
                      ttd: asesi?.ttd_path || "",
                      tanggal: new Date().toISOString().slice(0, 10),
                    },
                  }));
                }}
                className="w-full bg-transparent outline-none"
              >
                <option value="">Pilih Asesi</option>

                {listAsesi.map((item) => (
                  <option key={item.id_user} value={item.id_user}>
                    {item.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>

            <p className="hidden print:block font-medium">
              {form.nama_asesi || "-"}
            </p>
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
                  value={form.tanggal}
                  onChange={(e) => updateField("tanggal", e.target.value)}
                  className="bg-transparent outline-none print:hidden"
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
              <li key={index}>
                <input
                  value={item}
                  onChange={(e) => updatePetunjuk(index, e.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <div className="flex gap-5">
            <span className="font-bold">B.</span>
            <h2 className="font-bold">Skenario Tugas Praktik Demonstrasi</h2>
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
    <th className="w-[45px] border border-black px-2 py-1">No.</th>
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
                (x) => x.kode_unit === e.target.value
              );
              updateUnit(
                kelompokIndex,
                unitIndex,
                "kode_unit",
                selected?.kode_unit || ""
              );
              updateUnit(
                kelompokIndex,
                unitIndex,
                "judul_unit",
                selected?.judul_unit || ""
              );
            }}
            className="w-full bg-transparent outline-none"
          >
            <option value="">Pilih Unit</option>
            {listUnit.map((item) => (
              <option
                key={item.id_unit}
                value={item.kode_unit}
              >
                {item.kode_unit}
              </option>
            ))}
          </select>
        </div>
        <p className="hidden print:block">
          {unit.kode_unit || "-"}
        </p>
      </td>

      <td className="border border-black px-2 py-1">

        <div className="print:hidden">
          <p className="leading-6">
            {unit.judul_unit || "-"}
          </p>
        </div>

        <p className="hidden print:block leading-6">
          {unit.judul_unit || "-"}
        </p>

      </td>

      <td className="border border-black text-center print:hidden">
        <button
          type="button"
          onClick={() => removeUnit(kelompokIndex, unitIndex)}
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
                    updateKelompok(kelompokIndex, "skenario_tugas", value)
                  }
                  placeholder="Tuliskan skenario tugas praktik demonstrasi..."
                />

                <InputTable
                    title="Langkah Kerja"
                    value={kelompok.langkah_kerja || ""}
                    onChange={(value) =>
                      updateKelompok(kelompokIndex, "langkah_kerja", value)
                    }
                    placeholder="Tuliskan langkah kerja..."
                  />

                <InputTable
                  title="Perlengkapan dan Peralatan"
                  value={kelompok.perlengkapan_peralatan}
                  onChange={(value) =>
                    updateKelompok(
                      kelompokIndex,
                      "perlengkapan_peralatan",
                      value
                    )
                  }
                  placeholder="Tuliskan perlengkapan dan peralatan yang digunakan..."
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
          onChange={(e)=>
            updateKelompok(kelompokIndex,"waktu",e.target.value)
          }
          placeholder="120"
          className="w-24 bg-transparent outline-none"
        />
      </div>

      <span className="hidden print:inline">
        {kelompok.waktu || "-"}
      </span>

      <span className="ml-2">
        Menit
      </span>
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
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white print:hidden"
          >
            <Plus size={16} />
            Tambah Kelompok Pekerjaan
          </button>

          <section className="mt-10">

  {/* ================= ASESI ================= */}

  <table className="w-full border-collapse border border-black text-[13px]">
    <tbody>

      <tr>
        <td
          colSpan={3}
          className="border border-black bg-slate-50 px-4 py-3 text-[15px] font-semibold tracking-wide"
        >
          ASESI
        </td>
      </tr>

      <tr>
        <td className="w-[170px] border border-black px-2 py-1">
          Nama
        </td>

        <td className="w-[20px] border border-black text-center">
          :
        </td>

        <td className="border border-black px-2 py-1">
          <p className="font-medium">
            {form.nama_asesi || "-"}
          </p>
        </td>
      </tr>

      <tr>
        <td className="border border-black px-4 py-4 align-middle">
          Tanda tangan dan Tanggal
        </td>

        <td className="border border-black text-center">
          :
        </td>

        <td className="border border-black px-4 py-4 align-middle">
<div className="flex flex-col items-center justify-center py-3">

  {form.asesi.ttd && (
    <img
      src={
        form.asesi.ttd.startsWith("http")
          ? form.asesi.ttd
          : `${import.meta.env.VITE_API_BASE.replace("/api", "")}/${form.asesi.ttd.replace(/^\/+/, "")}`
      }
      alt="TTD Asesi"
      className="max-h-24 max-w-[250px] object-contain"
    />
  )}

  <div className="mt-2 w-[220px] border-b border-black"></div>

  <p className="mt-2 text-center text-[13px]">
    {formatTanggal(form.asesi.tanggal)}
  </p>

</div>
        </td>
      </tr>

    </tbody>
  </table>


  {/* ================= ASESOR ================= */}

  <table className="mt-4 w-full border-collapse border border-black text-[13px]">

    <tbody>

      <tr>
        <td
          colSpan={3}
          className="border border-black bg-slate-50 px-4 py-3 text-[15px] font-semibold tracking-wide"
        >
          ASESOR
        </td>
      </tr>

      <tr>
        <td className="w-[170px] border border-black px-2 py-1">
          Nama
        </td>

        <td className="w-[20px] border border-black text-center">
          :
        </td>

        <td className="border border-black px-2 py-1">

          <div className="print:hidden">
          <select
            value={form.asesor.id_user || ""}
            onChange={(e) => {
              const asesor = listAsesor.find(
                item => String(item.id_user) === e.target.value
              );

              setForm((prev) => ({
                ...prev,
                asesor: {
                  id_user: asesor?.id_user || "",
                  nama: asesor?.nama_lengkap || "",
                  no_reg: asesor?.no_reg_asesor || "",
                  ttd: asesor?.ttd_path || "",
                  tanggal: new Date().toISOString().slice(0, 10),
                },
              }));
            }}
            className="w-full bg-transparent outline-none"
          >
            <option value="">Pilih Asesor</option>

            {listAsesor.map((item) => (
              <option key={item.id_user} value={item.id_user}>
                {item.nama_lengkap}
              </option>
            ))}
          </select>
        </div>

        <p className="hidden print:block font-medium">
          {form.asesor.nama || "-"}
        </p>

        </td>
      </tr>

      <tr>

        <td className="border border-black px-2 py-1">
          No. Reg
        </td>

        <td className="border border-black text-center">
          :
        </td>

        <td className="border border-black px-2 py-1">

          <p className="font-medium">
            {form.asesor.no_reg || "-"}
          </p>

        </td>

      </tr>

      <tr>

        <td className="border border-black px-4 py-4 align-middle">
          Tanda tangan dan Tanggal
        </td>

        <td className="border border-black text-center">
          :
        </td>

        <td className="border border-black px-4 py-4 align-middle">

<div className="flex flex-col items-center justify-center py-3">

  {form.asesor.ttd && (
    <img
      src={
        form.asesor.ttd.startsWith("http")
          ? form.asesor.ttd
          : `${import.meta.env.VITE_API_BASE.replace("/api", "")}/${form.asesor.ttd.replace(/^\/+/, "")}`
      }
      alt="TTD Asesor"
      className="max-h-24 max-w-[250px] object-contain"
    />
  )}

  <div className="mt-2 w-[220px] border-b border-black"></div>

  <p className="mt-2 text-center text-[13px]">
    {formatTanggal(form.asesor.tanggal)}
  </p>

</div>

        </td>

      </tr>

    </tbody>

  </table>

</section>
        </section>

        {/* ================= PENYUSUN & VALIDATOR ================= */}

<table className="mt-8 w-full border-collapse border border-black text-[13px]">
  <thead>
    <tr className="bg-slate-50 text-[13px] font-semibold">
      <th className="border border-black px-2 py-2 w-[90px]">
        STATUS
      </th>

      <th className="border border-black px-2 py-2 w-[45px]">
        NO
      </th>

      <th className="border border-black px-3 py-2 text-left w-[230px]">
        NAMA
      </th>

      <th className="border border-black px-2 py-2 w-[180px]">
        NOMOR MET
      </th>

      <th className="border border-black px-2 py-2 w-[260px]">
        TANDA TANGAN DAN TANGGAL
      </th>
    </tr>
  </thead>

  <tbody>

    {/* ================= PENYUSUN ================= */}

    {form.penyusun.map((item,index)=>(

      <tr key={`penyusun-${index}`}>
        {index===0 && (
          <td
            rowSpan={form.penyusun.length}
            className="border border-black px-2 py-2 font-semibold align-middle"
          > Penyusun </td>
        )}

        <td className="border border-black text-center">
          {index+1}
        </td>

<td className="border border-black px-2">
  <div className="print:hidden">
    <select
      value={item.id_user}
      onChange={(e) => {
        const asesor = listAsesor.find(
          (a) => String(a.id_user) === e.target.value
        );

        updatePenyusun(index, "id_user", e.target.value);
        updatePenyusun(index, "nama", asesor?.nama_lengkap || "");
        updatePenyusun(index, "nomor_met", asesor?.no_lisensi || "");
        updatePenyusun(index, "ttd", asesor?.ttd_path || "");
        updatePenyusun(index, "tanggal", new Date().toISOString().slice(0, 10));
      }}
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
            : `${import.meta.env.VITE_API_BASE.replace("/api", "")}/${item.ttd.replace(/^\/+/, "")}`
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

    {/* ================= VALIDATOR ================= */}

    {form.validator.map((item,index)=>(
      <tr key={`validator-${index}`}>
        {index===0 && (
        <td
            rowSpan={form.validator.length}
            className="border border-black px-2 py-2 font-semibold align-middle"
        > Validator</td>
        )}

        <td className="border border-black text-center">
          {index+1}
        </td>

      <td className="border border-black px-2">
        <div className="print:hidden">
          <select
            value={item.id_user}
            onChange={(e) => {
              const asesor = listAsesor.find(
                (a) => String(a.id_user) === e.target.value
              );
              updateValidator(index, "id_user", e.target.value);
              updateValidator(index, "nama", asesor?.nama_lengkap || "");
              updateValidator(index, "nomor_met", asesor?.no_lisensi || "");
              updateValidator(index, "ttd", asesor?.ttd_path || "");
              updateValidator(index, "tanggal", new Date().toISOString().slice(0, 10));
            }}
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
            : `${import.meta.env.VITE_API_BASE.replace("/api", "")}/${item.ttd.replace(/^\/+/, "")}`
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

  </tbody>

</table>

<div className="mt-3 flex gap-3 print:hidden">

  <button
    type="button"
    onClick={addPenyusun}
    className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white hover:bg-slate-900"
  >
    <Plus size={16}/>
    Tambah Penyusun
  </button>

  <button
    type="button"
    onClick={addValidator}
    className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-3 text-sm font-bold text-white hover:bg-slate-900"
  >
    <Plus size={16}/>
    Tambah Validator
  </button>

</div>

        <div className="mt-10 print:hidden"></div>
      </main>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm;
          }

          input[type="date"] {
            display: none;
          }

          textarea,
          input {
            border: none !important;
            outline: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InputTable({ title, value, onChange, placeholder, small = false }) {
  return (
    <table className="w-full border-collapse border border-black">
      <tbody>
        <tr>
          <td className="w-[260px] border border-black bg-slate-100 px-3 py-3 align-top font-bold print:bg-white">
            {title} :
          </td>

          <td className="border border-black px-3 py-2">
            <>
          <textarea
            value={value}
            onChange={(e)=>onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full resize-none bg-transparent p-2 leading-7 outline-none print:hidden ${
              small ? "min-h-[50px]" : "min-h-[110px]"
            }`}
          />

          <div className="hidden whitespace-pre-wrap p-2 leading-7 print:block">
            {value || "-"}
          </div>
        </>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function getDisplayName() {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
      user?.nama ||
      user?.nama_lengkap ||
      user?.username ||
      user?.name ||
      "Asesor"
    );
  } catch {
    return "Asesor";
  }
}

function getSkema(jadwal) {
  const skema = jadwal?.skema;

  if (skema && typeof skema === "object") {
    return {
      judul_skema:
        skema.judul_skema ||
        skema.nama_skema ||
        jadwal?.nama_skema ||
        "KKNI Level II Pada Kompetensi Keahlian Teknik Komputer dan Jaringan",
      kode_skema:
        skema.kode_skema ||
        skema.nomor_skema ||
        jadwal?.kode_skema ||
        "LEVEL II TKJ",
    };
  }

  return {
    judul_skema:
      jadwal?.judul_skema ||
      jadwal?.nama_skema ||
      skema ||
      "KKNI Level II Pada Kompetensi Keahlian Teknik Komputer dan Jaringan",
    kode_skema: jadwal?.kode_skema || jadwal?.nomor_skema || "LEVEL II TKJ",
  };
}

function getTuk(jadwal) {
  return (
    jadwal?.nama_tuk ||
    jadwal?.tuk?.nama_tuk ||
    jadwal?.tuk?.nama ||
    jadwal?.tempat ||
    jadwal?.lokasi ||
    ""
  );
}

function formatTanggal(value) {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}