const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Apl01Dokumen = sequelize.define("apl01_dokumen", {
  id_dokumen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_apl01: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_persyaratan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "disetujui", "ditolak"),
    defaultValue: "pending"
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "apl01_dokumen",
  timestamps: false
});

module.exports = Apl01Dokumen;