const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { FrAk04, PesertaJadwal, Jadwal, Skema, Tuk, ProfileAsesi, ProfileAsesor, JadwalAsesor } = require("../../models");

const getCurrentUserId = (req) => Number(req.user?.id_user || req.user?.id);

const getPesertaContextForAsesor = async (id_peserta, id_user_asesor) => {
  const peserta = await PesertaJadwal.findOne({
    where: { id_peserta },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
        include: [{ model: Skema, as: "skema" }, { model: Tuk, as: "tuk" }]
      },
      { model: ProfileAsesi, as: "profileAsesi" }
    ]
  });
  if (!peserta) return null;

  let isAuthorized = false;
  let asesor = null;

  if (peserta.id_asesor) {
    asesor = await ProfileAsesor.findByPk(peserta.id_asesor);
    if (asesor && asesor.id_user === id_user_asesor) isAuthorized = true;
  }
  
  if (!isAuthorized) {
    const jadwalAsesor = await JadwalAsesor.findOne({
      where: { id_jadwal: peserta.id_jadwal, id_user: id_user_asesor, jenis_tugas: "asesor_penguji", status: "aktif" }
    });
    if (jadwalAsesor) {
      asesor = await ProfileAsesor.findByPk(jadwalAsesor.id_asesor || jadwalAsesor.id_user);
      isAuthorized = true;
    }
  }

  if (!isAuthorized) return null;
  return { peserta, asesor };
};

// [CATATAN: Sertakan fungsi formatTanggal, normalizeFilePath, dan safeText yang sama persis seperti pada Admin / Asesi di sini]
const formatTanggal = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};
const safeText = (value) => (value === undefined || value === null || value === "") ? "-" : String(value);
const normalizeFilePath = (value) => { /* Sama seperti kode di atas */ return String(value); };


exports.getFrAk04ByPeserta = async (req, res) => {
  try {
    const id_peserta = Number(req.params.id_peserta);
    const id_user_asesor = getCurrentUserId(req);

    if (!id_peserta) return res.status(400).json({ success: false, message: "ID peserta wajib diisi." });

    const context = await getPesertaContextForAsesor(id_peserta, id_user_asesor);
    if (!context) return res.status(403).json({ success: false, message: "Akses ditolak atau peserta tidak ditemukan." });

    const { peserta, asesor } = context;
    const profile = peserta.profileAsesi;
    const jadwal = peserta.jadwal;
    const skema = jadwal?.skema;
    const tuk = jadwal?.tuk;

    const data = await FrAk04.findOne({ where: { id_peserta } });
    if (!data) return res.status(404).json({ success: false, message: "Asesi belum mengisi FR.AK.04." });

    return res.status(200).json({
      success: true,
      data: {
        ...data.toJSON(),
        nama_asesi: profile?.nama_lengkap || "-",
        nik: profile?.nik || "-",
        nama_asesor: asesor?.nama_lengkap || "-",
        kode_asesor: asesor?.no_reg_asesor || "-",
        nama_skema: skema?.judul_skema || "-",
        kode_skema: skema?.kode_skema || "-",
        nama_tuk: tuk?.nama_tuk || "-",
        skema: skema || {},
        tuk: tuk || {},
        jadwal: jadwal || {},
        peserta: peserta.toJSON(),
        profileAsesi: profile?.toJSON() || null
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.generatePdfFrAk04 = async (req, res) => {
  // [CATATAN: Logika PDFDocument persis sama dengan Controller Admin, gunakan `getPesertaContextForAsesor` sebagai ganti `getPesertaContext`]
};