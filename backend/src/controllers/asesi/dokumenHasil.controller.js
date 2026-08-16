const {
  PesertaJadwal,
  Presensi,
  Apl01Asesmen,
  Apl02,
  FrIa01,
  FrIa02,
  FrIa03,
  FrIa05Penilaian,
  FrAk01,
  FrAk02,
  FrAk03,
  FrAk04,
  FrAk05,
  FrAk06,
  FrAk07,
} = require("../../models");

const presensiController = require("../asesi/presensi.controller");
const apl01Controller = require("../asesi/apl01.controller");
const apl02Controller = require("../asesi/apl02.controller");
const frAk03Controller = require("../asesi/frAk03.controller");
const frAk04Controller = require("../asesi/frAk04.controller");
const frAk01Controller = require("../asesor/frAk01.controller");
const frAk02Controller = require("../asesor/frAk02.controller");
const frAk05Controller = require("../asesor/frAk05.controller");
const frAk06Controller = require("../asesor/frAk06.controller");
const frAk07Controller = require("../asesor/frAk07.controller");
const frIa01Controller = require("../asesor/frIa01.controller");
const frIa02Controller = require("../komite/frIa02.controller");
const frIa03Controller = require("../asesor/frIa03.controller");
const frIa05Controller = require("../asesor/frIa05Penguji.controller");

const getIdUser = (req) => {
  return Number(
    req.user?.id_user ||
      req.user?.id ||
      0
  );
};

const getPesertaSaya = async (
  req,
  id_peserta
) => {
  const id_user = getIdUser(req);

  if (!id_user || !id_peserta) {
    return null;
  }

  return PesertaJadwal.findOne({
    where: {
      id_peserta: Number(id_peserta),
      id_user,
    },
  });
};

const getData = async (
  Model,
  where,
  order
) => {
  return Model.findOne({
    where,
    order,
  });
};

