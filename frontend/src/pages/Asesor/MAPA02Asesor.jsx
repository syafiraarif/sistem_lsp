import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeft, Download, Save, Loader2 } from "lucide-react";

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
        no: "4",
        kode: "FR.IA.04A",
        singkat: "DIT",
        nama: "Daftar Instruksi Terstruktur (Penjelasan Singkat Proyek Terkait Pekerjaan / Kegiatan Terstruktur Lainnya)",
    },
    {
        no: "5",
        kode: "FR.IA.04B",
        singkat: "DIT",
        nama: "Penilaian Proyek Singkat atau Kegiatan Terstruktur Lainnya",
    },
    {
        no: "6",
        kode: "FR.IA.05",
        singkat: "DPT",
        nama: "Daftar Pertanyaan Tertulis Pilihan Ganda",
    },
    {
        no: "7",
        kode: "FR.IA.06",
        singkat: "DPT",
        nama: "Daftar Pertanyaan Tertulis Pilihan Esai",
    },
    {
        no: "8",
        kode: "FR.IA.07",
        singkat: "DPL",
        nama: "Daftar Pertanyaan Lisan",
    },
    {
        no: "9",
        kode: "FR.IA.08",
        singkat: "CVP",
        nama: "Ceklis Verifikasi Portofolio",
    },
    {
        no: "10",
        kode: "FR.IA.09",
        singkat: "PW",
        nama: "Pertanyaan Wawancara",
    },
    {
        no: "11",
        kode: "FR.IA.10",
        singkat: "VPK",
        nama: "Verifikasi Pihak Ketiga",
    },
    {
        no: "12",
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

    const [penyusun, setPenyusun] = useState({
        nama: "",
        nomor: "",
        tanda_tangan: "",
        tanggal: "",
    });

    const [validator, setValidator] = useState({
        nama: "",
        nomor: "",
        tanda_tangan: "",
        tanggal: "",
    });

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
        const targetJadwal = getIdJadwal();
        const targetPeserta = getIdPeserta();

        if (!targetJadwal) {
            return null;
        }

        const urls = [];

        if (targetPeserta) {
            urls.push(
                `/asesor/mapa02/${targetJadwal}/${targetPeserta}`
            );
        }

        urls.push(
            `/asesor/mapa02/${targetJadwal}`
        );

        for (const url of urls) {
            try {
                const response = await api.get(url);

                if (response.status === 200) {
                    return getData(response);
                }
            } catch (requestError) {
                if (
                    requestError.response?.status === 404
                ) {
                    continue;
                }

                throw requestError;
            }
        }

        return null;
    };

    const loadUnits = async (jadwalData) => {
        const idSkema =
            jadwalData?.id_skema ??
            jadwalData?.skema?.id_skema;

        if (!idSkema) {
            return [];
        }

        const urls = [
            `/asesor/skema/${idSkema}/unit`,
            `/skema/${idSkema}/unit`,
            `/asesor/unit-kompetensi/${idSkema}`,
        ];

        for (const url of urls) {
            try {
                const response = await api.get(url);
                const data = getData(response);

                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                    ? data.data
                    : [];

                if (list.length) {
                    return list;
                }
            } catch (requestError) {
                if (
                    requestError.response?.status === 404
                ) {
                    continue;
                }
            }
        }

        return [];
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

    const normalizeSavedPerson = (data) => {
        if (!data) {
            return;
        }

        const penyusunData =
            data?.penyusun &&
            typeof data.penyusun === "object"
                ? data.penyusun
                : null;

        const validatorData =
            data?.validator &&
            typeof data.validator === "object"
                ? data.validator
                : null;

        if (penyusunData) {
            setPenyusun({
                nama: penyusunData.nama || "",
                nomor: penyusunData.nomor || "",
                tanda_tangan:
                    penyusunData.tanda_tangan || "",
                tanggal: penyusunData.tanggal || "",
            });
        } else {
            setPenyusun({
                nama: data?.nama_penyusun || "",
                nomor: data?.nomor_penyusun || "",
                tanda_tangan:
                    data?.tanda_tangan_penyusun || "",
                tanggal: data?.tanggal_penyusun || "",
            });
        }

        if (validatorData) {
            setValidator({
                nama: validatorData.nama || "",
                nomor: validatorData.nomor || "",
                tanda_tangan:
                    validatorData.tanda_tangan || "",
                tanggal: validatorData.tanggal || "",
            });
        } else {
            setValidator({
                nama: data?.nama_validator || "",
                nomor: data?.nomor_validator || "",
                tanda_tangan:
                    data?.tanda_tangan_validator || "",
                tanggal: data?.tanggal_validator || "",
            });
        }
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

            const [jadwalResult, pesertaResult] =
                await Promise.allSettled([
                    loadJadwal(),
                    loadPeserta(),
                ]);

            let jadwalData = null;
            let pesertaData = null;

            if (
                jadwalResult.status === "fulfilled"
            ) {
                jadwalData = jadwalResult.value;
                setJadwal(jadwalData);

                setSkema(
                    jadwalData?.skema ||
                        null
                );
            }

            if (
                pesertaResult.status === "fulfilled"
            ) {
                pesertaData = pesertaResult.value;
                setPeserta(pesertaData);
            }

            if (!jadwalData) {
                throw new Error(
                    "Data jadwal tidak ditemukan."
                );
            }

            const [unitResult, mapaResult] =
                await Promise.allSettled([
                    loadUnits(jadwalData),
                    loadMapa02(),
                ]);

            if (
                unitResult.status === "fulfilled"
            ) {
                setUnits(unitResult.value || []);
            }

            if (
                mapaResult.status === "fulfilled" &&
                mapaResult.value
            ) {
                const saved =
                    mapaResult.value;

                setInstrumen(
                    normalizeSavedInstrumen(
                        saved
                    )
                );

                normalizeSavedPerson(saved);
            }
        } catch (loadError) {
            console.error(
                "LOAD MAPA02 ERROR:",
                loadError
            );

            setError(
                loadError.response?.data?.message ||
                    loadError.message ||
                    "Data MAPA.02 tidak dapat dimuat."
            );
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
                        1: Boolean(
                            instrumen[item.kode]?.[1]
                        ),
                        2: Boolean(
                            instrumen[item.kode]?.[2]
                        ),
                        3: Boolean(
                            instrumen[item.kode]?.[3]
                        ),
                        4: Boolean(
                            instrumen[item.kode]?.[4]
                        ),
                        5: Boolean(
                            instrumen[item.kode]?.[5]
                        ),
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
                penyusun: {
                    nama: penyusun.nama,
                    nomor: penyusun.nomor,
                    tanda_tangan:
                        penyusun.tanda_tangan,
                    tanggal: penyusun.tanggal,
                },
                validator: {
                    nama: validator.nama,
                    nomor: validator.nomor,
                    tanda_tangan:
                        validator.tanda_tangan,
                    tanggal: validator.tanggal,
                },
            };

            let response;

            try {
                response = await api.post(
                    "/asesor/mapa02",
                    payload
                );
            } catch (postError) {
                if (
                    postError.response?.status !==
                    404
                ) {
                    throw postError;
                }

                response = await api.put(
                    `/asesor/mapa02/${targetJadwal}${
                        targetPeserta
                            ? `/${targetPeserta}`
                            : ""
                    }`,
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
                                <thead>
                                    <tr>
                                        <th
                                            colSpan="3"
                                            className="border border-black bg-slate-50 p-2 text-center font-bold"
                                        >
                                            Kelompok Pekerjaan 1
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="w-[8%] border border-black p-2">
                                            No.
                                        </th>
                                        <th className="w-[28%] border border-black p-2">
                                            Kode Unit
                                        </th>
                                        <th className="border border-black p-2">
                                            Judul Unit
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {units.length > 0 ? (
                                        units.map(
                                            (
                                                unit,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        unit?.id_unit ??
                                                        index
                                                    }
                                                >
                                                    <td className="border border-black p-2 text-center">
                                                        {index +
                                                            1}
                                                        .
                                                    </td>
                                                    <td className="border border-black p-2 font-semibold">
                                                        {unit?.kode_unit ||
                                                            unit?.kode ||
                                                            "-"}
                                                    </td>
                                                    <td className="border border-black p-2">
                                                        {unit?.judul_unit ||
                                                            unit?.nama_unit ||
                                                            unit?.judul ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="border border-black p-3 text-center text-slate-500"
                                            >
                                                Unit kompetensi
                                                belum tersedia.
                                            </td>
                                        </tr>
                                    )}
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
                                    {INSTRUMEN.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.kode
                                                }
                                            >
                                                <td className="border border-black p-2 text-center align-middle">
                                                    {
                                                        item.no
                                                    }
                                                    .
                                                </td>

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
                                                                    checked={Boolean(
                                                                        instrumen[
                                                                            item
                                                                                .kode
                                                                        ]?.[
                                                                            potensi
                                                                                .no
                                                                        ]
                                                                    )}
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
                            <div className="border-b border-black p-2 text-sm font-bold text-black">
                                Penyusun dan Validator
                            </div>

                            <table className="w-full border-collapse text-[10px] text-black md:text-xs">
                                <tbody>
                                    <tr>
                                        <td className="w-[24%] border border-black p-2 font-semibold">
                                            Nama Penyusun
                                        </td>
                                        <td className="w-[5%] border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    penyusun.nama
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPenyusun(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            nama: event
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Nama penyusun"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border border-black p-2 font-semibold">
                                            No. Reg
                                        </td>
                                        <td className="border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    penyusun.nomor
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPenyusun(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            nomor: event
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Nomor registrasi"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border border-black p-2 font-semibold">
                                            Tandatangan dan Tanggal
                                        </td>
                                        <td className="border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    penyusun.tanda_tangan
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPenyusun(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            tanda_tangan:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Tanda tangan / tanggal"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border border-black p-2 font-semibold">
                                            Nama Validator
                                        </td>
                                        <td className="border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    validator.nama
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setValidator(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            nama: event
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Nama validator"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border border-black p-2 font-semibold">
                                            No. Reg. MET
                                        </td>
                                        <td className="border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    validator.nomor
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setValidator(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            nomor: event
                                                                .target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Nomor registrasi"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="border border-black p-2 font-semibold">
                                            Tandatangan dan Tanggal
                                        </td>
                                        <td className="border border-black p-2 text-center">
                                            :
                                        </td>
                                        <td className="border border-black p-1">
                                            <input
                                                type="text"
                                                value={
                                                    validator.tanda_tangan
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setValidator(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            tanda_tangan:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                className="w-full border-0 bg-transparent px-1 py-1 outline-none"
                                                placeholder="Tanda tangan / tanggal"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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