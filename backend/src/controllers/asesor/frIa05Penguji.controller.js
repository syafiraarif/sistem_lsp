const PDFDocument = require("pdfkit");
const Jawaban = require("../../models/frIa05Jawaban.model");
const Penilaian = require("../../models/frIa05Penilaian.model");
const Soal = require("../../models/frIa05Soal.model");
const Opsi = require("../../models/frIa05Opsi.model");
const FrIa05 = require("../../models/frIa05.model");
const FrIa05Validator = require("../../models/frIa05Validator.model");
const ProfileAsesor = require("../../models/profileAsesor.model");
const PesertaJadwal = require("../../models/pesertaJadwal.model");
const ProfileAsesi = require("../../models/profileAsesi.model");
const Jadwal = require("../../models/jadwal.model");
const Skema = require("../../models/skema.model");
const Tuk = require("../../models/tuk.model");

exports.saveJawabanAsesi = async (req, res) => {
  try {
    const {
      id_peserta,
      id_soal,
      id_opsi,
      id_fr_ia_05
    } = req.body;

    if (!id_peserta || !id_soal || !id_opsi || !id_fr_ia_05) {
      return res.status(400).json({
        success: false,
        message: "Data jawaban belum lengkap"
      });
    }

    const submitted = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05,
        submitted: true
      }
    });

    if (submitted) {
      return res.status(400).json({
        success: false,
        message: "FR IA05 sudah disubmit dan tidak dapat diubah"
      });
    }

    const opsi = await Opsi.findByPk(id_opsi);

    if (!opsi) {
      return res.status(404).json({
        success: false,
        message: "Opsi tidak ditemukan"
      });
    }

    const existing = await Jawaban.findOne({
      where: {
        id_peserta,
        id_soal
      }
    });

    if (existing) {
      await existing.update({
        id_opsi,
        is_benar: opsi.is_benar
      });

      return res.json({
        success: true,
        message: "Jawaban berhasil diupdate",
        data: existing
      });
    }

    const data = await Jawaban.create({
      id_peserta,
      id_soal,
      id_opsi,
      is_benar: opsi.is_benar,
      created_at: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Jawaban berhasil disimpan",
      data
    });
  } catch (error) {
    console.error("Error saveJawabanAsesi FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan jawaban",
      error: error.message
    });
  }
};

exports.submitFinal = async (req, res) => {
  try {
    const {
      id_peserta,
      id_fr_ia_05
    } = req.body;

    if (!id_peserta || !id_fr_ia_05) {
      return res.status(400).json({
        success: false,
        message: "ID peserta dan ID FR.IA.05 wajib diisi"
      });
    }

    const existing = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05
      }
    });

    if (existing?.submitted) {
      return res.status(400).json({
        success: false,
        message: "FR IA05 sudah disubmit"
      });
    }

    if (existing) {
      await existing.update({
        submitted: true,
        tanggal_penilaian: new Date()
      });
    } else {
      await Penilaian.create({
        id_peserta,
        id_fr_ia_05,
        submitted: true,
        tanggal_penilaian: new Date()
      });
    }

    return res.json({
      success: true,
      message: "FR IA05 berhasil disubmit"
    });
  } catch (error) {
    console.error("Error submitFinal FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal submit FR IA05",
      error: error.message
    });
  }
};

