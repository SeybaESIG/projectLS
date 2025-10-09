import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant un aéroport
export class Aeroport extends Model<InferAttributes<Aeroport>, InferCreationAttributes<Aeroport>> {
    declare id_aeroport: CreationOptional<number>;
    declare code_iata: string;
    declare nom_aeroport: string;
    declare id_ville: ForeignKey<number>;
}

// Initialisation du modèle
Aeroport.init(
    {
        id_aeroport: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        code_iata: { type: DataTypes.STRING(10), allowNull: false, unique: true },
        nom_aeroport: { type: DataTypes.STRING(255), allowNull: false },
        id_ville: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_aeroports' }
);

