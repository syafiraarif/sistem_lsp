const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrAk05 = sequelize.define(
  "fr_ak05",
  {
    id_fr_ak05: {
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
    rekomendasi: {
      type: DataTypes.ENUM("kompeten", "belum_kompeten"),
      allowNull: false
    },
    keterangan: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    aspek_positif_negatif: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    penolakan_hasil: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    saran_perbaikan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: "fr_ak05",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["id_jadwal", "id_peserta"]
      }
    ]
  }
);

module.exports = FrAk05;