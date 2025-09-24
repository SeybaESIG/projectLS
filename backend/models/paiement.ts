import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_paiements
export const Paiement = sequelize.define(
    'Paiement',
    {
        id_paie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_transa: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING(50), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_paiements' }
);


