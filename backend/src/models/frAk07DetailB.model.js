const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// FR.AK.07 Detail B (Assessment)
const FrAk07DetailB = sequelize.define("fr_ak07_detailB", {
  id_fr_ak07_detailB: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_fr_ak07: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nomor: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  pertanyaan: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  jawaban: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  standar_industri: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  sop: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  regulasi_teknik: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  metode_asesmen: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  instrumen_asesmen: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: "fr_ak07_detailB",
  timestamps: true,
});

module.exports = FrAk07DetailB;