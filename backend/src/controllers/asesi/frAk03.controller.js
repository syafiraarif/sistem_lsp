const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const {
  FrAk03,
  FrAk03Detail,
  PesertaJadwal,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesi,
  ProfileAsesor,
  JadwalAsesor
} = require("../../models");

const QUESTIONS = [
  "Saya mendapatkan penjelasan yang cukup memadai mengenai proses asesmen/uji kompetensi.",
  "Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diujikan dan menilai diri sendiri terhadap pencapaiannya.",
  "Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metode, instrumen, sumber asesmen, serta jadwal asesmen.",
  "Asesor berusaha menggali seluruh bukti pendukung yang sesuai dengan latar belakang pelatihan dan pengalaman yang saya miliki.",
  "Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen.",
  "Saya mendapatkan penjelasan yang memadai mengenai keputusan asesmen.",
  "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjutnya.",
  "Asesor bersama saya mempelajari semua dokumen asesmen serta menandatanganinya.",
  "Saya mendapatkan jaminan kerahasiaan hasil asesmen serta penjelasan mengenai penanganan dokumen asesmen.",
  "Asesor menggunakan keterampilan komunikasi yang efektif selama asesmen."
];

const getCurrentUserId = (req) => {
  return Number(req.user?.id_user || req.user?.id);
};

const normalizeAnswer = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "ya") {
    return "ya";
  }

  if (normalized === "tidak") {
    return "tidak";
  }

  return "";
};

const formatTanggal = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const normalizeFilePath = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (
    path.isAbsolute(stringValue) &&
    fs.existsSync(stringValue)
  ) {
    return stringValue;
  }

  const cleaned = stringValue.replace(/^[/\\]+/, "");

  const candidates = [
    path.join(process.cwd(), cleaned),
    path.join(
      process.cwd(),
      "uploads",
      cleaned.replace(/^uploads[/\\]/, "")
    ),
    path.join(
      process.cwd(),
      "public",
      cleaned
    ),
    path.join(
      __dirname,
      "../../../",
      cleaned
    )
  ];

  return (
    candidates.find((filePath) =>
      fs.existsSync(filePath)
    ) || ""
  );
};

const getAsesorByJadwal = async (id_jadwal) => {
  if (!id_jadwal) {
    return null;
  }

  const jadwalAsesor = await JadwalAsesor.findOne({
    where: {
      id_jadwal,
      jenis_tugas: "asesor_penguji",
      status: "aktif"
    }
  });

  if (!jadwalAsesor) {
    return null;
  }

  const idAsesor =
    jadwalAsesor.id_asesor ||
    jadwalAsesor.id_user;

  if (!idAsesor) {
    return null;
  }

  return ProfileAsesor.findByPk(
    idAsesor
  );
};

const getPesertaContext = async (
  id_peserta,
  id_user
) => {
  const peserta = await PesertaJadwal.findOne({
    where: {
      id_peserta,
      id_user
    },
    include: [
      {
        model: Jadwal,
        as: "jadwal",
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
      },
      {
        model: ProfileAsesi,
        as: "profileAsesi",
        attributes: [
          "id_user",
          "nama_lengkap",
          "nik",
          "ttd_path"
        ]
      }
    ]
  });

  if (!peserta) {
    return null;
  }

  let asesor = null;

  if (peserta.id_asesor) {
    asesor = await ProfileAsesor.findByPk(
      peserta.id_asesor
    );
  }

  if (!asesor) {
    asesor = await getAsesorByJadwal(
      peserta.id_jadwal
    );
  }

  return {
    peserta,
    asesor
  };
};

