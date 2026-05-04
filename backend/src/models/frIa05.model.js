const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa05 = sequelize.define("fr_ia_05", {
  id_fr_ia_05: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kode_paket: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  judul_paket: DataTypes.STRING(255),
  passing_grade: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  },
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE
}, {
  tableName: "fr_ia_05",
  timestamps: false
});

module.exports = FrIa05;