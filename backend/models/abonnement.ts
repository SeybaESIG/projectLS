import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_abonnements
export class Abonnement extends Model<InferAttributes<Abonnement>, InferCreationAttributes<Abonnement>> {
    declare id_abonnement: CreationOptional<number>;
    declare id_util: ForeignKey<number>;
    declare id_type_abonnement: ForeignKey<number>;
    declare date_debut: Date;
    declare date_fin: Date;
}

// Initialisation du modèle
Abonnement.init(
    {
        id_abonnement: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_util: { type: DataTypes.INTEGER, allowNull: false, unique: true },
        id_type_abonnement: { type: DataTypes.INTEGER, allowNull: false },
        date_debut: { type: DataTypes.DATE, allowNull: false },
        date_fin: { type: DataTypes.DATE, allowNull: false },
    },
    { sequelize, timestamps: false, tableName: 'tb_abonnements' }
);


