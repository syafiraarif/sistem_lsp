const { ProfileTuk, Tuk, User } = require("../../models");
const response = require("../../utils/response.util");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    const profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    let tuk = null;

    tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    if (!tuk) {
      const user = await User.findByPk(userId, {
        attributes: ['username']
      });
      
      if (user && user.username) {
        tuk = await Tuk.findOne({
          where: { kode_tuk: user.username }
        });
      }
    }

    console.log("=== DEBUG TUK PROFILE ===");
    console.log("userId:", userId);
    console.log("profile found:", !!profile);
    console.log("tuk found:", !!tuk);
    console.log("=========================");

    response.success(res, "Profil TUK berhasil dimuat", {
      profile_tuk: profile || null,  
      tuk: tuk || null
    });

  } catch (err) {
    console.error("GetProfile Error:", err);
    response.error(res, err.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id_user;
    console.log("🔍 UPDATE userId:", userId);
    console.log("🔍 Body:", req.body);

    if (!userId) {
      return response.error(res, "User tidak valid", 400);
    }

    // 🔥 1. UPDATE ProfileTuk
    let profile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    if (!profile) {
      profile = await ProfileTuk.create({
        id_user: userId,
      });
      console.log("✅ Profile created for user:", userId);
    }

    // 🔥 2. Cari TUK (sama seperti getProfile)
    let tuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId }
    });

    if (!tuk) {
      const user = await User.findByPk(userId, {
        attributes: ['username']
      });
      
      if (user && user.username) {
        tuk = await Tuk.findOne({
          where: { kode_tuk: user.username }
        });
      }
    }

    const allowedFields = [
      'nik',
      'jenis_kelamin', 
      'tempat_lahir',
      'tanggal_lahir',
      'alamat',
      'provinsi',
      'kota',
      'kecamatan',
      'kelurahan',
      'kode_pos'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
        updateData[field] = req.body[field];
      }
    }

    console.log("🔍 Update data:", updateData);

    if (Object.keys(updateData).length === 0) {
      return response.error(res, "Tidak ada data yang diupdate", 400);
    }

    // 🔥 3. UPDATE PROFILE TUK
    await profile.update(updateData);
    
    // 🔥 4. UPDATE TUK (hanya field alamat terkait)
    if (tuk) {
      const tukUpdateData = {};
      const tukAllowedFields = ['alamat', 'provinsi', 'kota', 'kecamatan', 'kelurahan', 'kode_pos'];
      
      for (const field of tukAllowedFields) {
        if (updateData[field]) {
          tukUpdateData[field] = updateData[field];
        }
      }
      
      if (Object.keys(tukUpdateData).length > 0) {
        await tuk.update(tukUpdateData);
        console.log("✅ TUK updated:", tukUpdateData);
      }
    }

    // 🔥 5. Return data terbaru
    const updatedProfile = await ProfileTuk.findOne({
      where: { id_user: userId }
    });

    const updatedTuk = await Tuk.findOne({
      where: { id_penanggung_jawab: userId } || { kode_tuk: user.username }
    });

    console.log("✅ Update SUCCESS - Profile:", updatedProfile.alamat);
    console.log("✅ Update SUCCESS - TUK:", updatedTuk?.alamat);

    response.success(res, "✅ Profil TUK & data lokasi berhasil diperbarui", {
      profile_tuk: updatedProfile,
      tuk: updatedTuk || null
    });

  } catch (err) {
    console.error("💥 UpdateProfile Error:", err);
    response.error(res, err.message);
  }
};