const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa08 = sequelize.define("fr_ia_08", {
  id_fr_ia_08: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_jadwal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  created_by: {
    type: DataTypes.INTEGER
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_08",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_peserta", "id_jadwal"]
    }
  ]
});

module.exports = FrIa08;