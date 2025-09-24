const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define('Certificate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('BA', 'MA', 'PhD', 'CERT'), allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false, unique: true },
    grad_date: { type: DataTypes.DATEONLY },
    issuer: { type: DataTypes.STRING, defaultValue: 'ĐH Điện lực' },
    status: { type: DataTypes.ENUM('draft', 'issued', 'revoked'), defaultValue: 'draft' },
    file_url: { type: DataTypes.STRING }
}, {
    tableName: 'certificates',
    timestamps: true,
});

module.exports = Certificate;
