const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Feedback = sequelize.define("feedback", {
  id_feedback: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  peran: {
    type: DataTypes.ENUM("asesi", "asesor", "masyarakat_umum"),
    allowNull: false
  },
  pesan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  status: {
    type: DataTypes.ENUM("aktif", "tidak_aktif"),
    defaultValue: "tidak_aktif"
  }
}, {
  tableName: "feedback",
  timestamps: true, 
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Feedback;