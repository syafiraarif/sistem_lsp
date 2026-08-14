const {

  // FR MAPA
  FrMapa01,
  FrMapa02,
  FrMapa02Unit,
  FrMapa02Muk,

  // Master
  Skema,
  SkemaUnit,
  UnitKompetensi,
  KelompokPekerjaan,

  // Jadwal
  Jadwal,
  PesertaJadwal,

} = require("../../models");

const PDFDocument = require("pdfkit");

/* =====================================
MASTER MUK
===================================== */

const MASTER_MUK = [
  {
    urutan: 1,
    kode: "FR.IA.01",
    nama: "Ceklis Observasi Aktivitas di Tempat Kerja atau Tempat Kerja Simulasi",
    potensi: 1
  },
  {
    urutan: 2,
    kode: "FR.IA.02",
    nama: "Tugas Praktik Demonstrasi",
    potensi: 2
  },
  {
    urutan: 3,
    kode: "FR.IA.03",
    nama: "Pertanyaan Untuk Mendukung Observasi",
    potensi: 1
  },
  {
    urutan: 4,
    kode: "FR.IA.04.A",
    nama: "Daftar Instruksi Terstruktur (Proyek)",
    potensi: 3
  },
  {
    urutan: 5,
    kode: "FR.IA.04.B",
    nama: "Daftar Instruksi Terstruktur (Kegiatan Lainnya)",
    potensi: 4
  },
  {
    urutan: 6,
    kode: "FR.IA.05",
    nama: "Pertanyaan Tertulis Pilihan Ganda",
    potensi: 1
  },
  {
    urutan: 7,
    kode: "FR.IA.06",
    nama: "Pertanyaan Tertulis Esai",
    potensi: 2
  },
  {
    urutan: 8,
    kode: "FR.IA.07",
    nama: "Pertanyaan Lisan",
    potensi: 1
  },
  {
    urutan: 9,
    kode: "FR.IA.08",
    nama: "Ceklis Verifikasi Portofolio",
    potensi: 5
  },
  {
    urutan: 10,
    kode: "FR.IA.09",
    nama: "Pertanyaan Wawancara",
    potensi: 5
  },
  {
    urutan: 11,
    kode: "FR.IA.10",
    nama: "Verifikasi Pihak Ketiga",
    potensi: 5
  },
  {
    urutan: 12,
    kode: "FR.IA.11",
    nama: "Ceklis Reviu Produk",
    potensi: 5
  }
];

/* =====================================
GENERATE MAPA02
===================================== */

