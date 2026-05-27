const { ProfileAsesor, User } = require("../../models");

const makeFileUrl = (req, filePath) => {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const cleanPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${cleanPath}`;
};

const formatNamaLengkap = (item) => {
  return [item.gelar_depan, item.nama_lengkap, item.gelar_belakang]
    .filter(Boolean)
    .join(" ");
};

exports.getAllPublic = async (req, res) => {
  try {
    const data = await ProfileAsesor.findAll({
      where: { status_asesor: "aktif" },
      attributes: [
        "id_user",
        "nama_lengkap",
        "gelar_depan",
        "gelar_belakang",
        "bidang_keahlian",
        "institut_asal",
        "no_reg_asesor",
        "no_lisensi",
        "status_asesor",
        "foto_profil",
        "kota",
        "provinsi",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "no_hp"],
          required: false,
        },
      ],
      order: [["id_user", "DESC"]],
    });

    const formatted = data.map((asesor) => {
      const item = asesor.get({ plain: true });
      const namaLengkap = formatNamaLengkap(item);

      return {
        id: item.id_user,
        id_user: item.id_user,

        name: namaLengkap || "Asesor LSP",
        nama_lengkap: namaLengkap || "Asesor LSP",

        competency: item.bidang_keahlian || "Asesor Kompetensi",
        bidang_keahlian: item.bidang_keahlian || "Asesor Kompetensi",

        institution: item.institut_asal || "LSP Teknologi Informasi",
        institut_asal: item.institut_asal || "LSP Teknologi Informasi",

        license: item.no_reg_asesor || item.no_lisensi || "-",
        no_reg_asesor: item.no_reg_asesor || "-",
        no_lisensi: item.no_lisensi || "-",

        status: item.status_asesor === "aktif" ? "Aktif" : "Tidak Aktif",
        status_asesor: item.status_asesor,

        image: makeFileUrl(req, item.foto_profil),
        foto_profil: makeFileUrl(req, item.foto_profil),

        email: item.user?.email || null,
        no_hp: item.user?.no_hp || null,

        kota: item.kota || null,
        provinsi: item.provinsi || null,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("GET PUBLIC ASESOR ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getByIdPublic = async (req, res) => {
  try {
    const asesor = await ProfileAsesor.findByPk(req.params.id, {
      attributes: [
        "id_user",
        "nama_lengkap",
        "gelar_depan",
        "gelar_belakang",
        "bidang_keahlian",
        "institut_asal",
        "no_reg_asesor",
        "no_lisensi",
        "status_asesor",
        "foto_profil",
        "kota",
        "provinsi",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "no_hp"],
          required: false,
        },
      ],
    });

    if (!asesor) {
      return res.status(404).json({
        success: false,
        message: "Asesor tidak ditemukan",
      });
    }

    const item = asesor.get({ plain: true });
    const namaLengkap = formatNamaLengkap(item);

    res.json({
      success: true,
      data: {
        id: item.id_user,
        id_user: item.id_user,

        name: namaLengkap || "Asesor LSP",
        nama_lengkap: namaLengkap || "Asesor LSP",

        competency: item.bidang_keahlian || "Asesor Kompetensi",
        bidang_keahlian: item.bidang_keahlian || "Asesor Kompetensi",

        institution: item.institut_asal || "LSP Teknologi Informasi",
        institut_asal: item.institut_asal || "LSP Teknologi Informasi",

        license: item.no_reg_asesor || item.no_lisensi || "-",
        no_reg_asesor: item.no_reg_asesor || "-",
        no_lisensi: item.no_lisensi || "-",

        status: item.status_asesor === "aktif" ? "Aktif" : "Tidak Aktif",
        status_asesor: item.status_asesor,

        image: makeFileUrl(req, item.foto_profil),
        foto_profil: makeFileUrl(req, item.foto_profil),

        email: item.user?.email || null,
        no_hp: item.user?.no_hp || null,

        kota: item.kota || null,
        provinsi: item.provinsi || null,
      },
    });
  } catch (error) {
    console.error("GET PUBLIC ASESOR DETAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};