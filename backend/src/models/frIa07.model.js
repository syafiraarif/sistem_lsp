const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa07 = sequelize.define("fr_ia_07", {
  id_fr_ia_07: {
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
  tableName: "fr_ia_07",
  timestamps: false
});

module.exports = FrIa07;