exports.getHasilAsesi = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi"
      });
    }

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const paket = await FrIa05.findOne({
      where: {
        id_jadwal: peserta.id_jadwal
      },
      order: [["id_fr_ia_05", "DESC"]]
    });

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket FR.IA.05 tidak ditemukan"
      });
    }

    const jadwal = await Jadwal.findByPk(peserta.id_jadwal);

    const skema = paket.id_skema
      ? await Skema.findByPk(paket.id_skema)
      : null;

    const tuk = jadwal?.id_tuk
      ? await Tuk.findByPk(jadwal.id_tuk)
      : null;

    const asesi = peserta.id_user
      ? await ProfileAsesi.findByPk(peserta.id_user)
      : null;

    const asesor = peserta.id_asesor
      ? await ProfileAsesor.findByPk(peserta.id_asesor)
      : null;

    const validators = await FrIa05Validator.findAll({
      where: {
        id_fr_ia_05: paket.id_fr_ia_05
      },
      include: [
        {
          model: ProfileAsesor,
          as: "asesor"
        }
      ],
      order: [["urutan", "ASC"]]
    });

    const penyusun = validators
      .filter((item) => item.peran === "penyusun")
      .map((item) => ({
        id_asesor: item.id_asesor,
        nama_lengkap: item.asesor?.nama_lengkap || "",
        no_reg_asesor: item.asesor?.no_reg_asesor || "",
        ttd_path: item.asesor?.ttd_path || "",
        urutan: item.urutan,
        tanggal: paket.tanggal || null
      }));

    const validator = validators
      .filter((item) => item.peran === "validator")
      .map((item) => ({
        id_asesor: item.id_asesor,
        nama_lengkap: item.asesor?.nama_lengkap || "",
        no_reg_asesor: item.asesor?.no_reg_asesor || "",
        ttd_path: item.asesor?.ttd_path || "",
        urutan: item.urutan,
        tanggal: paket.tanggal || null
      }));

    const soalData = await Soal.findAll({
      where: {
        id_fr_ia_05: paket.id_fr_ia_05
      },
      order: [["urutan", "ASC"]]
    });

    const soal = [];

    for (const item of soalData) {
      const opsi = await Opsi.findAll({
        where: {
          id_soal: item.id_soal
        },
        order: [["kode_opsi", "ASC"]]
      });

      const jawaban = await Jawaban.findOne({
        where: {
          id_peserta,
          id_soal: item.id_soal
        }
      });

      const kunci = opsi.find(
        (option) => option.is_benar === true
      ) || null;

      soal.push({
        id_soal: item.id_soal,
        id_fr_ia_05: item.id_fr_ia_05,
        id_kelompok: item.id_kelompok,
        pertanyaan: item.pertanyaan,
        gambar: item.gambar,
        urutan: item.urutan,
        opsi,
        jawaban_asesi: jawaban
          ? {
              id_jawaban: jawaban.id_jawaban,
              id_opsi: jawaban.id_opsi,
              is_benar: jawaban.is_benar
            }
          : null,
        kunci_jawaban: kunci
          ? {
              id_opsi: kunci.id_opsi,
              kode_opsi: kunci.kode_opsi,
              jawaban: kunci.jawaban
            }
          : null
      });
    }

    const total = soal.length;

    const sudahDijawab = soal.filter(
      (item) => item.jawaban_asesi !== null
    ).length;

    const belumDijawab = total - sudahDijawab;

    const benar = soal.filter(
      (item) => item.jawaban_asesi?.is_benar === true
    ).length;

    const salah = soal.filter(
      (item) =>
        item.jawaban_asesi !== null &&
        item.jawaban_asesi.is_benar !== true
    ).length;

    const nilai =
      total > 0
        ? Number(((benar / total) * 100).toFixed(2))
        : 0;

    const penilaian = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05: paket.id_fr_ia_05
      }
    });

    return res.json({
      success: true,
      data: {
        id_fr_ia_05: paket.id_fr_ia_05,
        id_jadwal: paket.id_jadwal,
        id_peserta: Number(id_peserta),
        kode_paket: paket.kode_paket,
        judul_paket: paket.judul_paket,
        passing_grade: paket.passing_grade,
        tanggal: paket.tanggal || null,
        skema: skema
          ? {
              id_skema: skema.id_skema,
              kode_skema: skema.kode_skema,
              judul_skema: skema.judul_skema
            }
          : null,
        tuk: tuk
          ? {
              id_tuk: tuk.id_tuk,
              nama_tuk: tuk.nama_tuk
            }
          : null,
        asesor: asesor
          ? {
              id_user: asesor.id_user,
              nama_lengkap: asesor.nama_lengkap,
              no_reg_asesor: asesor.no_reg_asesor,
              ttd_path: asesor.ttd_path
            }
          : null,
        asesi: asesi
          ? {
              id_user: asesi.id_user,
              nama_lengkap: asesi.nama_lengkap,
              ttd_path: asesi.ttd_path
            }
          : null,
        penyusun,
        validator,
        penilaian: penilaian
          ? {
              nilai: penilaian.nilai,
              hasil: penilaian.hasil,
              jumlah_benar: penilaian.jumlah_benar,
              jumlah_salah: penilaian.jumlah_salah,
              submitted: penilaian.submitted
            }
          : null,
        statistik: {
          total,
          sudah_dijawab: sudahDijawab,
          belum_dijawab: belumDijawab,
          benar,
          salah,
          nilai
        },
        soal
      }
    });
  } catch (error) {
    console.error("Error getHasilAsesi FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil hasil FR.IA.05",
      error: error.message
    });
  }
};

exports.hitungNilai = async (req, res) => {
  try {
    const jawaban = await Jawaban.findAll({
      where: {
        id_peserta: req.params.id_peserta
      }
    });

    const total = jawaban.length;
    const benar = jawaban.filter(
      (item) => item.is_benar
    ).length;
    const salah = total - benar;
    const nilai =
      total > 0
        ? Number(((benar / total) * 100).toFixed(2))
        : 0;

    return res.json({
      total,
      benar,
      salah,
      nilai
    });
  } catch (error) {
    console.error("Error hitungNilai FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghitung nilai",
      error: error.message
    });
  }
};

