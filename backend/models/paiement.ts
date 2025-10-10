import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_paiements (classe typée)
export class Paiement extends Model<InferAttributes<Paiement>, InferCreationAttributes<Paiement>> {
    declare id_paie: CreationOptional<number>;
    declare id_transa: ForeignKey<number>;
    declare montant: string;
    declare type: string;
    declare statut: string;
    declare date: CreationOptional<Date>;
    declare stripe_payment_intent_id: string | null;
    declare stripe_charge_id: string | null;
}

// Initialisation du modèle
Paiement.init(
    {
        id_paie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_transa: { type: DataTypes.INTEGER, allowNull: false },
        montant: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        type: { type: DataTypes.STRING(50), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        stripe_payment_intent_id: { type: DataTypes.STRING(255), allowNull: true },
        stripe_charge_id: { type: DataTypes.STRING(255), allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_paiements' }
);


