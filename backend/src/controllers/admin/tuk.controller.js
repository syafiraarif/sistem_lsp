const XLSX = require("xlsx");
const { User, Role, Tuk, ProfileTuk, TukSkema } = require("../../models");
const { createNotifikasi } = require("../../services/notifikasi.service");
const response = require("../../utils/response.util");
const { createUser } = require("../../services/account.service");
const sequelize = require("../../config/database");
const { Op } = require("sequelize");

exports.createTuk = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const {
      kode_tuk,
      nama_tuk,
      jenis_tuk,
      institusi_induk,
      telepon,
      email,
      alamat,
      provinsi,
      kota,
      kecamatan,
      kelurahan,
      kode_pos,
      no_lisensi,
      masa_berlaku_lisensi
    } = req.body;

    let role = await Role.findOne({
      where: { role_name: "TUK" },
      transaction: t
    });

    if (!role) {
      role = await Role.create(
        { role_name: "TUK" },
        { transaction: t }
      );
    }

    const { user, rawPassword } = await createUser(
      {
        username: kode_tuk,
        email,
        no_hp: telepon,
        id_role: role.id_role
      },
      { transaction: t }
    );

    const tuk = await Tuk.create(
      {
        kode_tuk,
        nama_tuk,
        jenis_tuk,
        institusi_induk,
        telepon,
        email,
        alamat,
        provinsi,
        kota,
        kecamatan,
        kelurahan,
        kode_pos,
        no_lisensi,
        masa_berlaku_lisensi,
        status: "aktif",
        id_penanggung_jawab: req.user.id_user
      },
      { transaction: t }
    );

    await ProfileTuk.create(
      {
        id_user: user.id_user,
        nama_lengkap: nama_tuk,
        alamat,
        provinsi,
        kota,
        kecamatan,
        kelurahan,
        kode_pos
      },
      { transaction: t }
    );

    await createNotifikasi({
      channel: "email",
      tujuan: email,
      pesan: `Akun TUK berhasil dibuat.
Username: ${kode_tuk}
Password: ${rawPassword}`,
      status_kirim: "terkirim",
      ref_type: "akun",
      ref_id: user.id_user
    });

    await t.commit();

    return response.success(res, "Akun TUK berhasil dibuat", {
      username: kode_tuk,
      password: rawPassword
    });

  } catch (err) {

    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.importTukExcel = async (req, res) => {

  try {

    if (!req.file) {
      return response.error(res, "File tidak ditemukan", 400);
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return response.error(res, "File Excel kosong", 400);
    }

    let success = 0;
    let failed = 0;

    for (const row of rows) {

      const t = await sequelize.transaction();

      try {

        let role = await Role.findOne({
          where: { role_name: "TUK" }
        });

        if (!role) {
          role = await Role.create(
            { role_name: "TUK" },
            { transaction: t }
          );
        }

        const { user, rawPassword } = await createUser(
          {
            username: row.kode_tuk,
            email: row.email,
            no_hp: row.telepon,
            id_role: role.id_role
          },
          { transaction: t }
        );

        await Tuk.create({
          kode_tuk: row.kode_tuk,
          nama_tuk: row.nama_tuk,
          jenis_tuk: row.jenis_tuk,
          institusi_induk: row.institusi_induk,
          telepon: row.telepon,
          email: row.email,
          alamat: row.alamat,
          provinsi: row.provinsi,
          kota: row.kota,
          kecamatan: row.kecamatan,
          kelurahan: row.kelurahan,
          kode_pos: row.kode_pos,
          no_lisensi: row.no_lisensi,
          masa_berlaku_lisensi: row.masa_berlaku_lisensi,
          status: "nonaktif",
          id_penanggung_jawab: req.user.id_user
        }, { transaction: t });

        await ProfileTuk.create({
          id_user: user.id_user,
          nama_lengkap: row.nama_tuk,
          alamat: row.alamat,
          provinsi: row.provinsi,
          kota: row.kota,
          kecamatan: row.kecamatan,
          kelurahan: row.kelurahan,
          kode_pos: row.kode_pos
        }, { transaction: t });

        await createNotifikasi({
          channel: "email",
          tujuan: row.email,
          pesan: `Akun TUK berhasil dibuat.
Username: ${row.kode_tuk}
Password: ${rawPassword}`,
          status_kirim: "terkirim",
          ref_type: "akun",
          ref_id: user.id_user
        });

        await t.commit();
        success++;

      } catch (err) {

        await t.rollback();
        failed++;
        console.log("Import gagal:", err.message);

      }
    }

    return response.success(
      res,
      `Import selesai. Berhasil: ${success}, Gagal: ${failed}`
    );

  } catch (err) {

    return response.error(res, err.message);

  }
};

exports.getAll = async (req, res) => {

  try {

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";

    const whereClause = search ? {
      [Op.or]: [
        { kode_tuk: { [Op.like]: `%${search}%` } },
        { nama_tuk: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    if (page && limit) {

      const offset = (page - 1) * limit;

      const data = await Tuk.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [
          {
            model: User,
            as: "penanggungJawab",
            attributes: ["id_user", "username", "email"]
          }
        ],
        order: [['id_tuk', 'DESC']]
      });

      return response.success(res, "List TUK Pagination", data);
    }

    const data = await Tuk.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "penanggungJawab",
          attributes: ["id_user", "username", "email"]
        }
      ],
      order: [['nama_tuk', 'ASC']]
    });

    return response.success(res, "List Semua TUK", data);

  } catch (err) {

    console.error("Error Get All TUK:", err);
    return response.error(res, err.message);

  }
};

exports.getById = async (req, res) => {

  try {

    const data = await Tuk.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "penanggungJawab",
          attributes: ["id_user", "username", "email"]
        }
      ]
    });

    if (!data) {
      return response.error(res, "TUK tidak ditemukan", 404);
    }

    return response.success(res, "Detail TUK", data);

  } catch (err) {

    return response.error(res, err.message);
  }
};

exports.update = async (req, res) => {

  try {

    const tuk = await Tuk.findByPk(req.params.id);

    if (!tuk) {
      return response.error(res, "TUK tidak ditemukan", 404);
    }

    await tuk.update(req.body);

    return response.success(res, "TUK berhasil diperbarui", tuk);

  } catch (err) {

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

    await tuk.destroy({ transaction: t });

    await t.commit();

    return response.success(res, "TUK berhasil dihapus");

  } catch (err) {

    await t.rollback();
    return response.error(res, err.message);
  }
};

exports.attachSkema = async (req, res) => {
  try {

    const { id_tuk, id_skema } = req.body;

    const tuk = await Tuk.findByPk(id_tuk);

    if (!tuk)
      return response.error(res, "TUK tidak ditemukan", 404);

    const data = await TukSkema.create({
      id_tuk,
      id_skema
    });

    return response.success(res, "Skema berhasil dikaitkan ke TUK", data);

  } catch (err) {

    return response.error(res, err.message);

  }
};

exports.detachSkema = async (req, res) => {
  try {

    const { id_tuk, id_skema } = req.params;

    const deleted = await TukSkema.destroy({
      where: { id_tuk, id_skema }
    });

    if (!deleted)
      return response.error(res, "Relasi tidak ditemukan", 404);

    return response.success(res, "Skema dilepas dari TUK");

  } catch (err) {

    return response.error(res, err.message);

  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user)
      return response.error(res, "User tidak ditemukan", 404);

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