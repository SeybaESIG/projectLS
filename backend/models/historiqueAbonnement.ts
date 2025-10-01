import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant un historique d'abonnement
export class HistoriqueAbonnement extends Model<InferAttributes<HistoriqueAbonnement>, InferCreationAttributes<HistoriqueAbonnement>> {
    declare id_histo_abo: CreationOptional<number>;
    declare id_type_abonnement: ForeignKey<number>;
    declare nom_type: string;
    declare prix: string;
    declare duree_mois: number;
    declare description: string | null;
    declare action_histo: string;
}

// Initialisation du modèle
HistoriqueAbonnement.init(
    {
        id_histo_abo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        nom_type: { type: DataTypes.STRING(100), allowNull: false },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        duree_mois: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        action_histo: { type: DataTypes.STRING(10), allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_historique_abonnements' }
);