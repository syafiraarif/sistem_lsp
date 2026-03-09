const XLSX = require("xlsx");
const { User, Role, Notifikasi, Tuk } = require("../../models");
const response = require("../../utils/response.util");
const { createUser } = require("../../services/account.service");
const sequelize = require("../../config/database");

exports.createTuk = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const { kode_tuk, email, no_hp, ...data } = req.body;

    // --- AUTO CREATE ROLE TUK JIKA BELUM ADA ---
    let role = await Role.findOne({
      where: { role_name: "TUK" }
    });

    if (!role) {
      role = await Role.create(
        { role_name: "TUK" },
        { transaction: t }
      );
    }
    // --------------------------------------------

    // Buat akun user
    const { user } = await createUser(
      {
        username: kode_tuk,
        email,
        no_hp,
        id_role: role.id_role
      },
      { transaction: t }
    );

    // ✅ LANGSUNG MASUK TABEL TUK
    await Tuk.create(
      {
        kode_tuk,
        nama_tuk: data.nama_tuk,
        jenis_tuk: data.jenis_tuk,
        penanggung_jawab: data.penanggung_jawab,
        institusi_induk: data.institusi_induk,
        telepon: no_hp,
        email: email,
        alamat: data.alamat,
        provinsi: data.provinsi,
        kota: data.kota,
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        kode_pos: data.kode_pos,
        no_lisensi: data.no_lisensi,
        masa_berlaku_lisensi: data.masa_berlaku_lisensi,
        status: "nonaktif"
      },
      { transaction: t }
    );

    await t.commit();

    return response.success(res, "TUK berhasil dibuat");

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
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) {
      return response.error(res, "File Excel kosong", 400);
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const row of data) {

      const t = await sequelize.transaction();

      try {

        await Tuk.create(
          {
            kode_tuk: row.kode_tuk,
            nama_tuk: row.nama_tuk,
            jenis_tuk: row.jenis_tuk,
            penanggung_jawab: row.penanggung_jawab,
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
            status: row.status || "nonaktif"
          },
          { transaction: t }
        );

        await t.commit();
        totalSuccess++;

      } catch (err) {

        await t.rollback();
        totalFailed++;
        console.error("Import gagal:", err.message);
      }
    }

    return response.success(
      res,
      `Import selesai. Berhasil: ${totalSuccess}, Gagal: ${totalFailed}`
    );

  } catch (err) {

    return response.error(res, err.message);
  }
};

exports.getAll = async (req, res) => {

  try {

    const data = await Tuk.findAll({
      include: [
        {
          model: User,
          required: false
        }
      ]
    });

    return response.success(res, "List TUK", data);

  } catch (err) {

    return response.error(res, err.message);
  }
};

exports.getById = async (req, res) => {

  try {

    const data = await Tuk.findByPk(req.params.id, {
      include: User
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

