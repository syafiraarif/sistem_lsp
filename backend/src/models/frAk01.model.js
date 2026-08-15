const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk01 = sequelize.define(
  "fr_ak01",
  {
    id_fr_ak01: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_jadwal: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_peserta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_asesor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bukti_portofolio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_observasi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_tertulis: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_wawancara: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_review_produk: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_kegiatan_terstruktur: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_lisan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    t_lainnya: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bukti_lainnya: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    waktu: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    persetujuan: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ttd_asesor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "fr_ak01",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["id_jadwal", "id_peserta"]
      }
    ]
  }
);

module.exports = FrAk01;