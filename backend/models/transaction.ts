import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
    type NonAttribute,
} from 'sequelize';
import sequelize from '../config/db.js';
import type { Utilisateur } from './user.js';

// Classe représentant une transaction
export class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
    declare id_transa: CreationOptional<number>;
    declare id_payeur: ForeignKey<Utilisateur['id_util']>;
    declare id_receveur: ForeignKey<Utilisateur['id_util']>;
    declare id_annon: ForeignKey<number> | null;
    declare montant: string;
    declare statut: string;
    declare date: CreationOptional<Date>;

    // Associations optionnelles
    declare payeur?: NonAttribute<Utilisateur>;
    declare receveur?: NonAttribute<Utilisateur>;
}

// Initialisation du modèle
Transaction.init(
    {
        id_transa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_payeur: { type: DataTypes.INTEGER, allowNull: false },
        id_receveur: { type: DataTypes.INTEGER, allowNull: false },
        id_annon: { type: DataTypes.INTEGER, allowNull: true },
        montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, timestamps: false, tableName: 'tb_transactions' }
);

