const FrIa03 = require("../../models/frIa03.model");
const FrIa03Pertanyaan = require("../../models/frIa03Pertanyaan.model");
const FrIa03Jawaban = require("../../models/frIa03Jawaban.model");
const UnitKompetensi = require("../../models/unitKompetensi.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");
const PDFDocument = require("pdfkit");
const PesertaJadwal = require("../../models/pesertaJadwal.model");

const getFrIa03Data = async (id) => {
  let data = await FrIa03.findByPk(id, {
    include: [
      {
        model: FrIa03Pertanyaan,
        as: "pertanyaan",
        include: [
          {
            model: UnitKompetensi,
            as: "unit"
          },
          {
            model: FrIa03Jawaban,
            as: "jawaban"
          }
        ]
      },
      {
        model: ProfileAsesor,
        as: "asesor"
      },
      {
        model: ProfileAsesi,
        as: "asesi"
      },
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

  if (!data) {
    data = await FrIa03.findOne({
      where: {
        id_jadwal: id
      },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            {
              model: UnitKompetensi,
              as: "unit"
            },
            {
              model: FrIa03Jawaban,
              as: "jawaban"
            }
          ]
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: ProfileAsesi,
          as: "asesi"
        },
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
  }

  return data;
};

exports.getForm = async (req, res) => {
  try {
    const { id_jadwal, id_peserta } = req.params;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta pada jadwal tersebut tidak ditemukan"
      });
    }

    const data = await FrIa03.findOne({
      where: {
        id_jadwal,
        id_asesi: peserta.id_user
      },
      include: [
        {
          model: FrIa03Pertanyaan,
          as: "pertanyaan",
          include: [
            {
              model: FrIa03Jawaban,
              as: "jawaban"
            },
            {
              model: UnitKompetensi,
              as: "unit"
            }
          ]
        },
        {
          model: ProfileAsesor,
          as: "asesor"
        },
        {
          model: ProfileAsesi,
          as: "asesi"
        },
        {
          model: Skema,
          as: "skema"
        },
        {
          model: Tuk,
          as: "tuk"
        }
      ],
      order: [
        [
          {
            model: FrIa03Pertanyaan,
            as: "pertanyaan"
          },
          "urutan",
          "ASC"
        ]
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "FR.IA.03 untuk peserta tersebut belum tersedia"
      });
    }

    return res.json({
      success: true,
      data: data.toJSON()
    });
  } catch (error) {
    console.error("Error getForm FR.IA.03:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data FR.IA.03",
      error: error.message
    });
  }
};

exports.saveJawaban = async (req, res) => {
  try {
    const {
      id_pertanyaan,
      tanggapan,
      rekomendasi,
      umpan_balik,
      ttd_asesor
    } = req.body;

    if (!id_pertanyaan) {
      return res.status(400).json({
        success: false,
        message: "id_pertanyaan wajib diisi"
      });
    }

    const pertanyaan = await FrIa03Pertanyaan.findByPk(id_pertanyaan);

    if (!pertanyaan) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan FR.IA.03 tidak ditemukan"
      });
    }

    const existing = await FrIa03Jawaban.findOne({
      where: {
        id_pertanyaan
      }
    });

    const payload = {
      tanggapan: tanggapan !== undefined ? tanggapan : existing?.tanggapan || "",
      rekomendasi: rekomendasi !== undefined ? rekomendasi : existing?.rekomendasi || null,
      umpan_balik: umpan_balik !== undefined ? umpan_balik : existing?.umpan_balik || "",
      ttd_asesor: ttd_asesor !== undefined ? ttd_asesor : existing?.ttd_asesor || null
    };

    if (existing) {
      await existing.update(payload);

      return res.json({
        success: true,
        message: "Jawaban FR.IA.03 berhasil diperbarui",
        data: existing
      });
    }

    const data = await FrIa03Jawaban.create({
      id_pertanyaan,
      ...payload
    });

    return res.status(201).json({
      success: true,
      message: "Jawaban FR.IA.03 berhasil disimpan",
      data
    });
  } catch (error) {
    console.error("Error saveJawaban FR.IA.03:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan jawaban FR.IA.03",
      error: error.message
    });
  }
};

