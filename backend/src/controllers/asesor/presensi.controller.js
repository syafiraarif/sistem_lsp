const {
  PresensiAsesor,
  JadwalAsesor,
  Jadwal,
  PesertaJadwal,
  User,
  ProfileAsesor,
  Skema,
  Tuk
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const validatePresensi = async (id_jadwal, id_user) => {
  try {
    const jadwal = await Jadwal.findByPk(id_jadwal, {
      include: [
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        }
      ]
    });

    if (!jadwal) {
      return {
        valid: false,
        message: "Jadwal tidak ditemukan"
      };
    }

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        jenis_tugas: "asesor_penguji",
        status: "aktif"
      }
    });

    if (!tugas) {
      return {
        valid: false,
        message: "Anda bukan asesor penguji pada jadwal ini"
      };
    }

    if (!["open", "ongoing"].includes(jadwal.status)) {
      return {
        valid: false,
        message: "Jadwal belum dibuka"
      };
    }

    const today = new Date().toISOString().split("T")[0];

    if (today < jadwal.tgl_awal || today > jadwal.tgl_akhir) {
      return {
        valid: false,
        message: "Diluar tanggal pelaksanaan"
      };
    }

    const totalPeserta = await PesertaJadwal.count({
      where: {
        id_jadwal
      }
    });

    if (totalPeserta <= 0) {
      return {
        valid: false,
        message: "Belum ada peserta pada jadwal ini",
        totalPeserta: 0
      };
    }

    return {
      valid: true,
      jadwal,
      totalPeserta
    };
  } catch (err) {
    console.error("VALIDATE PRESENSI ERROR:", err);

    return {
      valid: false,
      message: err.message
    };
  }
};

const presensiAsesor = async (req, res) => {
  try {
    const {
      id_jadwal,
      ttd_path
    } = req.body;

    const id_user = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "id_jadwal wajib"
      });
    }

    if (!ttd_path) {
      return res.status(400).json({
        success: false,
        message: "Tanda tangan wajib"
      });
    }

    const validation = await validatePresensi(
      Number(id_jadwal),
      Number(id_user)
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        totalPeserta: validation.totalPeserta || 0
      });
    }

    const existing = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Sudah melakukan presensi"
      });
    }

    const presensi = await PresensiAsesor.create({
      id_jadwal,
      id_user,
      waktu_presensi: new Date(),
      ttd_path
    });

    return res.status(201).json({
      success: true,
      message: "Presensi berhasil",
      data: presensi
    });
  } catch (err) {
    console.error("PRESENSI ASESOR ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const cekPresensi = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.query;

    const id_user = req.user.id_user;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "id_jadwal wajib"
      });
    }

    const validation = await validatePresensi(
      Number(id_jadwal),
      Number(id_user)
    );

    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    return res.json({
      success: true,
      bolehPresensi: validation.valid,
      message: validation.message || null,
      hadir: !!presensi,
      data: presensi,
      totalPeserta: validation.totalPeserta || 0
    });
  } catch (err) {
    console.error("CEK PRESENSI ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getDetailPresensi = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.params;

    const id_user = req.user.id_user;

    const data = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET DETAIL PRESENSI ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const listPresensi = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.params;

    const data = await PresensiAsesor.findAll({
      where: {
        id_jadwal
      },
      include: [
        {
          model: User,
          as: "asesor",
          attributes: [
            "id_user",
            "username",
            "email"
          ]
        },
        {
          model: ProfileAsesor,
          as: "profileAsesor",
          attributes: [
            "nama_lengkap",
            "no_reg_asesor",
            "no_lisensi"
          ]
        }
      ],
      order: [
        ["waktu_presensi", "DESC"]
      ]
    });

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error("LIST PRESENSI ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const downloadPdf = async (req, res) => {
  try {
    const {
      id_jadwal
    } = req.params;

    const jadwal = await Jadwal.findByPk(id_jadwal, {
      include: [
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        }
      ]
    });

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    const data = await PresensiAsesor.findAll({
      where: {
        id_jadwal
      },
      include: [
        {
          model: User,
          as: "asesor"
        },
        {
          model: ProfileAsesor,
          as: "profileAsesor"
        }
      ],
      order: [
        ["waktu_presensi", "ASC"]
      ]
    });

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=presensi-${id_jadwal}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(18)
      .text(
        "PRESENSI ASESOR",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc.text(
      `Kegiatan : ${jadwal.nama_kegiatan || "-"}`
    );

    doc.text(
      `Skema : ${jadwal.skema?.judul_skema || "-"}`
    );

    doc.text(
      `TUK : ${jadwal.tuk?.nama_tuk || "-"}`
    );

    doc.text(
      `Tanggal : ${jadwal.tgl_awal || "-"} s/d ${jadwal.tgl_akhir || "-"}`
    );

    doc.moveDown(2);

    for (const item of data) {
      const totalPeserta = await PesertaJadwal.count({
        where: {
          id_jadwal,
          id_asesor: item.id_user
        }
      });

      doc
        .fontSize(13)
        .text(
          item.profileAsesor?.nama_lengkap || "-",
          {
            underline: true
          }
        );

      doc.fontSize(11);

      doc.text(
        `No Reg : ${item.profileAsesor?.no_reg_asesor || "-"}`
      );

      doc.text(
        `Peserta : ${totalPeserta}`
      );

      doc.text(
        `Presensi : ${new Date(item.waktu_presensi).toLocaleString("id-ID")}`
      );

      doc.moveDown();

      if (
        item.ttd_path &&
        fs.existsSync(path.resolve(item.ttd_path))
      ) {
        doc.image(
          path.resolve(item.ttd_path),
          {
            fit: [150, 80]
          }
        );
      } else {
        doc.text(
          "[TTD Tidak ditemukan]"
        );
      }

      doc.moveDown();

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error("DOWNLOAD PRESENSI PDF ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  presensiAsesor,
  cekPresensi,
  getDetailPresensi,
  listPresensi,
  downloadPdf
};