exports.getDaftarDokumen = async (
  req,
  res
) => {
  try {
    const { id_peserta } = req.params;

    const peserta =
      await getPesertaSaya(
        req,
        id_peserta
      );

    if (!peserta) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses ke peserta ini",
      });
    }

    const [
      presensi,
      apl01,
      apl02,
      fria01,
      fria02,
      fria03,
      fria05,
      frak01,
      frak02,
      frak03,
      frak04,
      frak05,
      frak06,
      frak07,
    ] = await Promise.all([
      Presensi.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
      }),

      Apl01Asesmen.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
      }),

      Apl02.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
      }),

      FrIa01.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id_fr_ia_01", "DESC"],
        ],
      }),

      FrIa02.findOne({
        where: {
          id_jadwal:
            peserta.id_jadwal,
          id_asesi:
            peserta.id_user,
        },
        order: [
          ["id_fr_ia_02", "DESC"],
        ],
      }),

      FrIa03.findOne({
        where: {
          id_jadwal:
            peserta.id_jadwal,
          id_asesi:
            peserta.id_user,
        },
        order: [
          ["id_fr_ia_03", "DESC"],
        ],
      }),

      FrIa05Penilaian.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
        order: [
          ["tanggal_penilaian", "DESC"],
          ["id_penilaian", "DESC"],
        ],
      }),

      FrAk01.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id_fr_ak01", "DESC"],
        ],
      }),

      FrAk02.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id_fr_ak02", "DESC"],
        ],
      }),

      FrAk03.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
        order: [
          ["id_fr_ak03", "DESC"],
        ],
      }),

      FrAk04.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
        },
        order: [
          ["id_fr_ak04", "DESC"],
        ],
      }),

      FrAk05.findOne({
        where: {
          id_peserta:
            peserta.id_peserta,
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id_fr_ak05", "DESC"],
        ],
      }),

      FrAk06.findOne({
        where: {
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id", "DESC"],
        ],
      }),

      FrAk07.findOne({
        where: {
          id_asesi:
            peserta.id_user,
          id_jadwal:
            peserta.id_jadwal,
        },
        order: [
          ["id_fr_ak07", "DESC"],
        ],
      }),
    ]);

    const documents = [
      {
        key: "presensi",
        label: "Presensi",
        category: "Administrasi",
        available: Boolean(
          presensi
        ),
        endpoint: `/asesi/hasil-saya/dokumen/presensi/${id_peserta}`,
      },
      {
        key: "apl01",
        label: "APL.01",
        category: "Administrasi",
        available: Boolean(
          apl01
        ),
        endpoint: `/asesi/hasil-saya/dokumen/apl01/${id_peserta}`,
      },
      {
        key: "apl02",
        label: "APL.02",
        category: "Administrasi",
        available: Boolean(
          apl02
        ),
        endpoint: `/asesi/hasil-saya/dokumen/apl02/${id_peserta}`,
      },
      {
        key: "fria01",
        label: "FR.IA.01",
        category: "FR.IA",
        available: Boolean(
          fria01
        ),
        endpoint: `/asesi/hasil-saya/dokumen/fria01/${id_peserta}`,
      },
      {
        key: "fria02",
        label: "FR.IA.02",
        category: "FR.IA",
        available: Boolean(
          fria02
        ),
        endpoint: `/asesi/hasil-saya/dokumen/fria02/${id_peserta}`,
      },
      {
        key: "fria03",
        label: "FR.IA.03",
        category: "FR.IA",
        available: Boolean(
          fria03
        ),
        endpoint: `/asesi/hasil-saya/dokumen/fria03/${id_peserta}`,
      },
      {
        key: "fria05",
        label: "FR.IA.05",
        category: "FR.IA",
        available: Boolean(
          fria05
        ),
        endpoint: `/asesi/hasil-saya/dokumen/fria05/${id_peserta}`,
      },
      {
        key: "frak01",
        label: "FR.AK.01",
        category: "FR.AK",
        available: Boolean(
          frak01
        ),
        endpoint: `/asesi/hasil-saya/dokumen/frak01/${id_peserta}`,
      },
      {
        key: "frak02",
        label: "FR.AK.02",
        category: "FR.AK",
        available: Boolean(
          frak02
        ),
        endpoint: `/asesi/hasil-saya/dokumen/frak02/${id_peserta}`,
      },
      {
        key: "frak03",
        label: "FR.AK.03",
        category: "FR.AK",
        available: Boolean(
          frak03
        ),
        endpoint: `/asesi/fr-ak03/pdf/${id_peserta}`,
      },
      {
        key: "frak04",
        label: "FR.AK.04",
        category: "FR.AK",
        available: Boolean(
          frak04
        ),
        endpoint: `/asesi/fr-ak04/pdf/${id_peserta}`,
      },
      {
        key: "frak05",
        label: "FR.AK.05",
        category: "FR.AK",
        available: Boolean(
          frak05
        ),
        endpoint: `/asesi/hasil-saya/dokumen/frak05/${id_peserta}`,
      },
      {
        key: "frak06",
        label: "FR.AK.06",
        category: "FR.AK",
        available: Boolean(
          frak06
        ),
        endpoint: `/asesi/hasil-saya/dokumen/frak06/${id_peserta}`,
      },
      {
        key: "frak07",
        label: "FR.AK.07",
        category: "FR.AK",
        available: Boolean(
          frak07
        ),
        endpoint: `/asesi/hasil-saya/dokumen/frak07/${id_peserta}`,
      },
    ];

    return res.json({
      status: "success",
      data: {
        id_peserta:
          peserta.id_peserta,
        id_jadwal:
          peserta.id_jadwal,
        documents,
      },
    });
  } catch (error) {
    console.error(
      "GET DAFTAR DOKUMEN ASESI ERROR:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        "Gagal mengambil daftar dokumen hasil",
      error: error.message,
    });
  }
};

