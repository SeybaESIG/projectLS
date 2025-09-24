import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_roles
export const Role = sequelize.define(
    'Role',
    {
        id_role: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_role: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        description_role: { type: DataTypes.TEXT, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_roles' }
);


