const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// FR.AK.07 Hasil (Results)
const FrAk07Hasil = sequelize.define("fr_ak07_hasil", {
  id_fr_ak07_hasil: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_fr_ak07: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bagian: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  acuan_pembanding: {
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
  tableName: "fr_ak07_hasil",
  timestamps: true,
});

module.exports = FrAk07Hasil;