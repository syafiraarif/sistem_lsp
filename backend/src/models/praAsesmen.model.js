const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PresensiPraAsesmen = sequelize.define('PresensiPraAsesmen', {
  id_pra_asesmen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_pra_asesmen'
  },
  id_peserta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peserta_jadwal',
      key: 'id_peserta'
    }
  },
  ttd_asesi_status: {
    type: DataTypes.ENUM('belum_ditandatangani', 'ditandatangani'),
    defaultValue: 'belum_ditandatangani'
  },
  ttd_asesi_tanggal: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ttd_asesor_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'presensi_pra_asesmen',
  timestamps: false
});

module.exports = PresensiPraAsesmen;