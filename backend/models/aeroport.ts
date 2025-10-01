import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant un aéroport
export class Aeroport extends Model<InferAttributes<Aeroport>, InferCreationAttributes<Aeroport>> {
    declare id_ville: ForeignKey<number>;
    declare id_aeroport: ForeignKey<number>;
    declare code_iata: string;
    declare nom_aeroport: string;
}

// Initialisation du modèle
Aeroport.init(
    {
        id_ville: { type: DataTypes.INTEGER, primaryKey: true },
        id_aeroport: { type: DataTypes.INTEGER, primaryKey: true },
        code_iata: { type: DataTypes.STRING(10), allowNull: false, unique: true },
        nom_aeroport: { type: DataTypes.STRING(255), allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_aeroports' }
);

