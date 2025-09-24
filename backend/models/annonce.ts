import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_annonces
export const Annonce = sequelize.define(
    'Annonce',
    {
        id_annon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_util: { type: DataTypes.INTEGER, allowNull: false },
        id_ville_dep: { type: DataTypes.INTEGER, allowNull: false },
        id_aerodep: { type: DataTypes.INTEGER, allowNull: false },
        id_ville_arr: { type: DataTypes.INTEGER, allowNull: false },
        id_aeroarr: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        datedepart: { type: DataTypes.DATE, allowNull: true },
        datearrivee: { type: DataTypes.DATE, allowNull: true },
        datepublication: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.STRING(50), allowNull: true },
        titre: { type: DataTypes.STRING(100), allowNull: true },
    },
    { timestamps: false, tableName: 'tb_annonces' }
);


