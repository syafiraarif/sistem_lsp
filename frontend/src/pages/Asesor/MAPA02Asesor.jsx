import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeft, Download, Save, Loader2, Plus, Trash2 } from "lucide-react";

const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const INSTRUMEN = [
    {
        no: "1",
        kode: "FR.IA.01",
        singkat: "CL",
        nama: "Ceklis Observasi Aktivitas Di Tempat Kerja atau Tempat Kerja Simulasi",
    },
    {
        no: "2",
        kode: "FR.IA.02",
        singkat: "TPD",
        nama: "Tugas Praktik Demonstrasi",
    },
    {
        no: "3",
        kode: "FR.IA.03",
        singkat: "PMO",
        nama: "Pertanyaan Untuk Mendukung Observasi",
    },
    {
        no: "4a",
        kode: "FR.IA.04A",
        singkat: "DIT",
        nama: "Daftar Instruksi Terstruktur (Penjelasan Singkat Proyek Terkait Pekerjaan / Kegiatan Terstruktur Lainnya)",
    },
    {
        no: "4b",
        kode: "FR.IA.04B",
        singkat: "DIT",
        nama: "Penilaian Proyek Singkat atau Kegiatan Terstruktur Lainnya",
    },
    {
        no: "5",
        kode: "FR.IA.05",
        singkat: "DPT",
        nama: "Daftar Pertanyaan Tertulis Pilihan Ganda",
    },
    {
        no: "6",
        kode: "FR.IA.06",
        singkat: "DPT",
        nama: "Daftar Pertanyaan Tertulis Pilihan Esai",
    },
    {
        no: "7",
        kode: "FR.IA.07",
        singkat: "DPL",
        nama: "Daftar Pertanyaan Lisan",
    },
    {
        no: "8",
        kode: "FR.IA.08",
        singkat: "CVP",
        nama: "Ceklis Verifikasi Portofolio",
    },
    {
        no: "9",
        kode: "FR.IA.09",
        singkat: "PW",
        nama: "Pertanyaan Wawancara",
    },
    {
        no: "10",
        kode: "FR.IA.10",
        singkat: "VPK",
        nama: "Verifikasi Pihak Ketiga",
    },
    {
        no: "11",
        kode: "FR.IA.11",
        singkat: "CRP",
        nama: "Ceklis Reviu Produk",
    },
];

const POTENSI = [
    {
        no: 1,
        label:
            "Hasil pelatihan dan / atau pendidikan, dimana Kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.",
    },
    {
        no: 2,
        label:
            "Hasil pelatihan dan / atau pendidikan, dimana kurikulum belum berbasis kompetensi.",
    },
    {
        no: 3,
        label:
            "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang pengalaman operasionalnya mampu telusur dengan standar kompetensi.",
    },
    {
        no: 4,
        label:
            "Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.",
    },
    {
        no: 5,
        label: "Pelatihan / belajar mandiri atau otodidak.",
    },
];

const createInitialInstrumen = () => {
    const result = {};

    INSTRUMEN.forEach((item) => {
        result[item.kode] = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
        };
    });

    return result;
};

const normalizeBoolean = (value) => {
    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true"
    );
};

const getData = (response) => {
    if (!response) {
        return null;
    }

    if (response.data?.data !== undefined) {
        return response.data.data;
    }

    if (response.data !== undefined) {
        return response.data;
    }

    return null;
};

