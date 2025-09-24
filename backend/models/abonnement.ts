import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_abonnements
export const Abonnement = sequelize.define(
    'Abonnement',
    {
        id_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_util: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        date_debut: { type: DataTypes.DATE, allowNull: false },
        date_fin: { type: DataTypes.DATE, allowNull: false },
    },
    { timestamps: false, tableName: 'tb_abonnements' }
);


