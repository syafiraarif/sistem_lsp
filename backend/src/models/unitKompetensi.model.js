const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UnitKompetensi = sequelize.define("unit_kompetensi", {
  id_unit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_skkni: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kode_unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  judul_unit: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  elemen_kriteria: {
    type: DataTypes.JSON,  
    allowNull: true,
    comment: "Struktur JSON: elemen_kompetensi sebagai string tanpa nomor, kriteria_unjuk_kerja sebagai array string tanpa nomor"
  }
}, {
  tableName: "unit_kompetensi",
  timestamps: false
});

const Skkni = require("./skkni.model");
UnitKompetensi.belongsTo(Skkni, { foreignKey: "id_skkni" });
Skkni.hasMany(UnitKompetensi, { foreignKey: "id_skkni" });

module.exports = UnitKompetensi;