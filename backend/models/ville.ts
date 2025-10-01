import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_villes
export class Ville extends Model<InferAttributes<Ville>, InferCreationAttributes<Ville>> {
    declare id_ville: CreationOptional<number>;
    declare nom_ville: string;
    declare code_postal: string | null;
    declare id_pays: number;
}

// Initialisation du modèle
Ville.init(
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_ville: { type: DataTypes.STRING(100), allowNull: false },
        code_postal: { type: DataTypes.STRING(20), allowNull: true },
        id_pays: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_villes' }
);

