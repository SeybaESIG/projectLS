import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_pays (classe typée)
export class Pays extends Model<InferAttributes<Pays>, InferCreationAttributes<Pays>> {
    declare id_pays: CreationOptional<number>;
    declare nom_pays: string;
    declare code_iso_pays: string | null;
}

Pays.init(
    {
        id_pays: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nom_pays: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        code_iso_pays: { type: DataTypes.STRING(10), allowNull: true, unique: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_pays' }
);