exports.saveUmpanBalik = async (req, res) => {
  try {
    const { id_jadwal, id_peserta, umpan_balik } = req.body;

    if (!id_jadwal || !id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal dan ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_jadwal,
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta pada jadwal tersebut tidak ditemukan"
      });
    }

    const dataFrIa03 = await FrIa03.findOne({
      where: {
        id_jadwal,
        id_asesi: peserta.id_user
      }
    });

    if (!dataFrIa03) {
      return res.status(404).json({
        success: false,
        message: "FR.IA.03 tidak ditemukan"
      });
    }

    const pertanyaan = await FrIa03Pertanyaan.findAll({
      where: {
        id_fr_ia_03: dataFrIa03.id_fr_ia_03
      }
    });

    if (!pertanyaan.length) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan FR.IA.03 tidak ditemukan"
      });
    }

    for (const item of pertanyaan) {
      const existing = await FrIa03Jawaban.findOne({
        where: {
          id_pertanyaan: item.id_pertanyaan
        }
      });

      if (existing) {
        await existing.update({
          umpan_balik: umpan_balik || ""
        });
      } else {
        await FrIa03Jawaban.create({
          id_pertanyaan: item.id_pertanyaan,
          tanggapan: "",
          rekomendasi: null,
          umpan_balik: umpan_balik || ""
        });
      }
    }

    return res.json({
      success: true,
      message: "Umpan balik berhasil disimpan"
    });
  } catch (error) {
    console.error("Error saveUmpanBalik:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan umpan balik",
      error: error.message
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getFrIa03Data(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.IA.03 tidak ditemukan"
      });
    }

    const doc = new PDFDocument({
      margin: 40
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="FR-IA-03-${id}.pdf"`
    );

    doc.pipe(res);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("FR.IA.03", {
        align: "center"
      });

    doc
      .fontSize(11)
      .text("PERTANYAAN UNTUK MENDUKUNG OBSERVASI", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(10).font("Helvetica");

    doc.text(
      `Skema : ${
        data?.skema?.judul_skema ||
        data?.skema?.nama_skema ||
        "-"
      }`
    );

    doc.text(
      `Nomor : ${
        data?.skema?.kode_skema ||
        data?.skema?.nomor ||
        "-"
      }`
    );

    doc.text(
      `TUK : ${
        data?.tuk?.nama_tuk ||
        data?.tuk?.nama ||
        "-"
      }`
    );

    doc.text(
      `Asesor : ${
        data?.asesor?.nama_lengkap ||
        data?.nama_asesor ||
        "-"
      }`
    );

    doc.text(
      `Asesi : ${
        data?.asesi?.nama_lengkap ||
        data?.nama_asesi ||
        "-"
      }`
    );

    doc.text(
      `Tanggal : ${
        data?.tanggal ||
        "-"
      }`
    );

    doc.moveDown();

    let nomor = 1;

    for (const pertanyaan of data.pertanyaan || []) {
      const jawaban = Array.isArray(pertanyaan.jawaban)
        ? pertanyaan.jawaban[0]
        : pertanyaan.jawaban;

      doc
        .font("Helvetica-Bold")
        .text(
          `${nomor}. ${pertanyaan.pertanyaan || "-"}`
        );

      doc.font("Helvetica");

      if (pertanyaan.unit) {
        doc.text(
          `Kode Unit : ${pertanyaan.unit.kode_unit || "-"}`
        );

        doc.text(
          `Judul Unit : ${pertanyaan.unit.judul_unit || "-"}`
        );
      }

      doc.moveDown(0.5);

      doc.text(
        `Tanggapan : ${jawaban?.tanggapan || "-"}`
      );

      doc.moveDown();

      nomor++;
    }

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Umpan Balik untuk Asesi:");

    doc.font("Helvetica");

    const umpanBalik =
      (data.pertanyaan || [])
        .map((item) => {
          const jawaban = Array.isArray(item.jawaban)
            ? item.jawaban[0]
            : item.jawaban;

          return jawaban?.umpan_balik || "";
        })
        .find(Boolean) || "-";

    doc.text(umpanBalik);

    doc.end();
  } catch (err) {
    console.error("Error downloadPdf FR.IA.03:", err);

    return res.status(500).json({
      success: false,
      message: "Gagal mendownload PDF",
      error: err.message
    });
  }
};