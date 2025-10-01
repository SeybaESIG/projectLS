import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant un historique d'annonce
export class HistoriqueAnnonce extends Model<InferAttributes<HistoriqueAnnonce>, InferCreationAttributes<HistoriqueAnnonce>> {
    declare id_histo_annon: CreationOptional<number>;
    declare id_annon: ForeignKey<number>;
    declare id_util: ForeignKey<number>;
    declare id_aerodep: ForeignKey<number>;
    declare id_aeroarr: ForeignKey<number>;
    declare description: string | null;
    declare prix: string;
    declare datedepart: Date | null;
    declare datearrivee: Date | null;
    declare datepublication: Date | null;
    declare statut: string | null;
    declare titre: string | null;
    declare action_histo: string;
}

// Initialisation du modèle
HistoriqueAnnonce.init(
    {
        id_histo_annon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_annon: { type: DataTypes.INTEGER, allowNull: false },
        id_util: { type: DataTypes.INTEGER, allowNull: false },
        id_aerodep: { type: DataTypes.INTEGER, allowNull: false },
        id_aeroarr: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: true },
        prix: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        datedepart: { type: DataTypes.DATE, allowNull: true },
        datearrivee: { type: DataTypes.DATE, allowNull: true },
        datepublication: { type: DataTypes.DATE, allowNull: true },
        statut: { type: DataTypes.STRING(50), allowNull: true },
        titre: { type: DataTypes.STRING(100), allowNull: true },
        action_histo: { type: DataTypes.STRING(10), allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_historique_annonces' }
);