exports.downloadDokumen = async (
  req,
  res
) => {
  const originalUser =
    req.user;

  try {
    const {
      jenis,
      id_peserta,
    } = req.params;

    const peserta =
      await getPesertaSaya(
        req,
        id_peserta
      );

    if (!peserta) {
      return res.status(403).json({
        status: "error",
        message:
          "Anda tidak memiliki akses ke dokumen ini",
      });
    }

    if (jenis === "presensi") {
      req.params.id_peserta =
        String(id_peserta);

      return presensiController.generatePdfPresensi(
        req,
        res
      );
    }

    if (jenis === "apl01") {
      req.params.id_peserta =
        String(id_peserta);

      return apl01Controller.generatePdfApl01(
        req,
        res
      );
    }

    if (jenis === "apl02") {
      req.params.id_peserta =
        String(id_peserta);

      return apl02Controller.generatePdfApl02(
        req,
        res
      );
    }

    if (jenis === "frak03") {
      req.params.id_peserta =
        String(id_peserta);

      return frAk03Controller.generatePdfFrAk03(
        req,
        res
      );
    }

    if (jenis === "frak04") {
      req.params.id_peserta =
        String(id_peserta);

      return frAk04Controller.generatePdfFrAk04(
        req,
        res
      );
    }

    const delegates = {
      fria01: async () => {
        const data =
          await getData(
            FrIa01,
            {
              id_peserta:
                peserta.id_peserta,
              id_jadwal:
                peserta.id_jadwal,
            },
            [
              [
                "id_fr_ia_01",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id =
          data.id_fr_ia_01;

        req.user = {
          ...originalUser,
          id_user:
            data.id_asesor,
        };

        return frIa01Controller.downloadPdf(
          req,
          res
        );
      },

      fria02: async () => {
        const data =
          await getData(
            FrIa02,
            {
              id_jadwal:
                peserta.id_jadwal,
              id_asesi:
                peserta.id_user,
            },
            [
              [
                "id_fr_ia_02",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id =
          data.id_fr_ia_02;

        return frIa02Controller.downloadPdf(
          req,
          res
        );
      },

      fria03: async () => {
        const data =
          await getData(
            FrIa03,
            {
              id_jadwal:
                peserta.id_jadwal,
              id_asesi:
                peserta.id_user,
            },
            [
              [
                "id_fr_ia_03",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id =
          data.id_fr_ia_03;

        return frIa03Controller.downloadPdf(
          req,
          res
        );
      },

      fria05: async () => {
        const data =
          await FrIa05Penilaian.findOne({
            where: {
              id_peserta:
                peserta.id_peserta,
            },
            order: [
              [
                "tanggal_penilaian",
                "DESC",
              ],
              [
                "id_penilaian",
                "DESC",
              ],
            ],
          });

        if (!data) {
          return null;
        }

        req.params.id_peserta =
          String(
            peserta.id_peserta
          );

        return frIa05Controller.downloadPdf(
          req,
          res
        );
      },

      frak01: async () => {
        const data =
          await getData(
            FrAk01,
            {
              id_peserta:
                peserta.id_peserta,
              id_jadwal:
                peserta.id_jadwal,
            },
            [
              [
                "id_fr_ak01",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id =
          data.id_fr_ak01;

        req.user = {
          ...originalUser,
          id_user:
            data.id_asesor,
        };

        return frAk01Controller.downloadPdfFrAk01(
          req,
          res
        );
      },

      frak02: async () => {
        const data =
          await getData(
            FrAk02,
            {
              id_peserta:
                peserta.id_peserta,
              id_jadwal:
                peserta.id_jadwal,
            },
            [
              [
                "id_fr_ak02",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id_jadwal =
          peserta.id_jadwal;

        req.params.id_peserta =
          peserta.id_peserta;

        return frAk02Controller.generatePdfFrAk02(
          req,
          res
        );
      },

      frak05: async () => {
        const data =
          await getData(
            FrAk05,
            {
              id_peserta:
                peserta.id_peserta,
              id_jadwal:
                peserta.id_jadwal,
            },
            [
              [
                "id_fr_ak05",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id_fr_ak05 =
          data.id_fr_ak05;

        req.user = {
          ...originalUser,
          id_user:
            data.id_asesor,
        };

        return frAk05Controller.downloadPdfFrAk05(
          req,
          res
        );
      },

      frak06: async () => {
        const data =
          await FrAk06.findOne({
            where: {
              id_jadwal:
                peserta.id_jadwal,
            },
            order: [
              ["id", "DESC"],
            ],
          });

        if (!data) {
          return null;
        }

        req.params.id =
          String(data.id);

        req.user = {
          ...originalUser,
          id_user:
            data.id_asesor,
        };

        return frAk06Controller.downloadPdf(
          req,
          res
        );
      },

      frak07: async () => {
        const data =
          await getData(
            FrAk07,
            {
              id_asesi:
                peserta.id_user,
              id_jadwal:
                peserta.id_jadwal,
            },
            [
              [
                "id_fr_ak07",
                "DESC",
              ],
            ]
          );

        if (!data) {
          return null;
        }

        req.params.id =
          data.id_fr_ak07;

        req.user = {
          ...originalUser,
          id_user:
            data.id_asesor,
        };

        return frAk07Controller.downloadPdfFrAk07(
          req,
          res
        );
      },
    };

    const delegate =
      delegates[jenis];

    if (!delegate) {
      return res.status(400).json({
        status: "error",
        message:
          "Jenis dokumen tidak didukung",
      });
    }

    const result =
      await delegate();

    if (
      result === null &&
      !res.headersSent
    ) {
      return res.status(404).json({
        status: "error",
        message:
          "Dokumen belum tersedia",
      });
    }

    return result;
  } catch (error) {
    console.error(
      "DOWNLOAD DOKUMEN ASESI ERROR:",
      error
    );

    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      status: "error",
      message:
        "Gagal mengambil dokumen",
      error: error.message,
    });
  } finally {
    req.user =
      originalUser;
  }
};