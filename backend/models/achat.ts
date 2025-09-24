import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_achats (PK composite)
export const Achat = sequelize.define(
    'Achat',
    {
        id_util: { type: DataTypes.INTEGER, primaryKey: true },
        id_annon: { type: DataTypes.INTEGER, primaryKey: true },
        venteid: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true },
        datevente: { type: DataTypes.DATE, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_achats' }
);


