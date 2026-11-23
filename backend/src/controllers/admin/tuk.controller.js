const XLSX = require("xlsx");
const { User, Role, Tuk, ProfileTuk, TukSkema } = require("../../models");
const response = require("../../utils/response.util");
const { createUser, resetUserPassword } = require("../../services/account.service");
const { sendAccountEmail } = require("../../services/email.service");
const { createNotifikasi } = require("../../services/notifikasi.service");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");

exports.createTuk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let surat_keputusan = null;
    if (req.files && req.files.surat_keputusan) {
      surat_keputusan = req.files.surat_keputusan[0].filename;
    }
    const tuk = await Tuk.create({
      kode_tuk: req.body.kode_tuk,
      nama_tuk: req.body.nama_tuk,
      jenis_tuk: req.body.jenis_tuk,
      institusi_induk: req.body.institusi_induk,
      email: req.body.email,
      nama_penanggung_jawab: req.body.nama_penanggung_jawab || null,
      telepon: req.body.telepon,
      alamat: req.body.alamat,
      provinsi: req.body.provinsi,
      kota: req.body.kota,
      kecamatan: req.body.kecamatan,
      kelurahan: req.body.kelurahan,
      kode_pos: req.body.kode_pos,
      no_lisensi: req.body.no_lisensi,
      masa_berlaku_lisensi: req.body.masa_berlaku_lisensi || null,
      surat_keputusan: surat_keputusan,
      status: req.body.status || "aktif",
      id_penanggung_jawab: null 
    }, { transaction: t });
    await t.commit();
    return response.success(res, "Data TUK berhasil ditambahkan. Akun belum dibuat.");
  } catch (err) {
    await t.rollback();
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      if (field === 'kode_tuk') {
        return response.error(res, "Gagal! Kode TUK tersebut sudah pernah didaftarkan. Silakan gunakan kode lain.", 400);
      }
    }
    return response.error(res, err.message);
  }
};

