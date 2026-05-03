const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MkvaDetail = sequelize.define("mkva_detail", {
  id_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  id_mkva: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  aspek: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // ATURAN BUKTI
  bukti_valid: { type: DataTypes.BOOLEAN, defaultValue: false },
  bukti_authentic: { type: DataTypes.BOOLEAN, defaultValue: false },
  bukti_terkini: { type: DataTypes.BOOLEAN, defaultValue: false },
  bukti_memadai: { type: DataTypes.BOOLEAN, defaultValue: false },

  // PRINSIP ASESMEN
  prinsip_valid: { type: DataTypes.BOOLEAN, defaultValue: false },
  prinsip_reliable: { type: DataTypes.BOOLEAN, defaultValue: false },
  prinsip_fair: { type: DataTypes.BOOLEAN, defaultValue: false },
  prinsip_flexible: { type: DataTypes.BOOLEAN, defaultValue: false }

}, {
  tableName: "mkva_detail",
  timestamps: false
});

module.exports = MkvaDetail;