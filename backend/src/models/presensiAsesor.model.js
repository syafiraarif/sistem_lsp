const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PresensiAsesor = sequelize.define("presensi_asesor", {
  id_presensi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  waktu_presensi: {
    type: DataTypes.DATE,
    allowNull: false
  },

  ttd_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "presensi_asesor",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_user"] // 🔥 sesuai UNIQUE KEY di SQL
    }
  ]
});

module.exports = PresensiAsesor;