// --- TAMBAHAN BARU: DOWNLOAD TEMPLATE EXCEL TUK ---
exports.downloadTemplate = async (req, res) => {
  try {
    const headers = [
      "kode_tuk",
      "nama_tuk",
      "jenis_tuk",
      "institusi_induk",
      "nama_penanggung_jawab",
      "email",
      "telepon",
      "alamat",
      "provinsi",
      "kota",
      "kecamatan",
      "kelurahan",
      "kode_pos",
      "no_lisensi",
      "masa_berlaku_lisensi"
    ];

    const exampleData = [
      {
        kode_tuk: "TUK-001",
        nama_tuk: "TUK Sewaktu Informatika Utama",
        jenis_tuk: "sewaktu", // Pilihan: mandiri | sewaktu | tempat_kerja
        institusi_induk: "PT Teknologi Nusantara",
        nama_penanggung_jawab: "Budi Santoso, S.Kom.",
        email: "tuk.contoh@gmail.com",
        telepon: "'081234567890", // Kutip tunggal agar angka 0 di depan tidak hilang di Excel
        alamat: "Jl. Kaliurang Km. 5 No. 45",
        provinsi: "DI Yogyakarta",
        kota: "Kabupaten Sleman",
        kecamatan: "Depok",
        kelurahan: "Caturtunggal",
        kode_pos: "'55281",
        no_lisensi: "KEP-LSP/012/2025",
        masa_berlaku_lisensi: "2030-12-31"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_TUK");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Template_Import_TUK.xlsx");

    return res.end(buffer);
  } catch (err) {
    console.error("Gagal buat template TUK:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.importTukExcel = async (req, res) => {
  try {
    if (!req.file) return response.error(res, "File tidak ditemukan", 400);
    const workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
    if (!rows.length) return response.error(res, "File Excel kosong", 400);

    let success = 0;
    let failed = 0;

    const cleanStr = (val) => {
      if (!val) return "";
      const str = String(val).trim();
      return str.startsWith("'") ? str.substring(1).trim() : str;
    };

    const parseDate = (dateVal) => {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d;
    };

    for (const row of rows) {
      const t = await sequelize.transaction();
      try {
        const kodeTuk = cleanStr(row.kode_tuk);
        const namaTuk = cleanStr(row.nama_tuk);
        const emailStr = cleanStr(row.email).toLowerCase();
        const teleponStr = cleanStr(row.telepon).replace(/\D/g, "");
        const kodePosStr = cleanStr(row.kode_pos);
        const namaPj = cleanStr(row.nama_penanggung_jawab) || namaTuk;

        if (!kodeTuk || !namaTuk || !emailStr) {
          throw new Error("Kode TUK, Nama TUK, atau Email kosong");
        }

        let role = await Role.findOne({ where: { role_name: "TUK" }, transaction: t });
        if (!role) role = await Role.create({ role_name: "TUK" }, { transaction: t });

        const { user, rawPassword } = await createUser({
          username: kodeTuk,
          email: emailStr,
          no_hp: teleponStr,
          id_role: role.id_role
        }, { transaction: t });

        await Tuk.create({
          kode_tuk: kodeTuk,
          nama_tuk: namaTuk,
          jenis_tuk: cleanStr(row.jenis_tuk) || "sewaktu",
          institusi_induk: cleanStr(row.institusi_induk) || null,
          telepon: teleponStr,
          email: emailStr,
          nama_penanggung_jawab: namaPj,
          alamat: cleanStr(row.alamat) || null,
          provinsi: cleanStr(row.provinsi) || null,
          kota: cleanStr(row.kota) || null,
          kecamatan: cleanStr(row.kecamatan) || null,
          kelurahan: cleanStr(row.kelurahan) || null,
          kode_pos: kodePosStr || null,
          no_lisensi: cleanStr(row.no_lisensi) || null,
          masa_berlaku_lisensi: parseDate(row.masa_berlaku_lisensi),
          status: "nonaktif",
          id_penanggung_jawab: user.id_user 
        }, { transaction: t });

        await ProfileTuk.upsert({
          id_user: user.id_user,
          nama_lengkap: namaPj,
          alamat: cleanStr(row.alamat) || null,
          provinsi: cleanStr(row.provinsi) || null,
          kota: cleanStr(row.kota) || null,
          kecamatan: cleanStr(row.kecamatan) || null,
          kelurahan: cleanStr(row.kelurahan) || null,
          kode_pos: kodePosStr || null
        }, { transaction: t });

        await t.commit(); 

        let statusKirim = "terkirim";
        try {
          await sendAccountEmail(emailStr, user.username, rawPassword);
        } catch (emailErr) {
          console.error(`Email gagal dikirim ke ${emailStr}:`, emailErr.message);
          statusKirim = "gagal";
        }

        await createNotifikasi({
          channel: "email",
          tujuan: emailStr,
          pesan: `Akun TUK berhasil dibuat melalui Import.\nUsername: ${kodeTuk}`,
          status_kirim: statusKirim,
          ref_type: "akun",
          ref_id: user.id_user
        });

        success++;
      } catch (err) {
        await t.rollback();
        failed++;
        console.log(`Import gagal pada baris kode ${row.kode_tuk}:`, err.message);
      }
    }
    return response.success(res, `Import selesai. Berhasil masuk & terkirim email: ${success}, Gagal/Duplikat: ${failed}`);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const status = req.query.status || ""; 
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { kode_tuk: { [Op.like]: `%${search}%` } },
        { nama_tuk: { [Op.like]: `%${search}%` } },
        { nama_penanggung_jawab: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (page && limit) {
      const offset = (page - 1) * limit;
      const data = await Tuk.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [{ model: User, as: "penanggungJawab", attributes: ["id_user", "username", "email"] }],
        order: [['id_tuk', 'DESC']]
      });
      return response.success(res, "List TUK Pagination", data);
    }
    const data = await Tuk.findAll({
      where: whereClause,
      include: [{ model: User, as: "penanggungJawab", attributes: ["id_user", "username", "email"] }],
      order: [['nama_tuk', 'ASC']]
    });
    return response.success(res, "List Semua TUK", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Tuk.findByPk(req.params.id, {
      include: [{ model: User, as: "penanggungJawab", attributes: ["id_user", "username", "email"] }]
    });
    if (!data) return response.error(res, "TUK tidak ditemukan", 404);
    return response.success(res, "Detail TUK", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const tuk = await Tuk.findByPk(req.params.id);
    if (!tuk) return response.error(res, "TUK tidak ditemukan", 404);
    const payload = { ...req.body };
    if (req.files && req.files.surat_keputusan) {
      payload.surat_keputusan = req.files.surat_keputusan[0].filename;
    }
    await tuk.update(payload);
    
    if (tuk.id_penanggung_jawab) {
      await ProfileTuk.update({
        nama_lengkap: req.body.nama_penanggung_jawab || req.body.nama_tuk,
        alamat: req.body.alamat,
        provinsi: req.body.provinsi,
        kota: req.body.kota,
        kecamatan: req.body.kecamatan,
        kelurahan: req.body.kelurahan,
        kode_pos: req.body.kode_pos
      }, { where: { id_user: tuk.id_penanggung_jawab }});
      
      if (req.body.email) {
        await User.update(
          { email: req.body.email },
          { where: { id_user: tuk.id_penanggung_jawab } }
        );
      }
    }
    return response.success(res, "TUK berhasil diperbarui", tuk);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      if (field === 'kode_tuk') return response.error(res, "Kode TUK tersebut sudah dipakai TUK lain.", 400);
    }
    return response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tuk = await Tuk.findByPk(req.params.id, { transaction: t });
    if (!tuk) {
      await t.rollback();
      return response.error(res, "TUK tidak ditemukan", 404);
    }
    
    if (tuk.id_penanggung_jawab) {
      await User.destroy({ where: { id_user: tuk.id_penanggung_jawab }, transaction: t });
    }
    await tuk.destroy({ transaction: t });
    await t.commit();
    return response.success(res, "TUK dan Akun berhasil dihapus");
  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.attachSkema = async (req, res) => {
  try {
    const { id_tuk, id_skema } = req.body;
    const tuk = await Tuk.findByPk(id_tuk);
    if (!tuk) return response.error(res, "TUK tidak ditemukan", 404);
    const data = await TukSkema.create({ id_tuk, id_skema });
    return response.success(res, "Skema berhasil dikaitkan ke TUK", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.detachSkema = async (req, res) => {
  try {
    const { id_tuk, id_skema } = req.params;
    const deleted = await TukSkema.destroy({ where: { id_tuk, id_skema } });
    if (!deleted) return response.error(res, "Relasi tidak ditemukan", 404);
    return response.success(res, "Skema dilepas dari TUK");
  } catch (err) {
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
      await createNotifikasi({
        channel: "email",
        tujuan: user.email || user.username,
        pesan: `Password untuk TUK ${user.username} berhasil direset dan dikirim ke email.`,
        status_kirim: "terkirim",
        ref_type: "akun",
        ref_id: user.id_user
      });
    } catch (notifErr) {
      console.error("Gagal membuat notif reset password:", notifErr);
    }
    return response.success(res, "Password berhasil direset dan dikirim ke email", { username: user.username });
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.generateAccount = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tuk = await Tuk.findByPk(req.params.id, {
      include: [{ model: User, as: "penanggungJawab" }]
    });
    if (!tuk) {
      await t.rollback();
      return response.error(res, "TUK tidak ditemukan", 404);
    }
    if (tuk.penanggungJawab) {
      await t.rollback();
      return response.success(res, "Akun sudah ada", { id_user: tuk.penanggungJawab.id_user });
    }
    let role = await Role.findOne({ where: { role_name: "TUK" }, transaction: t });
    if (!role) role = await Role.create({ role_name: "TUK" }, { transaction: t });
    const newUserInfo = await createUser({
      username: tuk.kode_tuk,
      email: tuk.email,
      no_hp: tuk.telepon,
      id_role: role.id_role
    }, { transaction: t });
    const user = newUserInfo.user;
    await tuk.update({ id_penanggung_jawab: user.id_user }, { transaction: t });
    
    await ProfileTuk.upsert({
      id_user: user.id_user,
      nama_lengkap: tuk.nama_penanggung_jawab || tuk.nama_tuk,
      alamat: tuk.alamat,
      provinsi: tuk.provinsi,
      kota: tuk.kota,
      kecamatan: tuk.kecamatan,
      kelurahan: tuk.kelurahan,
      kode_pos: tuk.kode_pos
    }, { transaction: t });
    
    await t.commit();
    return response.success(res, "Akun berhasil digenerate", { id_user: user.id_user });
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      if (field === 'email') {
        return response.error(res, "Gagal generate akun! Email yang tersimpan di TUK ini sudah digunakan akun lain. Silakan edit email TUK terlebih dahulu.", 400);
      } else if (field === 'kode_tuk' || field === 'username') {
        return response.error(res, "Gagal generate akun! Kode TUK ini bentrok dengan username lain.", 400);
      }
    }
    return response.error(res, err.message);
  }
};