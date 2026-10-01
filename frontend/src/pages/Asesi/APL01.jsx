import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  Inbox,
  Loader2,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import SidebarAsesi from "../../components/sidebar/SidebarAsesi";
import { notifikasi } from "../../components/ui/notifikasi";

const API =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:3000/api";

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

const getRequirement = (
  item
) => {
  return (
    item?.persyaratan ||
    item?.Persyaratan ||
    item?.persyaratan_data ||
    item ||
    {}
  );
};

const getRequirementId = (
  item
) => {
  const requirement =
    getRequirement(item);

  return (
    Number(
      item?.id_persyaratan ||
        requirement?.id_persyaratan ||
        requirement?.id
    ) || null
  );
};

const getRequirementName = (
  item
) => {
  const requirement =
    getRequirement(item);

  return (
    requirement?.nama_persyaratan ||
    requirement?.nama ||
    requirement?.judul ||
    item?.nama_persyaratan ||
    "Persyaratan"
  );
};

const getRequirementDescription = (
  item
) => {
  const requirement =
    getRequirement(item);

  return (
    requirement?.keterangan ||
    requirement?.deskripsi ||
    item?.keterangan ||
    item?.deskripsi ||
    ""
  );
};

const isRequirementRequired = (
  item
) => {
  const requirement =
    getRequirement(item);

  return (
    item?.wajib === true ||
    item?.wajib === 1 ||
    item?.wajib === "1" ||
    requirement?.wajib === true ||
    requirement?.wajib === 1 ||
    requirement?.wajib === "1" ||
    item?.skema_persyaratan?.wajib ===
      true ||
    item?.skema_persyaratan?.wajib ===
      1 ||
    item?.skema_persyaratan?.wajib ===
      "1"
  );
};

const getDokumenList = (
  data
) => {
  return (
    data?.dokumen ||
    data?.Apl01Dokumens ||
    data?.Apl01Dokumen ||
    data?.apl01_dokumen ||
    data?.apl01_dokumens ||
    []
  );
};

const formatDate = (
  value
) => {
  if (
    !value ||
    value === "-"
  ) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const getImageSrc = (
  filePath
) => {
  if (!filePath) {
    return "";
  }

  if (
    String(filePath).startsWith(
      "http"
    )
  ) {
    return filePath;
  }

  const base =
    API.replace(
      /\/api\/?$/,
      ""
    );

  return `${base}/${String(
    filePath
  ).replace(/^\/+/, "")}`;
};

const getDisplayValue = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "-";
  }

  return String(value);
};

const normalizeUnitData = (
  response
) => {
  const data =
    response?.data?.data ??
    response?.data ??
    [];

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.units
    )
  ) {
    return data.units;
  }

  if (
    Array.isArray(
      data?.unitKompetensi
    )
  ) {
    return data.unitKompetensi;
  }

  return [];
};

const tujuanOptions = [
  {
    value:
      "sertifikasi",
    label: "Sertifikasi",
  },
  {
    value:
      "sertifikasi_ulang",
    label:
      "Sertifikasi Ulang",
  },
  {
    value: "pkk",
    label:
      "Pengakuan Kompetensi Terkini (PKT)",
  },
  {
    value: "rpl",
    label:
      "Rekognisi Pembelajaran Lampau",
  },
  {
    value: "lainnya",
    label: "Lainnya",
  },
];

const InfoRow = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-[180px_28px_1fr] border-b border-r border-black ${className}`}
    >
      <div className="bg-[#F7F7F7] px-4 py-4 text-[10px] font-bold">
        {label}
      </div>

      <div className="px-2 py-4 text-center text-[10px] font-bold">
        :
      </div>

      <div className="border-l border-black px-4 py-4 text-[11px] font-medium leading-5">
        {value || "-"}
      </div>
    </div>
  );
};

const TujuanOption = ({
  value,
  label,
  checked,
  disabled,
  onChange,
}) => {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 border-2 px-4 py-4 transition-all ${
        checked
          ? "border-black bg-[#E2F0D9]"
          : "border-black bg-white hover:bg-slate-50"
      } ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : ""
      }`}
    >
      <input
        type="radio"
        name="tujuan_asesmen"
        value={value}
        checked={checked}
        onChange={() =>
          onChange(value)
        }
        disabled={disabled}
        className="h-5 w-5 accent-black"
      />

      <span className="text-[11px] font-bold text-[#071E3D]">
        {label}
      </span>
    </label>
  );
};

const StatusCard = ({
  label,
  value,
}) => {
  return (
    <div className="border-2 border-black bg-white px-4 py-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-[20px] font-black text-[#071E3D]">
        {value}
      </p>
    </div>
  );
};

