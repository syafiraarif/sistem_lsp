const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AplikasiAsesmen = sequelize.define("aplikasi_asesmen", {
  id_aplikasi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_skema: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  selected_persyaratan: {
    type: DataTypes.JSON, 
    allowNull: true
  },
  dokumen_tambahan: {
    type: DataTypes.JSON, 
    allowNull: true
  },
  tujuan_asesmen: {
    type: DataTypes.ENUM("Sertifikasi", "Sertifikasi Ulang", "Pengakuan Kompetensi Terkini (PKT)", "Rekognisi Pembelajaran Lampau", "Lainnya"),
    allowNull: false
  },
  tujuan_asesmen_lainnya: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  selected_units: {
    type: DataTypes.JSON, 
    allowNull: true
  },
  tanda_tangan: {
    type: DataTypes.STRING(255), 
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"),
    defaultValue: "draft"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "aplikasi_asesmen",
  timestamps: false
});

const Skema = require("./skema.model");
AplikasiAsesmen.belongsTo(Skema, { foreignKey: "id_skema" });

module.exports = AplikasiAsesmen;