export default function MAPA02Asesor() {
    const { id_jadwal, id_peserta } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [jadwal, setJadwal] = useState(null);
    const [peserta, setPeserta] = useState(null);
    const [skema, setSkema] = useState(null);
    const [units, setUnits] = useState([]);

    const [instrumen, setInstrumen] = useState(
        createInitialInstrumen()
    );

    const [penyusun, setPenyusun] = useState([
        { id_user: "", nama: "", nomor: "", tanda_tangan: "", tanggal: "" },
    ]);

    const [validator, setValidator] = useState([
        { id_user: "", nama: "", nomor: "", tanda_tangan: "", tanggal: "" },
    ]);

    const [asesorList, setAsesorList] = useState([]);
    const [mapa02Data, setMapa02Data] = useState(null);

    const [error, setError] = useState("");

    const getIdPeserta = () => {
        if (id_peserta) {
            return Number(id_peserta);
        }

        const storedPeserta =
            localStorage.getItem("id_peserta");

        return storedPeserta
            ? Number(storedPeserta)
            : null;
    };

    const getIdJadwal = () => {
        if (id_jadwal) {
            return Number(id_jadwal);
        }

        const storedJadwal =
            localStorage.getItem("id_jadwal");

        return storedJadwal
            ? Number(storedJadwal)
            : null;
    };

    const loadJadwal = async () => {
        const response = await api.get(
            "/asesor/jadwal-saya"
        );

        const data = getData(response);

        const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

        const targetId = getIdJadwal();

        const found = list.find(
            (item) =>
                Number(
                    item?.id_jadwal ??
                        item?.jadwal?.id_jadwal
                ) === Number(targetId)
        );

        if (!found) {
            return null;
        }

        return found?.jadwal || found;
    };

    const loadPeserta = async () => {
        const targetId = getIdJadwal();

        if (!targetId) {
            return null;
        }

        const response = await api.get(
            `/asesor/jadwal/${targetId}/peserta`
        );

        const data = getData(response);

        const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

        const targetPeserta = getIdPeserta();

        if (!targetPeserta) {
            return list[0] || null;
        }

        return (
            list.find(
                (item) =>
                    Number(
                        item?.id_peserta ??
                            item?.peserta?.id_peserta ??
                            item?.id_user
                    ) === Number(targetPeserta)
            ) || null
        );
    };

    const loadMapa02 = async () => {
        const targetPeserta = getIdPeserta();

        if (!targetPeserta) {
            return null;
        }

        try {
            const response = await api.get(
                `/asesor/fr-mapa02?id_peserta=${targetPeserta}`
            );

            return getData(response);
        } catch (requestError) {
            if (requestError.response?.status === 404) {
                return null;
            }

            throw requestError;
        }
    };

    const normalizeSavedInstrumen = (data) => {
        const result = createInitialInstrumen();

        if (!data) {
            return result;
        }

        if (Array.isArray(data)) {
            data.forEach((item) => {
                const kode =
                    item?.kode_instrumen ||
                    item?.kode ||
                    item?.kode_muk;

                if (!kode || !result[kode]) {
                    return;
                }

                POTENSI.forEach((potensi) => {
                    const key = String(potensi.no);

                    result[kode][key] = normalizeBoolean(
                        item?.[key] ??
                            item?.[`potensi_${key}`] ??
                            item?.potensi?.[key]
                    );
                });
            });

            return result;
        }

        if (data?.instrumen) {
            return normalizeSavedInstrumen(
                data.instrumen
            );
        }

        if (data?.details) {
            return normalizeSavedInstrumen(
                data.details
            );
        }

        Object.keys(result).forEach((kode) => {
            const saved = data[kode];

            if (!saved) {
                return;
            }

            POTENSI.forEach((potensi) => {
                const key = String(potensi.no);

                result[kode][key] = normalizeBoolean(
                    saved[key] ??
                        saved[`potensi_${key}`]
                );
            });
        });

        return result;
    };

    const normalizeImageUrl = (value) => {
        if (!value) return "";
        const text = String(value);
        if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("data:image")) return text;
        const root = API_BASE.replace(/\/api\/?$/, "");
        return text.startsWith("/") ? `${root}${text}` : `${root}/${text}`;
    };

    const normalizeUnits = (data) => {
        const source = Array.isArray(data) ? data : [];
        const result = [];
        const pushUnit = (item, index, groupOverride = null) => {
            const unit = item?.unitDetail || item?.unit || item?.UnitKompetensi || item?.unitKompetensi || item || {};
            const pivot = item?.SkemaUnit || item?.skemaUnit || item?.skema_unit || item?.pivot || {};
            const kelompok = groupOverride || item?.kelompok || item?.KelompokPekerjaan || pivot?.kelompok || pivot?.KelompokPekerjaan || unit?.kelompok || {};
            const idUnit = item?.id_unit || unit?.id_unit || pivot?.id_unit;
            const kodeUnit = unit?.kode_unit || unit?.kode || unit?.kode_unit_kompetensi || item?.kode_unit || item?.kode || "";
            const judulUnit = unit?.judul_unit || unit?.nama_unit || unit?.judul || unit?.nama || item?.judul_unit || item?.nama_unit || item?.judul || item?.nama || "";
            const namaKelompok = kelompok?.nama_kelompok || kelompok?.nama_kelompok_pekerjaan || kelompok?.nama || kelompok?.judul || item?.nama_kelompok || item?.nama_kelompok_pekerjaan || item?.kelompok_pekerjaan || "";
            if (idUnit || kodeUnit || judulUnit) {
                result.push({
                    id_unit: idUnit || `unit-${index}`,
                    kode_unit: kodeUnit || "-",
                    judul_unit: judulUnit || "-",
                    kelompok: namaKelompok || "Kelompok Pekerjaan 1",
                    urutan: Number(item?.urutan || pivot?.urutan || unit?.urutan || index + 1),
                });
            }
        };
        source.forEach((item, index) => {
            pushUnit(item, index);
            const groups = item?.kelompokPekerjaan || item?.kelompok_pekerjaan || item?.kelompok?.units;
            if (Array.isArray(groups)) {
                groups.forEach((group, groupIndex) => {
                    const groupUnits = group?.unitKompetensi || group?.unitKompetensiList || group?.units || group?.unit_kompetensi || group?.SkemaUnit || group?.skemaUnit || [];
                    if (Array.isArray(groupUnits)) groupUnits.forEach((unit, unitIndex) => pushUnit(unit, `${index}-${groupIndex}-${unitIndex}`, group));
                });
            }
        });
        const unique = result.filter((item, index, array) => index === array.findIndex((value) => String(value.id_unit) === String(item.id_unit)));
        return unique.sort((a, b) => {
            const group = String(a.kelompok).localeCompare(String(b.kelompok), "id");
            return group || Number(a.urutan) - Number(b.urutan);
        });
    };

    const normalizePersonList = (data, fallback) => {
        const source = Array.isArray(data) ? data : data ? [data] : [];
        if (!source.length) return fallback;
        return source.map((item) => ({
            id_user: item?.id_user || item?.id_asesor || "",
            nama: item?.nama || item?.nama_lengkap || "",
            nomor: item?.nomor || item?.nomor_met || item?.no_reg_asesor || item?.no_reg || "",
            tanda_tangan: item?.tanda_tangan || item?.ttd || item?.ttd_path || "",
            tanggal: item?.tanggal || "",
        }));
    };

    const normalizeSavedPerson = (data) => {
        if (!data) return;
        const penyusunData = data?.penyusun || (data?.nama_penyusun ? { nama: data.nama_penyusun, nomor: data.nomor_penyusun, tanda_tangan: data.tanda_tangan_penyusun, tanggal: data.tanggal_penyusun } : null);
        const validatorData = data?.validator || (data?.nama_validator ? { nama: data.nama_validator, nomor: data.nomor_validator, tanda_tangan: data.tanda_tangan_validator, tanggal: data.tanggal_validator } : null);
        setPenyusun(normalizePersonList(penyusunData, [{ id_user: "", nama: "", nomor: "", tanda_tangan: "", tanggal: "" }]));
        setValidator(normalizePersonList(validatorData, [{ id_user: "", nama: "", nomor: "", tanda_tangan: "", tanggal: "" }]));
    };

    const selectPerson = (type, index, idUser) => {
        const person = asesorList.find((item) => String(item?.id_user) === String(idUser));
        const setter = type === "penyusun" ? setPenyusun : setValidator;
        setter((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, id_user: idUser, nama: person?.nama_lengkap || person?.nama || "", nomor: person?.no_reg_asesor || person?.nomor_met || person?.no_reg || "", tanda_tangan: person?.ttd_path || person?.ttd || person?.tanda_tangan || "", tanggal: person ? new Date().toISOString().slice(0, 10) : "" } : item));
    };

    const addPerson = (type) => {
        const setter = type === "penyusun" ? setPenyusun : setValidator;
        setter((previous) => [...previous, { id_user: "", nama: "", nomor: "", tanda_tangan: "", tanggal: "" }]);
    };

    const removePerson = (type, index) => {
        const setter = type === "penyusun" ? setPenyusun : setValidator;
        setter((previous) => previous.length > 1 ? previous.filter((_, itemIndex) => itemIndex !== index) : previous);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
            const [jadwalResult, pesertaResult, asesorResult] = await Promise.allSettled([loadJadwal(), loadPeserta(), api.get("/asesor/list-asesor")]);
            let jadwalData = null;
            if (jadwalResult.status === "fulfilled") {
                jadwalData = jadwalResult.value;
                setJadwal(jadwalData);
                setSkema(jadwalData?.skema || null);
            }
            if (pesertaResult.status === "fulfilled") setPeserta(pesertaResult.value);
            if (asesorResult.status === "fulfilled") {
                const data = getData(asesorResult.value);
                const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.rows) ? data.rows : Array.isArray(data?.asesor) ? data.asesor : [];
                setAsesorList(list);
            }
            if (!jadwalData) throw new Error("Data jadwal tidak ditemukan.");
            // MAPA.02 cukup diambil satu kali. Endpoint ini juga mengembalikan
            // unit kompetensi dari skema apabila MAPA.02 belum pernah dibuat.
            const mapaResult = await Promise.allSettled([loadMapa02()]);
            if (mapaResult[0].status === "fulfilled" && mapaResult[0].value) {
                const saved = mapaResult[0].value;
                setMapa02Data(saved);
                setInstrumen(normalizeSavedInstrumen(saved));
                normalizeSavedPerson(saved);

                const savedUnits = normalizeUnits(
                    saved?.unit ||
                    saved?.units ||
                    saved?.data?.unit ||
                    saved?.unitKompetensi ||
                    saved?.unitKompetensiList ||
                    saved?.skemaUnit ||
                    saved?.skema_unit ||
                    []
                );

                setUnits(savedUnits);
            } else {
                setUnits([]);
            }
        } catch (loadError) {
            console.error("LOAD MAPA02 ERROR:", loadError);
            setError(loadError.response?.data?.message || loadError.message || "Data MAPA.02 tidak dapat dimuat.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id_jadwal, id_peserta]);

    const namaSkema = useMemo(() => {
        return (
            skema?.judul_skema ||
            skema?.nama_skema ||
            jadwal?.skema?.judul_skema ||
            jadwal?.skema?.nama_skema ||
            "-"
        );
    }, [skema, jadwal]);

    const nomorSkema = useMemo(() => {
        return (
            skema?.kode_skema ||
            skema?.nomor_skema ||
            jadwal?.skema?.kode_skema ||
            "-"
        );
    }, [skema, jadwal]);

    const namaPeserta = useMemo(() => {
        return (
            peserta?.nama_lengkap ||
            peserta?.nama ||
            peserta?.peserta?.nama_lengkap ||
            peserta?.peserta?.nama ||
            "-"
        );
    }, [peserta]);

    const toggleInstrumen = (
        kode,
        potensi
    ) => {
        setInstrumen((previous) => ({
            ...previous,
            [kode]: {
                ...previous[kode],
                [potensi]:
                    !previous[kode][potensi],
            },
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const targetJadwal = getIdJadwal();
            const targetPeserta = getIdPeserta();

            if (!targetJadwal) {
                throw new Error(
                    "ID jadwal tidak ditemukan."
                );
            }

            const payloadInstrumen =
                INSTRUMEN.map((item) => ({
                    kode_instrumen: item.kode,
                    singkat: item.singkat,
                    nama: item.nama,
                    potensi: {
                        1: Boolean(instrumen[item.kode]?.[1]),
                        2: Boolean(instrumen[item.kode]?.[2]),
                        3: Boolean(instrumen[item.kode]?.[3]),
                        4: Boolean(instrumen[item.kode]?.[4]),
                        5: Boolean(instrumen[item.kode]?.[5]),
                    },
                }));

            const payload = {
                id_jadwal: Number(targetJadwal),
                id_peserta: targetPeserta
                    ? Number(targetPeserta)
                    : null,
                id_skema:
                    Number(
                        jadwal?.id_skema ??
                            skema?.id_skema ??
                            jadwal?.skema?.id_skema
                    ) || null,
                instrumen: payloadInstrumen,
                penyusun,
                validator,
            };

            let response;

            if (mapa02Data?.id_mapa02 || mapa02Data?.id) {
                const idMapa02 =
                    mapa02Data.id_mapa02 ||
                    mapa02Data.id;

                response = await api.put(
                    `/asesor/fr-mapa02/${idMapa02}`,
                    payload
                );
            } else {
                response = await api.post(
                    "/asesor/fr-mapa02/generate",
                    payload
                );
            }

            if (
                response.data?.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                        "MAPA.02 gagal disimpan."
                );
            }

            await Swal.fire({
                icon: "success",
                title: "Berhasil",
                text:
                    response.data?.message ||
                    "MAPA.02 berhasil disimpan.",
                confirmButtonColor:
                    "#071E3D",
            });

            await loadData();
        } catch (saveError) {
            console.error(
                "SAVE MAPA02 ERROR:",
                saveError
            );

            await Swal.fire({
                icon: "error",
                title: "Gagal menyimpan",
                text:
                    saveError.response?.data
                        ?.message ||
                    saveError.message ||
                    "MAPA.02 gagal disimpan.",
                confirmButtonColor:
                    "#071E3D",
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#071E3D] font-bold">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />
                    Memuat MAPA.02...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 px-5 py-10">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <p className="font-bold text-red-600">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="mt-5 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    body {
                        background: white !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .mapa02-page {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .mapa02-paper {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
                <div className="no-print mx-auto mb-5 flex max-w-[1100px] items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                        Kembali
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={
                                handlePrint
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <Download
                                size={18}
                            />
                            Cetak / PDF
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleSave
                            }
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-[#071E3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2b56] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save
                                    size={18}
                                />
                            )}
                            {saving
                                ? "Menyimpan..."
                                : "Simpan MAPA.02"}
                        </button>
                    </div>
                </div>

                <main className="mapa02-page mx-auto max-w-[1100px]">
                    <div className="mapa02-paper bg-white p-5 shadow-md md:p-8">
                        <div className="mb-5 text-center">
                            <h1 className="text-lg font-black uppercase text-black md:text-xl">
                                FR.MAPA.02. PETA INSTRUMEN ASESMEN HASIL PENDEKATAN ASESMEN DAN PERENCANAAN ASESMEN
                            </h1>
                        </div>

                        <table className="w-full border-collapse border border-black text-[11px] text-black md:text-xs">
                            <tbody>
                                <tr>
                                    <td
                                        rowSpan="2"
                                        className="w-[22%] border border-black p-2 font-bold"
                                    >
                                        Skema Sertifikasi
                                        <br />
                                        (KKNI/Okupasi/Klaster)
                                    </td>
                                    <td className="w-[10%] border border-black p-2 font-bold">
                                        Judul
                                    </td>
                                    <td className="w-[4%] border border-black p-2 text-center">
                                        :
                                    </td>
                                    <td className="border border-black p-2">
                                        {namaSkema}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="border border-black p-2 font-bold">
                                        Nomor
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        :
                                    </td>
                                    <td className="border border-black p-2">
                                        {nomorSkema}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-5 overflow-hidden border border-black">
                            <table className="w-full border-collapse text-[10px] text-black md:text-xs">
                                <thead><tr><th className="w-[8%] border border-black p-2">No.</th><th className="w-[28%] border border-black p-2">Kode Unit</th><th className="border border-black p-2">Judul Unit</th></tr></thead>
                                <tbody>
                                    {units.length ? Object.entries(units.reduce((groups, unit) => { const key = unit.kelompok || "Kelompok Pekerjaan 1"; if (!groups[key]) groups[key] = []; groups[key].push(unit); return groups; }, {})).map(([group, groupUnits]) => (
                                        <React.Fragment key={group}><tr><th colSpan="3" className="border border-black bg-slate-50 p-2 text-left font-bold">{group}</th></tr>{groupUnits.map((unit, index) => <tr key={`${unit.id_unit}-${index}`}><td className="border border-black p-2 text-center">{index + 1}.</td><td className="border border-black p-2 font-semibold">{unit.kode_unit}</td><td className="border border-black p-2">{unit.judul_unit}</td></tr>)}</React.Fragment>
                                    )) : <tr><td colSpan="3" className="border border-black p-3 text-center text-slate-500">Unit kompetensi belum tersedia.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-[900px] w-full border-collapse border border-black text-[9px] text-black md:text-[10px]">
                                <thead>
                                    <tr>
                                        <th
                                            rowSpan="2"
                                            className="w-[5%] border border-black p-2"
                                        >
                                            No.
                                        </th>
                                        <th
                                            rowSpan="2"
                                            className="border border-black p-2"
                                        >
                                            INSTRUMEN ASESMEN
                                        </th>
                                        <th
                                            colSpan="5"
                                            className="border border-black p-2 text-center"
                                        >
                                            Potensi Asesi **
                                        </th>
                                    </tr>

                                    <tr>
                                        {POTENSI.map(
                                            (item) => (
                                                <th
                                                    key={
                                                        item.no
                                                    }
                                                    className="w-[7%] border border-black p-2 text-center"
                                                >
                                                    {
                                                        item.no
                                                    }
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {INSTRUMEN.map((item) => (
                                            <tr key={item.kode}>
                                                {item.no === "4a" ? <td rowSpan="2" className="border border-black p-2 text-center align-middle">4.</td> : item.no === "4b" ? null : <td className="border border-black p-2 text-center align-middle">{item.no}.</td>}

                                                <td className="border border-black p-2 align-middle">
                                                    <span className="font-bold">
                                                        {
                                                            item.kode
                                                        }
                                                        .
                                                    </span>{" "}
                                                    {
                                                        item.singkat
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        item.nama
                                                    }
                                                </td>

                                                {POTENSI.map(
                                                    (
                                                        potensi
                                                    ) => (
                                                        <td
                                                            key={
                                                                potensi.no
                                                            }
                                                            className="border border-black p-0 text-center align-middle"
                                                        >
                                                            <label className="flex min-h-[45px] cursor-pointer items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(instrumen[item.kode]?.[potensi.no])}
                                                                    onChange={() =>
                                                                        toggleInstrumen(
                                                                            item.kode,
                                                                            potensi.no
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 cursor-pointer accent-[#071E3D]"
                                                                />
                                                            </label>
                                                        </td>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 text-[9px] leading-4 text-black md:text-[10px]">
                            <p>
                                *) diisi berdasarkan hasil
                                penentuan pendekatan asesmen
                                dan perencanaan asesmen
                            </p>
                        </div>

                        <div className="mt-4 text-[9px] leading-4 text-black md:text-[10px]">
                            <p className="mb-1 font-bold">
                                **) Keterangan
                            </p>

                            {POTENSI.map(
                                (item) => (
                                    <p
                                        key={
                                            item.no
                                        }
                                    >
                                        {item.no}.{" "}
                                        {item.label}
                                    </p>
                                )
                            )}
                        </div>

                        <div className="mt-7 overflow-hidden border border-black">
                            <div className="border-b border-black p-2 text-sm font-bold text-black">Penyusun dan Validator</div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] border-collapse text-[10px] text-black md:text-xs">
                                    <thead>
                                        <tr>
                                            <th className="w-[8%] border border-black p-2">NO</th>
                                            <th className="border border-black p-2">NAMA</th>
                                            <th className="w-[16%] border border-black p-2">STATUS</th>
                                            <th className="w-[22%] border border-black p-2">NOMOR MET</th>
                                            <th className="w-[28%] border border-black p-2">TANDA TANGAN DAN TANGGAL</th>
                                            <th className="no-print w-[9%] border border-black p-2">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {penyusun.map((item, index) => (
                                            <tr key={`penyusun-${index}`}>
                                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                                <td className="border border-black p-1">
                                                    <select value={item.id_user} onChange={(event) => selectPerson("penyusun", index, event.target.value)} className="w-full border-0 bg-transparent px-1 py-1 outline-none">
                                                        <option value="">Pilih penyusun</option>
                                                        {asesorList.map((asesor) => <option key={asesor.id_user} value={asesor.id_user}>{asesor.nama_lengkap || asesor.nama || "-"}</option>)}
                                                    </select>
                                                </td>
                                                {index === 0 && <td rowSpan={penyusun.length} className="border border-black p-2 text-center align-middle font-bold">Penyusun</td>}
                                                <td className="border border-black p-2">{item.nomor || "-"}</td>
                                                <td className="border border-black p-2 text-center">
                                                    {item.tanda_tangan ? <img src={normalizeImageUrl(item.tanda_tangan)} alt="Tanda tangan" className="mx-auto max-h-12 max-w-[150px] object-contain" /> : "-"}
                                                    <div className="mt-1">{item.tanggal || "-"}</div>
                                                </td>
                                                <td className="no-print border border-black p-2 text-center">
                                                    <button type="button" onClick={() => removePerson("penyusun", index)} className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2 py-1 text-red-600"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {validator.map((item, index) => (
                                            <tr key={`validator-${index}`}>
                                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                                <td className="border border-black p-1">
                                                    <select value={item.id_user} onChange={(event) => selectPerson("validator", index, event.target.value)} className="w-full border-0 bg-transparent px-1 py-1 outline-none">
                                                        <option value="">Pilih validator</option>
                                                        {asesorList.map((asesor) => <option key={asesor.id_user} value={asesor.id_user}>{asesor.nama_lengkap || asesor.nama || "-"}</option>)}
                                                    </select>
                                                </td>
                                                {index === 0 && <td rowSpan={validator.length} className="border border-black p-2 text-center align-middle font-bold">Validator</td>}
                                                <td className="border border-black p-2">{item.nomor || "-"}</td>
                                                <td className="border border-black p-2 text-center">
                                                    {item.tanda_tangan ? <img src={normalizeImageUrl(item.tanda_tangan)} alt="Tanda tangan" className="mx-auto max-h-12 max-w-[150px] object-contain" /> : "-"}
                                                    <div className="mt-1">{item.tanggal || "-"}</div>
                                                </td>
                                                <td className="no-print border border-black p-2 text-center">
                                                    <button type="button" onClick={() => removePerson("validator", index)} className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2 py-1 text-red-600"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="no-print flex gap-3 mt-3">
                            <button type="button" onClick={() => addPerson("penyusun")} className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-[9px] font-bold text-white"><Plus size={14} />Tambah Penyusun</button>
                            <button type="button" onClick={() => addPerson("validator")} className="inline-flex items-center gap-2 rounded-xl bg-[#071E3D] px-4 py-2 text-[9px] font-bold text-white"><Plus size={14} />Tambah Validator</button>
                        </div>

                        <div className="mt-5 border-t border-slate-300 pt-4 text-[10px] text-slate-500">
                            <p>
                                Peserta:{" "}
                                <span className="font-bold text-slate-700">
                                    {namaPeserta}
                                </span>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
