const sequelize = require("../../config/database");

const {
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

const parsePeople = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
      jenis_asesi,
      tujuan_asesmen,
      tujuan_lainnya,
      lingkungan,
      peluang_bukti,
      hubungan_standar,
      siapa_melakukan_asesmen,
      konfirmasi_orang_relevan,
      standar_kompetensi,
      potensi_asesi,
      modifikasi,
      penyusun,
      validator,
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

    if (!jenis_asesi) {
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

    const hubungan = Array.isArray(hubungan_standar)
      ? hubungan_standar
      : [];

    const konfirmasi = konfirmasi_orang_relevan || "";

    const modifikasiData = modifikasi || {};

    t = await sequelize.transaction();

    const mapa01 = await FrMapa01.create({
      id_jadwal,
      id_skema,
      id_peserta,
      id_asesor: id_user,
      potensi_default: getPotensiDefault(jenis_asesi),
      potensi_asesi: potensi_asesi || null,
      profil_asesi: peserta.profil_asesi || null,
      jenis_asesi,
      tujuan_asesmen: tujuan_asesmen || null,
      tujuan_lainnya: tujuan_lainnya || null,
      lingkungan: lingkungan || null,
      peluang_bukti: peluang_bukti || null,
      bukti_langsung: hubungan.includes("bukti"),
      aktivitas_kerja: hubungan.includes("aktivitas"),
      kegiatan_pembelajaran: hubungan.includes("pembelajaran") ? "dipilih" : null,
      pelaksana: siapa_melakukan_asesmen || null,
      standar_kompetensi: standar_kompetensi || null,
      kurikulum_pelatihan: standar_kompetensi === "kurikulum" ? "dipilih" : null,
      spesifikasi_kinerja: standar_kompetensi === "industri" ? "dipilih" : null,
      spesifikasi_produk: standar_kompetensi === "produk" ? "dipilih" : null,
      pedoman_khusus: standar_kompetensi === "khusus" ? "dipilih" : null,
      manajer_lsp: konfirmasi === "Manajer sertifikasi LSP",
      master_asesor: konfirmasi === "Master Asesor / Master Trainer / Lead Asesor Kompetensi",
      manajer_pelatihan: konfirmasi === "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar",
      supervisor: konfirmasi === "Manajer atau supervisor ditempat kerja",
      karakteristik_asesi: modifikasiData.karakteristik_kandidat || null,
      kebutuhan_kontekstual: modifikasiData.kebutuhan_kontekstualisasi || null,
      saran_pelatihan: modifikasiData.saran_pelatihan || null,
      penyesuaian_perangkat: modifikasiData.penyesuaian_perangkat || null,
      peluang_integrasi: modifikasiData.peluang_integrasi || null,
      penyusun: JSON.stringify(Array.isArray(penyusun) ? penyusun : []),
      validator: JSON.stringify(Array.isArray(validator) ? validator : [])
    }, { transaction: t });

    if (Array.isArray(detail) && detail.length) {
      const detailData = detail.map((item) => {
        const metode = Array.isArray(item.metode)
          ? item.metode
          : [];

        return {
          id_mapa01: mapa01.id_mapa01,
          id_unit: item.id_unit,
          bukti: item.bukti || null,
          l: Boolean(item.l),
          tl: Boolean(item.tl),
          t: Boolean(item.t),
          metode_observasi: metode.includes("CL") ? "CL" : null,
          metode_portofolio: metode.includes("CVP") ? "CVP" : null,
          metode_tanya: metode.includes("DPT") ? "DPT" : null,
          metode_verifikasi: metode.includes("VPK") ? "VPK" : null,
          metode_crp: metode.includes("CRP"),
          metode_pw: metode.includes("PW")
        };
      });

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
      const detailRows = await FrMapa01Detail.findAll({
        where: {
          id_mapa01: mapa01.id_mapa01
        },
        order: [["id_detail", "ASC"]]
      });

      detail = detailRows.map((item) => {
        const data = item.toJSON();

        const metode = [];

        if (data.metode_observasi === "CL") {
          metode.push("CL");
        }

        if (
          data.metode_portofolio === "CVP" ||
          data.metode_portofolio === "CPV"
        ) {
          metode.push("CVP");
        }

        if (data.metode_tanya === "DPT") {
          metode.push("DPT");
        }

        if (data.metode_tanya === "PW") {
          metode.push("PW");
        }

        if (data.metode_verifikasi === "VPK") {
          metode.push("VPK");
        }

        if (data.metode_verifikasi === "CRP") {
          metode.push("CRP");
        }

        if (data.metode_crp) {
          metode.push("CRP");
        }

        if (data.metode_pw) {
          metode.push("PW");
        }

        return {
          ...data,
          metode
        };
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

    let mapaData = null;

    if (mapa01) {
      const data = mapa01.toJSON();

      const hubungan_standar = [];

      if (data.bukti_langsung) {
        hubungan_standar.push("bukti");
      }

      if (data.aktivitas_kerja) {
        hubungan_standar.push("aktivitas");
      }

      if (data.kegiatan_pembelajaran) {
        hubungan_standar.push("pembelajaran");
      }

      let siapa_melakukan_asesmen = data.pelaksana || "";

      let konfirmasi_orang_relevan = "";

      if (data.manajer_lsp) {
        konfirmasi_orang_relevan = "Manajer sertifikasi LSP";
      } else if (data.master_asesor) {
        konfirmasi_orang_relevan = "Master Asesor / Master Trainer / Lead Asesor Kompetensi";
      } else if (data.manajer_pelatihan) {
        konfirmasi_orang_relevan = "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar";
      } else if (data.supervisor) {
        konfirmasi_orang_relevan = "Manajer atau supervisor ditempat kerja";
      }

      let standar_kompetensi = data.standar_kompetensi || "";

      if (!standar_kompetensi) {
        if (data.kurikulum_pelatihan) {
          standar_kompetensi = "kurikulum";
        } else if (data.spesifikasi_kinerja) {
          standar_kompetensi = "industri";
        } else if (data.spesifikasi_produk) {
          standar_kompetensi = "produk";
        } else if (data.pedoman_khusus) {
          standar_kompetensi = "khusus";
        } else {
          standar_kompetensi = "skkni";
        }
      }

      let penyusunData = [];
      let validatorData = [];

      try {
        penyusunData = data.penyusun
          ? JSON.parse(data.penyusun)
          : [];
      } catch {
        penyusunData = [];
      }

      try {
        validatorData = data.validator
          ? JSON.parse(data.validator)
          : [];
      } catch {
        validatorData = [];
      }

      mapaData = {
        ...data,
        penyusun: penyusunData,
        validator: validatorData,
        hubungan_standar,
        siapa_melakukan_asesmen,
        konfirmasi_orang_relevan,
        standar_kompetensi,
        detail,
        modifikasi: {
          karakteristik_kandidat: data.karakteristik_asesi || "",
          kebutuhan_kontekstualisasi: data.kebutuhan_kontekstual || "",
          saran_pelatihan: data.saran_pelatihan || "",
          penyesuaian_perangkat: data.penyesuaian_perangkat || "",
          peluang_integrasi: data.peluang_integrasi || ""
        }
      };
    }

    return res.status(200).json({
      data: mapaData,
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

    const {
      jenis_asesi,
      tujuan_asesmen,
      tujuan_lainnya,
      lingkungan,
      peluang_bukti,
      hubungan_standar,
      siapa_melakukan_asesmen,
      konfirmasi_orang_relevan,
      standar_kompetensi,
      potensi_asesi,
      modifikasi,
      penyusun,
      validator,
      detail
    } = req.body;

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

    const hubungan = Array.isArray(hubungan_standar)
      ? hubungan_standar
      : [];

    const konfirmasi = konfirmasi_orang_relevan || "";
    const modifikasiData = modifikasi || {};

    t = await sequelize.transaction();

    await mapa01.update({
      potensi_default: getPotensiDefault(jenis_asesi),
      potensi_asesi: potensi_asesi || null,
      jenis_asesi: jenis_asesi || null,
      tujuan_asesmen: tujuan_asesmen || null,
      tujuan_lainnya: tujuan_lainnya || null,
      lingkungan: lingkungan || null,
      peluang_bukti: peluang_bukti || null,
      bukti_langsung: hubungan.includes("bukti"),
      aktivitas_kerja: hubungan.includes("aktivitas"),
      kegiatan_pembelajaran: hubungan.includes("pembelajaran") ? "dipilih" : null,
      pelaksana: siapa_melakukan_asesmen || null,
      standar_kompetensi: standar_kompetensi || null,
      kurikulum_pelatihan: standar_kompetensi === "kurikulum" ? "dipilih" : null,
      spesifikasi_kinerja: standar_kompetensi === "industri" ? "dipilih" : null,
      spesifikasi_produk: standar_kompetensi === "produk" ? "dipilih" : null,
      pedoman_khusus: standar_kompetensi === "khusus" ? "dipilih" : null,
      manajer_lsp: konfirmasi === "Manajer sertifikasi LSP",
      master_asesor: konfirmasi === "Master Asesor / Master Trainer / Lead Asesor Kompetensi",
      manajer_pelatihan: konfirmasi === "Manajer pelatihan Lembaga Training terakreditasi / Lembaga Training terdaftar",
      supervisor: konfirmasi === "Manajer atau supervisor ditempat kerja",
      karakteristik_asesi: modifikasiData.karakteristik_kandidat || null,
      kebutuhan_kontekstual: modifikasiData.kebutuhan_kontekstualisasi || null,
      saran_pelatihan: modifikasiData.saran_pelatihan || null,
      penyesuaian_perangkat: modifikasiData.penyesuaian_perangkat || null,
      peluang_integrasi: modifikasiData.peluang_integrasi || null,
      penyusun: JSON.stringify(Array.isArray(penyusun) ? penyusun : []),
      validator: JSON.stringify(Array.isArray(validator) ? validator : [])
    }, { transaction: t });

    await FrMapa01Detail.destroy({
      where: {
        id_mapa01: mapa01.id_mapa01
      },
      transaction: t
    });

    if (Array.isArray(detail) && detail.length) {
      const detailData = detail.map((item) => {
        const metode = Array.isArray(item.metode)
          ? item.metode
          : [];

        return {
          id_mapa01: mapa01.id_mapa01,
          id_unit: item.id_unit,
          bukti: item.bukti || null,
          l: Boolean(item.l),
          tl: Boolean(item.tl),
          t: Boolean(item.t),
          metode_observasi: metode.includes("CL") ? "CL" : null,
          metode_portofolio: metode.includes("CVP") ? "CVP" : null,
          metode_tanya: metode.includes("DPT") ? "DPT" : null,
          metode_verifikasi: metode.includes("VPK") ? "VPK" : null,
          metode_crp: metode.includes("CRP"),
          metode_pw: metode.includes("PW")
        };
      });

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