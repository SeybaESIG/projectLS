import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_historique_abonnements
export const HistoriqueAbonnement = sequelize.define(
    'HistoriqueAbonnement',
    {
        id_histo_abo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        nom_type: { type: DataTypes.STRING(100), allowNull: false },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        duree_mois: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        action_histo: { type: DataTypes.STRING(10), allowNull: false },
    },
    { timestamps: false, tableName: 'tb_historique_abonnements' }
);


