import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileSignature,
    Loader2,
    MapPin,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";

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

export default function PresensiAsesor() {
    const { id_jadwal } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [presensi, setPresensi] = useState(null);
    const [profile, setProfile] = useState(null);
    const [jadwal, setJadwal] = useState(null);

    const [peserta, setPeserta] = useState([]);
    const [jumlahPeserta, setJumlahPeserta] = useState(0);

    const [error, setError] = useState("");

    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // USER LOGIN
    // =====================================================

    const getCurrentUser = () => {
        try {
            const userData = localStorage.getItem("user");

            if (!userData) {
                return null;
            }

            return JSON.parse(userData);
        } catch (error) {
            console.error(
                "Gagal membaca user dari localStorage:",
                error
            );

            return null;
        }
    };

    const getCurrentUserId = () => {
        const user = getCurrentUser();

        if (!user) {
            return null;
        }

        const id =
            user.id_user ??
            user.id ??
            user.user?.id_user ??
            user.user?.id;

        return id ? Number(id) : null;
    };

    // =====================================================
    // IMAGE
    // =====================================================

    const getImageSrc = (filePath) => {
        if (!filePath) {
            return "";
        }

        if (String(filePath).startsWith("http")) {
            return filePath;
        }

        const base = API_BASE.replace(/\/api\/?$/, "");

        return `${base}/${String(filePath).replace(/^\/+/, "")}`;
    };

    // =====================================================
    // PROFILE ASESOR
    // =====================================================

    const getProfile = async () => {
        const response = await api.get("/asesor/profile");

        return response.data?.data || response.data || null;
    };

    // =====================================================
    // DETAIL PRESENSI
    // =====================================================

    const getPresensi = async () => {
        try {
            const response = await api.get(
                `/asesor/presensi/${id_jadwal}`
            );

            return response.data?.data || null;
        } catch (error) {
            /*
             * Kalau belum pernah presensi,
             * endpoint bisa mengembalikan 404.
             *
             * Itu bukan error halaman.
             */

            if (error.response?.status === 404) {
                return null;
            }

            throw error;
        }
    };

    // =====================================================
    // JADWAL ASESOR
    // =====================================================

    const getJadwal = async () => {
        const response = await api.get(
            "/asesor/jadwal-saya"
        );

        const responseData =
            response.data?.data ||
            response.data ||
            [];

        const list = Array.isArray(responseData)
            ? responseData
            : responseData?.data || [];

        const found = list.find(
            (item) =>
                Number(
                    item.id_jadwal ??
                        item.jadwal?.id_jadwal
                ) === Number(id_jadwal)
        );

        if (!found) {
            return null;
        }

        return found.jadwal || found;
    };

    // =====================================================
    // PESERTA JADWAL
    // =====================================================

    const getPeserta = async () => {
        try {
            const response = await api.get(
                `/asesor/jadwal/${id_jadwal}/peserta`
            );

            const data =
                response.data?.data ||
                response.data ||
                [];

            const list = Array.isArray(data)
                ? data
                : [];

            /*
             * =================================================
             * PENTING
             * =================================================
             *
             * Hanya peserta yang ditugaskan kepada
             * asesor yang sedang login yang dihitung.
             *
             * Database:
             *
             * peserta.id_asesor
             *
             * harus sama dengan:
             *
             * user.id_user
             *
             * dari localStorage.
             */

            const currentUserId =
                getCurrentUserId();

            if (!currentUserId) {
                console.warn(
                    "ID user asesor tidak ditemukan di localStorage."
                );

                return {
                    all: list,
                    milikAsesor: [],
                };
            }

            const pesertaMilikAsesor =
                list.filter(
                    (item) =>
                        Number(item.id_asesor) ===
                        Number(currentUserId)
                );

            return {
                all: list,
                milikAsesor:
                    pesertaMilikAsesor,
            };
        } catch (error) {
            console.error(
                "Gagal mengambil peserta jadwal:",
                error.response?.data ||
                    error.message
            );

            throw error;
        }
    };

    // =====================================================
    // LOAD SEMUA DATA
    // =====================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const [
                profileResult,
                presensiResult,
                jadwalResult,
                pesertaResult,
            ] = await Promise.allSettled([
                getProfile(),
                getPresensi(),
                getJadwal(),
                getPeserta(),
            ]);

            // =================================================
            // PROFILE
            // =================================================

            if (
                profileResult.status ===
                "fulfilled"
            ) {
                setProfile(
                    profileResult.value
                );
            } else {
                console.error(
                    "PROFILE ERROR:",
                    profileResult.reason
                );

                setProfile(null);
            }

            // =================================================
            // PRESENSI
            // =================================================

            if (
                presensiResult.status ===
                "fulfilled"
            ) {
                setPresensi(
                    presensiResult.value
                );
            } else {
                setPresensi(null);
            }

            // =================================================
            // JADWAL
            // =================================================

            if (
                jadwalResult.status ===
                "fulfilled"
            ) {
                setJadwal(
                    jadwalResult.value
                );
            } else {
                console.error(
                    "JADWAL ERROR:",
                    jadwalResult.reason
                );

                setJadwal(null);
            }

            // =================================================
            // PESERTA
            // =================================================

            if (
                pesertaResult.status ===
                "fulfilled"
            ) {
                const result =
                    pesertaResult.value || {};

                const semuaPeserta =
                    result.all || [];

                const pesertaMilikAsesor =
                    result.milikAsesor || [];

                /*
                 * Yang ditampilkan di halaman presensi
                 * hanya peserta milik asesor login.
                 */

                setPeserta(
                    pesertaMilikAsesor
                );

                setJumlahPeserta(
                    pesertaMilikAsesor.length
                );

                console.log(
                    "Semua peserta:",
                    semuaPeserta
                );

                console.log(
                    "Peserta milik asesor:",
                    pesertaMilikAsesor
                );
            } else {
                console.error(
                    "PESERTA ERROR:",
                    pesertaResult.reason
                );

                setPeserta([]);
                setJumlahPeserta(0);
            }

            // =================================================
            // VALIDASI JADWAL
            // =================================================

            if (
                jadwalResult.status ===
                    "fulfilled" &&
                !jadwalResult.value
            ) {
                setError(
                    "Data jadwal asesor tidak ditemukan."
                );
            }
        } catch (error) {
            console.error(
                "LOAD PRESENSI ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Data presensi tidak dapat dimuat."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        if (id_jadwal) {
            loadData();
        }
    }, [id_jadwal]);

    // =====================================================
    // PRESENSI
    // =====================================================

    const handlePresensi = async () => {
        try {
            const ttdPath =
                profile?.ttd_path;

            // =================================================
            // CEK TTD
            // =================================================

            if (!ttdPath) {
                await Swal.fire({
                    icon: "warning",
                    title:
                        "Tanda Tangan Belum Ada",
                    text:
                        "Silakan lengkapi tanda tangan pada profile asesor terlebih dahulu.",
                    confirmButtonColor:
                        "#071E3D",
                });

                return;
            }

            // =================================================
            // CEK PESERTA
            // =================================================

            if (jumlahPeserta <= 0) {
                await Swal.fire({
                    icon: "warning",
                    title:
                        "Belum Ada Peserta",
                    text:
                        "Belum ada peserta yang ditugaskan kepada Anda pada jadwal ini.",
                    confirmButtonColor:
                        "#071E3D",
                });

                return;
            }

            // =================================================
            // KONFIRMASI
            // =================================================

            const confirm =
                await Swal.fire({
                    icon: "question",
                    title:
                        "Presensi Skema",
                    html: `
                        <div style="font-size:14px; line-height:1.7">
                            <p>
                                Kamu akan melakukan presensi sebagai
                                <b>Asesor Penguji</b>.
                            </p>

                            <p>
                                <b>Skema:</b>
                                ${namaSkema}
                            </p>

                            <p>
                                <b>Tanggal:</b>
                                ${tanggal}
                            </p>

                            <p>
                                <b>Peserta:</b>
                                ${jumlahPeserta} peserta
                            </p>
                        </div>
                    `,
                    showCancelButton:
                        true,
                    confirmButtonText:
                        "Ya, Presensi",
                    cancelButtonText:
                        "Batal",
                    confirmButtonColor:
                        "#071E3D",
                });

            if (!confirm.isConfirmed) {
                return;
            }

            setSubmitting(true);

            // =================================================
            // REQUEST PRESENSI
            // =================================================
            /*
             * Tidak mengirim id_user.
             *
             * Backend mengambil:
             *
             * req.user.id_user
             *
             * berdasarkan token login.
             */

            const response =
                await api.post(
                    "/asesor/presensi",
                    {
                        id_jadwal:
                            Number(
                                id_jadwal
                            ),
                        ttd_path:
                            ttdPath,
                    }
                );

            if (
                response.data?.success
            ) {
                await Swal.fire({
                    icon: "success",
                    title:
                        "Presensi Berhasil",
                    text:
                        response.data
                            ?.message ||
                        "Presensi kamu berhasil disimpan.",
                    confirmButtonColor:
                        "#071E3D",
                });

                await loadData();
            } else {
                throw new Error(
                    response.data
                        ?.message ||
                        "Presensi gagal."
                );
            }
        } catch (error) {
            console.error(
                "PRESENSI ERROR:",
                error
            );

            const message =
                error.response?.data
                    ?.message ||
                error.message ||
                "Presensi tidak dapat disimpan.";

            await Swal.fire({
                icon: "error",
                title:
                    "Presensi Gagal",
                text: message,
                confirmButtonColor:
                    "#071E3D",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // DATA DISPLAY
    // =====================================================

    const namaAsesor =
        profile?.nama_lengkap ||
        profile?.nama ||
        "-";

    const ttdUrl =
        getImageSrc(
            profile?.ttd_path
        );

    // =====================================================
    // SKEMA
    // =====================================================

    const namaSkema =
        jadwal?.skema?.judul_skema ||
        jadwal?.skema?.nama_skema ||
        jadwal?.judul_skema ||
        jadwal?.nama_skema ||
        "-";

    const kodeSkema =
        jadwal?.skema?.kode_skema ||
        jadwal?.kode_skema ||
        "-";

    // =====================================================
    // TUK
    // =====================================================

    const namaTuk =
        jadwal?.tuk?.nama_tuk ||
        jadwal?.nama_tuk ||
        "-";

    // =====================================================
    // TANGGAL
    // =====================================================

    const tanggal =
        jadwal?.tgl_awal &&
        jadwal?.tgl_akhir
            ? `${jadwal.tgl_awal} s/d ${jadwal.tgl_akhir}`
            : jadwal?.tgl_awal ||
              jadwal?.tgl_akhir ||
              "-";

    // =====================================================
    // STATUS PRESENSI
    // =====================================================

    const sudahPresensi =
        Boolean(
            presensi?.id_presensi ||
                presensi
        );

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3 font-bold text-[#071E3D]">
                    <Loader2
                        size={22}
                        className="animate-spin"
                    />

                    Memuat data presensi...
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-8">
                <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm font-bold text-red-600">
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

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-5xl">

                {/* BACK */}
                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071E3D]"
                >
                    <ArrowLeft size={18} />
                    Kembali
                </button>

                {/* HEADER */}
                <div className="mb-8">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#071E3D]">
                        Presensi Asesor Penguji
                    </p>

                    <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                        Presensi Skema
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Presensi dilakukan satu kali
                        untuk setiap jadwal skema.
                        Tanda tangan otomatis
                        menggunakan tanda tangan
                        yang tersimpan pada profile
                        asesor.
                    </p>
                </div>

                {/* CONTENT */}
                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

                    {/* =================================================
                        DETAIL JADWAL
                    ================================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

                        {/* SKEMA */}
                        <div className="mb-7 flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#071E3D] text-white">
                                <ShieldCheck
                                    size={26}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Skema Sertifikasi
                                </p>

                                <h2 className="mt-1 text-xl font-black text-slate-900">
                                    {namaSkema}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {kodeSkema}
                                </p>
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="grid gap-4 md:grid-cols-2">

                            {/* TUK */}
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <MapPin
                                        size={16}
                                    />

                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                        TUK
                                    </span>
                                </div>

                                <p className="font-bold text-slate-800">
                                    {namaTuk}
                                </p>
                            </div>

                            {/* TANGGAL */}
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <div className="mb-2 flex items-center gap-2 text-slate-400">
                                    <Clock3
                                        size={16}
                                    />

                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                        Tanggal
                                    </span>
                                </div>

                                <p className="font-bold text-slate-800">
                                    {tanggal}
                                </p>
                            </div>
                        </div>

                        {/* ASESOR */}
                        <div className="mt-4 rounded-2xl bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                <UserRound
                                    size={16}
                                />

                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Asesor Penguji
                                </span>
                            </div>

                            <p className="font-bold text-slate-800">
                                {namaAsesor}
                            </p>
                        </div>

                        {/* PESERTA */}
                        <div className="mt-4 rounded-2xl bg-slate-50 p-5">
                            <div className="mb-2 flex items-center gap-2 text-slate-400">
                                <Users
                                    size={16}
                                />

                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Peserta
                                </span>
                            </div>

                            <p className="font-bold text-slate-800">
                                {jumlahPeserta} peserta
                            </p>

                            {jumlahPeserta > 0 ? (
                                <p className="mt-1 text-xs text-slate-500">
                                    Peserta yang
                                    ditugaskan kepada
                                    Anda pada jadwal
                                    ini.
                                </p>
                            ) : (
                                <p className="mt-1 text-xs font-semibold text-amber-600">
                                    Belum ada peserta
                                    yang ditugaskan
                                    kepada Anda.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        PRESENSI
                    ================================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

                        {/* TITLE */}
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#071E3D]">
                                <FileSignature
                                    size={21}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Tanda Tangan
                                </p>

                                <h3 className="font-black text-slate-900">
                                    Tanda Tangan Asesor
                                </h3>
                            </div>
                        </div>

                        {/* TTD */}
                        <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                            {ttdUrl ? (
                                <img
                                    src={ttdUrl}
                                    alt="Tanda tangan asesor"
                                    className="max-h-36 max-w-[85%] object-contain"
                                />
                            ) : (
                                <div className="px-6 text-center">
                                    <FileSignature
                                        className="mx-auto mb-3 text-slate-300"
                                        size={36}
                                    />

                                    <p className="text-sm font-bold text-slate-400">
                                        Tanda tangan
                                        belum
                                        tersedia di
                                        profile
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* SUDAH PRESENSI */}
                        {sudahPresensi ? (
                            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2
                                        className="text-emerald-600"
                                        size={24}
                                    />

                                    <div>
                                        <p className="font-black text-emerald-800">
                                            Sudah Presensi
                                        </p>

                                        <p className="mt-1 text-xs text-emerald-700">
                                            Kamu sudah
                                            melakukan
                                            presensi
                                            untuk
                                            skema ini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* INFO PESERTA */}
                                {jumlahPeserta > 0 ? (
                                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                        <p className="text-xs font-bold leading-5 text-emerald-700">
                                            Terdapat{" "}
                                            {jumlahPeserta}{" "}
                                            peserta yang
                                            ditugaskan
                                            kepada Anda
                                            pada jadwal
                                            ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                        <p className="text-xs font-bold leading-5 text-amber-700">
                                            Belum ada
                                            peserta yang
                                            ditugaskan
                                            kepada Anda.
                                            Presensi belum
                                            dapat
                                            dilakukan.
                                        </p>
                                    </div>
                                )}

                                {/* BUTTON */}
                                <button
                                    type="button"
                                    onClick={
                                        handlePresensi
                                    }
                                    disabled={
                                        submitting ||
                                        !ttdUrl ||
                                        jumlahPeserta <=
                                            0
                                    }
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071E3D] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#071E3D]/20 transition hover:bg-[#0b2b56] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <CheckCircle2
                                            size={19}
                                        />
                                    )}

                                    {submitting
                                        ? "Menyimpan Presensi..."
                                        : "Presensi Skema Ini"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}