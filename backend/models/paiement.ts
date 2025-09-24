import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_paiements (classe typée)
export class Paiement extends Model<InferAttributes<Paiement>, InferCreationAttributes<Paiement>> {
    declare id_paie: CreationOptional<number>;
    declare id_transa: ForeignKey<number>;
    declare type: string;
    declare statut: string;
    declare date: Date | null;
}

Paiement.init(
    {
        id_paie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_transa: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING(50), allowNull: false },
        statut: { type: DataTypes.STRING(50), allowNull: false },
        date: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_paiements' }
);


