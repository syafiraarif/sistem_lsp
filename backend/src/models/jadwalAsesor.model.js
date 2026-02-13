const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalAsesor = sequelize.define('JadwalAsesor', {
  id_jadwal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: { model: 'jadwal', key: 'id_jadwal' },
  },
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: { model: 'users', key: 'id_user' },  
  },
  jenis_tugas: {
    type: DataTypes.ENUM(
      'jadwal Asesor penguji',
      'Verifikator TUK',
      'Validator MKVA',
      'Peninjau Instrumen Asesmen'
    ),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('aktif', 'nonaktif'),
    allowNull: true,
    defaultValue: 'aktif',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'jadwal_asesor',
  timestamps: false,
});

JadwalAsesor.associate = (models) => {
  JadwalAsesor.belongsTo(models.Jadwal, {
    foreignKey: "id_jadwal",
    as: "jadwal"
  });

  JadwalAsesor.belongsTo(models.User, {
    foreignKey: "id_user",
    as: "user"
  });
};


module.exports = JadwalAsesor;