import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_pays
export const Pays = sequelize.define(
    'Pays',
    {
        id_pays: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_pays: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        code_iso_pays: { type: DataTypes.STRING(10), allowNull: true, unique: true },
    },
    { timestamps: false, tableName: 'tb_pays' }
);


