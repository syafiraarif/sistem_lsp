const {
  FrAk06,
  FrAk06Detail,
  JadwalAsesor,
  PresensiAsesor,
  Jadwal,
  Skema,
  Tuk,
  ProfileAsesor
} = require("../../models");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.getFrAk06 = async (req, res) => {
  try {
    const { id_jadwal } = req.query;
    const id_asesor = Number(req.user.id_user);

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message: "id_jadwal wajib diisi"
      });
    }

    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user: id_asesor,
        status: "aktif"
      }
    });

    if (!tugas) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses pada jadwal ini"
      });
    }

    const jadwal = await Jadwal.findByPk(id_jadwal);

    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    const [skema, tuk, asesor] = await Promise.all([
      Skema.findByPk(jadwal.id_skema),
      Tuk.findByPk(jadwal.id_tuk),
      ProfileAsesor.findByPk(id_asesor)
    ]);

    const data = await FrAk06.findOne({
      attributes: [
        "id",
        "id_jadwal",
        "id_asesor",
        "rekomendasi_1",
        "rekomendasi_2",
        "komentar",
        "ttd_asesor",
        "created_at"
      ],
      where: {
        id_jadwal,
        id_asesor
      },
      include: [
        {
          model: FrAk06Detail,
          as: "detail",
          separate: true,
          order: [["id", "ASC"]]
        }
      ]
    });

    const baseData = {
      id: data?.id || null,
      id_jadwal: Number(id_jadwal),
      id_asesor,
      exists: Boolean(data),
      rekomendasi_1:
        data?.rekomendasi_1 || "",
      rekomendasi_2:
        data?.rekomendasi_2 || "",
      komentar:
        data?.komentar || "",
      ttd_asesor:
        data?.ttd_asesor ||
        asesor?.ttd_path ||
        "",
      created_at:
        data?.created_at || null,
      jadwal: jadwal.toJSON(),
      skema:
        skema?.toJSON?.() ||
        skema ||
        {},
      tuk:
        tuk?.toJSON?.() ||
        tuk ||
        {},
      asesor: {
        ...(asesor?.toJSON?.() ||
          asesor ||
          {}),
        nama_lengkap:
          asesor?.nama_lengkap ||
          "",
        no_reg_asesor:
          asesor?.no_reg_asesor ||
          "",
        ttd_path:
          asesor?.ttd_path ||
          ""
      },
      details:
        data?.detail || []
    };

    return res.status(200).json({
      success: true,
      data: baseData
    });
  } catch (error) {
    console.error(
      "GET FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitFrAk06 = async (req, res) => {
  const transaction =
    await FrAk06.sequelize.transaction();

  try {
    const id_asesor =
      Number(req.user.id_user);

    const {
      id_jadwal,
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    if (!id_jadwal) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "ID Jadwal wajib diisi"
      });
    }

    if (!ttd_asesor) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Tanda tangan asesor wajib diisi"
      });
    }

    if (
      !Array.isArray(detail) ||
      detail.length === 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Minimal harus terdapat satu detail asesmen"
      });
    }

    const presensi =
      await PresensiAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor
        },
        transaction
      });

    if (!presensi) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message:
          "Harap melakukan presensi terlebih dahulu"
      });
    }

    const tugas =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor,
          status: "aktif"
        },
        transaction
      });

    if (!tugas) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki tugas pada jadwal ini"
      });
    }

    const existing =
      await FrAk06.findOne({
        attributes: ["id"],
        where: {
          id_jadwal,
          id_asesor
        },
        transaction
      });

    if (existing) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "FR.AK.06 sudah pernah dibuat"
      });
    }

    const fr =
      await FrAk06.create(
        {
          id_jadwal:
            Number(id_jadwal),
          id_asesor,
          rekomendasi_1:
            rekomendasi_1 || null,
          rekomendasi_2:
            rekomendasi_2 || null,
          komentar:
            komentar || null,
          ttd_asesor
        },
        {
          transaction
        }
      );

    const detailData =
      detail.map((item) => ({
        id_fr_ak06: fr.id,
        aspek:
          item.aspek || null,
        validitas:
          Boolean(item.validitas),
        reliabel:
          Boolean(item.reliabel),
        fleksibel:
          Boolean(item.fleksibel),
        adil:
          Boolean(item.adil),
        task_skills:
          Boolean(item.task_skills),
        task_management:
          Boolean(
            item.task_management
          ),
        contingency_management:
          Boolean(
            item.contingency_management
          ),
        job_role:
          Boolean(item.job_role),
        transfer_skills:
          Boolean(
            item.transfer_skills
          ),
        bukti:
          item.bukti || null
      }));

    await FrAk06Detail.bulkCreate(
      detailData,
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        "FR.AK.06 berhasil disimpan",
      data: {
        id: fr.id,
        id_jadwal:
          fr.id_jadwal,
        id_asesor:
          fr.id_asesor
      }
    });
  } catch (error) {
    await transaction.rollback();

    console.error(
      "SUBMIT FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

exports.listFrAk06 = async (req, res) => {
  try {
    const id_asesor =
      Number(req.user.id_user);

    const { id_jadwal } =
      req.params;

    if (!id_jadwal) {
      return res.status(400).json({
        success: false,
        message:
          "ID Jadwal wajib diisi"
      });
    }

    const tugas =
      await JadwalAsesor.findOne({
        where: {
          id_jadwal,
          id_user: id_asesor,
          status: "aktif"
        }
      });

    if (!tugas) {
      return res.status(403).json({
        success: false,
        message:
          "Anda tidak memiliki akses pada jadwal ini"
      });
    }

    const data =
      await FrAk06.findAll({
        attributes: [
          "id",
          "id_jadwal",
          "id_asesor",
          "rekomendasi_1",
          "rekomendasi_2",
          "komentar",
          "ttd_asesor",
          "created_at"
        ],
        where: {
          id_jadwal,
          id_asesor
        },
        include: [
          {
            model: FrAk06Detail,
            as: "detail",
            separate: true,
            order: [
              ["id", "ASC"]
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
            model: ProfileAsesor,
            as: "asesor",
            attributes: [
              "nama_lengkap",
              "no_reg_asesor",
              "ttd_path"
            ]
          }
        ],
        order: [
          ["created_at", "DESC"]
        ]
      });

    return res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error(
      "LIST FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan pada server",
      error: error.message
    });
  }
};

exports.updateFrAk06 = async (
  req,
  res
) => {
  const transaction =
    await FrAk06.sequelize.transaction();

  try {
    const { id } =
      req.params;

    const id_asesor =
      Number(req.user.id_user);

    const {
      rekomendasi_1,
      rekomendasi_2,
      komentar,
      ttd_asesor,
      detail
    } = req.body;

    const fr =
      await FrAk06.findOne({
        attributes: [
          "id",
          "id_jadwal",
          "id_asesor",
          "rekomendasi_1",
          "rekomendasi_2",
          "komentar",
          "ttd_asesor",
          "created_at"
        ],
        where: {
          id,
          id_asesor
        },
        transaction
      });

    if (!fr) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message:
          "FR.AK.06 tidak ditemukan"
      });
    }

    if (!Array.isArray(detail)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Detail harus berupa array"
      });
    }

    await fr.update(
      {
        rekomendasi_1:
          rekomendasi_1 !== undefined
            ? rekomendasi_1 || null
            : fr.rekomendasi_1,

        rekomendasi_2:
          rekomendasi_2 !== undefined
            ? rekomendasi_2 || null
            : fr.rekomendasi_2,

        komentar:
          komentar !== undefined
            ? komentar || null
            : fr.komentar,

        ttd_asesor:
          ttd_asesor ||
          fr.ttd_asesor
      },
      {
        transaction
      }
    );

    await FrAk06Detail.destroy({
      where: {
        id_fr_ak06: fr.id
      },
      transaction
    });

    const detailData =
      detail.map((item) => ({
        id_fr_ak06: fr.id,
        aspek:
          item.aspek || null,
        validitas:
          Boolean(item.validitas),
        reliabel:
          Boolean(item.reliabel),
        fleksibel:
          Boolean(item.fleksibel),
        adil:
          Boolean(item.adil),
        task_skills:
          Boolean(item.task_skills),
        task_management:
          Boolean(
            item.task_management
          ),
        contingency_management:
          Boolean(
            item.contingency_management
          ),
        job_role:
          Boolean(item.job_role),
        transfer_skills:
          Boolean(
            item.transfer_skills
          ),
        bukti:
          item.bukti || null
      }));

    await FrAk06Detail.bulkCreate(
      detailData,
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message:
        "FR.AK.06 berhasil diperbarui",
      data: {
        id: fr.id,
        id_jadwal:
          fr.id_jadwal,
        id_asesor:
          fr.id_asesor
      }
    });
  } catch (error) {
    await transaction.rollback();

    console.error(
      "UPDATE FR.AK.06 ERROR :",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.downloadPdf = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const id_asesor =
      Number(req.user.id_user);

    const data =
      await FrAk06.findOne({
        attributes: [
          "id",
          "id_jadwal",
          "id_asesor",
          "rekomendasi_1",
          "rekomendasi_2",
          "komentar",
          "ttd_asesor",
          "created_at"
        ],
        where: {
          id,
          id_asesor
        },
        include: [
          {
            model: FrAk06Detail,
            as: "detail",
            separate: true,
            order: [
              ["id", "ASC"]
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
            model: ProfileAsesor,
            as: "asesor",
            attributes: [
              "nama_lengkap",
              "no_reg_asesor",
              "ttd_path"
            ]
          }
        ]
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "FR.AK.06 tidak ditemukan"
      });
    }

    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN_LEFT = 30;
    const MARGIN_RIGHT = 30;
    const MARGIN_TOP = 25;
    const CONTENT_WIDTH =
      PAGE_WIDTH -
      MARGIN_LEFT -
      MARGIN_RIGHT;

    const doc =
      new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
        autoFirstPage: true
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-AK-06-${id}.pdf`
    );

    doc.pipe(res);
    doc.font("Helvetica");

    const safe = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return "-";
      }

      return String(value);
    };

    const formatTanggal = (
      value
    ) => {
      if (!value) {
        return "-";
      }

      const date =
        new Date(value);

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
          year: "numeric"
        }
      );
    };

    const getTukType = () => {
      const value =
        data?.jadwal?.tuk?.jenis_tuk ||
        data?.jadwal?.tuk?.jenis ||
        "";

      const normalized =
        String(value)
          .toLowerCase()
          .trim();

      if (
        normalized.includes(
          "sewaktu"
        )
      ) {
        return "sewaktu";
      }

      if (
        normalized.includes(
          "tempat"
        ) ||
        normalized.includes(
          "kerja"
        )
      ) {
        return "tempat_kerja";
      }

      if (
        normalized.includes(
          "mandiri"
        )
      ) {
        return "mandiri";
      }

      return "";
    };

    const normalizeSignaturePath =
      (value) => {
        if (!value) {
          return "";
        }

        const stringValue =
          String(value);

        if (
          path.isAbsolute(
            stringValue
          ) &&
          fs.existsSync(
            stringValue
          )
        ) {
          return stringValue;
        }

        const cleaned =
          stringValue.replace(
            /^[/\\]+/,
            ""
          );

        const candidates = [
          path.join(
            process.cwd(),
            cleaned
          ),
          path.join(
            process.cwd(),
            "uploads",
            cleaned.replace(
              /^uploads[/\\]/,
              ""
            )
          ),
          path.join(
            process.cwd(),
            "public",
            cleaned
          )
        ];

        return (
          candidates.find(
            (item) =>
              fs.existsSync(
                item
              )
          ) || ""
        );
      };

    const drawPageNumber = () => {
      const range =
        doc.bufferedPageRange();

      if (
        !range ||
        range.count <= 1
      ) {
        return;
      }

      for (
        let pageIndex =
          range.start;
        pageIndex <
        range.start +
          range.count;
        pageIndex += 1
      ) {
        doc.switchToPage(
          pageIndex
        );

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("#555555")
          .text(
            `Halaman ${
              pageIndex -
              range.start +
              1
            } dari ${
              range.count
            }`,
            MARGIN_LEFT,
            PAGE_HEIGHT - 18,
            {
              width:
                CONTENT_WIDTH,
              align:
                "center",
              lineBreak:
                false
            }
          );

        doc.fillColor(
          "#000000"
        );
      }
    };

    const drawCell = (
      x,
      y,
      width,
      height,
      text,
      options = {}
    ) => {
      const {
        fontSize = 7.2,
        bold = false,
        align = "left",
        valign = "center",
        padding = 4,
        fill = null,
        border = true
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

      if (border) {
        doc
          .save()
          .lineWidth(0.7)
          .strokeColor(
            "#000000"
          )
          .rect(
            x,
            y,
            width,
            height
          )
          .stroke()
          .restore();
      }

      doc
        .font(
          bold
            ? "Helvetica-Bold"
            : "Helvetica"
        )
        .fontSize(fontSize)
        .fillColor("#000000");

      const textHeight =
        doc.heightOfString(
          safe(text),
          {
            width:
              Math.max(
                width -
                  padding *
                    2,
                5
              ),
            align
          }
        );

      let textY =
        y + padding;

      if (
        valign === "center"
      ) {
        textY =
          y +
          Math.max(
            padding,
            (height -
              textHeight) /
              2
          );
      }

      if (
        valign === "bottom"
      ) {
        textY =
          y +
          height -
          textHeight -
          padding;
      }

      doc.text(
        safe(text),
        x + padding,
        textY,
        {
          width:
            Math.max(
              width -
                padding *
                  2,
              5
            ),
          align,
          height:
            Math.max(
              height -
                padding *
                  2,
              5
            )
        }
      );
    };

    const drawCheckbox = (
      x,
      y,
      width,
      height,
      checked
    ) => {
      const boxSize = 10;

      const boxX =
        x +
        (width -
          boxSize) /
          2;

      const boxY =
        y +
        (height -
          boxSize) /
          2;

      doc
        .save()
        .lineWidth(0.8)
        .strokeColor("#000000")
        .rect(
          boxX,
          boxY,
          boxSize,
          boxSize
        )
        .stroke()
        .restore();

      if (checked) {
        doc
          .save()
          .lineWidth(1.4)
          .lineCap(
            "round"
          )
          .lineJoin(
            "round"
          )
          .strokeColor(
            "#000000"
          )
          .moveTo(
            boxX + 2,
            boxY + 5
          )
          .lineTo(
            boxX + 4.5,
            boxY + 8
          )
          .lineTo(
            boxX + 8.5,
            boxY + 2
          )
          .stroke()
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
    };

    const drawTukOption = (
      x,
      centerY,
      checked,
      label
    ) => {
      const boxSize = 9;

      const boxY =
        centerY -
        boxSize / 2;

      doc
        .save()
        .lineWidth(0.8)
        .strokeColor("#000000")
        .rect(
          x,
          boxY,
          boxSize,
          boxSize
        )
        .stroke()
        .restore();

      if (checked) {
        doc
          .save()
          .lineWidth(1.3)
          .lineCap(
            "round"
          )
          .lineJoin(
            "round"
          )
          .strokeColor(
            "#000000"
          )
          .moveTo(
            x + 1.5,
            boxY + 4.5
          )
          .lineTo(
            x + 4,
            boxY + 7
          )
          .lineTo(
            x + 7.5,
            boxY + 2
          )
          .stroke()
          .restore();
      }

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#000000")
        .text(
          label,
          x +
            boxSize +
            4,
          boxY - 1,
          {
            lineBreak:
              false
          }
        );
    };

    const drawCenteredTitle =
      () => {
        doc
          .font(
            "Helvetica-Bold"
          )
          .fontSize(13)
          .fillColor(
            "#000000"
          )
          .text(
            "FR.AK.06. MENINJAU PROSES ASESMEN",
            MARGIN_LEFT,
            MARGIN_TOP,
            {
              width:
                CONTENT_WIDTH,
              align:
                "center"
            }
          );
      };

    const drawHeaderTable =
      (startY) => {
        const col1 = 145;
        const col2 = 58;
        const col3 = 18;
        const col4 =
          CONTENT_WIDTH -
          col1 -
          col2 -
          col3;

        const row1 = 30;
        const row2 = 30;
        const row3 = 28;
        const row4 = 28;
        const row5 = 28;

        let y = startY;

        drawCell(
          MARGIN_LEFT,
          y,
          col1,
          row1 + row2,
          "Skema Sertifikasi\n(KKNI/Okupasi/Klaster)",
          {
            bold: true,
            valign:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1,
          y,
          col2,
          row1,
          "Judul",
          {
            bold: true,
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          row1,
          ":",
          {
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2 +
            col3,
          y,
          col4,
          row1,
          data?.jadwal?.skema
            ?.judul_skema ||
            data?.jadwal?.skema
              ?.nama_skema ||
            data?.jadwal?.skema
              ?.judul ||
            data?.jadwal
              ?.nama_skema ||
            "-",
          {}
        );

        drawCell(
          MARGIN_LEFT +
            col1,
          y + row1,
          col2,
          row2,
          "Nomor",
          {
            bold: true,
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y + row1,
          col3,
          row2,
          ":",
          {
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2 +
            col3,
          y + row1,
          col4,
          row2,
          data?.jadwal?.skema
            ?.kode_skema ||
            data?.jadwal?.skema
              ?.kode ||
            "-",
          {}
        );

        y +=
          row1 + row2;

        drawCell(
          MARGIN_LEFT,
          y,
          col1 + col2,
          row3,
          "TUK",
          {
            bold: true
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          row3,
          ":",
          {
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2 +
            col3,
          y,
          col4,
          row3,
          "",
          {
            padding: 0
          }
        );

        const tukType =
          getTukType();

        const tukStartX =
          MARGIN_LEFT +
          col1 +
          col2 +
          col3 +
          12;

        const tukCenterY =
          y +
          row3 / 2;

        drawTukOption(
          tukStartX,
          tukCenterY,
          tukType ===
            "sewaktu",
          "Sewaktu"
        );

        drawTukOption(
          tukStartX + 75,
          tukCenterY,
          tukType ===
            "tempat_kerja",
          "Tempat Kerja"
        );

        drawTukOption(
          tukStartX + 165,
          tukCenterY,
          tukType ===
            "mandiri",
          "Mandiri"
        );

        y += row3;

        drawCell(
          MARGIN_LEFT,
          y,
          col1 + col2,
          row4,
          "Nama Asesor",
          {
            bold: true
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          row4,
          ":",
          {
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2 +
            col3,
          y,
          col4,
          row4,
          data?.asesor
            ?.nama_lengkap ||
            "-",
          {}
        );

        y += row4;

        drawCell(
          MARGIN_LEFT,
          y,
          col1 + col2,
          row5,
          "Tanggal",
          {
            bold: true
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          row5,
          ":",
          {
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2 +
            col3,
          y,
          col4,
          row5,
          formatTanggal(
            data?.created_at ||
              data?.jadwal
                ?.tgl_awal ||
              new Date()
          ),
          {}
        );

        return y + row5;
      };

    const drawExplanation =
      (startY) => {
        const firstHeight = 24;

        const secondText =
          "1. Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.\n" +
          "2. Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan/atau peserta kelompok yang homogen.\n" +
          "3. Isilah pemenuhan dimensi kompetensi dengan menuliskan jenis bukti dan instrumen yang digunakan pada saat asesmen sebagai bukti terpenuhinya dimensi kompetensi.";

        const secondHeight =
          doc.heightOfString(
            secondText,
            {
              width:
                CONTENT_WIDTH -
                14,
              fontSize: 7.1,
              lineGap: 1
            }
          ) + 12;

        drawCell(
          MARGIN_LEFT,
          startY,
          CONTENT_WIDTH,
          firstHeight,
          "Penjelasan:",
          {
            bold: true
          }
        );

        drawCell(
          MARGIN_LEFT,
          startY +
            firstHeight,
          CONTENT_WIDTH,
          secondHeight,
          secondText,
          {
            fontSize: 7.1,
            valign:
              "top",
            padding: 7
          }
        );

        return (
          startY +
          firstHeight +
          secondHeight
        );
      };

    const drawPrincipleTable =
      (startY) => {
        const firstCol = 270;
        const otherCol =
          (CONTENT_WIDTH -
            firstCol) /
          4;

        const header1 = 25;
        const header2 = 28;

        const detailRows =
          data.detail || [];

        const visibleDetails =
          detailRows.length >= 5
            ? detailRows.slice(0, 5)
            : [
                {
                  aspek:
                    "Rencana asesmen",
                  validitas:
                    false,
                  reliabel:
                    false,
                  fleksibel:
                    false,
                  adil:
                    false
                },
                {
                  aspek:
                    "Persiapan asesmen",
                  validitas:
                    false,
                  reliabel:
                    false,
                  fleksibel:
                    false,
                  adil:
                    false
                },
                {
                  aspek:
                    "Implementasi asesmen",
                  validitas:
                    false,
                  reliabel:
                    false,
                  fleksibel:
                    false,
                  adil:
                    false
                },
                {
                  aspek:
                    "Keputusan asesmen",
                  validitas:
                    false,
                  reliabel:
                    false,
                  fleksibel:
                    false,
                  adil:
                    false
                },
                {
                  aspek:
                    "Umpan balik asesmen",
                  validitas:
                    false,
                  reliabel:
                    false,
                  fleksibel:
                    false,
                  adil:
                    false
                }
              ].map(
                (
                  item,
                  index
                ) => ({
                  ...item,
                  ...(detailRows[
                    index
                  ] || {})
                })
              );

        let y = startY;

        drawCell(
          MARGIN_LEFT,
          y,
          firstCol,
          header1 +
            header2,
          "Aspek yang ditinjau",
          {
            bold: true,
            valign:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            firstCol,
          y,
          otherCol * 4,
          header1,
          "Kesesuaian dengan prinsip asesmen",
          {
            bold: true,
            align:
              "center"
          }
        );

        const headers = [
          "Validitas",
          "Reliabel",
          "Fleksibel",
          "Adil"
        ];

        headers.forEach(
          (
            header,
            index
          ) => {
            drawCell(
              MARGIN_LEFT +
                firstCol +
                otherCol *
                  index,
              y + header1,
              otherCol,
              header2,
              header,
              {
                bold: true,
                align:
                  "center"
              }
            );
          }
        );

        y +=
          header1 +
          header2;

        visibleDetails.forEach(
          (item) => {
            const aspectText =
              item?.aspek ||
              "-";

            const rowHeight =
              Math.max(
                34,
                doc.heightOfString(
                  `• ${aspectText}`,
                  {
                    width:
                      firstCol -
                      12,
                    fontSize: 7.1
                  }
                ) + 12
              );

            drawCell(
              MARGIN_LEFT,
              y,
              firstCol,
              rowHeight,
              `• ${aspectText}`,
              {
                fontSize:
                  7.1,
                valign:
                  "center"
              }
            );

            drawCheckbox(
              MARGIN_LEFT +
                firstCol,
              y,
              otherCol,
              rowHeight,
              Boolean(
                item.validitas
              )
            );

            drawCheckbox(
              MARGIN_LEFT +
                firstCol +
                otherCol,
              y,
              otherCol,
              rowHeight,
              Boolean(
                item.reliabel
              )
            );

            drawCheckbox(
              MARGIN_LEFT +
                firstCol +
                otherCol *
                  2,
              y,
              otherCol,
              rowHeight,
              Boolean(
                item.fleksibel
              )
            );

            drawCheckbox(
              MARGIN_LEFT +
                firstCol +
                otherCol *
                  3,
              y,
              otherCol,
              rowHeight,
              Boolean(
                item.adil
              )
            );

            y += rowHeight;
          }
        );

        drawCell(
          MARGIN_LEFT,
          y,
          CONTENT_WIDTH,
          24,
          "Rekomendasi untuk peningkatan",
          {
            bold: true
          }
        );

        y += 24;

        const recommendationText =
          data?.rekomendasi_1 ||
          "-";

        const recommendationHeight =
          Math.max(
            65,
            doc.heightOfString(
              recommendationText,
              {
                width:
                  CONTENT_WIDTH -
                  12,
                fontSize: 7.1
              }
            ) + 12
          );

        drawCell(
          MARGIN_LEFT,
          y,
          CONTENT_WIDTH,
          recommendationHeight,
          recommendationText,
          {
            fontSize:
              7.1,
            valign:
              "top",
            padding: 7
          }
        );

        return (
          y +
          recommendationHeight
        );
      };

    const drawDimensionTable =
      (startY) => {
        const firstCol = 215;
        const otherCol =
          (CONTENT_WIDTH -
            firstCol) /
          5;

        const header1 = 25;
        const header2 = 42;

        const detail =
          (data.detail || [])[5] ||
          {
            task_skills:
              false,
            task_management:
              false,
            contingency_management:
              false,
            job_role:
              false,
            transfer_skills:
              false
          };

        let y = startY;

        drawCell(
          MARGIN_LEFT,
          y,
          firstCol,
          header1 +
            header2,
          "Aspek yang ditinjau",
          {
            bold: true,
            valign:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            firstCol,
          y,
          otherCol * 5,
          header1,
          "Pemenuhan dimensi kompetensi",
          {
            bold: true,
            align:
              "center"
          }
        );

        const dimensionHeaders = [
          "Task Skills",
          "Task Management Skills",
          "Contingency Management Skills",
          "Job Role / Environment Skills",
          "Transfer Skills"
        ];

        dimensionHeaders.forEach(
          (
            header,
            index
          ) => {
            drawCell(
              MARGIN_LEFT +
                firstCol +
                otherCol *
                  index,
              y + header1,
              otherCol,
              header2,
              header,
              {
                fontSize:
                  6.2,
                bold: true,
                align:
                  "center"
              }
            );
          }
        );

        y +=
          header1 +
          header2;

        const aspectText =
          "Konsistensi keputusan asesmen\n\nBukti dari berbagai asesmen diperkirakan untuk konsistensi dimensi kompetensi";

        const aspectHeight =
          105;

        drawCell(
          MARGIN_LEFT,
          y,
          firstCol,
          aspectHeight,
          aspectText,
          {
            fontSize: 7,
            bold: true,
            valign:
              "top",
            padding: 7
          }
        );

        drawCheckbox(
          MARGIN_LEFT +
            firstCol,
          y,
          otherCol,
          aspectHeight,
          Boolean(
            detail.task_skills
          )
        );

        drawCheckbox(
          MARGIN_LEFT +
            firstCol +
            otherCol,
          y,
          otherCol,
          aspectHeight,
          Boolean(
            detail.task_management
          )
        );

        drawCheckbox(
          MARGIN_LEFT +
            firstCol +
            otherCol * 2,
          y,
          otherCol,
          aspectHeight,
          Boolean(
            detail.contingency_management
          )
        );

        drawCheckbox(
          MARGIN_LEFT +
            firstCol +
            otherCol * 3,
          y,
          otherCol,
          aspectHeight,
          Boolean(
            detail.job_role
          )
        );

        drawCheckbox(
          MARGIN_LEFT +
            firstCol +
            otherCol * 4,
          y,
          otherCol,
          aspectHeight,
          Boolean(
            detail.transfer_skills
          )
        );

        y +=
          aspectHeight;

        drawCell(
          MARGIN_LEFT,
          y,
          CONTENT_WIDTH,
          24,
          "Rekomendasi untuk peningkatan:",
          {
            bold: true
          }
        );

        y += 24;

        const recommendationText =
          data?.rekomendasi_2 ||
          "-";

        const recommendationHeight =
          Math.max(
            65,
            doc.heightOfString(
              recommendationText,
              {
                width:
                  CONTENT_WIDTH -
                  12,
                fontSize: 7.1
              }
            ) + 12
          );

        drawCell(
          MARGIN_LEFT,
          y,
          CONTENT_WIDTH,
          recommendationHeight,
          recommendationText,
          {
            fontSize:
              7.1,
            valign:
              "top",
            padding: 7
          }
        );

        return (
          y +
          recommendationHeight
        );
      };

    const drawSignatureTable =
      (startY) => {
        const col1 =
          CONTENT_WIDTH *
          0.3;

        const col2 =
          CONTENT_WIDTH *
          0.3;

        const col3 =
          CONTENT_WIDTH *
          0.4;

        const headerHeight =
          28;

        const bodyHeight =
          125;

        let y = startY;

        drawCell(
          MARGIN_LEFT,
          y,
          col1,
          headerHeight,
          "Nama Lead Asesor/Asesor",
          {
            bold: true,
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1,
          y,
          col2,
          headerHeight,
          "Tanggal dan Tanda Tangan",
          {
            bold: true,
            align:
              "center"
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          headerHeight,
          "Komentar",
          {
            bold: true,
            align:
              "center"
          }
        );

        y +=
          headerHeight;

        drawCell(
          MARGIN_LEFT,
          y,
          col1,
          bodyHeight,
          `${data?.asesor?.nama_lengkap || "-"}\n${data?.asesor?.no_reg_asesor || ""}`,
          {
            fontSize:
              7.2,
            valign:
              "top",
            padding: 7
          }
        );

        drawCell(
          MARGIN_LEFT +
            col1,
          y,
          col2,
          bodyHeight,
          "",
          {
            padding: 0
          }
        );

        const signatureValue =
          data?.asesor
            ?.ttd_path ||
          data?.ttd_asesor ||
          "";

        const normalizedSignature =
          normalizeSignaturePath(
            signatureValue
          );

        if (
          normalizedSignature &&
          fs.existsSync(
            normalizedSignature
          )
        ) {
          try {
            doc.image(
              normalizedSignature,
              MARGIN_LEFT +
                col1 +
                28,
              y + 20,
              {
                fit: [
                  col2 - 56,
                  60
                ],
                align:
                  "center",
                valign:
                  "center"
              }
            );
          } catch (
            imageError
          ) {
            doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor(
                "#666666"
              )
              .text(
                "Tanda tangan tidak tersedia",
                MARGIN_LEFT +
                  col1 +
                  8,
                y + 45,
                {
                  width:
                    col2 - 16,
                  align:
                    "center"
                }
              )
              .fillColor(
                "#000000"
              );
          }
        }

        doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor(
            "#000000"
          )
          .text(
            formatTanggal(
              data?.created_at ||
                data?.jadwal
                  ?.tgl_awal ||
                new Date()
            ),
            MARGIN_LEFT +
              col1 +
              8,
            y + 95,
            {
              width:
                col2 - 16,
              align:
                "center"
            }
          );

        drawCell(
          MARGIN_LEFT +
            col1 +
            col2,
          y,
          col3,
          bodyHeight,
          data?.komentar ||
            "-",
          {
            fontSize:
              7.1,
            valign:
              "top",
            padding: 7
          }
        );

        return (
          y +
          bodyHeight
        );
      };

    drawCenteredTitle();

    let currentY =
      MARGIN_TOP + 25;

    currentY =
      drawHeaderTable(
        currentY
      ) + 12;

    currentY =
      drawExplanation(
        currentY
      ) + 12;

    if (
      currentY >
      PAGE_HEIGHT - 330
    ) {
      doc.addPage();
      currentY =
        MARGIN_TOP;
    }

    currentY =
      drawPrincipleTable(
        currentY
      ) + 12;

    if (
      currentY >
      PAGE_HEIGHT - 300
    ) {
      doc.addPage();
      currentY =
        MARGIN_TOP;

      doc
        .font(
          "Helvetica-Bold"
        )
        .fontSize(10)
        .text(
          "FR.AK.06. MENINJAU PROSES ASESMEN",
          MARGIN_LEFT,
          currentY,
          {
            width:
              CONTENT_WIDTH,
            align:
              "center"
          }
        );

      currentY += 20;
    }

    currentY =
      drawDimensionTable(
        currentY
      ) + 14;

    if (
      currentY >
      PAGE_HEIGHT - 180
    ) {
      doc.addPage();
      currentY =
        MARGIN_TOP;

      doc
        .font(
          "Helvetica-Bold"
        )
        .fontSize(10)
        .text(
          "FR.AK.06. MENINJAU PROSES ASESMEN",
          MARGIN_LEFT,
          currentY,
          {
            width:
              CONTENT_WIDTH,
            align:
              "center"
          }
        );

      currentY += 20;
    }

    drawSignatureTable(
      currentY
    );

    doc
      .font("Helvetica")
      .fillColor("#000000");

    drawPageNumber();

    doc.end();
  } catch (error) {
    console.error(
      "DOWNLOAD PDF FR.AK.06 ERROR :",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  }
};