const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa06 = sequelize.define("fr_ia_06", {
  id_fr_ia_06: {
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
  judul: DataTypes.STRING(255),
  created_by: DataTypes.INTEGER,
  created_at: DataTypes.DATE
}, {
  tableName: "fr_ia_06",
  timestamps: false
});

module.exports = FrIa06;