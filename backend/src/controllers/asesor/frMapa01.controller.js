const {
  sequelize,
  FrMapa01,
  FrMapa01Detail,
  Jadwal,
  JadwalAsesor,
  PresensiAsesor,
  PesertaJadwal,
  Skema,
  SkemaUnit,
  UnitKompetensi,
  KelompokPekerjaan,
  ProfileAsesi
} = require("../../models");
const PDFDocument = require("pdfkit");

const getPotensiDefault = (jenis) => {
  switch (jenis) {
    case "pelatihan_kompeten":
    case "pelatihan_belum_kompeten":
      return 2;
    case "pengalaman_kompeten":
    case "pengalaman_belum_kompeten":
      return 3;
    case "mandiri":
      return 5;
    default:
      return null;
  }
};

const getUnitKompetensi = async (id_skema) => {
  if (!id_skema) {
    return [];
  }
  const data = await SkemaUnit.findAll({
    where: {
      id_skema
    },
    order: [
      ["id_kelompok", "ASC"],
      ["urutan", "ASC"]
    ]
  });
  const kelompokIds = [...new Set(data.map((item) => item.id_kelompok).filter(Boolean))];
  const unitIds = [...new Set(data.map((item) => item.id_unit).filter(Boolean))];
  const kelompokData = kelompokIds.length
    ? await KelompokPekerjaan.findAll({
        where: {
          id_kelompok: kelompokIds
        },
        order: [["urutan", "ASC"]]
      })
    : [];
  const unitData = unitIds.length
    ? await UnitKompetensi.findAll({
        where: {
          id_unit: unitIds
        }
      })
    : [];
  const kelompokMap = new Map(
    kelompokData.map((item) => [
      Number(item.id_kelompok),
      item
    ])
  );
  const unitMap = new Map(
    unitData.map((item) => [
      Number(item.id_unit),
      item
    ])
  );
  return data.map((item) => {
    const kelompok = kelompokMap.get(Number(item.id_kelompok));
    const unit = unitMap.get(Number(item.id_unit));
    return {
      id_skema: item.id_skema,
      id_kelompok: item.id_kelompok,
      nama_kelompok: kelompok?.nama_kelompok || "-",
      deskripsi_kelompok: kelompok?.deskripsi || null,
      id_unit: item.id_unit,
      kode_unit: unit?.kode_unit || "-",
      judul_unit: unit?.judul_unit || "-",
      urutan: item.urutan
    };
  });
};

const getGroupedUnitKompetensi = async (id_skema) => {
  const units = await getUnitKompetensi(id_skema);
  const grouped = [];
  units.forEach((item) => {
    let kelompok = grouped.find(
      (group) =>
        Number(group.id_kelompok) === Number(item.id_kelompok)
    );
    if (!kelompok) {
      kelompok = {
        id_kelompok: item.id_kelompok,
        nama_kelompok: item.nama_kelompok,
        deskripsi_kelompok: item.deskripsi_kelompok,
        units: []
      };
      grouped.push(kelompok);
    }
    kelompok.units.push({
      id_unit: item.id_unit,
      kode_unit: item.kode_unit,
      judul_unit: item.judul_unit,
      urutan: item.urutan
    });
  });
  return grouped;
};

const getPesertaProfile = async (id_peserta) => {
  const peserta = await PesertaJadwal.findByPk(id_peserta);
  if (!peserta) {
    return null;
  }
  const profile = await ProfileAsesi.findByPk(peserta.id_user);
  return {
    id_peserta: peserta.id_peserta,
    id_user: peserta.id_user,
    id_jadwal: peserta.id_jadwal,
    id_asesor: peserta.id_asesor,
    status_asesmen: peserta.status_asesmen,
    nomor_peserta: peserta.nomor_peserta,
    nik: profile?.nik || null,
    nama_lengkap: profile?.nama_lengkap || null,
    jenis_kelamin: profile?.jenis_kelamin || null,
    tempat_lahir: profile?.tempat_lahir || null,
    tanggal_lahir: profile?.tanggal_lahir || null,
    alamat: profile?.alamat || null,
    email: profile?.email || null,
    foto_profil: profile?.foto_profil || null,
    ttd_path: profile?.ttd_path || null
  };
};

