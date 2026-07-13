const XLSX = require("xlsx");
const { Op } = require("sequelize"); 
const { User, ProfileAsesor, Role, Notifikasi, Skema  } = require("../../models");
const response = require("../../utils/response.util");
const {createUser, resetUserPassword, sendAccountEmail} = require("../../services/account.service");
const sequelize = require("../../config/database");

exports.createAsesor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nik, email, no_hp, ...profile } = req.body;

    let role = await Role.findOne({
      where: { role_name: "ASESOR" },
      transaction: t
    });

    if (!role) {
      role = await Role.create({ role_name: "ASESOR" }, { transaction: t });
    }

    const { user } = await createUser({
      username: nik,
      email,
      no_hp,
      id_role: role.id_role
    }, { transaction: t });

    await ProfileAsesor.create({
      id_user: user.id_user,
      nik,
      ...profile
    }, { transaction: t });

    await t.commit();
    return response.success(res, "Asesor berhasil dibuat. Email belum dikirim.");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.getSkemaDropdown = async (req, res) => {
  const skema = await Skema.findAll({ attributes: ['id_skema', 'judul_skema'] });
  return response.success(res, "Data Skema", skema);
};

exports.downloadTemplate = async (req, res) => {
  try {
    const headers = [
      "nik", "email", "no_hp", "gelar_depan", "nama_lengkap", "gelar_belakang", 
      "jenis_kelamin", "tempat_lahir", "tanggal_lahir", "kebangsaan", 
      "pendidikan_terakhir", "tahun_lulus", "institut_asal",
      "alamat_ktp", "rt_ktp", "rw_ktp", "provinsi_ktp", "kota_ktp", "kecamatan_ktp", "kelurahan_ktp", "kode_pos_ktp",
      "alamat_domisili", "rt_domisili", "rw_domisili", "provinsi_domisili", "kota_domisili", "kecamatan_domisili", "kelurahan_domisili", "kode_pos_domisili",
      "bidang_keahlian", "no_reg_asesor", "no_lisensi", "masa_berlaku", "status_asesor"
    ];

    const exampleData = [{
      nik: "3404012345678901",
      email: "asesor.contoh@email.com",
      no_hp: "081987654321",
      gelar_depan: "Dr.",
      nama_lengkap: "Siti Aminah",
      gelar_belakang: "M.Kom.",
      jenis_kelamin: "perempuan",
      tempat_lahir: "Yogyakarta",
      tanggal_lahir: "1990-01-01",
      kebangsaan: "Indonesia",
      pendidikan_terakhir: "S2",
      tahun_lulus: 2015,
      institut_asal: "Universitas Gadjah Mada",
      alamat_ktp: "Jl. Contoh No. 123",
      rt_ktp: "01",
      rw_ktp: "02",
      provinsi_ktp: "DI Yogyakarta",
      kota_ktp: "Yogyakarta",
      kecamatan_ktp: "Gondokusuman",
      kelurahan_ktp: "Terban",
      kode_pos_ktp: "55223",
      alamat_domisili: "Jl. Contoh No. 123",
      rt_domisili: "01",
      rw_domisili: "02",
      provinsi_domisili: "DI Yogyakarta",
      kota_domisili: "Yogyakarta",
      kecamatan_domisili: "Gondokusuman",
      kelurahan_domisili: "Terban",
      kode_pos_domisili: "55223",
      bidang_keahlian: "Informatika",
      no_reg_asesor: "REG123456",
      no_lisensi: "LSI789012",
      masa_berlaku: "2030-01-01",
      status_asesor: "aktif"
    }];

    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Asesor");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Template_Import_Asesor.xlsx");
    
    return res.end(buffer);

  } catch (err) {
    console.error("Gagal buat template:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.importAsesorExcel = async (req, res) => {
  try {
    if (!req.file) {
      return response.error(res, "File tidak ditemukan", 400);
    }

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { 
        type: "buffer",
        cellDates: true 
      });
    } catch (xlsxErr) {
      console.error("Gagal membaca struktur Excel:", xlsxErr);
      return response.error(res, "Struktur file Excel tidak valid atau rusak.", 400);
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

    if (!data || data.length === 0) {
      return response.error(res, "File Excel kosong atau tidak memiliki data.", 400);
    }

    let role = await Role.findOne({ where: { role_name: "ASESOR" } });
    if (!role) {
      role = await Role.create({ role_name: "ASESOR" });
    }

    let totalSuccess = 0;
    let totalFailed = 0;
    let errorDetails = [];

    for (const [index, row] of data.entries()) {
      const t = await sequelize.transaction();

      try {
        const nikStr = row.nik ? String(row.nik).trim() : "";
        const emailStr = row.email ? String(row.email).trim() : "";
        const noHpStr = row.no_hp ? String(row.no_hp).trim().replace(/\D/g, "") : null;

        if (!nikStr || !emailStr) {
          throw new Error("NIK atau Email tidak boleh kosong");
        }

        const existingUser = await User.findOne({
          where: { [Op.or]: [{ username: nikStr }, { email: emailStr }] }
        });

        if (existingUser) {
          throw new Error(`User dengan NIK/Email tersebut sudah terdaftar`);
        }

        const { user } = await createUser({
          username: nikStr,
          email: emailStr,
          no_hp: noHpStr,
          id_role: role.id_role
        }, { transaction: t });

        await ProfileAsesor.create({
          id_user: user.id_user,
          nik: nikStr,
          gelar_depan: row.gelar_depan || null,
          nama_lengkap: row.nama_lengkap || "-",
          gelar_belakang: row.gelar_belakang || null,
          jenis_kelamin: row.jenis_kelamin ? String(row.jenis_kelamin).toLowerCase() : "laki-laki",
          tempat_lahir: row.tempat_lahir || null,
          tanggal_lahir: row.tanggal_lahir ? new Date(row.tanggal_lahir) : null,
          kebangsaan: row.kebangsaan || "Indonesia",
          pendidikan_terakhir: row.pendidikan_terakhir || "S1",
          tahun_lulus: row.tahun_lulus ? parseInt(row.tahun_lulus) : null,
          institut_asal: row.institut_asal || null,

          alamat_ktp: row.alamat_ktp || null,
          rt_ktp: row.rt_ktp || null,
          rw_ktp: row.rw_ktp || null,
          provinsi_ktp: row.provinsi_ktp || null,
          kota_ktp: row.kota_ktp || null,
          kecamatan_ktp: row.kecamatan_ktp || null,
          kelurahan_ktp: row.kelurahan_ktp || null,
          kode_pos_ktp: row.kode_pos_ktp || null,

          alamat_domisili: row.alamat_domisili || null,
          rt_domisili: row.rt_domisili || null,
          rw_domisili: row.rw_domisili || null,
          provinsi_domisili: row.provinsi_domisili || null,
          kota_domisili: row.kota_domisili || null,
          kecamatan_domisili: row.kecamatan_domisili || null,
          kelurahan_domisili: row.kelurahan_domisili || null,
          kode_pos_domisili: row.kode_pos_domisili || null,

          bidang_keahlian: row.bidang_keahlian || null,
          no_reg_asesor: row.no_reg_asesor || null,
          no_lisensi: row.no_lisensi || null,
          masa_berlaku: row.masa_berlaku ? new Date(row.masa_berlaku) : null,
          status_asesor: row.status_asesor ? String(row.status_asesor).toLowerCase() : "aktif"
        }, { transaction: t });

        await t.commit();
        totalSuccess++;
      } catch (err) {
        await t.rollback();
        totalFailed++;
        errorDetails.push(`Baris ${index + 2}: ${err.message}`);
      }
    }

    return response.success(res, `Proses import selesai.`, {
      berhasil: totalSuccess,
      gagal: totalFailed,
      rincian_error: errorDetails
    });

  } catch (err) {
    return response.error(res, "Terjadi kesalahan server saat memproses file Excel.", 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = search ? {
      [Op.or]: [
        { nik: { [Op.like]: `%${search}%` } },
        { nama_lengkap: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await ProfileAsesor.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: "user", 
          attributes: ["id_user", "email", "no_hp", "status_user"],
          include: [
            {
              model: Notifikasi,
              where: { ref_type: "akun" },
              required: false
            }
          ]
        }
      ],
      order: [['id_user', 'DESC']] 
    });

    return response.success(res, "List Asesor", {
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error("GET All Asesor Error:", err);
    return response.error(res, "Gagal mengambil data asesor: " + err.message, 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ProfileAsesor.findByPk(req.params.id, {
      include: {
        model: User,
        as: "user" 
      }
    });

    if (!data) return response.error(res, "Asesor tidak ditemukan", 404);

    return response.success(res, "Detail Asesor", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const asesor = await ProfileAsesor.findByPk(req.params.id);
    if (!asesor) return response.error(res, "Asesor tidak ditemukan", 404);

    await asesor.update(req.body);

    return response.success(res, "Asesor berhasil diperbarui", asesor);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const asesor = await ProfileAsesor.findByPk(req.params.id, { transaction: t });
    if (!asesor) {
      await t.rollback();
      return response.error(res, "Asesor tidak ditemukan", 404);
    }

    const today = new Date();

    if (asesor.masa_berlaku) {
      const masaBerlaku = new Date(asesor.masa_berlaku);
      if (masaBerlaku >= today) {
        await t.rollback();
        return response.error(res, "Asesor masih aktif dan tidak bisa dihapus", 400);
      }
    }

    await User.destroy({
      where: { id_user: asesor.id_user },
      transaction: t
    });

    await asesor.destroy({ transaction: t });

    await t.commit();
    return response.success(res, "Asesor berhasil dihapus");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return response.error(res, "User tidak ditemukan", 404);

    const rawPassword = await resetUserPassword(user);

    try {
       await sendAccountEmail(user.email, user.username, rawPassword);
    } catch (emailErr) {
       console.error("Gagal mengirim email reset password:", emailErr);
    }

    try {
      const { createNotifikasi } = require("../../services/notifikasi.service"); 
      await createNotifikasi({
        channel: "email",
        tujuan: user.email || user.username,
        pesan: `Password untuk NIK ${user.username} berhasil direset dan dikirim ke email.`,
        status_kirim: "terkirim",
        ref_type: "akun",
        ref_id: user.id_user
      });
    } catch (notifErr) {
      console.error("Gagal membuat notif reset password:", notifErr);
    }

    return response.success(res, "Password berhasil direset dan dikirim ke email", {
      username: user.username
    });

  } catch (err) {
    return response.error(res, err.message);
  }
};