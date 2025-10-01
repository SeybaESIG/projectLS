import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
    type CreationOptional,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant un achat
export class Achat extends Model<InferAttributes<Achat>, InferCreationAttributes<Achat>> {
    declare id_util: ForeignKey<number>;
    declare id_annon: ForeignKey<number>;
    declare venteid: CreationOptional<number>;
    declare datevente: Date | null;
}

// Initialisation du modèle
Achat.init(
    {
        id_util: { type: DataTypes.INTEGER, primaryKey: true },
        id_annon: { type: DataTypes.INTEGER, primaryKey: true },
        venteid: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true },
        datevente: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_achats' }
);