const generateMapa02 = async (req, res) => {
  let t;

  try {
    t = await FrMapa02.sequelize.transaction();

    const id_user = req.user.id_user;
    const { id_peserta } = req.body;

    if (!id_peserta) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "ID Peserta wajib diisi."
      });
    }

    // ==========================
    // CEK PESERTA
    // ==========================

    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_asesor: id_user
      },
      transaction: t
    });

    if (!peserta) {

      await t.rollback();

      return res.status(403).json({
        success: false,
        message: "Peserta bukan tanggung jawab asesor."
      });

    }

    // ==========================
    // CEK MAPA01
    // ==========================

    const mapa01 = await FrMapa01.findOne({
      where: {
        id_peserta,
        id_asesor: id_user
      },
      transaction: t
    });

    if (!mapa01) {

      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "FR.MAPA.01 belum dibuat."
      });

    }

    // ==========================
    // SUDAH ADA?
    // ==========================

    const existing = await FrMapa02.findOne({
      where: {
        id_mapa01: mapa01.id_mapa01
      },
      transaction: t
    });

    if (existing) {

      await t.rollback();

      return res.status(400).json({
        success: false,
        message: "FR.MAPA.02 sudah pernah dibuat."
      });

    }

    // ==========================
    // HEADER MAPA02
    // ==========================

    const mapa02 = await FrMapa02.create({

      id_jadwal: mapa01.id_jadwal,
      id_skema: mapa01.id_skema,
      id_peserta,
      id_asesor: id_user,
      id_mapa01: mapa01.id_mapa01

    }, {
      transaction: t
    });

    // ==========================
    // AMBIL UNIT SKEMA
    // ==========================

    const units = await SkemaUnit.findAll({

      where: {
        id_skema: mapa01.id_skema
      },

      include: [
        {
          model: UnitKompetensi,
          as: "unit"
        }
      ],

      order: [
        ["urutan", "ASC"]
      ],

      transaction: t

    });

    // ==========================
    // INSERT UNIT
    // ==========================

    for (const u of units) {

    // id_kelompok berasal dari tabel skema_unit
    const id_kelompok = u.id_kelompok;

    if (!id_kelompok) {
      throw new Error(
        `Kelompok pekerjaan untuk unit ${u.id_unit} tidak ditemukan pada skema.`
      );
    }

    const unit = await FrMapa02Unit.create({

      id_mapa02: mapa02.id_mapa02,
      id_unit: u.id_unit,
      id_kelompok,
      urutan: u.urutan

    }, {
      transaction: t
    });

      // ==========================
      // INSERT MASTER MUK
      // ==========================

      const mukData = MASTER_MUK.map(item => ({

        id_mapa02_unit: unit.id_mapa02_unit,

        kode_muk: item.kode,

        nama_muk: item.nama,

        potensi_asesi: item.potensi,

        dipilih: false

      }));

      await FrMapa02Muk.bulkCreate(
        mukData,
        {
          transaction: t
        }
      );

    }

    await t.commit();

    return res.status(201).json({

      success: true,

      message: "FR.MAPA.02 berhasil dibuat.",

      data: mapa02

    });

   } catch (err) {

    if (t) {
      await t.rollback();
    }

    console.error("Generate MAPA02 Error :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }

};

/* =====================================
GET MAPA02
===================================== */

const getMapa02 = async (req, res) => {

  try {

    const id_user = req.user.id_user;
    const { id_peserta } = req.query;

    if (!id_peserta) {
      return res.status(400).json({
        success: false,
        message: "ID peserta wajib diisi."
      });
    }

    // ==========================
    // CEK MAPA01
    // ==========================

    const mapa01 = await FrMapa01.findOne({
      where: {
        id_peserta,
        id_asesor: id_user
      }
    });

    if (!mapa01) {
      return res.status(404).json({
        success: false,
        message: "FR.MAPA.01 tidak ditemukan."
      });
    }

    // ==========================
    // AMBIL MAPA02
    // ==========================

    const data = await FrMapa02.findOne({

      where: {
        id_mapa01: mapa01.id_mapa01
      },

      include: [

        {
          model: Skema,
          as: "skema"
        },

        {
          model: FrMapa01,
          as: "mapa01"
        },

        {
          model: FrMapa02Unit,
          as: "unit",

          include: [

            {
              model: UnitKompetensi,
              as: "unitDetail"
            },

            {
              model: KelompokPekerjaan,
              as: "kelompok"
            },

            {
              model: FrMapa02Muk,
              as: "muk",
              separate: true,
              order: [["id_muk", "ASC"]]
            }

          ],

          separate: true,
          order: [["urutan", "ASC"]]

        }

      ]

    });

    if (!data) {
  const skemaUnits = await SkemaUnit.findAll({
    where: {
      id_skema: mapa01.id_skema
    },
    include: [
      {
        model: UnitKompetensi,
        as: "unit"
      },
      {
        model: KelompokPekerjaan,
        as: "kelompok"
      }
    ],
    order: [
      ["urutan", "ASC"]
    ]
  });

  const preview = {
    id_mapa02: null,
    id_jadwal: mapa01.id_jadwal,
    id_skema: mapa01.id_skema,
    id_peserta: mapa01.id_peserta,
    id_asesor: mapa01.id_asesor,
    unit: skemaUnits.map((item) => ({
      id_unit: item.id_unit,
      id_kelompok: item.id_kelompok,
      urutan: item.urutan,
      unitDetail: item.unit,
      kelompok: item.kelompok,
      muk: []
    }))
  };

  return res.status(200).json({
    success: true,
    message: "Unit kompetensi MAPA.02 berhasil diambil dari skema.",
    data: preview
  });
}

    return res.status(200).json({

      success: true,

      message: "Data FR.MAPA.02 berhasil diambil.",

      data

    });

  } catch (err) {

    console.error("Get MAPA02 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

/* =====================================
UPDATE CHECKBOX MUK
===================================== */

const normalizeKodeMuk = (value) => {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
};

/* =====================================
UPDATE CHECKBOX MUK / INSTRUMEN
===================================== */

const updateMapa02 = async (req, res) => {
  let t;

  try {
    t = await FrMapa02.sequelize.transaction();

    const { muk, instrumen, penyusun, validator } = req.body;

    // Endpoint lama menggunakan `muk` berupa array.
    // Halaman MAPA02Asesor saat ini mengirim matriks `instrumen`,
    // sehingga di sini kita konversi matriks tersebut menjadi
    // record MUK yang memang tersimpan di database.
    let mukItems = Array.isArray(muk) ? muk : [];

    const mapa02 = await FrMapa02.findByPk(req.params.id, {
      include: [
        {
          model: FrMapa01,
          as: "mapa01"
        },
        {
          model: FrMapa02Unit,
          as: "unit",
          include: [
            {
              model: FrMapa02Muk,
              as: "muk"
            }
          ]
        }
      ],
      transaction: t
    });

    if (!mapa02) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "FR.MAPA.02 tidak ditemukan."
      });
    }

    // Validasi bahwa MAPA02 memang milik asesor yang sedang login.
    if (
      mapa02.id_asesor &&
      req.user?.id_user &&
      Number(mapa02.id_asesor) !== Number(req.user.id_user)
    ) {
      await t.rollback();

      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak mengubah FR.MAPA.02 ini."
      });
    }

    // Data lama pada database bisa memiliki id_peserta = 0 karena
    // model Sequelize sebelumnya belum mendefinisikan kolom id_peserta.
    // Sinkronkan kembali dengan MAPA.01 agar record lama ikut benar.
    if (
      mapa02.mapa01?.id_peserta &&
      Number(mapa02.id_peserta) !== Number(mapa02.mapa01.id_peserta)
    ) {
      await mapa02.update(
        {
          id_peserta: Number(mapa02.mapa01.id_peserta)
        },
        {
          transaction: t
        }
      );
    }

    // Penyusun dan validator MAPA.02 menggunakan kolom JSON/TEXT
    // yang memang sudah tersedia pada tabel fr_mapa01.
    // Jadi tidak perlu menambah kolom baru ke fr_mapa02.
    if (mapa02.mapa01) {
      const personUpdate = {};

      if (Array.isArray(penyusun)) {
        personUpdate.penyusun = JSON.stringify(penyusun);
      }

      if (Array.isArray(validator)) {
        personUpdate.validator = JSON.stringify(validator);
      }

      if (Object.keys(personUpdate).length) {
        await mapa02.mapa01.update(personUpdate, {
          transaction: t
        });
      }
    }

    // Jika frontend mengirim matriks instrumen, bentuk array MUK
    // berdasarkan MUK yang sudah dibuat saat generate.
    if (mukItems.length === 0 && Array.isArray(instrumen)) {
      const rows = [];

      for (const unit of mapa02.unit || []) {
        for (const item of unit.muk || []) {
          const formItem = instrumen.find(
            (entry) =>
              normalizeKodeMuk(entry?.kode_instrumen) ===
              normalizeKodeMuk(item?.kode_muk)
          );

          const selectedPotensi = Object.entries(
            formItem?.potensi || {}
          )
            .filter(([, selected]) => Boolean(selected))
            .map(([key]) => Number(key))
            .filter((value) => value >= 1 && value <= 5)
            .sort((a, b) => a - b)[0];

          rows.push({
            id_muk: item.id_muk,
            dipilih: Boolean(selectedPotensi),
            // Kolom database `potensi_asesi` masih tinyint, jadi
            // satu record MUK hanya menyimpan satu potensi.
            // Jika user mencentang lebih dari satu, nilai pertama
            // dipakai agar tidak terjadi data invalid.
            potensi_asesi:
              selectedPotensi ||
              Number(item.potensi_asesi) ||
              1
          });
        }
      }

      mukItems = rows;
    }

    if (!Array.isArray(mukItems) || mukItems.length === 0) {
      await t.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Data MUK harus berupa array dan minimal ada satu data MUK."
      });
    }

    const validMukIds = new Set(
      (mapa02.unit || []).flatMap((unit) =>
        (unit.muk || []).map((item) => Number(item.id_muk))
      )
    );

    for (const item of mukItems) {
      const idMuk = Number(item?.id_muk);

      if (!idMuk) {
        await t.rollback();

        return res.status(400).json({
          success: false,
          message: "id_muk tidak boleh kosong."
        });
      }

      if (!validMukIds.has(idMuk)) {
        await t.rollback();

        return res.status(400).json({
          success: false,
          message: `MUK dengan id ${idMuk} bukan bagian dari MAPA.02 ini.`
        });
      }

      const potensi =
        item?.potensi_asesi !== undefined &&
        item?.potensi_asesi !== null &&
        item?.potensi_asesi !== ""
          ? Number(item.potensi_asesi)
          : null;

      if (potensi !== null && ![1, 2, 3, 4, 5].includes(potensi)) {
        await t.rollback();

        return res.status(400).json({
          success: false,
          message: "potensi_asesi harus bernilai 1 sampai 5."
        });
      }

      await FrMapa02Muk.update(
        {
          dipilih:
            item?.dipilih !== undefined
              ? Boolean(item.dipilih)
              : false,
          potensi_asesi:
            potensi !== null
              ? potensi
              : 1
        },
        {
          where: {
            id_muk: idMuk
          },
          transaction: t
        }
      );
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "FR.MAPA.02 berhasil diperbarui."
    });
  } catch (err) {
    if (t) {
      await t.rollback();
    }

    console.error("Update MAPA02 Error :", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================
DOWNLOAD PDF
===================================== */

const downloadPdfMapa02 = async (req, res) => {

  try {

    const data = await FrMapa02.findByPk(req.params.id, {

      include: [

        {
          model: FrMapa02Unit,
          as: "unit",

          include: [

            {
              model: UnitKompetensi,
              as: "unitDetail"
            },

            {
              model: KelompokPekerjaan,
              as: "kelompok"
            },

            {
              model: FrMapa02Muk,
              as: "muk"
            }

          ]

        }

      ]

    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.MAPA.02 tidak ditemukan."
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=FR-MAPA02-${data.id_mapa02}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    doc.pipe(res);

    // ==========================
    // HEADER
    // ==========================

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("FR.MAPA.02", {
        align: "center"
      });

    doc
      .fontSize(14)
      .text("PETA INSTRUMEN ASESMEN", {
        align: "center"
      });

    doc.moveDown();

    doc.font("Helvetica");

    doc.text(`ID MAPA02 : ${data.id_mapa02}`);
    doc.text(`ID Jadwal : ${data.id_jadwal}`);
    doc.text(`ID Skema  : ${data.id_skema}`);
    doc.text(`ID Asesor : ${data.id_asesor}`);

    doc.moveDown();

    // ==========================
    // UNIT
    // ==========================

    data.unit.forEach((unit, index) => {

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${index + 1}. ${unit.unitDetail?.kode_unit || "-"}`);

      doc
        .font("Helvetica")
        .text(unit.unitDetail?.judul_unit || "-");

      if (unit.kelompok) {

        doc.text(
          `Kelompok : ${unit.kelompok.nama_kelompok}`
        );

      }

      doc.moveDown(0.3);

      unit.muk.forEach(item => {

        const check = item.dipilih ? "[✓]" : "[ ]";

        doc.text(
          `${check} ${item.kode_muk} - ${item.nama_muk}`
        );

      });

      doc.moveDown();

    });

    doc.end();

  } catch (err) {

    console.error("PDF MAPA02 Error :", err);

    return res.status(500).json({

      success: false,

      message: err.message

    });

  }

};

const getMapa02ByJadwalPeserta = async (req, res) => {
  try {

    const { id_jadwal, id_peserta } = req.params;

    const data = await FrMapa02.findOne({
      where: {
        id_jadwal,
        id_peserta
      },

      include: [
        {
          model: FrMapa02Unit,
          as: "unit",

          include: [
            {
              model: UnitKompetensi,
              as: "unitDetail"
            },
            {
              model: KelompokPekerjaan,
              as: "kelompok"
            },
            {
              model: FrMapa02Muk,
              as: "muk",
              separate: true,
              order: [["id_muk", "ASC"]]
            }
          ],

          separate: true,
          order: [["urutan", "ASC"]]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data FR.MAPA.02 belum tersedia."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data FR.MAPA.02 berhasil diambil.",
      data
    });

  } catch (error) {

    console.error(
      "GET MAPA02 BY JADWAL PESERTA ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data FR.MAPA.02.",
      error: error.message
    });

  }
};

module.exports = {
  generateMapa02,
  getMapa02,
  getMapa02ByJadwalPeserta,
  updateMapa02,
  downloadPdfMapa02
};