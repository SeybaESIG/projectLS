import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_aeroports (PK composite id_ville + id_aeroport)
export const Aeroport = sequelize.define(
    'Aeroport',
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true },
        id_aeroport: { type: DataTypes.INTEGER, primaryKey: true },
        code_iata: { type: DataTypes.STRING(10), allowNull: false, unique: true },
        nom_aeroport: { type: DataTypes.STRING(255), allowNull: false },
    },
    { timestamps: false, tableName: 'tb_aeroports' }
);