exports.simpanPenilaian = async (req, res) => {
  try {
    const {
      id_peserta,
      id_fr_ia_05
    } = req.body;

    if (!id_peserta || !id_fr_ia_05) {
      return res.status(400).json({
        success: false,
        message: "ID peserta dan ID FR.IA.05 wajib diisi"
      });
    }

    const existing = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05
      }
    });

    if (existing) {
      await existing.update({
        ...req.body,
        tanggal_penilaian: new Date()
      });

      return res.json({
        success: true,
        message: "Penilaian berhasil diupdate",
        data: existing
      });
    }

    const data = await Penilaian.create({
      ...req.body,
      tanggal_penilaian: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Penilaian berhasil disimpan",
      data
    });
  } catch (error) {
    console.error("Error simpanPenilaian FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan penilaian",
      error: error.message
    });
  }
};

exports.getPenilaian = async (req, res) => {
  try {
    const data = await Penilaian.findOne({
      where: {
        id_peserta: req.params.id_peserta
      }
    });

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error getPenilaian FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil penilaian",
      error: error.message
    });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { id_peserta } = req.params;

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta
      }
    });

    if (!peserta) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan"
      });
    }

    const paket = await FrIa05.findOne({
      where: {
        id_jadwal: peserta.id_jadwal
      },
      order: [["id_fr_ia_05", "DESC"]]
    });

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket FR.IA.05 tidak ditemukan"
      });
    }

    const hasil = [];

    const soalData = await Soal.findAll({
      where: {
        id_fr_ia_05: paket.id_fr_ia_05
      },
      order: [["urutan", "ASC"]]
    });

    for (const soal of soalData) {
      const opsi = await Opsi.findAll({
        where: {
          id_soal: soal.id_soal
        },
        order: [["kode_opsi", "ASC"]]
      });

      const jawaban = await Jawaban.findOne({
        where: {
          id_peserta,
          id_soal: soal.id_soal
        }
      });

      hasil.push({
        soal,
        opsi,
        jawaban
      });
    }

    const penilaian = await Penilaian.findOne({
      where: {
        id_peserta,
        id_fr_ia_05: paket.id_fr_ia_05
      }
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FRIA05-HASIL-${id_peserta}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40
    });

    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        "FR.IA.05A HASIL ASESMEN PILIHAN GANDA",
        {
          align: "center"
        }
      );

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(10);

    doc.text(
      `Peserta : ${id_peserta}`
    );

    doc.text(
      `Paket : ${paket.kode_paket || "-"}`
    );

    doc.text(
      `Judul : ${paket.judul_paket || "-"}`
    );

    doc.text(
      `Tanggal : ${paket.tanggal || "-"}`
    );

    if (penilaian) {
      doc.text(
        `Nilai : ${penilaian.nilai ?? "-"}`
      );

      doc.text(
        `Hasil : ${penilaian.hasil ?? "-"}`
      );

      doc.text(
        `Jumlah Benar : ${penilaian.jumlah_benar ?? 0}`
      );

      doc.text(
        `Jumlah Salah : ${penilaian.jumlah_salah ?? 0}`
      );

      doc.text(
        `Status Submit : ${
          penilaian.submitted
            ? "SUDAH SUBMIT"
            : "BELUM SUBMIT"
        }`
      );
    }

    doc.moveDown();

    hasil.forEach((row, index) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          `${index + 1}. ${row.soal?.pertanyaan || "-"}`
        );

      doc
        .font("Helvetica")
        .fontSize(10);

      row.opsi.forEach((option) => {
        const selected =
          row.jawaban?.id_opsi === option.id_opsi;

        const correct =
          option.is_benar === true;

        let prefix = "[ ] ";

        if (selected) {
          prefix = "[X] ";
        }

        doc.text(
          `${prefix}${option.kode_opsi}. ${option.jawaban}${
            correct ? " (KUNCI)" : ""
          }`
        );
      });

      const kunci =
        row.opsi.find(
          (option) => option.is_benar === true
        ) || null;

      doc.moveDown(0.3);

      doc.text(
        `Jawaban Asesi : ${
          row.jawaban
            ? row.opsi.find(
                (option) =>
                  option.id_opsi === row.jawaban.id_opsi
              )?.kode_opsi || "-"
            : "Belum dijawab"
        }`
      );

      doc.text(
        `Jawaban Benar : ${
          kunci?.kode_opsi || "-"
        }`
      );

      doc.text(
        `Status : ${
          !row.jawaban
            ? "BELUM DIJAWAB"
            : row.jawaban.is_benar
            ? "BENAR"
            : "SALAH"
        }`
      );

      doc.moveDown();

      doc
        .moveTo(40, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error downloadPdf FR.IA.05:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat PDF",
      error: error.message
    });
  }
};