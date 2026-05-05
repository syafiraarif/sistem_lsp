const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrMapa02 = sequelize.define("fr_mapa02", {
  id_mapa02: {
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

  id_asesor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_mapa01: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_mapa02",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_jadwal", "id_asesor"] // 🔥 biar tidak double
    }
  ]
});

module.exports = FrMapa02;