const submitFrMapa01 = async (req, res) => {
  let t;
  try {
    const id_user = req.user.id_user;
    const {
      id_jadwal,
      id_skema,
      id_peserta,
      header,
      detail
    } = req.body;
    if (!id_jadwal || !id_skema || !id_peserta) {
      return res.status(400).json({
        message: "id_jadwal, id_skema dan id_peserta wajib diisi"
      });
    }
    const jadwal = await Jadwal.findByPk(id_jadwal);
    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }
    if (Number(jadwal.id_skema) !== Number(id_skema)) {
      return res.status(400).json({
        message: "Skema tidak sesuai dengan jadwal"
      });
    }
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        status: "aktif"
      }
    });
    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki tugas pada jadwal ini"
      });
    }
    const presensi = await PresensiAsesor.findOne({
      where: {
        id_jadwal,
        id_user
      }
    });
    if (!presensi) {
      return res.status(403).json({
        message: "Wajib presensi terlebih dahulu"
      });
    }
    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal,
        id_asesor: id_user
      }
    });
    if (!peserta) {
      return res.status(403).json({
        message: "Peserta bukan tanggung jawab asesor"
      });
    }
    if (!header?.jenis_asesi) {
      return res.status(400).json({
        message: "jenis_asesi wajib diisi"
      });
    }
    const existing = await FrMapa01.findOne({
      where: {
        id_jadwal,
        id_peserta,
        id_asesor: id_user
      }
    });
    if (existing) {
      return res.status(409).json({
        message: "FR.MAPA.01 sudah tersedia",
        id_mapa01: existing.id_mapa01
      });
    }
    t = await sequelize.transaction();
    const mapa01 = await FrMapa01.create({
      id_jadwal,
      id_skema,
      id_peserta,
      id_asesor: id_user,
      potensi_default: getPotensiDefault(header.jenis_asesi),
      profil_asesi: header.profil_asesi || null,
      jenis_asesi: header.jenis_asesi,
      tujuan_asesmen: header.tujuan_asesmen || null,
      tujuan_lainnya: header.tujuan_lainnya || null,
      lingkungan: header.lingkungan || null,
      peluang_bukti: header.peluang_bukti || null,
      bukti_langsung: Boolean(header.bukti_langsung),
      aktivitas_kerja: Boolean(header.aktivitas_kerja),
      kegiatan_pembelajaran: header.kegiatan_pembelajaran || null,
      pelaksana: header.pelaksana || null,
      standar_kompetensi: header.standar_kompetensi || null,
      kurikulum_pelatihan: header.kurikulum_pelatihan || null,
      spesifikasi_kinerja: header.spesifikasi_kinerja || null,
      spesifikasi_produk: header.spesifikasi_produk || null,
      pedoman_khusus: header.pedoman_khusus || null,
      manajer_lsp: Boolean(header.manajer_lsp),
      master_asesor: Boolean(header.master_asesor),
      manajer_pelatihan: Boolean(header.manajer_pelatihan),
      supervisor: Boolean(header.supervisor),
      karakteristik_asesi: header.karakteristik_asesi || null,
      kebutuhan_kontekstual: header.kebutuhan_kontekstual || null,
      saran_pelatihan: header.saran_pelatihan || null,
      penyesuaian_perangkat: header.penyesuaian_perangkat || null,
      peluang_integrasi: header.peluang_integrasi || null
    }, { transaction: t });
    if (Array.isArray(detail) && detail.length) {
      const detailData = detail.map((item) => ({
        id_mapa01: mapa01.id_mapa01,
        id_unit: item.id_unit,
        bukti: item.bukti || null,
        l: Boolean(item.l),
        tl: Boolean(item.tl),
        t: Boolean(item.t),
        metode_observasi: item.metode_observasi || null,
        metode_portofolio: item.metode_portofolio || null,
        metode_tanya: item.metode_tanya || null,
        metode_verifikasi: item.metode_verifikasi || null
      }));
      await FrMapa01Detail.bulkCreate(detailData, {
        transaction: t
      });
    }
    await t.commit();
    return res.status(201).json({
      message: "FR.MAPA.01 berhasil disimpan",
      id_mapa01: mapa01.id_mapa01
    });
  } catch (err) {
    if (t) {
      await t.rollback();
    }
    console.error("Submit MAPA01 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const getFrMapa01 = async (req, res) => {
  try {
    const id_peserta = Number(req.query.id_peserta);
    const id_jadwal = Number(req.query.id_jadwal);
    const id_user = Number(req.user.id_user);
    if (!id_peserta) {
      return res.status(400).json({
        message: "id_peserta wajib diisi"
      });
    }
    if (!id_jadwal) {
      return res.status(400).json({
        message: "id_jadwal wajib diisi"
      });
    }
    if (!id_user) {
      return res.status(401).json({
        message: "User asesor tidak ditemukan"
      });
    }
    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta,
        id_jadwal
      }
    });
    if (!peserta) {
      return res.status(404).json({
        message: "Peserta tidak ditemukan pada jadwal tersebut"
      });
    }
    const jadwal = await Jadwal.findByPk(id_jadwal);
    if (!jadwal) {
      return res.status(404).json({
        message: "Jadwal tidak ditemukan"
      });
    }
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        status: "aktif"
      }
    });
    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses sebagai asesor pada jadwal ini"
      });
    }
    const skema = await Skema.findByPk(jadwal.id_skema);
    if (!skema) {
      return res.status(404).json({
        message: "Skema sertifikasi tidak ditemukan",
        id_skema: jadwal.id_skema
      });
    }
    const mapa01 = await FrMapa01.findOne({
      where: {
        id_jadwal,
        id_peserta,
        id_asesor: id_user
      }
    });
    let detail = [];
    if (mapa01) {
      detail = await FrMapa01Detail.findAll({
        where: {
          id_mapa01: mapa01.id_mapa01
        },
        order: [["id_detail", "ASC"]]
      });
    }
    const profile = await ProfileAsesi.findByPk(peserta.id_user);
    const pesertaData = {
      id_peserta: peserta.id_peserta,
      id_user: peserta.id_user,
      id_jadwal: peserta.id_jadwal,
      id_asesor: peserta.id_asesor,
      status_asesmen: peserta.status_asesmen,
      nomor_peserta: peserta.nomor_peserta,
      nik: profile?.nik || null,
      nama_lengkap: profile?.nama_lengkap || null,
      jenis_kelamin: profile?.jenis_kelamin || null,
      tempat_lahir: profile?.tempat_lahir || null,
      tanggal_lahir: profile?.tanggal_lahir || null,
      alamat: profile?.alamat || null,
      email: profile?.email || null,
      foto_profil: profile?.foto_profil || null,
      ttd_path: profile?.ttd_path || null
    };
    const unitKompetensi = await getUnitKompetensi(jadwal.id_skema);
    const kelompokPekerjaan = await getGroupedUnitKompetensi(jadwal.id_skema);
    return res.status(200).json({
      data: mapa01
        ? {
            ...mapa01.toJSON(),
            detail
          }
        : null,
      peserta: pesertaData,
      jadwal: {
        id_jadwal: jadwal.id_jadwal,
        kode_jadwal: jadwal.kode_jadwal,
        nama_kegiatan: jadwal.nama_kegiatan,
        id_skema: jadwal.id_skema,
        id_tuk: jadwal.id_tuk,
        tgl_pra_asesmen: jadwal.tgl_pra_asesmen,
        tgl_awal: jadwal.tgl_awal,
        tgl_akhir: jadwal.tgl_akhir,
        jam: jadwal.jam,
        pelaksanaan_uji: jadwal.pelaksanaan_uji
      },
      skema: skema.toJSON(),
      unitKompetensi,
      kelompokPekerjaan
    });
  } catch (err) {
    console.error("Get MAPA01 Error:", err);
    console.error("Get MAPA01 Error Message:", err.message);
    console.error("Get MAPA01 Error Stack:", err.stack);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const updateFrMapa01 = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;
    const { header, detail } = req.body;
    const mapa01 = await FrMapa01.findOne({
      where: {
        id_mapa01: id,
        id_asesor: id_user
      }
    });
    if (!mapa01) {
      return res.status(404).json({
        message: "Data tidak ditemukan"
      });
    }
    const peserta = await PesertaJadwal.findOne({
      where: {
        id_peserta: mapa01.id_peserta,
        id_jadwal: mapa01.id_jadwal,
        id_asesor: id_user
      }
    });
    if (!peserta) {
      return res.status(403).json({
        message: "Peserta bukan tanggung jawab asesor"
      });
    }
    const unitKompetensi = await getUnitKompetensi(mapa01.id_skema);
    if (!unitKompetensi.length) {
      return res.status(400).json({
        message: "Unit kompetensi tidak ditemukan"
      });
    }
    t = await sequelize.transaction();
    await mapa01.update({
      profil_asesi: header?.profil_asesi || null,
      jenis_asesi: header?.jenis_asesi || null,
      tujuan_asesmen: header?.tujuan_asesmen || null,
      tujuan_lainnya: header?.tujuan_lainnya || null,
      lingkungan: header?.lingkungan || null,
      peluang_bukti: header?.peluang_bukti || null,
      bukti_langsung: Boolean(header?.bukti_langsung),
      aktivitas_kerja: Boolean(header?.aktivitas_kerja),
      kegiatan_pembelajaran: header?.kegiatan_pembelajaran || null,
      pelaksana: header?.pelaksana || null,
      standar_kompetensi: header?.standar_kompetensi || null,
      kurikulum_pelatihan: header?.kurikulum_pelatihan || null,
      spesifikasi_kinerja: header?.spesifikasi_kinerja || null,
      spesifikasi_produk: header?.spesifikasi_produk || null,
      pedoman_khusus: header?.pedoman_khusus || null,
      manajer_lsp: Boolean(header?.manajer_lsp),
      master_asesor: Boolean(header?.master_asesor),
      manajer_pelatihan: Boolean(header?.manajer_pelatihan),
      supervisor: Boolean(header?.supervisor),
      karakteristik_asesi: header?.karakteristik_asesi || null,
      kebutuhan_kontekstual: header?.kebutuhan_kontekstual || null,
      saran_pelatihan: header?.saran_pelatihan || null,
      penyesuaian_perangkat: header?.penyesuaian_perangkat || null,
      peluang_integrasi: header?.peluang_integrasi || null,
      potensi_default: getPotensiDefault(header?.jenis_asesi)
    }, { transaction: t });
    await FrMapa01Detail.destroy({
      where: {
        id_mapa01: mapa01.id_mapa01
      },
      transaction: t
    });
    if (Array.isArray(detail) && detail.length) {
      const detailData = detail.map((item) => ({
        id_mapa01: mapa01.id_mapa01,
        id_unit: item.id_unit,
        bukti: item.bukti || null,
        l: Boolean(item.l),
        tl: Boolean(item.tl),
        t: Boolean(item.t),
        metode_observasi: item.metode_observasi || null,
        metode_portofolio: item.metode_portofolio || null,
        metode_tanya: item.metode_tanya || null,
        metode_verifikasi: item.metode_verifikasi || null
      }));
      await FrMapa01Detail.bulkCreate(detailData, {
        transaction: t
      });
    }
    await t.commit();
    return res.json({
      message: "FR.MAPA.01 berhasil diperbarui"
    });
  } catch (err) {
    if (t) {
      await t.rollback();
    }
    console.error("Update MAPA01 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const listFrMapa01 = async (req, res) => {
  try {
    const { id_jadwal } = req.params;
    const id_user = req.user.id_user;
    const tugas = await JadwalAsesor.findOne({
      where: {
        id_jadwal,
        id_user,
        status: "aktif"
      }
    });
    if (!tugas) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses ke jadwal ini"
      });
    }
    const data = await FrMapa01.findAll({
      where: {
        id_jadwal,
        id_asesor: id_user
      },
      order: [["id_mapa01", "DESC"]]
    });
    return res.json({
      data
    });
  } catch (err) {
    console.error("List MAPA01 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const downloadPdfFrMapa01 = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;
    const mapa01 = await FrMapa01.findOne({
      where: {
        id_mapa01: id,
        id_asesor: id_user
      }
    });
    if (!mapa01) {
      return res.status(404).json({
        message: "Data MAPA.01 tidak ditemukan"
      });
    }
    const detail = await FrMapa01Detail.findAll({
      where: {
        id_mapa01: mapa01.id_mapa01
      },
      order: [["id_detail", "ASC"]]
    });
    const jadwal = await Jadwal.findByPk(mapa01.id_jadwal);
    const skema = await Skema.findByPk(mapa01.id_skema);
    const peserta = await getPesertaProfile(mapa01.id_peserta);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="FR-MAPA-01-${mapa01.id_mapa01}.pdf"`
    );
    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });
    doc.pipe(res);
    doc.fontSize(14).text("FR.MAPA.01", {
      align: "center"
    });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Kode Jadwal: ${jadwal?.kode_jadwal || "-"}`);
    doc.text(`Skema: ${skema?.judul_skema || "-"}`);
    doc.text(`Kode Skema: ${skema?.kode_skema || "-"}`);
    doc.text(`Peserta: ${peserta?.nama_lengkap || "-"}`);
    doc.text(`NIK: ${peserta?.nik || "-"}`);
    doc.moveDown();
    doc.text(`Jenis Asesi: ${mapa01.jenis_asesi || "-"}`);
    doc.text(`Tujuan Asesmen: ${mapa01.tujuan_asesmen || "-"}`);
    doc.moveDown();
    detail.forEach((item, index) => {
      doc.text(
        `${index + 1}. Unit ${item.id_unit} | Bukti: ${item.bukti || "-"} | L: ${item.l ? "Ya" : "Tidak"} | TL: ${item.tl ? "Ya" : "Tidak"} | T: ${item.t ? "Ya" : "Tidak"}`
      );
    });
    doc.end();
  } catch (err) {
    console.error("PDF MAPA01 Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = {
  getFrMapa01,
  submitFrMapa01,
  updateFrMapa01,
  listFrMapa01,
  downloadPdfFrMapa01
};