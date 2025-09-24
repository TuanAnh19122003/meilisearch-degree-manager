const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.ENUM('male', 'female', 'other') },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING(50) },
    address: { type: DataTypes.TEXT },
    majorId: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING }
}, {
    tableName: 'students',
    timestamps: true,
});

module.exports = Student;