const DocumentSection = ({
  title,
  icon,
  open,
  onToggle,
  children,
}) => {
  return (
    <section className="border-t-2 border-black">
      <div className="flex items-center justify-between gap-4 border-b border-black px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black bg-white">
            {icon}
          </div>

          <div>
            <h2 className="text-[14px] font-black">
              {title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="apl01-print-hidden flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-white"
        >
          {open ? (
            <ChevronUp
              size={17}
            />
          ) : (
            <ChevronDown
              size={17}
            />
          )}
        </button>
      </div>

      {open && (
        <div>{children}</div>
      )}
    </section>
  );
};

const RequirementSection = ({
  title,
  items,
  documents,
  open,
  onToggle,
  onFileSelect,
  onUpload,
  getFileUrl,
  uploadingId,
  isLocked,
}) => {
  return (
    <section className="border-t-2 border-black">
      <div className="flex items-center justify-between gap-4 border-b border-black px-5 py-4">
        <div>
          <h2 className="text-[14px] font-black uppercase">
            {title}
          </h2>

          <p className="mt-1 text-[10px] font-medium text-slate-500">
            {items.length} persyaratan
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="apl01-print-hidden flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-white"
        >
          {open ? (
            <ChevronUp
              size={17}
            />
          ) : (
            <ChevronDown
              size={17}
            />
          )}
        </button>
      </div>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th className="w-[55px] border-b border-r border-black bg-[#E2F0D9] px-3 py-3 text-center text-[11px] font-bold">
                  No.
                </th>

                <th className="border-b border-r border-black bg-[#E2F0D9] px-4 py-3 text-left text-[11px] font-bold">
                  Persyaratan
                </th>

                <th className="w-[105px] border-b border-r border-black bg-[#E2F0D9] px-3 py-3 text-center text-[11px] font-bold">
                  Sifat
                </th>

                <th className="w-[360px] border-b border-black bg-[#E2F0D9] px-4 py-3 text-center text-[11px] font-bold">
                  Bukti
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="border-b border-black px-5 py-12 text-center text-[12px]"
                  >
                    <Inbox
                      size={34}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    Belum ada persyaratan.
                  </td>
                </tr>
              ) : (
                items.map(
                  (
                    item,
                    index
                  ) => {
                    const requirementId =
                      getRequirementId(
                        item
                      );

                    if (
                      !requirementId
                    ) {
                      return null;
                    }

                    const document =
                      documents[
                        requirementId
                      ] || {};

                    const fileUrl =
                      getFileUrl(
                        document
                      );

                    const isUploading =
                      uploadingId ===
                      requirementId;

                    const required =
                      isRequirementRequired(
                        item
                      );

                    return (
                      <tr
                        key={
                          requirementId
                        }
                        className="align-top"
                      >
                        <td className="border-b border-r border-black px-3 py-5 text-center text-[11px] font-bold">
                          {index + 1}
                        </td>

                        <td className="border-b border-r border-black px-4 py-5">
                          <p className="text-[12px] font-bold leading-6 text-[#071E3D]">
                            {getRequirementName(
                              item
                            )}
                          </p>

                          {getRequirementDescription(
                            item
                          ) && (
                            <p className="mt-2 text-[10px] leading-5 text-slate-600">
                              {getRequirementDescription(
                                item
                              )}
                            </p>
                          )}
                        </td>

                        <td className="border-b border-r border-black px-3 py-5 text-center">
                          <span
                            className={`inline-flex border px-3 py-2 text-[9px] font-bold uppercase ${
                              required
                                ? "border-black bg-black text-white"
                                : "border-slate-300 bg-white text-slate-500"
                            }`}
                          >
                            {required
                              ? "Wajib"
                              : "Pendukung"}
                          </span>
                        </td>

                        <td className="border-b border-black px-4 py-5">
                          {fileUrl && (
                            <div className="mb-3 flex items-center gap-2 border border-black px-3 py-3">
                              <FileCheck2
                                size={17}
                                className="shrink-0"
                              />

                              <a
                                href={
                                  fileUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="min-w-0 flex-1 truncate text-[10px] font-bold underline"
                              >
                                {document.file_path
                                  ?.split(
                                    "/"
                                  )
                                  .pop() ||
                                  "Dokumen Tersimpan"}
                              </a>

                              <CheckCircle
                                size={15}
                                className="shrink-0 text-green-600"
                              />
                            </div>
                          )}

                          {!isLocked && (
                            <label className="apl01-print-hidden flex min-h-[90px] cursor-pointer flex-col items-center justify-center border border-dashed border-black bg-white px-4 py-4 text-center hover:bg-slate-50">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(
                                  event
                                ) =>
                                  onFileSelect(
                                    requirementId,
                                    event
                                      .target
                                      .files?.[0]
                                  )
                                }
                              />

                              <UploadCloud
                                size={23}
                              />

                              <span className="mt-2 text-[10px] font-bold">
                                {document.file
                                  ? "File Dipilih"
                                  : fileUrl
                                  ? "Ganti File"
                                  : "Tambah Bukti"}
                              </span>

                              <span className="mt-1 max-w-full truncate text-[9px] text-slate-500">
                                {document.file
                                  ?.name ||
                                  "PDF / JPG / PNG"}
                              </span>
                            </label>
                          )}

                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpload(
                                  item
                                )
                              }
                              disabled={
                                isUploading
                              }
                              className="apl01-print-hidden mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-4 py-3 text-[10px] font-bold text-white transition-colors hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {isUploading ? (
                                <Loader2
                                  size={
                                    15
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <Save
                                  size={
                                    15
                                  }
                                />
                              )}

                              {isUploading
                                ? "Menyimpan..."
                                : "Simpan Bukti"}
                            </button>
                          )}

                          {!fileUrl &&
                            isLocked && (
                              <span className="text-[10px] italic text-slate-400">
                                Belum ada dokumen.
                              </span>
                            )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-5">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-9 text-center shadow-lg">
        <Loader2
          size={42}
          className="mx-auto animate-spin text-[#CC6B27]"
        />

        <h2 className="mt-5 text-[20px] font-black text-[#071E3D]">
          Memuat APL.01
        </h2>

        <p className="mt-2 text-[13px] font-medium text-slate-500">
          Menyiapkan formulir permohonan sertifikasi.
        </p>
      </div>
    </div>
  );
};

export default function APL01() {
  const {
    id_peserta: paramIdPeserta,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const idPeserta =
    paramIdPeserta ||
    location.state
      ?.id_peserta ||
    location.state
      ?.idPeserta ||
    "";

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    uploadingId,
    setUploadingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    peserta,
    setPeserta,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    skema,
    setSkema,
  ] = useState(null);

  const [
    jadwal,
    setJadwal,
  ] = useState(null);

  const [
    tuk,
    setTuk,
  ] = useState(null);

  const [
    apl01,
    setApl01,
  ] = useState(null);

  const [
    persyaratanDasar,
    setPersyaratanDasar,
  ] = useState([]);

  const [
    persyaratanAdministratif,
    setPersyaratanAdministratif,
  ] = useState([]);

  const [
    unitKompetensi,
    setUnitKompetensi,
  ] = useState([]);

  const [
    tujuan,
    setTujuan,
  ] = useState("");

  const [
    tujuanLainnya,
    setTujuanLainnya,
  ] = useState("");

  const [
    documents,
    setDocuments,
  ] = useState({});

  const [
    openSections,
    setOpenSections,
  ] = useState({
    unit: true,
    dasar: true,
    administratif: true,
  });

  const [
    openInformation,
    setOpenInformation,
  ] = useState({
    pribadi: true,
    pekerjaan: true,
    skema: true,
  });

  const loadExistingApl01 =
    useCallback(
      async (
        currentIdPeserta
      ) => {
        if (
          !currentIdPeserta
        ) {
          return null;
        }

        try {
          const response =
            await api.get(
              `/asesi/apl01/${currentIdPeserta}`
            );

          const responseData =
            response.data?.data ||
            {};

          const existing =
            responseData.apl01 ||
            null;

          setApl01(existing);

          if (!existing) {
            setDocuments({});
            return null;
          }

          setTujuan(
            existing.tujuan_asesmen ||
              ""
          );

          setTujuanLainnya(
            existing.tujuan_lainnya ||
              ""
          );

          const mappedDocuments =
            {};

          getDokumenList(
            existing
          ).forEach(
            (document) => {
              const requirementId =
                Number(
                  document.id_persyaratan
                );

              if (
                !requirementId
              ) {
                return;
              }

              mappedDocuments[
                requirementId
              ] = {
                id_dokumen:
                  document.id_dokumen,
                id_persyaratan:
                  requirementId,
                file_path:
                  document.file_path ||
                  "",
                file_url:
                  document.file_url ||
                  "",
                file: null,
              };
            }
          );

          setDocuments(
            mappedDocuments
          );

          return existing;
        } catch (err) {
          if (
            err.response
              ?.status ===
            404
          ) {
            setApl01(null);
            setDocuments({});
            return null;
          }

          throw err;
        }
      },
      []
    );

  const loadPage =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            navigate(
              "/login",
              {
                replace: true,
              }
            );
            return;
          }

          if (!idPeserta) {
            const message =
              "ID peserta tidak ditemukan.";

            setError(message);

            await notifikasi.gagal(
              "Data Peserta Tidak Ditemukan",
              message
            );

            return;
          }

          const formResponse =
            await api.get(
              `/asesi/apl01/form/${idPeserta}`
            );

          const formData =
            formResponse.data?.data ||
            {};

          setPeserta(
            formData.peserta ||
              null
          );

          setProfile(
            formData.profile ||
              null
          );

          setSkema(
            formData.skema ||
              null
          );

          setJadwal(
            formData.jadwal ||
              null
          );

          setTuk(
            formData.tuk ||
              null
          );

          setPersyaratanDasar(
            Array.isArray(
              formData.persyaratanDasar
            )
              ? formData.persyaratanDasar
              : []
          );

          setPersyaratanAdministratif(
            Array.isArray(
              formData.persyaratanAdministratif
            )
              ? formData.persyaratanAdministratif
              : []
          );

          try {
            const unitResponse =
              await api.get(
                `/asesi/unit-kompetensi/skema/${formData.skema?.id_skema}`
              );

            setUnitKompetensi(
              normalizeUnitData(
                unitResponse
              )
            );
          } catch (
            unitError
          ) {
            console.error(
              "Gagal mengambil unit kompetensi:",
              unitError
            );

            setUnitKompetensi(
              []
            );
          }

          await loadExistingApl01(
            idPeserta
          );
        } catch (err) {
          console.error(
            "Load APL01 error:",
            err
          );

          if (
            err.response
              ?.status ===
            401
          ) {
            localStorage.clear();

            await notifikasi.peringatan(
              "Sesi Berakhir",
              "Sesi login Anda telah berakhir. Silakan login kembali."
            );

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          const message =
            err.response
              ?.data
              ?.message ||
            err.response
              ?.data
              ?.error ||
            err.message ||
            "Gagal memuat APL.01.";

          setError(message);

          await notifikasi.gagal(
            "Gagal Memuat APL.01",
            message
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        idPeserta,
        loadExistingApl01,
        navigate,
      ]
    );

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const persyaratan =
    useMemo(
      () => [
        ...persyaratanDasar,
        ...persyaratanAdministratif,
      ],
      [
        persyaratanDasar,
        persyaratanAdministratif,
      ]
    );

  const requiredCount =
    useMemo(
      () =>
        persyaratan.filter(
          isRequirementRequired
        ).length,
      [persyaratan]
    );

  const uploadedCount =
    useMemo(
      () =>
        persyaratan.filter(
          (item) => {
            const id =
              getRequirementId(
                item
              );

            return Boolean(
              documents[id]
                ?.id_dokumen
            );
          }
        ).length,
      [
        persyaratan,
        documents,
      ]
    );

  const requiredUploadedCount =
    useMemo(
      () =>
        persyaratan.filter(
          (item) => {
            if (
              !isRequirementRequired(
                item
              )
            ) {
              return false;
            }

            const id =
              getRequirementId(
                item
              );

            return Boolean(
              documents[id]
                ?.id_dokumen
            );
          }
        ).length,
      [
        persyaratan,
        documents,
      ]
    );

  const progress =
    persyaratan.length >
    0
      ? Math.round(
          (uploadedCount /
            persyaratan.length) *
            100
        )
      : 0;

  const requiredProgress =
    requiredCount > 0
      ? Math.round(
          (requiredUploadedCount /
            requiredCount) *
            100
        )
      : 0;

  const namaAsesi =
    profile?.nama_lengkap ||
    profile?.nama ||
    peserta?.nama_lengkap ||
    "-";

  const nik =
    profile?.nik ||
    profile?.nik_ktp ||
    "-";

  const email =
    profile?.email ||
    peserta?.email ||
    peserta?.email_user ||
    profile?.email_user ||
    profile?.email_perusahaan ||
    "-";

  const nomorRumah =
    profile?.telepon_rumah ||
    profile?.telp_rumah ||
    profile?.no_telp_rumah ||
    peserta?.telepon_rumah ||
    "-";

  const nomorHp =
    profile?.no_hp ||
    profile?.nomor_hp ||
    profile?.no_telepon ||
    profile?.telepon ||
    peserta?.no_hp ||
    peserta?.nomor_hp ||
    peserta?.no_telepon ||
    "-";

  const nomorKantor =
    profile?.telp_perusahaan ||
    profile?.telepon_kantor ||
    profile?.no_telp_kantor ||
    "-";

  const faxKantor =
    profile?.fax_perusahaan ||
    profile?.fax ||
    "-";

  const jenisKelamin =
    profile?.jenis_kelamin ===
    "laki-laki"
      ? "Laki-laki"
      : profile?.jenis_kelamin ===
        "perempuan"
      ? "Wanita"
      : "-";

  const tempatLahir =
    profile?.tempat_lahir ||
    "-";

  const tanggalLahir =
    profile?.tanggal_lahir ||
    profile?.tgl_lahir ||
    null;

  const kebangsaan =
    profile?.kebangsaan ||
    "-";

  const alamatRumah = [
    profile?.alamat,
    profile?.rt
      ? `RT ${profile.rt}`
      : "",
    profile?.rw
      ? `RW ${profile.rw}`
      : "",
    profile?.kelurahan,
    profile?.kecamatan,
    profile?.kota,
    profile?.provinsi,
  ]
    .filter(Boolean)
    .join(", ");

  const kodePos =
    profile?.kode_pos ||
    "-";

  const pendidikanTerakhir =
    profile?.pendidikan_terakhir ||
    profile?.pendidikan ||
    "-";

  const universitas =
    profile?.universitas ||
    "-";

  const jurusan =
    profile?.jurusan ||
    "-";

  const tahunLulus =
    profile?.tahun_lulus
      ? String(
          profile.tahun_lulus
        )
      : "-";

  const kualifikasiPendidikan =
    [
      pendidikanTerakhir !==
      "-"
        ? pendidikanTerakhir
        : "",
      universitas !==
      "-"
        ? universitas
        : "",
      jurusan !==
      "-"
        ? jurusan
        : "",
      tahunLulus !==
      "-"
        ? `Tahun ${tahunLulus}`
        : "",
    ]
      .filter(Boolean)
      .join(" - ");

  const pekerjaan =
    profile?.pekerjaan ||
    "-";

  const jabatan =
    profile?.jabatan ||
    "-";

  const namaPerusahaan =
    profile?.nama_perusahaan ||
    "-";

  const alamatKantor =
    profile?.alamat_perusahaan ||
    "-";

  const kodePosKantor =
    profile?.kode_pos_perusahaan ||
    profile?.kode_pos_kantor ||
    profile?.kode_pos_kantor_perusahaan ||
    "-";

  const emailKantor =
    profile?.email_perusahaan ||
    "-";

  const ttdUrl =
    profile?.ttd_url ||
    profile?.tanda_tangan_url ||
    getImageSrc(
      profile?.ttd_path
    );

  const isSubmitted =
    apl01?.status ===
    "submit";

  const ensureApl01 =
    useCallback(
      async () => {
        if (
          apl01?.id_apl01
        ) {
          return apl01;
        }

        if (!tujuan) {
          throw new Error(
            "Silakan pilih tujuan asesmen terlebih dahulu."
          );
        }

        if (
          tujuan ===
            "lainnya" &&
          !tujuanLainnya.trim()
        ) {
          throw new Error(
            "Silakan isi tujuan asesmen lainnya."
          );
        }

        try {
          const response =
            await api.post(
              "/asesi/apl01/create",
              {
                id_peserta:
                  Number(
                    idPeserta
                  ),
                tujuan_asesmen:
                  tujuan,
                tujuan_lainnya:
                  tujuan ===
                  "lainnya"
                    ? tujuanLainnya.trim()
                    : null,
              }
            );

          const created =
            response.data
              ?.data ||
            null;

          if (
            created?.id_apl01
          ) {
            setApl01(
              created
            );
          }

          return created;
        } catch (err) {
          if (
            err.response
              ?.status ===
              409 &&
            err.response
              ?.data
              ?.data
          ) {
            const existing =
              err.response.data
                .data;

            setApl01(
              existing
            );

            setTujuan(
              existing.tujuan_asesmen ||
                tujuan
            );

            setTujuanLainnya(
              existing.tujuan_lainnya ||
                ""
            );

            return existing;
          }

          throw err;
        }
      },
      [
        apl01,
        idPeserta,
        tujuan,
        tujuanLainnya,
      ]
    );

  const handleRefresh =
    async () => {
      if (refreshing) {
        return;
      }

      await loadPage(
        true
      );
    };

  const handleTujuanChange =
    (value) => {
      if (isSubmitted) {
        return;
      }

      setTujuan(value);

      if (
        value !==
        "lainnya"
      ) {
        setTujuanLainnya(
          ""
        );
      }
    };

  const handleSaveTujuan =
    async () => {
      if (isSubmitted) {
        await notifikasi.peringatan(
          "APL.01 Sudah Disubmit",
          "Data APL.01 tidak dapat diubah lagi."
        );

        return;
      }

      if (!tujuan) {
        await notifikasi.peringatan(
          "Tujuan Belum Dipilih",
          "Silakan pilih tujuan asesmen terlebih dahulu."
        );

        return;
      }

      if (
        tujuan ===
          "lainnya" &&
        !tujuanLainnya.trim()
      ) {
        await notifikasi.peringatan(
          "Tujuan Lainnya Belum Diisi",
          "Silakan isi tujuan asesmen lainnya."
        );

        return;
      }

      try {
        setSaving(true);

        const result =
          await ensureApl01();

        if (
          result?.id_apl01
        ) {
          await notifikasi.sukses(
            "Berhasil",
            "Tujuan asesmen berhasil disimpan."
          );

          await loadExistingApl01(
            idPeserta
          );
        }
      } catch (err) {
        await notifikasi.gagal(
          "Gagal Menyimpan",
          err.response?.data
            ?.message ||
            err.message ||
            "Tujuan asesmen gagal disimpan."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleFileSelect =
    (
      requirementId,
      file
    ) => {
      if (isSubmitted) {
        return;
      }

      if (!file) {
        return;
      }

      if (
        file.size >
        10 *
          1024 *
          1024
      ) {
        notifikasi.peringatan(
          "File Terlalu Besar",
          "Ukuran file maksimal 10 MB."
        );

        return;
      }

      setDocuments(
        (prev) => ({
          ...prev,
          [requirementId]: {
            ...prev[
              requirementId
            ],
            id_persyaratan:
              requirementId,
            file,
          },
        })
      );
    };

  const handleUpload =
    async (
      item
    ) => {
      if (isSubmitted) {
        await notifikasi.peringatan(
          "APL.01 Sudah Disubmit",
          "Dokumen tidak dapat diubah lagi."
        );

        return;
      }

      const requirementId =
        getRequirementId(
          item
        );

      const document =
        documents[
          requirementId
        ];

      if (
        !document?.file
      ) {
        await notifikasi.peringatan(
          "File Belum Dipilih",
          `Silakan pilih file untuk ${getRequirementName(
            item
          )}.`
        );

        return;
      }

      try {
        setUploadingId(
          requirementId
        );

        const currentApl01 =
          await ensureApl01();

        if (
          !currentApl01?.id_apl01
        ) {
          throw new Error(
            "APL.01 belum berhasil dibuat."
          );
        }

        const formData =
          new FormData();

        formData.append(
          "id_apl01",
          currentApl01.id_apl01
        );

        formData.append(
          "id_persyaratan",
          requirementId
        );

        formData.append(
          "file_dokumen",
          document.file
        );

        await api.post(
          "/asesi/apl01/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        await loadExistingApl01(
          idPeserta
        );

        await notifikasi.sukses(
          "Dokumen Tersimpan",
          `${getRequirementName(
            item
          )} berhasil diunggah.`
        );
      } catch (err) {
        await notifikasi.gagal(
          "Gagal Upload",
          err.response?.data
            ?.message ||
            err.message ||
            "Dokumen gagal diunggah."
        );
      } finally {
        setUploadingId(
          null
        );
      }
    };

  const handleSubmit =
    async () => {
      if (isSubmitted) {
        await notifikasi.peringatan(
          "APL.01 Sudah Disubmit",
          "Dokumen ini sudah dikirim."
        );

        return;
      }

      if (!tujuan) {
        await notifikasi.peringatan(
          "Tujuan Belum Dipilih",
          "Silakan pilih tujuan asesmen."
        );

        return;
      }

      if (
        tujuan ===
          "lainnya" &&
        !tujuanLainnya.trim()
      ) {
        await notifikasi.peringatan(
          "Tujuan Lainnya Belum Diisi",
          "Silakan isi tujuan asesmen lainnya."
        );

        return;
      }

      if (!ttdUrl) {
        await notifikasi.peringatan(
          "Tanda Tangan Belum Ada",
          "Silakan upload tanda tangan terlebih dahulu melalui Profil Asesi."
        );

        return;
      }

      const requiredItems =
        [
          ...persyaratanDasar,
          ...persyaratanAdministratif,
        ].filter(
          isRequirementRequired
        );

      const missingDocuments =
        requiredItems.filter(
          (item) => {
            const requirementId =
              getRequirementId(
                item
              );

            return !documents[
              requirementId
            ]?.id_dokumen;
          }
        );

      if (
        missingDocuments.length >
        0
      ) {
        await notifikasi.peringatan(
          "Persyaratan Belum Lengkap",
          `Masih ada ${missingDocuments.length} persyaratan wajib yang belum diunggah.`
        );

        return;
      }

      const currentApl01 =
        await ensureApl01();

      if (
        !currentApl01?.id_apl01
      ) {
        await notifikasi.gagal(
          "Gagal Membuat APL.01",
          "APL.01 belum berhasil dibuat."
        );

        return;
      }

      const confirmation =
        await notifikasi.konfirmasi(
          "Submit APL.01?",
          "Pastikan seluruh persyaratan wajib dan tanda tangan sudah lengkap. Setelah disubmit, data tidak dapat diubah lagi.",
          "Ya, Submit",
          "Batal",
          "question",
          "primary"
        );

      if (
        !confirmation?.isConfirmed
      ) {
        return;
      }

      try {
        setSubmitting(
          true
        );

        await api.put(
          `/asesi/apl01/submit/${currentApl01.id_apl01}`,
          {}
        );

        await notifikasi.sukses(
          "APL.01 Berhasil Disubmit",
          "Formulir permohonan sertifikasi berhasil dikirim."
        );

        await loadPage();
      } catch (err) {
        await notifikasi.gagal(
          "Gagal Submit",
          err.response?.data
            ?.message ||
            err.message ||
            "APL.01 gagal disubmit."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  const downloadPdf =
    async () => {
      if (!idPeserta) {
        await notifikasi.peringatan(
          "ID Peserta Tidak Ditemukan",
          "Data peserta belum tersedia."
        );

        return;
      }

      try {
        const response =
          await api.get(
            `/asesi/apl01/pdf/${idPeserta}`,
            {
              responseType:
                "blob",
            }
          );

        const blob =
          new Blob(
            [
              response.data,
            ],
            {
              type: "application/pdf",
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `APL01_${idPeserta}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        await notifikasi.sukses(
          "Berhasil",
          "Dokumen APL.01 berhasil diunduh."
        );
      } catch (err) {
        console.error(
          "Download PDF APL01 error:",
          err
        );

        if (
          err.response
            ?.status ===
          401
        ) {
          localStorage.clear();

          await notifikasi.peringatan(
            "Sesi Berakhir",
            "Silakan login kembali."
          );

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        await notifikasi.gagal(
          "Gagal Download PDF",
          "Dokumen APL.01 gagal diunduh."
        );
      }
    };

  const toggleSection =
    (section) => {
      setOpenSections(
        (prev) => ({
          ...prev,
          [section]:
            !prev[section],
        })
      );
    };

  const toggleInformation =
    (section) => {
      setOpenInformation(
        (prev) => ({
          ...prev,
          [section]:
            !prev[section],
        })
      );
    };

  const getFileUrl =
    (document) => {
      if (
        document?.file_url
      ) {
        return document.file_url;
      }

      return getImageSrc(
        document?.file_path
      );
    };

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            .apl01-print-hidden {
              display: none !important;
            }

            .apl01-main {
              padding: 0 !important;
              margin: 0 !important;
            }

            .apl01-paper {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              border: 0 !important;
              box-shadow: none !important;
            }

            .apl01-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            table,
            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="flex min-h-screen bg-[#EEF2F7]">
        <div className="apl01-print-hidden">
          <SidebarAsesi
            isOpen={
              sidebarOpen
            }
            setIsOpen={
              setSidebarOpen
            }
          />
        </div>

        <main className="apl01-main min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <div className="apl01-print-hidden mb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-[13px] font-bold text-[#071E3D] shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCcw
                    size={17}
                  />
                )}
                Refresh
              </button>

              <button
                type="button"
                onClick={
                  downloadPdf
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#A8561F]"
              >
                <Download
                  size={17}
                />
                Download PDF
              </button>
            </div>

            {error && (
              <div className="apl01-print-hidden mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] font-semibold leading-6 text-red-700">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <section className="apl01-paper overflow-hidden border-2 border-black bg-white shadow-xl">
              <header className="border-b-2 border-black">
                <div className="px-5 py-5 text-center">
                  <p className="text-[15px] font-bold">
                    FORMULIR PERMOHONAN SERTIFIKASI KOMPETENSI
                  </p>

                  <h1 className="mt-1 text-[26px] font-black tracking-tight md:text-[30px]">
                    FR.APL.01
                  </h1>
                </div>

                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td
                        rowSpan="4"
                        className="w-[24%] border border-black px-4 py-5 text-center text-[11px] font-bold leading-6"
                      >
                        Skema Sertifikasi
                        <br />
                        (KKNI/Okupasi/Klaster)
                      </td>

                      <td className="w-[12%] border border-black px-3 py-4 text-center text-[11px] font-bold">
                        Judul
                      </td>

                      <td className="w-[3%] border border-black px-2 py-4 text-center text-[11px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-4 py-4 text-[12px] font-bold">
                        {skema?.judul_skema ||
                          "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-black px-3 py-4 text-center text-[11px] font-bold">
                        Nomor
                      </td>

                      <td className="border border-black px-2 py-4 text-center text-[11px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-4 py-4 text-[11px]">
                        {skema?.kode_skema ||
                          skema?.nomor_skema ||
                          skema?.nomor ||
                          "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-black px-3 py-4 text-center text-[11px] font-bold">
                        TUK
                      </td>

                      <td className="border border-black px-2 py-4 text-center text-[11px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-4 py-4 text-[11px]">
                        {tuk?.nama_tuk ||
                          "-"}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-black px-3 py-4 text-center text-[11px] font-bold">
                        Kegiatan
                      </td>

                      <td className="border border-black px-2 py-4 text-center text-[11px] font-bold">
                        :
                      </td>

                      <td className="border border-black px-4 py-4 text-[11px]">
                        {jadwal?.nama_kegiatan ||
                          "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </header>

              <div className="mb-0 border-b-2 border-black px-5 py-5">
                <div className="mb-2 text-[15px] font-bold">
                  Bagian 1 : Rincian Data Pemohon Sertifikasi
                </div>

                <p className="text-[11px] leading-6 text-slate-700">
                  Pada bagian ini, cantumkan data pribadi,
                  data pendidikan formal serta data pekerjaan
                  anda pada saat ini.
                </p>
              </div>

              <DocumentSection
                title="Data Pribadi"
                icon={
                  <User
                    size={18}
                  />
                }
                open={
                  openInformation.pribadi
                }
                onToggle={() =>
                  toggleInformation(
                    "pribadi"
                  )
                }
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <InfoRow
                    label="Nama Lengkap"
                    value={
                      namaAsesi
                    }
                  />

                  <InfoRow
                    label="No. KTP/NIK/Paspor"
                    value={
                      nik
                    }
                  />

                  <InfoRow
                    label="Tempat / Tgl. Lahir"
                    value={
                      tanggalLahir
                        ? `${tempatLahir}, ${formatDate(
                            tanggalLahir
                          )}`
                        : tempatLahir
                    }
                  />

                  <InfoRow
                    label="Jenis Kelamin"
                    value={
                      jenisKelamin
                    }
                  />

                  <InfoRow
                    label="Kebangsaan"
                    value={
                      kebangsaan
                    }
                  />

                  <InfoRow
                    label="Kode Pos"
                    value={
                      kodePos
                    }
                  />

                  <InfoRow
                    label="Alamat Rumah"
                    value={
                      alamatRumah ||
                      "-"
                    }
                    className="lg:col-span-2"
                  />

                  <div className="border-b border-r border-black lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="border-b border-black md:border-b-0 md:border-r">
                        <div className="bg-[#F7F7F7] px-4 py-3 text-[10px] font-bold">
                          No. Telepon / HP
                        </div>

                        <div className="grid grid-cols-[90px_25px_1fr] border-t border-black">
                          <div className="px-4 py-3 text-[10px]">
                            Rumah
                          </div>

                          <div className="py-3 text-center text-[10px]">
                            :
                          </div>

                          <div className="border-l border-black px-4 py-3 text-[11px]">
                            {nomorRumah}
                          </div>
                        </div>

                        <div className="grid grid-cols-[90px_25px_1fr] border-t border-black">
                          <div className="px-4 py-3 text-[10px]">
                            HP
                          </div>

                          <div className="py-3 text-center text-[10px]">
                            :
                          </div>

                          <div className="border-l border-black px-4 py-3 text-[11px]">
                            {nomorHp}
                          </div>
                        </div>

                        <div className="grid grid-cols-[90px_25px_1fr] border-t border-black">
                          <div className="px-4 py-3 text-[10px]">
                            Kantor
                          </div>

                          <div className="py-3 text-center text-[10px]">
                            :
                          </div>

                          <div className="border-l border-black px-4 py-3 text-[11px]">
                            {nomorKantor}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="bg-[#F7F7F7] px-4 py-3 text-[10px] font-bold">
                          E-mail
                        </div>

                        <div className="grid grid-cols-[90px_25px_1fr] border-t border-black">
                          <div className="px-4 py-3 text-[10px]">
                            Email
                          </div>

                          <div className="py-3 text-center text-[10px]">
                            :
                          </div>

                          <div className="border-l border-black px-4 py-3 text-[11px] break-all">
                            {email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <InfoRow
                    label="Kualifikasi Pendidikan"
                    value={
                      kualifikasiPendidikan ||
                      "-"
                    }
                    className="lg:col-span-2"
                  />
                </div>

                <div className="px-5 py-3 text-[10px] italic text-slate-600">
                  *Coret yang tidak perlu
                </div>
              </DocumentSection>

              <DocumentSection
                title="Data Pekerjaan Sekarang"
                icon={
                  <BriefcaseBusiness
                    size={18}
                  />
                }
                open={
                  openInformation.pekerjaan
                }
                onToggle={() =>
                  toggleInformation(
                    "pekerjaan"
                  )
                }
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <InfoRow
                    label="Nama Institusi / Perusahaan"
                    value={
                      namaPerusahaan
                    }
                    className="lg:col-span-2"
                  />

                  <InfoRow
                    label="Pekerjaan"
                    value={
                      pekerjaan
                    }
                  />

                  <InfoRow
                    label="Jabatan"
                    value={
                      jabatan
                    }
                  />

                  <InfoRow
                    label="Alamat Kantor"
                    value={
                      alamatKantor
                    }
                    className="lg:col-span-2"
                  />

                  <InfoRow
                    label="Kode Pos Kantor"
                    value={
                      kodePosKantor
                    }
                  />

                  <div className="grid grid-cols-1 border-b border-r border-black">
                    <div className="bg-[#F7F7F7] px-4 py-4 text-[10px] font-bold">
                      No. Telp / Fax / E-mail
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <div className="grid grid-cols-[45px_15px_1fr] border-t border-black">
                        <div className="px-2 py-3 text-[10px]">
                          Telp
                        </div>

                        <div className="py-3 text-center text-[10px]">
                          :
                        </div>

                        <div className="border-l border-black px-2 py-3 text-[10px]">
                          {nomorKantor}
                        </div>
                      </div>

                      <div className="grid grid-cols-[45px_15px_1fr] border-t border-black md:border-l">
                        <div className="px-2 py-3 text-[10px]">
                          Fax
                        </div>

                        <div className="py-3 text-center text-[10px]">
                          :
                        </div>

                        <div className="border-l border-black px-2 py-3 text-[10px]">
                          {faxKantor}
                        </div>
                      </div>

                      <div className="grid grid-cols-[45px_15px_1fr] border-t border-black md:border-l">
                        <div className="px-2 py-3 text-[10px]">
                          Email
                        </div>

                        <div className="py-3 text-center text-[10px]">
                          :
                        </div>

                        <div className="border-l border-black px-2 py-3 text-[10px] break-all">
                          {emailKantor}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DocumentSection>

              <DocumentSection
                title="Data Sertifikasi"
                icon={
                  <ShieldCheck
                    size={18}
                  />
                }
                open={
                  openInformation.skema
                }
                onToggle={() =>
                  toggleInformation(
                    "skema"
                  )
                }
              >
                <div className="border-b border-black">
                  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
                    <div className="border-b border-r border-black bg-[#F7F7F7] px-4 py-4 text-[11px] font-bold lg:border-b-0">
                      Skema Sertifikasi
                    </div>

                    <div className="border-b border-black px-4 py-4 text-[12px] font-bold">
                      {skema?.judul_skema ||
                        "-"}
                    </div>

                    <div className="border-b border-r border-black bg-[#F7F7F7] px-4 py-4 text-[11px] font-bold lg:border-b-0">
                      Nomor / Kode
                    </div>

                    <div className="border-b border-black px-4 py-4 text-[12px]">
                      {skema?.kode_skema ||
                        skema?.nomor_skema ||
                        skema?.nomor ||
                        "-"}
                    </div>

                    <div className="border-b border-r border-black bg-[#F7F7F7] px-4 py-4 text-[11px] font-bold lg:border-b-0">
                      Tempat Uji Kompetensi
                    </div>

                    <div className="border-b border-black px-4 py-4 text-[12px]">
                      {tuk?.nama_tuk ||
                        "-"}
                    </div>

                    <div className="border-r border-black bg-[#F7F7F7] px-4 py-4 text-[11px] font-bold">
                      Kegiatan
                    </div>

                    <div className="px-4 py-4 text-[12px]">
                      {jadwal?.nama_kegiatan ||
                        "-"}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="mb-4">
                    <h3 className="text-[13px] font-black">
                      Daftar Unit Kompetensi sesuai kemasan:
                    </h3>
                  </div>

                  <div className="overflow-x-auto border border-black">
                    <table className="w-full min-w-[850px] border-collapse">
                      <thead>
                        <tr>
                          <th className="w-[55px] border border-black bg-white px-3 py-3 text-center text-[10px] font-bold">
                            No.
                          </th>

                          <th className="w-[180px] border border-black bg-white px-3 py-3 text-center text-[10px] font-bold">
                            Kode Unit
                          </th>

                          <th className="border border-black bg-white px-3 py-3 text-left text-[10px] font-bold">
                            Judul Unit
                          </th>

                          <th className="w-[170px] border border-black bg-white px-3 py-3 text-center text-[10px] font-bold">
                            Standar
                            <br />
                            Kompetensi Kerja
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {unitKompetensi.length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="border border-black px-5 py-10 text-center text-[11px] text-slate-500"
                            >
                              Belum ada unit kompetensi pada skema ini.
                            </td>
                          </tr>
                        ) : (
                          unitKompetensi.map(
                            (
                              unit,
                              index
                            ) => {
                              const standar =
                                unit?.jenis_standar ||
                                unit?.standar_kompetensi ||
                                (skema?.jenis_skema ===
                                "kkni"
                                  ? "SKKNI"
                                  : "-");

                              return (
                                <tr
                                  key={`${unit?.id_unit || index}`}
                                >
                                  <td className="border border-black px-3 py-3 text-center text-[10px] align-top">
                                    {index + 1}.
                                  </td>

                                  <td className="border border-black px-3 py-3 text-[10px] font-medium align-top">
                                    {getDisplayValue(
                                      unit?.kode_unit
                                    )}
                                  </td>

                                  <td className="border border-black px-3 py-3 text-[10px] leading-5 align-top">
                                    {getDisplayValue(
                                      unit?.judul_unit
                                    )}
                                  </td>

                                  <td className="border border-black px-3 py-3 text-center text-[10px] align-middle">
                                    {standar}
                                  </td>
                                </tr>
                              );
                            }
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DocumentSection>

              <section className="border-t-2 border-black">
                <div className="px-5 py-5">
                  <div className="mb-5">
                    <h2 className="text-[15px] font-black">
                      Bagian 3 : Bukti Kelengkapan Pemohon
                    </h2>
                  </div>

                  <RequirementSection
                    title="3.1 Bukti Persyaratan Dasar Pemohon"
                    items={
                      persyaratanDasar
                    }
                    documents={
                      documents
                    }
                    open={
                      openSections.dasar
                    }
                    onToggle={() =>
                      toggleSection(
                        "dasar"
                      )
                    }
                    onFileSelect={
                      handleFileSelect
                    }
                    onUpload={
                      handleUpload
                    }
                    getFileUrl={
                      getFileUrl
                    }
                    uploadingId={
                      uploadingId
                    }
                    isLocked={
                      isSubmitted
                    }
                  />

                  <RequirementSection
                    title="3.2 Bukti Administratif"
                    items={
                      persyaratanAdministratif
                    }
                    documents={
                      documents
                    }
                    open={
                      openSections.administratif
                    }
                    onToggle={() =>
                      toggleSection(
                        "administratif"
                      )
                    }
                    onFileSelect={
                      handleFileSelect
                    }
                    onUpload={
                      handleUpload
                    }
                    getFileUrl={
                      getFileUrl
                    }
                    uploadingId={
                      uploadingId
                    }
                    isLocked={
                      isSubmitted
                    }
                  />
                </div>
              </section>

              <section className="border-t-2 border-black">
                <div className="border-b border-black px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black">
                      <FileCheck2
                        size={18}
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-black">
                        Status Kelengkapan
                      </h2>

                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Ringkasan dokumen yang sudah tersedia.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 px-5 py-5 md:grid-cols-3">
                  <StatusCard
                    label="Total Persyaratan"
                    value={
                      persyaratan.length
                    }
                  />

                  <StatusCard
                    label="Dokumen Terunggah"
                    value={`${uploadedCount}/${persyaratan.length}`}
                  />

                  <StatusCard
                    label="Persyaratan Wajib"
                    value={`${requiredUploadedCount}/${requiredCount}`}
                  />
                </div>

                <div className="border-t border-black px-5 py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-bold">
                        Progres Seluruh Dokumen
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {progress}% lengkap
                      </p>
                    </div>

                    <div className="h-3 w-full max-w-[500px] overflow-hidden border border-black bg-white">
                      <div
                        className="h-full bg-[#CC6B27]"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-bold">
                        Persyaratan Wajib
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {requiredProgress}% terpenuhi
                      </p>
                    </div>

                    <div className="h-3 w-full max-w-[500px] overflow-hidden border border-black bg-white">
                      <div
                        className="h-full bg-[#071E3D]"
                        style={{
                          width: `${requiredProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t-2 border-black">
                <div className="border-b border-black px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black">
                      <ClipboardList
                        size={18}
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-black">
                        Rekomendasi LSP
                      </h2>

                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Bagian ini diisi oleh LSP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto border border-black">
                    <table className="w-full min-w-[850px] border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-[52%] border border-black px-4 py-4 align-top">
                            <p className="text-[10px] font-bold">
                              Rekomendasi (diisi oleh LSP):
                            </p>

                            <p className="mt-3 text-[10px] leading-5">
                              Berdasarkan ketentuan
                              persyaratan dasar, maka
                              pemohon:
                            </p>

                            <p className="mt-2 text-[11px] font-bold">
                              Diterima / Tidak diterima *
                            </p>

                            <p className="mt-5 text-[9px] italic text-slate-500">
                              *Coret yang tidak sesuai
                            </p>
                          </td>

                          <td className="border border-black align-top">
                            <div className="grid grid-cols-[120px_1fr] border-b border-black">
                              <div className="border-r border-black px-3 py-3 text-[10px] font-bold">
                                Pemohon /
                                Kandidat
                              </div>

                              <div className="px-3 py-3">
                                <p className="text-[10px] font-bold">
                                  Nama
                                </p>

                                <p className="mt-2 text-[10px]">
                                  {namaAsesi}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-[120px_1fr]">
                              <div className="border-r border-black px-3 py-3 text-[10px] font-bold">
                                Tanda tangan /
                                Tanggal
                              </div>

                              <div className="min-h-[110px] px-3 py-3">
                                {ttdUrl ? (
                                  <div className="flex min-h-[90px] flex-col justify-between">
                                    <img
                                      src={
                                        ttdUrl
                                      }
                                      alt="Tanda tangan asesi"
                                      className="max-h-[60px] max-w-[220px] object-contain object-left"
                                    />

                                    <p className="text-[10px]">
                                      {formatDate(
                                        new Date()
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-[10px] italic text-slate-400">
                                    Tanda tangan belum tersedia.
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td className="border border-black px-4 py-4 align-top">
                            <p className="text-[10px] font-bold">
                              Catatan:
                            </p>

                            <div className="min-h-[100px]" />
                          </td>

                          <td className="border border-black align-top">
                            <div className="grid grid-cols-[120px_1fr] border-b border-black">
                              <div className="border-r border-black px-3 py-3 text-[10px] font-bold">
                                Admin LSP
                              </div>

                              <div className="px-3 py-3 text-[10px]">
                                Nama
                              </div>
                            </div>

                            <div className="grid grid-cols-[120px_1fr]">
                              <div className="border-r border-black px-3 py-3 text-[10px] font-bold">
                                Tanda tangan /
                                Tanggal
                              </div>

                              <div className="min-h-[100px]" />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="border-t-2 border-black">
                <div className="border-b border-black px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black">
                      <ShieldCheck
                        size={18}
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-black">
                        Pernyataan Asesi
                      </h2>

                      <p className="mt-1 text-[10px] font-medium text-slate-500">
                        Pernyataan sebelum pengajuan disubmit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="border-2 border-black p-5">
                    <p className="text-[11px] leading-7">
                      Dengan mengisi dan mengajukan formulir ini,
                      saya menyatakan bahwa data dan dokumen yang
                      saya berikan adalah benar dan dapat
                      dipertanggungjawabkan.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] font-bold">
                          Nama Asesi
                        </p>

                        <div className="border border-black px-4 py-3 text-[11px] font-bold">
                          {namaAsesi}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-bold">
                          Status Tanda Tangan
                        </p>

                        <div className="flex items-center gap-2 border border-black px-4 py-3 text-[11px] font-bold">
                          <ShieldCheck
                            size={16}
                            className={
                              ttdUrl
                                ? "text-green-600"
                                : "text-slate-400"
                            }
                          />

                          {ttdUrl
                            ? "Tanda tangan tersedia"
                            : "Tanda tangan belum tersedia"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] font-bold">
                          Tanda Tangan
                        </p>

                        <div className="flex min-h-[130px] items-center justify-center border border-black p-4">
                          {ttdUrl ? (
                            <img
                              src={
                                ttdUrl
                              }
                              alt="Tanda tangan asesi"
                              className="max-h-[95px] max-w-[280px] object-contain"
                            />
                          ) : (
                            <span className="text-center text-[10px] italic text-slate-400">
                              Tanda tangan belum tersedia.
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[10px] font-bold">
                          Tanggal
                        </p>

                        <div className="flex min-h-[130px] items-center justify-center border border-black text-[11px] font-bold">
                          {formatDate(
                            new Date()
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="apl01-print-hidden border-t-2 border-black px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Status APL.01
                    </p>

                    <p className="mt-1.5 text-[14px] font-black text-[#071E3D]">
                      {isSubmitted
                        ? "Sudah Disubmit"
                        : "Draft"}{" "}
                      ·{" "}
                      {
                        requiredUploadedCount
                      }
                      /
                      {
                        requiredCount
                      }{" "}
                      persyaratan wajib
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        downloadPdf
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#071E3D]/15 bg-white px-5 py-3 text-[11px] font-bold text-[#071E3D] transition-all hover:bg-[#071E3D] hover:text-white"
                    >
                      <Download
                        size={16}
                      />
                      Download PDF
                    </button>

                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={
                          handleSubmit
                        }
                        disabled={
                          submitting
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC6B27] px-5 py-3 text-[11px] font-bold text-white transition-all hover:bg-[#A8561F] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {submitting ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Send
                            size={16}
                          />
                        )}

                        {submitting
                          ? "Mengirim..."
                          : "Submit APL.01"}
                      </button>
                    )}

                    {isSubmitted && (
                      <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-[11px] font-bold text-green-700">
                        <BadgeCheck
                          size={16}
                        />
                        Sudah Submit
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}