exports.getFormFrAk03 = async (req, res) => {
  try {
    const id_user = getCurrentUserId(req);
    const id_peserta = Number(
      req.query.id_peserta ||
      req.params.id_peserta
    );

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi."
      });
    }

    const context = await getPesertaContext(
      id_peserta,
      id_user
    );

    if (!context) {
      return res.status(404).json({
        success: false,
        message: "Peserta tidak ditemukan."
      });
    }

    const peserta = context.peserta;
    const asesor = context.asesor;
    const jadwal = peserta.jadwal;
    const skema = jadwal?.skema;
    const tuk = jadwal?.tuk;

    const existing = await FrAk03.findOne({
      where: {
        id_peserta
      },
      include: [
        {
          model: FrAk03Detail,
          as: "detailAk03",
          separate: true,
          order: [
            ["kode_pertanyaan", "ASC"]
          ]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        id_peserta:
          peserta.id_peserta,
        id_jadwal:
          peserta.id_jadwal,
        id_skema:
          jadwal?.id_skema || null,
        id_tuk:
          jadwal?.id_tuk || null,
        nama_asesi:
          peserta.profileAsesi?.nama_lengkap || "-",
        nik:
          peserta.profileAsesi?.nik || "-",
        nama_asesor:
          asesor?.nama_lengkap || "-",
        kode_asesor:
          asesor?.no_reg_asesor || "-",
        nama_skema:
          skema?.judul_skema || "-",
        kode_skema:
          skema?.kode_skema || "-",
        nama_tuk:
          tuk?.nama_tuk || "-",
        ttd_asesi:
          peserta.profileAsesi?.ttd_path || null,
        skema:
          skema || {},
        tuk:
          tuk || {},
        jadwal:
          jadwal || {},
        peserta:
          peserta.toJSON(),
        questions: QUESTIONS.map(
          (question, index) => ({
            kode_pertanyaan:
              `Q${index + 1}`,
            pertanyaan:
              question
          })
        ),
        existing:
          existing || null,
        is_submitted:
          Boolean(existing),
        can_submit:
          !existing
      }
    });
  } catch (error) {
    console.error(
      "GET FORM FR.AK.03:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createFrAk03 = async (
  req,
  res
) => {
  const transaction =
    await FrAk03.sequelize.transaction();

  try {
    const id_user =
      getCurrentUserId(req);

    const id_peserta = Number(
      req.body.id_peserta
    );

    const {
      jawaban,
      catatan_lainnya
    } = req.body;

    if (!id_peserta) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "ID peserta wajib diisi."
      });
    }

    if (!Array.isArray(jawaban)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Jawaban harus berupa array."
      });
    }

    if (
      jawaban.length !==
      QUESTIONS.length
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Jumlah jawaban harus ${QUESTIONS.length}.`
      });
    }

    const invalidAnswer =
      jawaban.some(
        (item) =>
          !["ya", "tidak"].includes(
            normalizeAnswer(
              item?.jawaban
            )
          )
      );

    if (invalidAnswer) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Semua komponen wajib dijawab Ya atau Tidak."
      });
    }

    const context =
      await getPesertaContext(
        id_peserta,
        id_user
      );

    if (!context) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Peserta tidak ditemukan atau bukan milik user ini."
      });
    }

    if (!context.peserta.jadwal) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Jadwal peserta tidak ditemukan."
      });
    }

    const existing =
      await FrAk03.findOne({
        where: {
          id_peserta
        },
        transaction
      });

    if (existing) {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "FR.AK.03 sudah pernah diisi.",
        data: existing
      });
    }

    const peserta =
      context.peserta;

    const fr =
      await FrAk03.create(
        {
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
          id_skema:
            peserta.jadwal.id_skema,
          id_tuk:
            peserta.jadwal.id_tuk,
          tanggal_asesmen:
            new Date(),
          catatan_lainnya:
            catatan_lainnya || null
        },
        {
          transaction
        }
      );

    const detailData =
      jawaban.map(
        (item, index) => ({
          id_fr_ak03:
            fr.id_fr_ak03,
          kode_pertanyaan:
            `Q${index + 1}`,
          pertanyaan:
            QUESTIONS[index],
          jawaban:
            normalizeAnswer(
              item.jawaban
            ),
          catatan:
            item.catatan || null
        })
      );

    await FrAk03Detail.bulkCreate(
      detailData,
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        "FR.AK.03 berhasil disimpan.",
      data: {
        ...fr.toJSON(),
        id_peserta:
          peserta.id_peserta,
        nama_asesi:
          peserta.profileAsesi?.nama_lengkap || "-",
        nik:
          peserta.profileAsesi?.nik || "-",
        nama_asesor:
          context.asesor?.nama_lengkap || "-",
        kode_asesor:
          context.asesor?.no_reg_asesor || "-",
        nama_skema:
          peserta.jadwal?.skema?.judul_skema || "-",
        kode_skema:
          peserta.jadwal?.skema?.kode_skema || "-",
        nama_tuk:
          peserta.jadwal?.tuk?.nama_tuk || "-",
        ttd_asesi:
          peserta.profileAsesi?.ttd_path || null,
        is_submitted:
          true,
        can_submit:
          false
      }
    });
  } catch (error) {
    if (
      transaction &&
      !transaction.finished
    ) {
      await transaction.rollback();
    }

    console.error(
      "CREATE FR.AK.03:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFrAk03ByPeserta = async (
  req,
  res
) => {
  try {
    const id_user =
      getCurrentUserId(req);

    const id_peserta = Number(
      req.params.id_peserta
    );

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message:
          "ID peserta wajib diisi."
      });
    }

    const context =
      await getPesertaContext(
        id_peserta,
        id_user
      );

    if (!context) {
      return res.status(404).json({
        success: false,
        message:
          "Peserta tidak ditemukan."
      });
    }

    const peserta =
      context.peserta;

    const asesor =
      context.asesor;

    const data =
      await FrAk03.findOne({
        where: {
          id_peserta
        },
        include: [
          {
            model: FrAk03Detail,
            as: "detailAk03",
            separate: true,
            order: [
              ["kode_pertanyaan", "ASC"]
            ]
          },
          {
            model: PesertaJadwal,
            as: "peserta",
            required: false,
            include: [
              {
                model: ProfileAsesi,
                as: "profileAsesi",
                attributes: [
                  "id_user",
                  "nama_lengkap",
                  "nik",
                  "ttd_path"
                ]
              }
            ]
          },
          {
            model: Jadwal,
            as: "jadwal",
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
          }
        ]
      });

    const profile =
      peserta.profileAsesi;

    const jadwal =
      peserta.jadwal;

    const skema =
      jadwal?.skema;

    const tuk =
      jadwal?.tuk;

    if (!data) {
      return res.status(200).json({
        success: true,
        data: {
          id_fr_ak03: null,
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
          id_skema:
            jadwal?.id_skema || null,
          id_tuk:
            jadwal?.id_tuk || null,
          tanggal_asesmen:
            jadwal?.tgl_akhir ||
            jadwal?.tgl_awal ||
            null,
          nama_asesi:
            profile?.nama_lengkap || "-",
          nik:
            profile?.nik || "-",
          nama_asesor:
            asesor?.nama_lengkap || "-",
          kode_asesor:
            asesor?.no_reg_asesor || "-",
          nama_skema:
            skema?.judul_skema || "-",
          kode_skema:
            skema?.kode_skema || "-",
          nama_tuk:
            tuk?.nama_tuk || "-",
          ttd_asesi:
            profile?.ttd_path || null,
          skema:
            skema || {},
          tuk:
            tuk || {},
          jadwal:
            jadwal || {},
          peserta:
            peserta.toJSON(),
          detailAk03: [],
          catatan_lainnya: "",
          is_submitted: false,
          can_submit: true
        }
      });
    }

    const result =
      data.toJSON();

    result.nama_asesi =
      profile?.nama_lengkap ||
      result.peserta?.profileAsesi?.nama_lengkap ||
      "-";

    result.nik =
      profile?.nik ||
      result.peserta?.profileAsesi?.nik ||
      "-";

    result.nama_asesor =
      asesor?.nama_lengkap ||
      "-";

    result.kode_asesor =
      asesor?.no_reg_asesor ||
      "-";

    result.nama_skema =
      skema?.judul_skema ||
      "-";

    result.kode_skema =
      skema?.kode_skema ||
      "-";

    result.nama_tuk =
      tuk?.nama_tuk ||
      "-";

    result.ttd_asesi =
      result.ttd_asesi ||
      profile?.ttd_path ||
      null;

    result.skema =
      skema ||
      {};

    result.tuk =
      tuk ||
      {};

    result.jadwal =
      jadwal ||
      {};

    result.peserta =
      peserta.toJSON();

    result.is_submitted =
      true;

    result.can_submit =
      false;

    return res.status(200).json({
      success: true,
      message:
        "Data FR.AK.03 berhasil diambil.",
      data: result
    });
  } catch (error) {
    console.error(
      "GET DETAIL FR.AK.03:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.generatePdfFrAk03 = async (
  req,
  res
) => {
  try {
    const id_user =
      getCurrentUserId(req);

    const id_peserta = Number(
      req.params.id_peserta
    );

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message:
          "ID peserta wajib diisi."
      });
    }

    const context =
      await getPesertaContext(
        id_peserta,
        id_user
      );

    if (!context) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses."
      });
    }

    const data =
      await FrAk03.findOne({
        where: {
          id_peserta
        },
        include: [
          {
            model: FrAk03Detail,
            as: "detailAk03",
            separate: true,
            order: [
              ["kode_pertanyaan", "ASC"]
            ]
          },
          {
            model: Jadwal,
            as: "jadwal",
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
          },
          {
            model: PesertaJadwal,
            as: "peserta",
            include: [
              {
                model: ProfileAsesi,
                as: "profileAsesi",
                attributes: [
                  "nama_lengkap",
                  "nik",
                  "ttd_path"
                ]
              }
            ]
          }
        ]
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Data FR.AK.03 tidak ditemukan."
      });
    }

    const profile =
      context.peserta.profileAsesi;

    const asesor =
      context.asesor;

    const jadwal =
      context.peserta.jadwal;

    const skema =
      jadwal?.skema;

    const tuk =
      jadwal?.tuk;

    const namaAsesi =
      profile?.nama_lengkap ||
      "-";

    const namaAsesor =
      asesor?.nama_lengkap ||
      "-";

    const namaSkema =
      skema?.judul_skema ||
      "-";

    const kodeSkema =
      skema?.kode_skema ||
      "-";

    const namaTuk =
      tuk?.nama_tuk ||
      "-";

    const ttdAsesi =
      data.ttd_asesi ||
      profile?.ttd_path ||
      null;

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const LEFT = 42;
    const RIGHT = 42;
    const TOP = 34;
    const CONTENT_WIDTH =
      PAGE_WIDTH - LEFT - RIGHT;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: `FR.AK.03 - ${namaAsesi}`
      }
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK-03-${id_peserta}.pdf`
    );

    doc.pipe(res);

    const drawCell = (
      x,
      y,
      width,
      height,
      text = "",
      options = {}
    ) => {
      const {
        fontSize = 7,
        bold = false,
        align = "left",
        valign = "center",
        padding = 5,
        fill = null
      } = options;

      if (fill) {
        doc
          .save()
          .fillColor(fill)
          .rect(
            x,
            y,
            width,
            height
          )
          .fill()
          .restore();
      }

      doc
        .save()
        .lineWidth(0.7)
        .strokeColor("#000000")
        .rect(
          x,
          y,
          width,
          height
        )
        .stroke()
        .restore();

      doc
        .font(
          bold
            ? "Helvetica-Bold"
            : "Helvetica"
        )
        .fontSize(fontSize)
        .fillColor("#000000");

      const value =
        text === undefined ||
        text === null ||
        text === ""
          ? "-"
          : String(text);

      const textWidth =
        Math.max(
          width - padding * 2,
          8
        );

      const textHeight =
        doc.heightOfString(
          value,
          {
            width: textWidth,
            align,
            lineGap: 0
          }
        );

      let textY =
        y + padding;

      if (valign === "center") {
        textY =
          y +
          Math.max(
            padding,
            (height - textHeight) / 2
          );
      }

      if (valign === "bottom") {
        textY =
          y +
          height -
          textHeight -
          padding;
      }

      doc.text(
        value,
        x + padding,
        textY,
        {
          width: textWidth,
          height: Math.max(
            height - padding * 2,
            8
          ),
          align,
          lineGap: 0
        }
      );
    };

    const drawCheck = (
      x,
      y,
      width,
      height,
      checked
    ) => {
      const size = 9;

      const checkX =
        x +
        (width - size) / 2;

      const checkY =
        y +
        (height - size) / 2;

      doc
        .save()
        .lineWidth(0.8)
        .strokeColor("#000000")
        .rect(
          checkX,
          checkY,
          size,
          size
        )
        .stroke()
        .restore();

      if (checked) {
        doc
          .save()
          .lineWidth(1)
          .lineCap("round")
          .lineJoin("round")
          .strokeColor("#000000")
          .moveTo(
            checkX + 1.2,
            checkY + 4.8
          )
          .lineTo(
            checkX + 4,
            checkY + 7
          )
          .lineTo(
            checkX + 7.7,
            checkY + 1.8
          )
          .stroke()
          .restore();
      }
    };

    const drawSignature = (
      value,
      x,
      y,
      width,
      height
    ) => {
      const signaturePath =
        normalizeFilePath(value);

      if (!signaturePath) {
        return;
      }

      try {
        const imageWidth =
          Math.min(
            125,
            width - 16
          );

        const imageHeight =
          Math.min(
            58,
            height - 12
          );

        const imageX =
          x +
          (width - imageWidth) / 2;

        const imageY =
          y +
          (height - imageHeight) / 2;

        doc.image(
          signaturePath,
          imageX,
          imageY,
          {
            fit: [
              imageWidth,
              imageHeight
            ],
            align: "center",
            valign: "center"
          }
        );
      } catch {
        return;
      }
    };

    let currentY = TOP;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        "FR.AK.03. UMPAN BALIK DAN CATATAN ASESMEN",
        LEFT,
        currentY,
        {
          width:
            CONTENT_WIDTH,
          align: "center"
        }
      );

    currentY += 25;

    const infoLabelWidth = 150;
    const infoValueWidth =
      CONTENT_WIDTH -
      infoLabelWidth;
    const infoRowHeight = 21;

    const drawInfoRow = (
      label,
      value
    ) => {
      drawCell(
        LEFT,
        currentY,
        infoLabelWidth,
        infoRowHeight,
        label,
        {
          bold: true,
          fontSize: 7
        }
      );

      drawCell(
        LEFT + infoLabelWidth,
        currentY,
        infoValueWidth,
        infoRowHeight,
        value,
        {
          fontSize: 7
        }
      );

      currentY +=
        infoRowHeight;
    };

    drawInfoRow(
      "Nama Asesi",
      namaAsesi
    );

    drawInfoRow(
      "Nama Asesor",
      namaAsesor
    );

    drawInfoRow(
      "Tanggal Asesmen",
      formatTanggal(
        data.tanggal_asesmen
      )
    );

    currentY += 8;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      25,
      "Umpan balik dari Asesi:",
      {
        bold: true,
        fontSize: 7,
        fill: "#E5E7EB"
      }
    );

    currentY += 25;

    const noWidth = 30;
    const yesWidth = 50;
    const noAnswerWidth = 50;
    const commentWidth = 150;
    const questionWidth =
      CONTENT_WIDTH -
      noWidth -
      yesWidth -
      noAnswerWidth -
      commentWidth;

    const headerHeight = 28;

    drawCell(
      LEFT,
      currentY,
      noWidth,
      headerHeight,
      "No.",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + noWidth,
      currentY,
      questionWidth,
      headerHeight,
      "KOMPONEN",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT +
        noWidth +
        questionWidth,
      currentY,
      yesWidth +
        noAnswerWidth,
      18,
      "Hasil",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT +
        noWidth +
        questionWidth +
        yesWidth +
        noAnswerWidth,
      currentY,
      commentWidth,
      headerHeight,
      "Catatan / Komentar Asesi",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT +
        noWidth +
        questionWidth,
      currentY + 18,
      yesWidth,
      10,
      "Ya",
      {
        bold: true,
        align: "center",
        fontSize: 6.5
      }
    );

    drawCell(
      LEFT +
        noWidth +
        questionWidth +
        yesWidth,
      currentY + 18,
      noAnswerWidth,
      10,
      "Tidak",
      {
        bold: true,
        align: "center",
        fontSize: 6.5
      }
    );

    currentY +=
      headerHeight;

    const details =
      data.detailAk03 || [];

    details.forEach(
      (item, index) => {
        const questionText =
          item.pertanyaan || "-";

        const commentText =
          item.catatan || "-";

        const questionHeight =
          doc.heightOfString(
            questionText,
            {
              width:
                questionWidth - 10,
              fontSize: 7
            }
          );

        const commentHeight =
          doc.heightOfString(
            commentText,
            {
              width:
                commentWidth - 10,
              fontSize: 7
            }
          );

        const rowHeight =
          Math.max(
            38,
            questionHeight + 12,
            commentHeight + 12
          );

        if (
          currentY +
            rowHeight >
          PAGE_HEIGHT - 70
        ) {
          doc.addPage();
          currentY = TOP;
        }

        drawCell(
          LEFT,
          currentY,
          noWidth,
          rowHeight,
          String(index + 1),
          {
            align: "center",
            fontSize: 7
          }
        );

        drawCell(
          LEFT + noWidth,
          currentY,
          questionWidth,
          rowHeight,
          questionText,
          {
            fontSize: 7,
            valign: "center"
          }
        );

        drawCell(
          LEFT +
            noWidth +
            questionWidth,
          currentY,
          yesWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheck(
          LEFT +
            noWidth +
            questionWidth,
          currentY,
          yesWidth,
          rowHeight,
          item.jawaban === "ya"
        );

        drawCell(
          LEFT +
            noWidth +
            questionWidth +
            yesWidth,
          currentY,
          noAnswerWidth,
          rowHeight,
          "",
          {
            padding: 0
          }
        );

        drawCheck(
          LEFT +
            noWidth +
            questionWidth +
            yesWidth,
          currentY,
          noAnswerWidth,
          rowHeight,
          item.jawaban === "tidak"
        );

        drawCell(
          LEFT +
            noWidth +
            questionWidth +
            yesWidth +
            noAnswerWidth,
          currentY,
          commentWidth,
          rowHeight,
          commentText,
          {
            fontSize: 7,
            valign: "center"
          }
        );

        currentY +=
          rowHeight;
      }
    );

    currentY += 8;

    const noteHeight = 70;

    drawCell(
      LEFT,
      currentY,
      CONTENT_WIDTH,
      noteHeight,
      `Catatan / komentar lainnya (apabila ada):\n\n${data.catatan_lainnya || "-"}`,
      {
        fontSize: 7,
        valign: "top",
        padding: 6
      }
    );

    currentY +=
      noteHeight + 15;

    if (
      currentY >
      PAGE_HEIGHT - 150
    ) {
      doc.addPage();
      currentY = TOP;
    }

    const signatureWidth =
      CONTENT_WIDTH / 2;

    drawCell(
      LEFT,
      currentY,
      signatureWidth,
      24,
      "Tanda Tangan Asesi",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    drawCell(
      LEFT + signatureWidth,
      currentY,
      signatureWidth,
      24,
      "Tanggal",
      {
        bold: true,
        align: "center",
        fontSize: 7
      }
    );

    currentY += 24;

    drawCell(
      LEFT,
      currentY,
      signatureWidth,
      100,
      "",
      {
        padding: 0
      }
    );

    drawCell(
      LEFT + signatureWidth,
      currentY,
      signatureWidth,
      100,
      "",
      {
        padding: 0
      }
    );

    drawSignature(
      ttdAsesi,
      LEFT,
      currentY + 5,
      signatureWidth,
      60
    );

    doc
      .font("Helvetica")
      .fontSize(7)
      .text(
        namaAsesi,
        LEFT + 8,
        currentY + 72,
        {
          width:
            signatureWidth - 16,
          align: "center",
          lineBreak: false
        }
      );

    doc
      .font("Helvetica")
      .fontSize(7)
      .text(
        formatTanggal(
          data.tanggal_asesmen
        ),
        LEFT +
          signatureWidth +
          8,
        currentY + 42,
        {
          width:
            signatureWidth - 16,
          align: "center",
          lineBreak: false
        }
      );

    const pageRange =
      doc.bufferedPageRange();

    if (
      pageRange &&
      pageRange.count > 1
    ) {
      for (
        let pageIndex =
          pageRange.start;
        pageIndex <
        pageRange.start +
          pageRange.count;
        pageIndex += 1
      ) {
        doc.switchToPage(
          pageIndex
        );

        doc
          .font("Helvetica")
          .fontSize(6)
          .fillColor("#555555")
          .text(
            `Halaman ${pageIndex - pageRange.start + 1} dari ${pageRange.count}`,
            LEFT,
            PAGE_HEIGHT - 18,
            {
              width:
                CONTENT_WIDTH,
              align: "center",
              lineBreak: false
            }
          );
      }
    }

    doc
      .fillColor("#000000")
      .end();
  } catch (error) {
    console.error(
      "PDF FR.AK.03:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};