const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const { User, ProfileTuk, Role } = require("../../models");
const response = require("../../utils/response.util");

exports.createTuk = async (req, res) => {
  try {
    const {
      kode_tuk,
      email,
      no_hp,
      ...profile
    } = req.body;

    const role = await Role.findOne({
      where: { role_name: "TUK" }
    });

    if (!role) {
      return response.error(res, "Role TUK tidak ditemukan", 500);
    }

    const username = kode_tuk;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      username,
      password_hash: hash,
      id_role: role.id_role,
      email,
      no_hp
    });

    await ProfileTuk.create({
      id_user: user.id_user,
      kode_tuk,
      ...profile
    });

    return response.success(res, "Akun TUK berhasil dibuat");
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.importTukExcel = async (req, res) => {
  try {
    if (!req.file) {
      return response.error(res, "File tidak ditemukan", 400);
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const role = await Role.findOne({
      where: { role_name: "TUK" }
    });

    if (!role) {
      return response.error(res, "Role TUK tidak ditemukan", 500);
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const row of data) {
      try {
        const username = row.kode_tuk;
        const rawPassword = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(rawPassword, 10);

        const user = await User.create({
          username,
          password_hash: hash,
          id_role: role.id_role,
          email: row.email,
          no_hp: row.no_hp
        });

        await ProfileTuk.create({
          id_user: user.id_user,
          kode_tuk: row.kode_tuk,
          nama_tuk: row.nama_tuk,
          jenis_tuk: row.jenis_tuk,
          alamat: row.alamat,
          provinsi: row.provinsi,
          kota: row.kota,
          kecamatan: row.kecamatan,
          kelurahan: row.kelurahan,
          kode_pos: row.kode_pos,
          no_izin: row.no_izin,
          masa_berlaku: row.masa_berlaku,
          status_tuk: row.status_tuk
        });

        totalSuccess++;
      } catch (err) {
        totalFailed++;
        console.error("Gagal import TUK:", row.kode_tuk, err.message);
      }
    }

    return response.success(
      res,
      `Import TUK selesai. Berhasil: ${totalSuccess}, Gagal: ${totalFailed}`
    );

  } catch (err) {
    return response.error(res, err.message);
  }
};