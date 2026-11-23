const ProfileAdmin = require("../../models/profileAdmin.model");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const data = await ProfileAdmin.findByPk(req.user.id_user);

    if (!data) {
      return response.success(res, "Profil admin belum diisi", {});
    }

    response.success(res, "Profil admin ditemukan", data);
  } catch (err) {
    console.error("Get Profile Error:", err);
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const rawBody = req.body || {};

    // Sanitasi data: ubah string kosong "" menjadi null
    const bodyData = {
      nip_admin: rawBody.nip_admin || null,
      nik: rawBody.nik || null,
      nama_lengkap: rawBody.nama_lengkap || null,
      tempat_lahir: rawBody.tempat_lahir || null,
      tanggal_lahir:
        rawBody.tanggal_lahir && rawBody.tanggal_lahir !== ""
          ? rawBody.tanggal_lahir
          : null,
      alamat: rawBody.alamat || null,
      provinsi: rawBody.provinsi || null,
      kota: rawBody.kota || null,
      kecamatan: rawBody.kecamatan || null,
      kelurahan: rawBody.kelurahan || null,
      rt: rawBody.rt || null,
      rw: rawBody.rw || null,
      pendidikan_terakhir: rawBody.pendidikan_terakhir || null,
      no_lisensi: rawBody.no_lisensi || null,
      masa_berlaku:
        rawBody.masa_berlaku && rawBody.masa_berlaku !== ""
          ? rawBody.masa_berlaku
          : null,
    };

    // Ambil file dari req.files (karena upload.middleware memakai upload.fields) atau req.file
    const uploadedFoto =
      req.files && Array.isArray(req.files.foto) && req.files.foto.length > 0
        ? req.files.foto[0]
        : req.file || null;

    if (uploadedFoto && typeof uploadedFoto.filename === "string") {
      // Karena upload.middleware menyimpan field "foto" ke "uploads/tuk/foto_profile",
      // simpan path relatif dari folder "uploads/" agar frontend cukup panggil /uploads/${foto}
      const normalizedPath = uploadedFoto.path
        ? uploadedFoto.path.replace(/\\/g, "/").replace(/^uploads\//, "")
        : uploadedFoto.filename;

      bodyData.foto = String(normalizedPath);
    }

    const existingProfile = await ProfileAdmin.findByPk(id_user);

    if (existingProfile) {
      await ProfileAdmin.update(bodyData, {
        where: { id_user: id_user },
      });
    } else {
      await ProfileAdmin.create({
        id_user: id_user,
        ...bodyData,
      });
    }

    const updatedData = await ProfileAdmin.findByPk(id_user);

    response.success(res, "Profil admin berhasil diperbarui", updatedData);
  } catch (err) {
    console.error("Update Profile Error:", err);
    response.error(res, "Gagal menyimpan profil: " + err.message);
  }
};