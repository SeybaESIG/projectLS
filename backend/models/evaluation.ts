import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Modèle: tb_evaluations (PK composite)
export const Evaluation = sequelize.define(
    'Evaluation',
    {
        id_util_donne: { type: DataTypes.INTEGER, primaryKey: true },
        id_util_recoit: { type: DataTypes.INTEGER, primaryKey: true },
        id_transa: { type: DataTypes.INTEGER, primaryKey: true },
        note: { type: DataTypes.DECIMAL, allowNull: true },
        commentaire: { type: DataTypes.STRING(500), allowNull: true },
        date: { type: DataTypes.DATE, allowNull: true },
        note_moyenne: { type: DataTypes.DECIMAL, allowNull: true },
    },
    { timestamps: false, tableName: 'tb_evaluations' }
);


