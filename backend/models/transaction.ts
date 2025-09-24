import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_transactions
export const Transaction = sequelize.define(
    'Transaction',
    {
        id_transa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_payeur: { type: DataTypes.INTEGER, allowNull: false },
        id_receveur: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_transactions' }
);


