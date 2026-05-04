const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrIa09Detail = sequelize.define("fr_ia_09_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_fr_ia_09: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  id_soal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  kesimpulan_jawaban: {
    type: DataTypes.TEXT
  },

  rekomendasi: {
    type: DataTypes.ENUM("K", "BK")
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: "fr_ia_09_detail",
  timestamps: false,

  indexes: [
    {
      unique: true,
      fields: ["id_fr_ia_09", "id_soal"]
    }
  ]
});

module.exports = FrIa09Detail;