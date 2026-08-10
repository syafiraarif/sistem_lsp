const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa01 = sequelize.define(
  "fr_mapa01",
  {
    // ========================
    // PRIMARY KEY
    // ========================
    id_mapa01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ========================
    // RELASI
    // ========================
    id_jadwal: {
  type: DataTypes.INTEGER,
  allowNull: false,
},

id_skema: {
  type: DataTypes.INTEGER,
  allowNull: false,
},

id_peserta: {
  type: DataTypes.INTEGER,
  allowNull: false,
},

id_asesor: {
  type: DataTypes.INTEGER,
  allowNull: false,
},

potensi_default: {
    type: DataTypes.INTEGER,
    allowNull: true,
},

potensi_asesi: {
    type: DataTypes.TEXT,
    allowNull: true,
},

profil_asesi: {
    type: DataTypes.TEXT,
    allowNull: true,
},

    // ========================
    // PROFIL ASESI
    // ========================
    profil_asesi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ========================
    // PENDEKATAN
    // ========================
    jenis_asesi: {
      type: DataTypes.ENUM(
        "pelatihan_kompeten",
        "pelatihan_belum_kompeten",
        "pengalaman_kompeten",
        "pengalaman_belum_kompeten",
        "mandiri"
      ),
      allowNull: true,
    },

    tujuan_asesmen: {
      type: DataTypes.ENUM(
        "sertifikasi",
        "sertifikasi_ulang",
        "pkt",
        "rpl",
        "lainnya"
      ),
      allowNull: true,
    },

    tujuan_lainnya: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ========================
    // KONTEKS
    // ========================
    lingkungan: {
      type: DataTypes.ENUM("nyata", "simulasi"),
      allowNull: true,
    },

    peluang_bukti: {
      type: DataTypes.ENUM("tersedia", "terbatas"),
      allowNull: true,
    },

    bukti_langsung: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    aktivitas_kerja: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    kegiatan_pembelajaran: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pelaksana: {
      type: DataTypes.ENUM(
        "lsp",
        "organisasi_pelatihan",
        "asesor_perusahaan"
      ),
      allowNull: true,
    },

    // ========================
    // STANDAR
    // ========================
    standar_kompetensi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    kurikulum_pelatihan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    spesifikasi_kinerja: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    spesifikasi_produk: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pedoman_khusus: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ========================
    // KONFIRMASI
    // ========================
    manajer_lsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    master_asesor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    manajer_pelatihan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    supervisor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // ========================
    // MODIFIKASI
    // ========================
    karakteristik_asesi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    kebutuhan_kontekstual: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    saran_pelatihan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    penyesuaian_perangkat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    peluang_integrasi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    penyusun: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },

    validator: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },

    // ========================
    // TIMESTAMP
    // ========================
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "fr_mapa01",
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["id_jadwal", "id_peserta", "id_asesor"],
      },
    ],
  }
);

module.exports = FrMapa01;