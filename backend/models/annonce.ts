import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_annonces
export class Annonce extends Model<InferAttributes<Annonce>, InferCreationAttributes<Annonce>> {
    declare id_annon: CreationOptional<number>;
    declare id_util: ForeignKey<number>;
    declare id_ville_dep: number;
    declare id_aerodep: number;
    declare id_ville_arr: number;
    declare id_aeroarr: number;
    declare description: string | null;
    declare prix: string;
    declare datedepart: Date | null;
    declare datearrivee: Date | null;
    declare datepublication: Date | null;
    declare statut: string | null;
    declare titre: string | null;
}

// Initialisation du modèle
Annonce.init(
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
    { sequelize, timestamps: false, tableName: 'tb_annonces' }
);


