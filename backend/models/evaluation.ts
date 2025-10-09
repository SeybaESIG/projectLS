// Modèle Sequelize pour tb_evaluations (PK composite)

import {
    DataTypes,
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    type ForeignKey,
    type CreationOptional,
} from 'sequelize';
import sequelize from '../config/db.js';

// Classe représentant une évaluation
export class Evaluation extends Model<InferAttributes<Evaluation>, InferCreationAttributes<Evaluation>> {
    declare id_util_donne: ForeignKey<number>;
    declare id_util_recoit: ForeignKey<number>;
    declare id_transa: ForeignKey<number>;
    declare note: string | null;
    declare commentaire: string | null;
    declare date: Date | null;
    declare note_moyenne: string | null;
}

// Initialisation du modèle
Evaluation.init(
    {
        id_util_donne: { type: DataTypes.INTEGER, primaryKey: true },
        id_util_recoit: { type: DataTypes.INTEGER, primaryKey: true },
        id_transa: { type: DataTypes.INTEGER, primaryKey: true },
        note: { type: DataTypes.DECIMAL, allowNull: true },
        commentaire: { type: DataTypes.STRING(500), allowNull: true },
        date: { type: DataTypes.DATE, allowNull: true },
        note_moyenne: { type: DataTypes.DECIMAL, allowNull: true },
    },
    { sequelize, timestamps: false, tableName: 'tb_evaluations' }
);