import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_types_abonnement
export const TypeAbonnement = sequelize.define(
    'TypeAbonnement',
    {
        id_type_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_type: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        duree_mois: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_types_abonnement' }
);


