const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Log = sequelize.define('Log', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    target_id: { type: DataTypes.INTEGER },
    target_type: { type: DataTypes.STRING },
    ip_address: { type: DataTypes.STRING(50) }
}, {
    tableName: 'logs',
    timestamps: true,
    updatedAt: false
});

module.exports = Log;
