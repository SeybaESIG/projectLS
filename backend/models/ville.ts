import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_villes
export const Ville = sequelize.define(
    'Ville',
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_ville: { type: DataTypes.STRING(100), allowNull: false },
        code_postal: { type: DataTypes.STRING(20), allowNull: true },
        id_pays: { type: DataTypes.INTEGER, allowNull: false },
    },
    { timestamps: false, tableName: 'tb_villes' }
);


