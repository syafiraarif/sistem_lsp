const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const { User, ProfileAsesi, Role } = require("../../models");
const response = require("../../utils/response.util");

exports.importAsesiExcel = async (req, res) => {
  try {
    if (!req.file) {
      return response.error(res, "File tidak ditemukan", 400);
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const role = await Role.findOne({
      where: { role_name: "ASESI" }
    });

    if (!role) {
      return response.error(res, "Role asesi tidak ditemukan", 500);
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const row of data) {
      try {
        const username = row.nik;
        const rawPassword = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(rawPassword, 10);

        const user = await User.create({
          username,
          password_hash: hash,
          id_role: role.id_role,
          email: row.email,
          no_hp: row.no_hp
        });

        await ProfileAsesi.create({
          id_user: user.id_user,
          nik: row.nik,
          nama_lengkap: row.nama_lengkap,
          jenis_kelamin: row.jenis_kelamin,
          tempat_lahir: row.tempat_lahir,
          tanggal_lahir: row.tanggal_lahir,
          kebangsaan: row.kebangsaan,
          alamat: row.alamat,
          rt: row.rt,
          rw: row.rw,
          provinsi: row.provinsi,
          kota: row.kota,
          kecamatan: row.kecamatan,
          kelurahan: row.kelurahan,
          kode_pos: row.kode_pos,
          pendidikan_terakhir: row.pendidikan_terakhir,
          universitas: row.universitas,
          jurusan: row.jurusan,
          tahun_lulus: row.tahun_lulus,
          pekerjaan: row.pekerjaan,
          jabatan: row.jabatan,
          nama_perusahaan: row.nama_perusahaan,
          alamat_perusahaan: row.alamat_perusahaan,
          telp_perusahaan: row.telp_perusahaan,
          fax_perusahaan: row.fax_perusahaan,
          email_perusahaan: row.email_perusahaan
        });

        totalSuccess++;
      } catch (err) {
        totalFailed++;
        console.error("Gagal import asesi:", row.nik, err.message);
      }
    }

    return response.success(
      res,
      `Import Asesi selesai. Berhasil: ${totalSuccess}, Gagal: ${totalFailed}`
    );

  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await ProfileAsesi.findAll({
      include: {
        model: User,
        attributes: ["id_user", "email", "no_hp", "status_user"]
      }
    });

    return response.success(res, "List Asesi", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ProfileAsesi.findByPk(req.params.id, {
      include: User
    });

    if (!data) return response.error(res, "Asesi tidak ditemukan", 404);

    return response.success(res, "Detail Asesi", data);
  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {

    const asesi = await ProfileAsesi.findByPk(req.params.id);
    if (!asesi) return response.error(res, "Asesi tidak ditemukan", 404);

    await asesi.update(req.body);

    return response.success(res, "Asesi berhasil diperbarui", asesi);

  } catch (err) {
    return response.error(res, err.message);
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {

    const asesi = await ProfileAsesi.findByPk(req.params.id, { transaction: t });
    if (!asesi) {
      await t.rollback();
      return response.error(res, "Asesi tidak ditemukan", 404);
    }

    await User.destroy({
      where: { id_user: asesi.id_user },
      transaction: t
    });

    await asesi.destroy({ transaction: t });

    await t.commit();
    return response.success(res, "Asesi berhasil dihapus");

  } catch (err) {
    await t.rollback();
    return response.error(res, err.message);
  }
};